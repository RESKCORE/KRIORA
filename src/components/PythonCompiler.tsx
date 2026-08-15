import React, { useState, useEffect } from "react";
import { Play, RotateCcw, AlertCircle, CheckCircle2, Loader2, Terminal, Cpu, Copy, Check, Clock, ChevronDown, ChevronUp, Code2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { runPythonWithStdin } from "@/lib/pythonRunner";

interface PythonCompilerProps {
  starterCode?: string;
  topicId?: string;
  studentId?: string;
}

type ExecutionStatus = "idle" | "initializing" | "running" | "success" | "error" | "blocked" | "sandbox-not-ready";

export default function PythonCompiler({ starterCode = "", topicId, studentId }: PythonCompilerProps) {
  const [code, setCode] = useState(starterCode);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [status, setStatus] = useState<ExecutionStatus>("idle");
  const [executionMs, setExecutionMs] = useState<number | null>(null);
  const [history, setHistory] = useState<{ code: string; output: string; error: string; ts: string; duration?: number }[]>([]);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"output" | "stdin" | "history">("output");
  const [copied, setCopied] = useState(false);

  // Sync starterCode when prop updates or topicId changes
  useEffect(() => {
    setCode(starterCode || "");
    setOutput("");
    setErrorMsg("");
    setStatus("idle");
    setExecutionMs(null);
  }, [topicId, starterCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    if (!code.trim()) return;
    setStatus("running");
    setOutput("");
    setErrorMsg("");
    setExecutionMs(null);
    setActiveConsoleTab("output");

    const start = Date.now();

    try {
      const result = await runPythonWithStdin(code, stdin);
      const elapsed = Date.now() - start;
      setExecutionMs(elapsed);

      if (result.error) {
        setStatus("error");
        setErrorMsg(result.stderr || result.error);
        if (result.stdout) setOutput(result.stdout);
      } else {
        setStatus("success");
        setOutput(result.stdout || "(program completed with no output)");
        if (result.stderr) setErrorMsg(result.stderr);
      }

      setHistory((prev) => [
        { code: code.slice(0, 200), output: result.stdout || "", error: (result.stderr || result.error) || "", ts: new Date().toLocaleTimeString(), duration: elapsed },
        ...prev.slice(0, 4),
      ]);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg("Execution Error: " + (err.message || "Failed to execute code."));
    }
  };

  const handleReset = () => {
    setCode(starterCode);
    setStdin("");
    setOutput("");
    setErrorMsg("");
    setStatus("idle");
    setExecutionMs(null);
  };

  const lineCount = (code.match(/\n/g) || []).length + 1;

  return (
    <div className="bg-[#0D1117] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs select-none">
      {/* IDE Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161B22] border-b border-slate-800">
        {/* Left: Window Controls & Engine Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
          </div>

          <div className="h-4 w-px bg-slate-700/80 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200 text-xs tracking-tight">main.py</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60 font-mono">
              <Cpu className="w-3 h-3 text-emerald-400" /> Python 3.11 WASM
            </span>
          </div>
        </div>

        {/* Right: Runtime Telemetry & Action Buttons */}
        <div className="flex items-center gap-2.5">
          {executionMs !== null && status === "success" && (
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/50">
              <Clock className="w-3 h-3" /> {executionMs}ms
            </span>
          )}

          <button
            onClick={handleCopyCode}
            title="Copy Code"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleReset}
            title="Reset code to default"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRun}
            disabled={status === "running" || !code.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            {status === "running" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & Line Numbers */}
      <div className="flex bg-[#0D1117] min-h-[220px] max-h-[420px] overflow-y-auto">
        {/* Line Numbers Gutter */}
        <div className="py-4 px-3 text-right text-slate-600 bg-[#0D1117] select-none text-[11px] font-mono leading-relaxed border-r border-slate-800/60 shrink-0">
          {Array.from({ length: Math.max(lineCount, 8) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code Textarea */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-transparent text-emerald-300 font-mono text-xs p-4 resize-none focus:outline-none leading-relaxed border-none scrollbar-thin scrollbar-thumb-slate-800 select-text"
          placeholder="# Write or test Python code here...&#10;print('Hello Kriora!')"
        />
      </div>

      {/* Interactive Bottom Console / Tabs */}
      <div className="border-t border-slate-800 bg-[#161B22]">
        <div className="flex items-center justify-between px-3 border-b border-slate-800/80">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveConsoleTab("output")}
              className={`px-3 py-2 text-[11px] font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeConsoleTab === "output"
                  ? "border-[#FF5A36] text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Output Console</span>
              {status === "error" && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
              {status === "success" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>

            <button
              onClick={() => setActiveConsoleTab("stdin")}
              className={`px-3 py-2 text-[11px] font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeConsoleTab === "stdin"
                  ? "border-[#FF5A36] text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Program Input (STDIN)</span>
              {stdin.trim() && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </button>

            <button
              onClick={() => setActiveConsoleTab("history")}
              className={`px-3 py-2 text-[11px] font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeConsoleTab === "history"
                  ? "border-[#FF5A36] text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>History ({history.length})</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
            {status === "running" ? "Processing..." : status === "success" ? "Execution Succeeded" : status === "error" ? "Execution Failed" : "Idle"}
          </div>
        </div>

        {/* Tab 1: Terminal Output */}
        {activeConsoleTab === "output" && (
          <div className="p-4 bg-[#0D1117] min-h-[100px] max-h-[220px] overflow-y-auto space-y-2 select-text">
            {status === "running" ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executing code in isolated WebAssembly container...</span>
              </div>
            ) : output || errorMsg ? (
              <>
                {output && (
                  <pre className="text-emerald-400 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {output}
                  </pre>
                )}
                {errorMsg && (
                  <div className="flex items-start gap-2 bg-rose-950/40 border border-rose-900/60 p-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <pre className="text-rose-300 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto">
                      {errorMsg}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-500 text-xs italic py-2">
                Click "Run Code" to execute the script in the Pyodide WebAssembly sandbox.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Program Input (STDIN) */}
        {activeConsoleTab === "stdin" && (
          <div className="p-4 bg-[#0D1117] space-y-2 select-text">
            <p className="text-[11px] text-slate-400">
              Provide input lines that will be read sequentially by Python <code className="text-emerald-400">input()</code> calls:
            </p>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              rows={3}
              className="w-full bg-[#161B22] border border-slate-800 text-slate-200 font-mono text-xs p-3 rounded-xl focus:outline-none focus:border-slate-600 resize-none leading-relaxed"
              placeholder="e.g.&#10;Alice&#10;25"
            />
          </div>
        )}

        {/* Tab 3: Execution History */}
        {activeConsoleTab === "history" && (
          <div className="p-3 bg-[#0D1117] space-y-2 max-h-[220px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-slate-500 text-xs italic p-2">No execution runs recorded yet in this session.</div>
            ) : (
              history.map((h, i) => (
                <div key={i} className="p-2.5 bg-[#161B22] rounded-xl border border-slate-800/80 text-[11px] font-mono flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-slate-500 text-[10px]">{h.ts}</span>
                    <span className="truncate text-slate-300">{h.output ? h.output.replace(/\n/g, " ") : h.error.replace(/\n/g, " ")}</span>
                  </div>
                  <Badge variant={h.error ? "destructive" : "success"} className="text-[9px] shrink-0">
                    {h.error ? "Error" : "Passed"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
