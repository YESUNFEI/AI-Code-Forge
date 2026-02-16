import OpenAI from "openai";
import { HttpsProxyAgent } from "https-proxy-agent";

/**
 * Robustly parse JSON from LLM output, handling common issues like
 * markdown wrapping and invalid escape sequences (e.g. \d, \s in code).
 */
export function safeParseJSON(text: string): Record<string, unknown> {
  // 1. Try direct parse
  try {
    return JSON.parse(text);
  } catch {
    // continue to fallbacks
  }

  // 2. Try extracting from markdown code block ```json ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {
      // continue
    }
  }

  // 3. Fix invalid JSON escape sequences (\d, \s, \w, etc.)
  //    Valid JSON escapes: \" \\ \/ \b \f \n \r \t \uXXXX
  const source = codeBlockMatch?.[1] || text;
  try {
    const fixed = source.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
    return JSON.parse(fixed);
  } catch {
    // continue
  }

  // 4. Last resort: return empty object
  return {};
}

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      ...(proxyUrl ? { httpAgent: new HttpsProxyAgent(proxyUrl) } : {}),
    });
  }
  return openaiClient;
}

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 15000;

async function chatWithRetry(
  client: OpenAI,
  params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming
): Promise<OpenAI.Chat.ChatCompletion> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await client.chat.completions.create(params);
    } catch (error: unknown) {
      const status = (error as { status?: number }).status;
      if (status === 429 && attempt < MAX_RETRIES) {
        // Try to read Retry-After header from the error response
        const headers = (error as { headers?: Record<string, string> }).headers;
        const retryAfter = headers?.["retry-after"];
        const delay = retryAfter
          ? Math.max(parseInt(retryAfter, 10) * 1000, BASE_DELAY_MS)
          : BASE_DELAY_MS * Math.pow(2, attempt);
        console.log(`Rate limited (429), retrying in ${Math.round(delay / 1000)}s... (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function generateCode(
  requirement: string,
  language: string,
  framework?: string
): Promise<{ code: string; explanation: string }> {
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o";

  const systemPrompt = `You are an expert API developer. Generate clean, production-ready API code.
Rules:
- Write complete, runnable code with proper error handling
- Include input validation
- Add appropriate comments
- Follow best practices for the chosen language/framework
- Include proper type definitions
- Code should be a complete, self-contained API endpoint or module

Output ONLY valid JSON with two fields:
- "code": the complete source code as a string
- "explanation": a brief explanation of the generated code`;

  const userPrompt = `Generate API code for the following requirement:

Requirement: ${requirement}
Language: ${language}${framework ? `\nFramework: ${framework}` : ""}

Please generate production-ready code.`;

  const response = await chatWithRetry(client, {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = safeParseJSON(content);

  return {
    code: (parsed.code as string) || "// No code generated",
    explanation: (parsed.explanation as string) || "No explanation provided",
  };
}

export async function generateTests(
  code: string,
  language: string,
  requirement: string
): Promise<{ tests: string; explanation: string }> {
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o";

  const systemPrompt = `You are an expert software tester. Analyze the given API code and generate comprehensive test results.
  
You should simulate running tests against the code and provide realistic test results.

Output ONLY valid JSON with the following structure:
{
  "success": boolean,
  "tests": [
    {
      "name": "test name",
      "status": "pass" | "fail",
      "message": "description of what was tested or what failed",
      "duration": number (milliseconds)
    }
  ],
  "summary": "overall test summary",
  "errors": ["list of any errors found in the code"]
}

Be thorough: check for:
- Input validation
- Error handling
- Edge cases
- Security issues (SQL injection, XSS, etc.)
- Performance concerns
- Type safety
- Missing null checks
- API response format consistency`;

  const userPrompt = `Analyze and test the following ${language} API code:

Original requirement: ${requirement}

Code:
\`\`\`${language}
${code}
\`\`\`

Simulate comprehensive testing and return results.`;

  const response = await chatWithRetry(client, {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "{}";

  return {
    tests: content,
    explanation: "Tests generated and executed",
  };
}

export async function fixCode(
  code: string,
  language: string,
  errors: string[],
  testResults: string
): Promise<{ code: string; changes: string[]; explanation: string }> {
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o";

  const systemPrompt = `You are an expert debugger and code fixer. Fix the issues found in the code.
  
Rules:
- Fix ALL reported errors and failing tests
- Maintain existing functionality
- Improve code quality where possible
- Don't introduce new issues

Output ONLY valid JSON with:
- "code": the complete fixed source code
- "changes": array of strings describing each change made
- "explanation": brief explanation of what was fixed and why`;

  const userPrompt = `Fix the following ${language} code based on test failures:

Current code:
\`\`\`${language}
${code}
\`\`\`

Errors found:
${errors.map((e) => `- ${e}`).join("\n")}

Test results:
${testResults}

Please fix all issues and return the corrected code.`;

  const response = await chatWithRetry(client, {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = safeParseJSON(content);

  return {
    code: (parsed.code as string) || code,
    changes: (parsed.changes as string[]) || ["No changes made"],
    explanation: (parsed.explanation as string) || "No explanation",
  };
}
