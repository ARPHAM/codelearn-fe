import React, { useEffect, useRef } from 'react';

export interface TestcaseResult {
  id: number;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILE_ERROR';
  runtime: number;
  memory: number;
}

export interface SubmissionResultData {
  status: 'PENDING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILE_ERROR';
  score?: number;
  runtime?: number;
  memory?: number;
  testcases: TestcaseResult[];
}

interface SubmissionPanelProps {
  result?: SubmissionResultData | null;
  isLoading?: boolean;
}

export default function SubmissionPanel({ result, isLoading }: SubmissionPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new results arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [result]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'WRONG_ANSWER': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'COMPILE_ERROR': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'RUNTIME_ERROR': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'TIME_LIMIT_EXCEEDED': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'MEMORY_LIMIT_EXCEEDED': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'text-emerald-500';
      case 'WRONG_ANSWER': return 'text-rose-500';
      case 'COMPILE_ERROR': return 'text-amber-500';
      case 'RUNTIME_ERROR': return 'text-purple-500';
      case 'TIME_LIMIT_EXCEEDED': return 'text-yellow-500';
      case 'MEMORY_LIMIT_EXCEEDED': return 'text-blue-500';
      default: return 'text-slate-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-card border-t border-border p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <div className="text-muted-foreground font-medium animate-pulse">Evaluating submission against hidden testcases...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full bg-card border-t border-border text-muted-foreground italic">
        Submit code to see evaluation results
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card border-t border-border" ref={containerRef}>
      {/* Overview Scorecard */}
      <div className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border ${getStatusColor(result.status)}`}>
        <div>
          <h2 className="text-2xl font-black tracking-tight mb-1">{result.status.replace(/_/g, ' ')}</h2>
          {result.score !== undefined && (
            <div className="font-medium opacity-80">Score: {result.score}/100</div>
          )}
        </div>
        
        <div className="flex gap-4">
          <div className="bg-background/40 backdrop-blur rounded p-2 text-center min-w-[70px]">
            <div className="text-[10px] uppercase font-bold opacity-70 mb-1">Runtime</div>
            <div className="font-mono font-semibold">{result.runtime ?? '-'} <span className="text-xs font-normal">ms</span></div>
          </div>
          <div className="bg-background/40 backdrop-blur rounded p-2 text-center min-w-[70px]">
            <div className="text-[10px] uppercase font-bold opacity-70 mb-1">Memory</div>
            <div className="font-mono font-semibold">{result.memory ?? '-'} <span className="text-xs font-normal">MB</span></div>
          </div>
        </div>
      </div>

      {/* Testcases Table */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <h3 className="text-sm font-bold mb-3 text-foreground">Testcases Details</h3>
        {result.testcases && result.testcases.length > 0 ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/50 text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="p-3 font-semibold border-b border-border">Testcase</th>
                  <th className="p-3 font-semibold border-b border-border">Status</th>
                  <th className="p-3 font-semibold border-b border-border text-right">Runtime</th>
                  <th className="p-3 font-semibold border-b border-border text-right">Memory</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {result.testcases.map((tc, idx) => (
                  <tr key={tc.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="p-3 text-secondary-foreground font-semibold">Test {idx + 1}</td>
                    <td className="p-3 font-bold">
                      <span className={getBadgeColor(tc.status)}>
                        {tc.status === 'ACCEPTED' ? '✓ ' : '✗ '}{tc.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right text-muted-foreground">{tc.runtime} ms</td>
                    <td className="p-3 text-right text-muted-foreground">{tc.memory} MB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-muted-foreground italic text-sm">No testcases data available.</div>
        )}
      </div>
    </div>
  );
}
