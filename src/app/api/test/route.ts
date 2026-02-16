import { NextRequest, NextResponse } from "next/server";
import { generateTests, safeParseJSON } from "@/lib/openai";
import type { TestResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.code || body.code.trim().length === 0) {
      return NextResponse.json(
        { error: "Code is required for testing" },
        { status: 400 }
      );
    }

    if (!body.language) {
      return NextResponse.json(
        { error: "Language is required" },
        { status: 400 }
      );
    }

    const result = await generateTests(
      body.code,
      body.language,
      body.requirement || ""
    );

    const parsed = safeParseJSON(result.tests);
    const tests = (parsed.tests as TestResult["tests"]) || [];
    const errors = (parsed.errors as string[]) || [];

    // Derive success from actual test results instead of trusting the LLM's field
    const allTestsPassed = tests.length > 0 && tests.every((t) => t.status === "pass");
    const hasNoErrors = errors.length === 0;

    const testResult: TestResult = {
      success: allTestsPassed && hasNoErrors,
      tests,
      summary: (parsed.summary as string) || "No summary",
      errors,
    };

    return NextResponse.json(testResult);
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      { error: "Failed to run tests. Please try again." },
      { status: 500 }
    );
  }
}
