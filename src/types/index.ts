export type Language = "typescript" | "python" | "go" | "java" | "rust";

export type WorkflowStep =
  | "idle"
  | "generating"
  | "generated"
  | "testing"
  | "tested"
  | "fixing"
  | "fixed"
  | "complete"
  | "error";

export interface GenerateRequest {
  requirement: string;
  language: Language;
  framework?: string;
}

export interface GenerateResponse {
  code: string;
  explanation: string;
  language: Language;
}

export interface TestCase {
  name: string;
  status: "pass" | "fail" | "pending";
  message: string;
  duration?: number;
}

export interface TestResult {
  success: boolean;
  tests: TestCase[];
  summary: string;
  errors: string[];
}

export interface FixRequest {
  code: string;
  language: Language;
  errors: string[];
  testResults: TestResult;
}

export interface FixResponse {
  code: string;
  changes: string[];
  explanation: string;
}

export interface WorkflowState {
  step: WorkflowStep;
  requirement: string;
  language: Language;
  code: string;
  explanation: string;
  testResult: TestResult | null;
  fixHistory: FixResponse[];
  iteration: number;
  maxIterations: number;
}
