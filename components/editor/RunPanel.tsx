import React, { useState } from 'react';

export interface RunResultData {
  status: 'PENDING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILE_ERROR';
  stdout?: string;
  stderr?: string;
  expectedOutput?: string;
  runtime?: number;
  memory?: number;
}

interface RunPanelProps {
  customInput: string;
  onCustomInputChange: (val: string) => void;
  result?: RunResultData | null;
  isLoading?: boolean;
}

export default function RunPanel({ customInput, onCustomInputChange, result, isLoading }: RunPanelProps) {
  const [activeTab, setActiveTab] = useState<'input' | 'output' | 'compile' | 'runtime'>('input');

  const getStatusColor = (status: string) => {
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

  return (
    <div className="flex flex-col h-full bg-card border-t border-border">
      {/* Tabs */}
      <div className="flex bg-secondary/30 border-b border-border overflow-x-auto">
        {(['input', 'output', 'compile', 'runtime'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold capitalize whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            {tab === 'compile' ? 'Compile Error' : tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
            Running code...
          </div>
        ) : (
          <>
            {activeTab === 'input' && (
              <div className="h-full flex flex-col">
                <label className="text-xs text-muted-foreground font-semibold mb-2 block">Custom Input</label>
                <textarea
                  className="flex-1 w-full bg-secondary/20 border border-border rounded-md p-3 text-secondary-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  value={customInput}
                  onChange={(e) => onCustomInputChange(e.target.value)}
                  placeholder="Enter custom input here..."
                />
              </div>
            )}
            {activeTab === 'output' && (
              <div>
                {result ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-muted-foreground">Status:</span>
                      <span className={`font-bold ${getStatusColor(result.status)}`}>{result.status.replace(/_/g, ' ')}</span>
                    </div>
                    {result.runtime !== undefined && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">Runtime:</span>
                        <span className="text-secondary-foreground">{result.runtime} ms</span>
                      </div>
                    )}
                    {result.memory !== undefined && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">Memory:</span>
                        <span className="text-secondary-foreground">{result.memory} MB</span>
                      </div>
                    )}
                    <div>
                      <span className="text-xs text-muted-foreground font-semibold mb-2 block">Stdout</span>
                      <div className="bg-secondary/30 p-3 rounded-md border border-border min-h-[60px] whitespace-pre-wrap">
                        {result.stdout || <span className="opacity-50 italic">No output</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground italic text-center mt-10">Run code to see output</div>
                )}
              </div>
            )}
            {activeTab === 'compile' && (
              <div>
                {result?.stderr && result.status === 'COMPILE_ERROR' ? (
                  <div className="bg-amber-500/10 text-amber-500 p-3 rounded-md border border-amber-500/20 whitespace-pre-wrap">
                    {result.stderr}
                  </div>
                ) : (
                  <div className="text-muted-foreground italic text-center mt-10">No compilation errors</div>
                )}
              </div>
            )}
            {activeTab === 'runtime' && (
              <div>
                {result?.stderr && result.status === 'RUNTIME_ERROR' ? (
                  <div className="bg-purple-500/10 text-purple-500 p-3 rounded-md border border-purple-500/20 whitespace-pre-wrap">
                    {result.stderr}
                  </div>
                ) : (
                  <div className="text-muted-foreground italic text-center mt-10">No runtime errors</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
