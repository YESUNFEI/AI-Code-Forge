import { NextRequest, NextResponse } from "next/server";
import { fixCode } from "@/lib/openai";
import type { FixResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.code || body.code.trim().length === 0) {
      return NextResponse.json(
        { error: "Code is required for fixing" },
        { status: 400 }
      );
    }

    if (!body.language) {
      return NextResponse.json(
        { error: "Language is required" },
        { status: 400 }
      );
    }

    if (!body.errors || body.errors.length === 0) {
      return NextResponse.json(
        { error: "Errors list is required" },
        { status: 400 }
      );
    }

    const result = await fixCode(
      body.code,
      body.language,
      body.errors,
      JSON.stringify(body.testResults || {})
    );

    const response: FixResponse = {
      code: result.code,
      changes: result.changes,
      explanation: result.explanation,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Fix error:", error);
    return NextResponse.json(
      { error: "Failed to fix code. Please try again." },
      { status: 500 }
    );
  }
}
