"use client";

import { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  Lightbulb,
} from "lucide-react";
import type { Language } from "@/types";

interface RequirementInputProps {
  onSubmit: (requirement: string, language: Language) => void;
  isLoading: boolean;
}

const LANGUAGES: { value: Language; label: string; icon: string }[] = [
  { value: "typescript", label: "TypeScript", icon: "TS" },
  { value: "python", label: "Python", icon: "PY" },
  { value: "go", label: "Go", icon: "GO" },
  { value: "java", label: "Java", icon: "JV" },
  { value: "rust", label: "Rust", icon: "RS" },
];

const EXAMPLES = [
  "Create a REST API for user CRUD operations with authentication middleware",
  "Build a WebSocket chat server with room support and message history",
  "Design an API endpoint for file upload with validation and cloud storage",
  "Create a rate-limited API gateway with JWT token verification",
  "Build a GraphQL API for an e-commerce product catalog",
];

export default function RequirementInput({
  onSubmit,
  isLoading,
}: RequirementInputProps) {
  const [requirement, setRequirement] = useState("");
  const [language, setLanguage] = useState<Language>("typescript");
  const [showLanguages, setShowLanguages] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const selectedLang = LANGUAGES.find((l) => l.value === language)!;

  const handleSubmit = () => {
    if (requirement.trim() && !isLoading) {
      onSubmit(requirement.trim(), language);
    }
  };

  return (
    <div className="space-y-4">
      {/* Language selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-dark-400">Language:</span>
        <div className="relative">
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            className="flex items-center gap-2 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg hover:border-primary-500/50 transition-all text-sm"
          >
            <span className="text-xs font-mono font-bold text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded">
              {selectedLang.icon}
            </span>
            <span className="text-dark-200">{selectedLang.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-dark-400" />
          </button>
          {showLanguages && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-20 overflow-hidden">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => {
                    setLanguage(lang.value);
                    setShowLanguages(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-dark-700 transition-colors ${
                    lang.value === language
                      ? "bg-primary-500/10 text-primary-300"
                      : "text-dark-200"
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded">
                    {lang.icon}
                  </span>
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="relative">
        <textarea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
          placeholder="Describe the API you want to build... (e.g., 'Create a REST API for managing a todo list with user authentication')"
          rows={4}
          className="w-full bg-dark-800/80 border border-dark-600 rounded-xl px-4 py-3 text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/10 resize-none transition-all text-sm leading-relaxed"
          disabled={isLoading}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className="text-[10px] text-dark-500">
            {navigator?.platform?.includes("Mac") ? "⌘" : "Ctrl"} + Enter
          </span>
          <button
            onClick={handleSubmit}
            disabled={!requirement.trim() || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-lg hover:from-primary-500 hover:to-primary-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30"
          >
            {isLoading ? (
              <>
                <div className="flex gap-1">
                  <span className="loading-dot w-1 h-1 bg-white rounded-full" />
                  <span className="loading-dot w-1 h-1 bg-white rounded-full" />
                  <span className="loading-dot w-1 h-1 bg-white rounded-full" />
                </div>
                Processing
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Examples */}
      <div>
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="flex items-center gap-2 text-xs text-dark-400 hover:text-dark-300 transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          {showExamples ? "Hide" : "Show"} example prompts
          <ChevronDown
            className={`w-3 h-3 transition-transform ${
              showExamples ? "rotate-180" : ""
            }`}
          />
        </button>
        {showExamples && (
          <div className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map((example, i) => (
              <button
                key={i}
                onClick={() => setRequirement(example)}
                className="px-3 py-1.5 text-xs bg-dark-800 border border-dark-700 text-dark-300 rounded-lg hover:border-primary-500/30 hover:text-primary-300 transition-all"
              >
                {example.length > 60 ? example.slice(0, 60) + "..." : example}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
