"use client";

import {
  Sparkles,
  FlaskConical,
  Wrench,
  CheckCircle2,
  Loader2,
  Circle,
} from "lucide-react";
import type { WorkflowStep } from "@/types";

interface WorkflowStatusProps {
  currentStep: WorkflowStep;
  iteration: number;
  maxIterations: number;
}

interface StepConfig {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  activeSteps: WorkflowStep[];
  doneSteps: WorkflowStep[];
}

const STEPS: StepConfig[] = [
  {
    key: "generate",
    label: "Generate",
    description: "AI generates API code from your requirements",
    icon: <Sparkles className="w-4 h-4" />,
    activeSteps: ["generating"],
    doneSteps: [
      "generated",
      "testing",
      "tested",
      "fixing",
      "fixed",
      "complete",
    ],
  },
  {
    key: "test",
    label: "Test",
    description: "Automated testing and validation",
    icon: <FlaskConical className="w-4 h-4" />,
    activeSteps: ["testing"],
    doneSteps: ["tested", "fixing", "fixed", "complete"],
  },
  {
    key: "fix",
    label: "Auto-Fix",
    description: "AI automatically fixes any issues found",
    icon: <Wrench className="w-4 h-4" />,
    activeSteps: ["fixing"],
    doneSteps: ["fixed", "complete"],
  },
  {
    key: "done",
    label: "Complete",
    description: "Code is ready for use",
    icon: <CheckCircle2 className="w-4 h-4" />,
    activeSteps: [],
    doneSteps: ["complete"],
  },
];

export default function WorkflowStatus({
  currentStep,
  iteration,
  maxIterations,
}: WorkflowStatusProps) {
  const getStepStatus = (step: StepConfig) => {
    if (step.activeSteps.includes(currentStep)) return "active";
    if (step.doneSteps.includes(currentStep)) return "done";
    return "pending";
  };

  if (currentStep === "idle") return null;

  return (
    <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-dark-200">
          Workflow Progress
        </h3>
        {iteration > 0 && (
          <span className="text-[10px] text-dark-400 bg-dark-700 px-2 py-1 rounded-full">
            Iteration {iteration}/{maxIterations}
          </span>
        )}
      </div>

      <div className="flex items-center gap-0">
        {STEPS.map((step, index) => {
          const status = getStepStatus(step);
          return (
            <div key={step.key} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    status === "active"
                      ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30 glow-strong"
                      : status === "done"
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                      : "bg-dark-700 text-dark-400"
                  }`}
                >
                  {status === "active" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : status === "done" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium whitespace-nowrap ${
                    status === "active"
                      ? "text-primary-300"
                      : status === "done"
                      ? "text-green-400"
                      : "text-dark-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      getStepStatus(STEPS[index + 1]) !== "pending" ||
                      status === "active"
                        ? "bg-gradient-to-r from-green-500 to-primary-500"
                        : "bg-dark-700"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
