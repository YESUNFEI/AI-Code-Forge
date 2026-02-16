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
    const testResult: TestResult = {
      success: !!parsed.success,
      tests: (parsed.tests as TestResult["tests"]) || [],
      summary: (parsed.summary as string) || "Failed to parse test results",
      errors: (parsed.errors as string[]) || [],
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
