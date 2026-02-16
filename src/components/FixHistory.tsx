"use client";

import { Wrench, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { FixResponse } from "@/types";

interface FixHistoryProps {
  fixes: FixResponse[];
}

export default function FixHistory({ fixes }: FixHistoryProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (fixes.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
        <Wrench className="w-4 h-4 text-primary-400" />
        Fix History ({fixes.length} iteration{fixes.length !== 1 ? "s" : ""})
      </h3>

      <div className="space-y-2">
        {fixes.map((fix, index) => (
          <div
            key={index}
            className="border border-dark-700/50 rounded-lg bg-dark-800/30 overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded">
                  Fix #{index + 1}
                </span>
                <span className="text-xs text-dark-300 truncate max-w-[300px]">
                  {fix.explanation}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-dark-500">
                  {fix.changes.length} change{fix.changes.length !== 1 ? "s" : ""}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-dark-400 transition-transform ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>
            {expandedIndex === index && (
              <div className="px-4 pb-3 border-t border-dark-700/30">
                <p className="text-xs text-dark-300 mt-2 mb-2">
                  {fix.explanation}
                </p>
                <ul className="space-y-1">
                  {fix.changes.map((change, ci) => (
                    <li
                      key={ci}
                      className="text-xs text-dark-400 flex items-start gap-2"
                    >
                      <span className="text-primary-400 mt-0.5 flex-shrink-0">
                        +
                      </span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
