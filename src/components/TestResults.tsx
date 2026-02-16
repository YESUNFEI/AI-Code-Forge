"use client";

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import type { TestResult, TestCase } from "@/types";

interface TestResultsProps {
  result: TestResult;
}

function TestCaseItem({ test }: { test: TestCase }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${
        test.status === "pass"
          ? "border-green-500/20 bg-green-500/5"
          : test.status === "fail"
          ? "border-red-500/20 bg-red-500/5"
          : "border-yellow-500/20 bg-yellow-500/5"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          {test.status === "pass" ? (
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          ) : test.status === "fail" ? (
            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          )}
          <span className="text-sm text-dark-200 font-medium">
            {test.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {test.duration !== undefined && (
            <span className="text-[10px] text-dark-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {test.duration}ms
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-dark-400 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-2.5 border-t border-dark-700/30">
          <p className="text-xs text-dark-400 mt-2 leading-relaxed">
            {test.message}
          </p>
        </div>
      )}
    </div>
  );
}

export default function TestResults({ result }: TestResultsProps) {
  const passCount = result.tests.filter((t) => t.status === "pass").length;
  const failCount = result.tests.filter((t) => t.status === "fail").length;
  const total = result.tests.length;
  const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div
        className={`flex items-center justify-between p-4 rounded-xl border ${
          result.success
            ? "bg-green-500/5 border-green-500/20"
            : "bg-red-500/5 border-red-500/20"
        }`}
      >
        <div className="flex items-center gap-3">
          {result.success ? (
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-dark-100">
              {result.success ? "All Tests Passed" : "Tests Failed"}
            </p>
            <p className="text-xs text-dark-400 mt-0.5">{result.summary}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-dark-100">{passRate}%</p>
          <p className="text-[10px] text-dark-400">
            {passCount}/{total} passed
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
        <div className="h-full flex">
          <div
            className="bg-green-500 transition-all duration-500"
            style={{ width: `${(passCount / Math.max(total, 1)) * 100}%` }}
          />
          <div
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${(failCount / Math.max(total, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Test cases */}
      <div className="space-y-2">
        {result.tests.map((test, index) => (
          <TestCaseItem key={index} test={test} />
        ))}
      </div>

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
          <p className="text-xs font-semibold text-red-400 mb-2">
            Errors Found:
          </p>
          <ul className="space-y-1">
            {result.errors.map((error, index) => (
              <li
                key={index}
                className="text-xs text-red-300/80 flex items-start gap-2"
              >
                <span className="text-red-500 mt-0.5">-</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
