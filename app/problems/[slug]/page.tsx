'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProblemDescription from '@/components/problem/ProblemDescription';
import CodeEditor from '@/components/editor/CodeEditor';
import RunPanel from '@/components/editor/RunPanel';
import SubmissionPanel from '@/components/editor/SubmissionPanel';
import { useProblem, useRunResult, useSubmissionResult } from './_api/queries';
import { useRunCode, useSubmitCode } from './_api/mutations';
import { useLanguages } from '@/hooks/useLanguages';
import { toast } from '@/components/ui/Toast';

export default function ProblemWorkspacePage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug || '';
  
  const { data: problem, isLoading: isLoadingProblem } = useProblem(slug);
  const { data: languages } = useLanguages();

  const [languageId, setLanguageId] = useState<number>(0);
  const [code, setCode] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  
  // Track IDs from mutations to trigger polling queries
  const [runId, setRunId] = useState<string | number | null>(null);
  const [submissionId, setSubmissionId] = useState<string | number | null>(null);
  const [activeBottomPanel, setActiveBottomPanel] = useState<'CONSOLE' | 'SUBMISSION' | null>(null);

  const runMutation = useRunCode();
  const submitMutation = useSubmitCode();

  // Polling hooks! enabled if their ID is not null
  const { data: runResult, isLoading: isPollingRun } = useRunResult(runId);
  const { data: submissionResult, isLoading: isPollingSubmission } = useSubmissionResult(submissionId);

  // Initialize lang constraints and local storage
  useEffect(() => {
    if (languages && languages.length > 0 && languageId === 0) {
      setLanguageId(languages[0].id);
    }
  }, [languages, languageId]);

  useEffect(() => {
    if (slug && languageId) {
      const savedCode = localStorage.getItem(`code_${slug}_${languageId}`);
      if (savedCode) {
        setCode(savedCode);
      }
    }
  }, [slug, languageId]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguageId(Number(e.target.value));
  };

  const handleCodeChange = (val: string | undefined) => {
    setCode(val || '');
    if (slug && languageId) {
      localStorage.setItem(`code_${slug}_${languageId}`, val || '');
    }
  };

  const handleRun = async () => {
    if (!problem) return;
    try {
      setActiveBottomPanel('CONSOLE');
      const res = await runMutation.mutateAsync({
        problemId: problem.id,
        languageId,
        code,
        input: customInput,
      });
      // Start polling!
      setRunId(res.id);
    } catch (err: any) {
      console.error(err);
      toast({ type: 'error', title: 'Run Request Failed', message: err.message });
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    try {
      setActiveBottomPanel('SUBMISSION');
      const res = await submitMutation.mutateAsync({
        problemId: problem.id,
        languageId,
        code,
      });
      // Start polling!
      setSubmissionId(res.id);
    } catch (err: any) {
      console.error(err);
      toast({ type: 'error', title: 'Submission Request Failed', message: err.message });
    }
  };

  const isExecuting = runMutation.isPending || submitMutation.isPending || 
     (runResult && runResult.status === 'PENDING') || isPollingRun ||
     (submissionResult && submissionResult.status === 'PENDING') || isPollingSubmission;

  if (isLoadingProblem) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground animate-pulse">Loading workspace...</div>;
  }

  if (!problem) {
    return <div className="flex h-screen items-center justify-center text-rose-500">Problem not found.</div>;
  }

  const selectedLangInfo = languages?.find((l: any) => l.id === languageId);

  return (
    <div className="flex h-[calc(100vh-60px)] w-full overflow-hidden bg-background p-2 gap-2">
      {/* LEFT PANEL */}
      <div className="w-[45%] h-full rounded-xl overflow-hidden border border-border flex flex-col">
        <ProblemDescription problem={problem} />
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[55%] h-full flex flex-col gap-2 rounded-xl overflow-hidden">
        
        {/* Editor Wrapper */}
        <div className="flex-1 flex flex-col border border-border rounded-xl overflow-hidden bg-card">
          
          {/* Editor Header Toolbar */}
          <div className="h-12 bg-secondary/30 flex items-center justify-between px-4 border-b border-border">
            <div className="flex items-center gap-2">
              <select 
                className="bg-background border border-input rounded text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                value={languageId}
                onChange={handleLanguageChange}
              >
                {languages?.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-[10px] text-muted-foreground hidden lg:flex gap-3">
                <span title="Ctrl + Enter">⌨️ Ctrl+Enter = Run</span>
                <span title="Ctrl + Shift + Enter">⌨️ Ctrl+Shift+Enter = Submit</span>
              </div>
              <button 
                onClick={handleRun}
                disabled={Boolean(isExecuting)}
                className="px-4 py-1.5 text-xs font-bold rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors disabled:opacity-50 border border-border"
              >
                {runMutation.isPending || (runResult && runResult.status === 'PENDING' && activeBottomPanel==='CONSOLE') ? 'Running...' : 'Run ▶'}
              </button>
              <button 
                onClick={handleSubmit}
                disabled={Boolean(isExecuting)}
                className="px-4 py-1.5 text-xs font-bold rounded bg-primary hover:bg-primary/90 text-primary-foreground transition-colors disabled:opacity-50"
              >
                {submitMutation.isPending || (submissionResult && submissionResult.status === 'PENDING' && activeBottomPanel==='SUBMISSION') ? 'Submitting...' : 'Submit ☁'}
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            <CodeEditor 
              language={selectedLangInfo?.name?.toLowerCase() || 'javascript'}
              value={code}
              onChange={handleCodeChange}
              onRun={handleRun}
              onSubmit={handleSubmit}
            />
          </div>
        </div>

        {/* BOTTOM PANEL (Results / Console) */}
        {activeBottomPanel && (
          <div className="h-64 border border-border rounded-xl overflow-hidden bg-card flex flex-col shadow-sm relative">
            <div className="absolute top-2 right-2 z-10">
              <button 
                onClick={() => setActiveBottomPanel(null)}
                className="text-muted-foreground hover:text-foreground bg-background rounded p-1"
                title="Close Panel"
              >
                ✕
              </button>
            </div>
            {activeBottomPanel === 'CONSOLE' && (
              <RunPanel 
                customInput={customInput}
                onCustomInputChange={setCustomInput}
                result={runResult}
                isLoading={runMutation.isPending || (runResult && runResult.status === 'PENDING')}
              />
            )}
            
            {activeBottomPanel === 'SUBMISSION' && (
              <SubmissionPanel 
                result={submissionResult}
                isLoading={submitMutation.isPending || (submissionResult && submissionResult.status === 'PENDING')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
