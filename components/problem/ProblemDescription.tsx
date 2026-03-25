import React from 'react';
import ExampleBlock, { ExampleData } from './ExampleBlock';

export interface ProblemData {
  id: number;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  examples: ExampleData[];
  constraints?: string[];
  tags: string[];
}

interface ProblemDescriptionProps {
  problem: ProblemData;
}

export default function ProblemDescription({ problem }: ProblemDescriptionProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'EASY': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'HARD': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-card/50">
        <h1 className="text-xl font-bold text-foreground mb-3">{problem.id}. {problem.title}</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          {problem.tags.map(tag => (
            <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {/* HTML Description safely rendered */}
        <div 
          className="prose prose-invert prose-sm max-w-none text-muted-foreground mb-8"
          dangerouslySetInnerHTML={{ __html: problem.description }}
        />

        {/* Examples */}
        {problem.examples && problem.examples.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-foreground mb-3">Examples</h3>
            <div className="space-y-4">
              {problem.examples.map((ex, idx) => (
                <ExampleBlock key={idx} index={idx + 1} example={ex} />
              ))}
            </div>
          </div>
        )}

        {/* Constraints */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">Constraints</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              {problem.constraints.map((c, i) => (
                <li key={i} className="text-xs text-muted-foreground font-mono bg-secondary/50 inline-block px-2 py-1 rounded border border-border/50 w-fit mb-1">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
