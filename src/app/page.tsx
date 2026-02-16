"use client";

import { useState, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import Header from "@/components/Header";
import RequirementInput from "@/components/RequirementInput";
import CodeEditor from "@/components/CodeEditor";
import TestResults from "@/components/TestResults";
import WorkflowStatus from "@/components/WorkflowStatus";
import FixHistory from "@/components/FixHistory";
import {
  FileCode2,
  FlaskConical,
  Wrench,
  RotateCcw,
  ArrowDown,
  Info,
} from "lucide-react";
import type {
  Language,
  WorkflowStep,
  TestResult,
  FixResponse,
} from "@/types";

const MAX_FIX_ITERATIONS = 3;

export default function Home() {
  const [step, setStep] = useState<WorkflowStep>("idle");
  const [requirement, setRequirement] = useState("");
  const [language, setLanguage] = useState<Language>("typescript");
  const [code, setCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [fixHistory, setFixHistory] = useState<FixResponse[]>([]);
  const [iteration, setIteration] = useState(0);

  const isLoading =
    step === "generating" || step === "testing" || step === "fixing";

  // Step 1: Generate code
  const handleGenerate = useCallback(
    async (req: string, lang: Language) => {
      setRequirement(req);
      setLanguage(lang);
      setStep("generating");
      setCode("");
      setExplanation("");
      setTestResult(null);
      setFixHistory([]);
      setIteration(0);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requirement: req, language: lang }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to generate code");
        }

        const data = await res.json();
        setCode(data.code);
        setExplanation(data.explanation);
        setStep("generated");
        toast.success("Code generated successfully!");
      } catch (error) {
        setStep("error");
        toast.error(
          error instanceof Error ? error.message : "Failed to generate code"
        );
      }
    },
    []
  );

  // Step 2: Run tests, then auto-fix loop if tests fail
  const handleTest = useCallback(async (resetIterations = true) => {
    if (!code) return;

    let currentIteration = 0;
    if (resetIterations) {
      setIteration(0);
      setFixHistory([]);
    }

    setStep("testing");
    let currentCode = code;

    try {
      // Run initial tests
      const res = await fetch("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: currentCode, language, requirement }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to run tests");
      }

      let testData: TestResult = await res.json();
      setTestResult(testData);

      if (testData.success) {
        toast.success("All tests passed!");
        setStep("complete");
        return;
      }

      toast.error(`${testData.tests.filter((t) => t.status === "fail").length} test(s) failed`);

      // Auto fix loop
      while (!testData.success && currentIteration < MAX_FIX_ITERATIONS) {
        currentIteration++;
        setIteration(currentIteration);
        setStep("fixing");

        const fixRes = await fetch("/api/fix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: currentCode,
            language,
            errors: testData.errors,
            testResults: testData,
          }),
        });

        if (!fixRes.ok) {
          const err = await fixRes.json();
          throw new Error(err.error || "Failed to fix code");
        }

        const fixData: FixResponse = await fixRes.json();
        currentCode = fixData.code;
        setCode(fixData.code);
        setFixHistory((prev) => [...prev, fixData]);
        toast.success(`Fix #${currentIteration}: applied ${fixData.changes.length} change(s)`);

        // Re-test after fix
        setStep("testing");
        const reTestRes = await fetch("/api/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: currentCode,
            language,
            requirement,
          }),
        });

        if (!reTestRes.ok) throw new Error("Failed to re-test");

        testData = await reTestRes.json();
        setTestResult(testData);
      }

      if (testData.success) {
        setStep("complete");
        toast.success("All tests passed after auto-fix!", { duration: 5000 });
      } else {
        setStep("tested");
        toast.error("Max fix iterations reached. Manual review needed.");
      }
    } catch (error) {
      setStep("error");
      toast.error(
        error instanceof Error ? error.message : "Failed to run tests"
      );
    }
  }, [code, language, requirement]);

  // Full auto pipeline: generate -> test -> fix loop
  const handleAutoRun = useCallback(
    async (req: string, lang: Language) => {
      setRequirement(req);
      setLanguage(lang);
      setStep("generating");
      setCode("");
      setExplanation("");
      setTestResult(null);
      setFixHistory([]);
      setIteration(0);

      try {
        // Generate
        const genRes = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requirement: req, language: lang }),
        });

        if (!genRes.ok) {
          const err = await genRes.json();
          throw new Error(err.error || "Failed to generate code");
        }

        const genData = await genRes.json();
        setCode(genData.code);
        setExplanation(genData.explanation);
        toast.success("Code generated!");

        // Test
        setStep("testing");
        const testRes = await fetch("/api/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: genData.code,
            language: lang,
            requirement: req,
          }),
        });

        if (!testRes.ok) throw new Error("Failed to run tests");

        let testData: TestResult = await testRes.json();
        setTestResult(testData);

        // Fix loop
        let currentCode = genData.code;
        let currentIteration = 0;

        while (!testData.success && currentIteration < MAX_FIX_ITERATIONS) {
          currentIteration++;
          setIteration(currentIteration);
          setStep("fixing");

          const fixRes = await fetch("/api/fix", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: currentCode,
              language: lang,
              errors: testData.errors,
              testResults: testData,
            }),
          });

          if (!fixRes.ok) throw new Error("Failed to fix code");

          const fixData: FixResponse = await fixRes.json();
          currentCode = fixData.code;
          setCode(fixData.code);
          setFixHistory((prev) => [...prev, fixData]);
          toast.success(`Fix #${currentIteration} applied`);

          // Re-test
          setStep("testing");
          const reTestRes = await fetch("/api/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: currentCode,
              language: lang,
              requirement: req,
            }),
          });

          if (!reTestRes.ok) throw new Error("Failed to re-test");

          testData = await reTestRes.json();
          setTestResult(testData);
        }

        if (testData.success) {
          setStep("complete");
          toast.success("All tests passed! Code is ready.", { duration: 5000 });
        } else {
          setStep("tested");
          toast.error("Some tests still fail after max iterations.");
        }
      } catch (error) {
        setStep("error");
        toast.error(
          error instanceof Error ? error.message : "Something went wrong"
        );
      }
    },
    []
  );

  const handleReset = () => {
    setStep("idle");
    setCode("");
    setExplanation("");
    setTestResult(null);
    setFixHistory([]);
    setIteration(0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "toast-custom",
          duration: 3000,
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid rgba(99, 102, 241, 0.3)",
          },
        }}
      />

      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero section when idle */}
        {step === "idle" && (
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent mb-3">
              Build APIs with AI
            </h2>
            <p className="text-dark-400 text-sm sm:text-base max-w-2xl mx-auto">
              Describe your API requirements in natural language. AI will
              generate production-ready code, run comprehensive tests, and
              automatically fix any issues.
            </p>
            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
              <div className="p-4 bg-dark-800/50 border border-dark-700/50 rounded-xl">
                <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FileCode2 className="w-5 h-5 text-primary-400" />
                </div>
                <h3 className="text-sm font-semibold text-dark-200 mb-1">
                  Smart Generation
                </h3>
                <p className="text-xs text-dark-400">
                  Gemini generates clean, type-safe API code
                </p>
              </div>
              <div className="p-4 bg-dark-800/50 border border-dark-700/50 rounded-xl">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FlaskConical className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-sm font-semibold text-dark-200 mb-1">
                  Auto Testing
                </h3>
                <p className="text-xs text-dark-400">
                  Comprehensive tests for security & edge cases
                </p>
              </div>
              <div className="p-4 bg-dark-800/50 border border-dark-700/50 rounded-xl">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Wrench className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-sm font-semibold text-dark-200 mb-1">
                  Self-Healing
                </h3>
                <p className="text-xs text-dark-400">
                  AI automatically fixes issues until tests pass
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Requirement input */}
        <section className="mb-6">
          <div className="bg-dark-800/30 border border-dark-700/50 rounded-2xl p-6 glow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-dark-100 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-primary-400" />
                API Requirements
              </h2>
              {step !== "idle" && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-dark-400 hover:text-white bg-dark-800 border border-dark-700 rounded-lg hover:border-dark-600 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>
            <RequirementInput
              onSubmit={handleAutoRun}
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* Workflow status */}
        {step !== "idle" && (
          <section className="mb-6 animate-slide-up">
            <WorkflowStatus
              currentStep={step}
              iteration={iteration}
              maxIterations={MAX_FIX_ITERATIONS}
            />
          </section>
        )}

        {/* Content grid */}
        {code && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
            {/* Left: Code Editor */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-dark-100 flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-primary-400" />
                  Generated Code
                </h2>
                {!isLoading && (
                  <button
                    onClick={() => handleTest(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-all shadow-lg shadow-green-500/20"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    {testResult ? "Re-Test" : "Run Tests"}
                  </button>
                )}
              </div>

              {/* Explanation */}
              {explanation && (
                <div className="mb-3 p-3 bg-primary-500/5 border border-primary-500/20 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-primary-200/80 leading-relaxed">
                      {explanation}
                    </p>
                  </div>
                </div>
              )}

              <CodeEditor
                code={code}
                language={language}
                onChange={(v) => setCode(v)}
                readOnly={isLoading}
              />
            </section>

            {/* Right: Test Results & Fix History */}
            <section>
              {testResult ? (
                <div className="space-y-6">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-base font-semibold text-dark-100 flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-green-400" />
                        Test Results
                      </h2>
                      {!testResult.success &&
                        iteration >= MAX_FIX_ITERATIONS && (
                          <span className="text-xs text-orange-400/80 flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5" />
                            Max auto-fix reached — edit code &amp; re-test
                          </span>
                        )}
                    </div>
                    <TestResults result={testResult} />
                  </div>

                  {/* Fix History */}
                  <FixHistory fixes={fixHistory} />
                </div>
              ) : step !== "idle" && step !== "generating" && step !== "generated" ? (
                <div className="flex flex-col items-center justify-center h-64 text-dark-500">
                  <FlaskConical className="w-8 h-8 mb-3 animate-pulse" />
                  <p className="text-sm">Running tests...</p>
                </div>
              ) : code ? (
                <div className="flex flex-col items-center justify-center h-64 text-dark-500 border border-dashed border-dark-700 rounded-xl">
                  <ArrowDown className="w-6 h-6 mb-2 animate-bounce" />
                  <p className="text-sm">
                    Click &quot;Run Tests&quot; to validate the code
                  </p>
                </div>
              ) : null}
            </section>
          </div>
        )}

        {/* Error state */}
        {step === "error" && !code && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-dark-200 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-dark-400 mb-4">
              Please check your API key and network connection, then try again.
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-dark-800 border border-dark-700 text-dark-300 text-sm rounded-lg hover:border-primary-500/30 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-xs text-dark-500">
            AI Code Forge - Intelligent API Generator
          </p>
          <p className="text-xs text-dark-600">
            Powered by Google Gemini
          </p>
        </div>
      </footer>
    </div>
  );
}
