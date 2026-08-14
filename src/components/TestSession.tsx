import React, { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TestSessionProps {
  testId: string;
  testTitle: string;
  studentId: string;
  durationMinutes: number;
  onSubmit: (sessionId: string, answers: Record<string, string>) => void;
  onExit: () => void;
}

export default function TestSession({
  testId, testTitle, durationMinutes, onSubmit
}: TestSessionProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSession = () => {
    setSessionId("tsess-" + Date.now());
    setStarted(true);
  };

  useEffect(() => {
    if (!started) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleForceSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started]);

  const handleForceSubmit = () => {
    if (!sessionId) return;
    onSubmit(sessionId, {});
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m + ":" + String(s).padStart(2, "0");
  };

  if (!started) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-lg mx-auto text-center space-y-5 shadow-xl">
        <h2 className="text-lg font-black text-slate-900">{testTitle}</h2>
        <p className="text-xs text-slate-500 font-medium">Duration: <span className="font-bold text-slate-800">{durationMinutes} minutes</span></p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 text-left space-y-2">
          <p className="font-bold text-slate-900">Assessment Guidelines:</p>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600 text-[11px]">
            <li>Write clean, working Python code to solve the problem requirements.</li>
            <li>Run and test your code in the embedded console before final submission.</li>
            <li>The test will automatically record and submit when the timer expires.</li>
          </ul>
        </div>
        <Button onClick={startSession} className="w-full py-2.5 bg-[#FF5A36] hover:bg-[#e04523] text-white font-bold rounded-xl shadow-lg shadow-orange-500/25">
          Begin Assessment
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Test header bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
        <div>
          <p className="text-xs font-bold text-slate-900">{testTitle}</p>
          <p className="text-[10px] text-slate-400 font-mono">Assessment ID: {testId}</p>
        </div>
        <div className={"flex items-center gap-2 font-mono font-black text-sm px-3 py-1.5 rounded-lg " + (secondsLeft < 300 ? "bg-red-50 text-red-600 border border-red-200" : "bg-slate-100 text-slate-800")}>
          <Clock className="w-4 h-4" />
          {formatTime(secondsLeft)}
        </div>
      </div>

      {/* Test content slot */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <p className="text-xs text-slate-500 text-center font-medium">Test session active. Please complete and submit your code in the assessment workspace.</p>
      </div>
    </div>
  );
}
