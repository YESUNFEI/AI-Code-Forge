import { NextRequest, NextResponse } from "next/server";
import { generateCode } from "@/lib/openai";
import type { GenerateRequest, GenerateResponse, Language } from "@/types";

const VALID_LANGUAGES: Language[] = [
  "typescript",
  "python",
  "go",
  "java",
  "rust",
];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequest;

    if (!body.requirement || body.requirement.trim().length === 0) {
      return NextResponse.json(
        { error: "Requirement is required" },
        { status: 400 }
      );
    }

    if (!body.language || !VALID_LANGUAGES.includes(body.language)) {
      return NextResponse.json(
        {
          error: `Invalid language. Supported: ${VALID_LANGUAGES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const result = await generateCode(
      body.requirement,
      body.language,
      body.framework
    );

    const response: GenerateResponse = {
      code: result.code,
      explanation: result.explanation,
      language: body.language,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Generate error:", error);

    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY in .env" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate code. Please try again." },
      { status: 500 }
    );
  }
}
