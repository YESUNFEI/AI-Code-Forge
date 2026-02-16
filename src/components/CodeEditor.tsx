"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Copy, Check, Download, Maximize2, Minimize2 } from "lucide-react";
import type { Language } from "@/types";

interface CodeEditorProps {
  code: string;
  language: Language;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  title?: string;
}

const LANGUAGE_MAP: Record<Language, string> = {
  typescript: "typescript",
  python: "python",
  go: "go",
  java: "java",
  rust: "rust",
};

export default function CodeEditor({
  code,
  language,
  onChange,
  readOnly = false,
  title = "Generated Code",
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleDownload = useCallback(() => {
    const extensions: Record<Language, string> = {
      typescript: "ts",
      python: "py",
      go: "go",
      java: "java",
      rust: "rs",
    };
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `api.${extensions[language]}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, language]);

  const lineCount = code.split("\n").length;
  const editorHeight = expanded
    ? "70vh"
    : `${Math.max(300, Math.min(lineCount * 20 + 40, 500))}px`;

  return (
    <div
      className={`editor-container transition-all duration-300 ${
        expanded ? "fixed inset-4 z-50" : ""
      }`}
    >
      {/* Editor header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-dark-800/90 border-b border-dark-700/50">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-dark-400 font-medium">{title}</span>
          <span className="text-[10px] text-dark-500 font-mono bg-dark-700 px-2 py-0.5 rounded">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-dark-400 hover:text-white transition-colors rounded-md hover:bg-dark-700"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 text-dark-400 hover:text-white transition-colors rounded-md hover:bg-dark-700"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-dark-400 hover:text-white transition-colors rounded-md hover:bg-dark-700"
            title={expanded ? "Minimize" : "Maximize"}
          >
            {expanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <Editor
        height={editorHeight}
        language={LANGUAGE_MAP[language]}
        value={code}
        onChange={(value) => onChange?.(value || "")}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineHeight: 20,
          padding: { top: 12, bottom: 12 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          renderLineHighlight: "gutter",
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          bracketPairColorization: { enabled: true },
          wordWrap: "on",
          tabSize: 2,
        }}
      />

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-dark-800/90 border-t border-dark-700/50">
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-dark-500">
            Lines: {lineCount}
          </span>
          <span className="text-[10px] text-dark-500">
            Chars: {code.length}
          </span>
        </div>
        <span className="text-[10px] text-dark-500">
          {readOnly ? "Read Only" : "Editable"}
        </span>
      </div>

      {/* Expanded overlay */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/60 -z-10"
          onClick={() => setExpanded(false)}
        />
      )}
    </div>
  );
}
