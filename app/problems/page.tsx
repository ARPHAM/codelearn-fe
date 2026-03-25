'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProblems } from './_api/queries';

export default function ProblemsPage() {
  const [page, setPage] = useState(1);
  const [difficulty, setDifficulty] = useState<string>('');
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState('');

  const { data, isLoading, isError } = useProblems({
    page,
    limit: 10,
    difficulty: difficulty || undefined,
    search: search || undefined,
    tags: tags || undefined,
  });

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
    setPage(1);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'EASY': return 'text-emerald-500 font-semibold';
      case 'MEDIUM': return 'text-amber-500 font-semibold';
      case 'HARD': return 'text-rose-500 font-semibold';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Problems</h1>
          <p className="text-muted-foreground mt-1 text-sm">Explore and filter all available coding challenges.</p>
        </div>
        <div className="flex gap-3 items-center bg-card p-2 rounded-lg border border-border shadow-sm">
          <input 
            type="text"
            placeholder="Search problems..."
            className="bg-background border border-input rounded placeholder-muted-foreground px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-primary"
            value={search}
            onChange={handleSearchChange}
          />
          <input 
            type="text"
            placeholder="Tags (comma seq)"
            className="bg-background border border-input rounded placeholder-muted-foreground px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-1 focus:ring-primary"
            value={tags}
            onChange={handleTagsChange}
          />
          <select 
            value={difficulty}
            onChange={handleDifficultyChange}
            className="bg-background border border-input rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/40 text-xs text-muted-foreground uppercase tracking-wider">
              <th className="p-4 font-semibold border-b border-border w-16 text-center">ID</th>
              <th className="p-4 font-semibold border-b border-border">Title</th>
              <th className="p-4 font-semibold border-b border-border w-32">Difficulty</th>
              <th className="p-4 font-semibold border-b border-border w-32 text-center">Acceptance</th>
              <th className="p-4 font-semibold border-b border-border w-64">Tags</th>
              <th className="p-4 font-semibold border-b border-border w-24 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground animate-pulse">
                  Loading problems...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-rose-500 bg-rose-500/5">
                  Failed to load problems. Please try again later.
                </td>
              </tr>
            ) : data?.items?.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground italic">
                  No problems found matching your filters.
                </td>
              </tr>
            ) : (
              data?.items?.map((prob) => (
                <tr key={prob.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="p-4 text-center text-muted-foreground">{prob.id}</td>
                  <td className="p-4 font-semibold text-foreground group-hover:text-primary transition-colors">
                    <Link href={`/problems/${prob.slug}`}>
                      {prob.title}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className={getDifficultyColor(prob.difficulty)}>{prob.difficulty}</span>
                  </td>
                  <td className="p-4 text-center text-muted-foreground font-mono">
                    {prob.acceptanceRate !== undefined ? `${prob.acceptanceRate.toFixed(1)}%` : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {prob.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-secondary-foreground font-medium border border-border/50">
                          {tag}
                        </span>
                      ))}
                      {prob.tags.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full bg-secondary/50 text-[10px] text-muted-foreground border border-border/30">
                          +{prob.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Link 
                      href={`/problems/${prob.slug}`}
                      className="inline-block px-4 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold rounded-full transition-colors border border-primary/20 hover:border-transparent cursor-pointer"
                    >
                      Solve
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination Details */}
        {!isLoading && !isError && data && (
          <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-secondary/10">
            <div>
              Showing {data.items.length} of {data.total} problems
            </div>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 rounded bg-background border border-input disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
                title="Previous Page"
              >
                ← Prev
              </button>
              <div className="px-3 py-1 rounded bg-background border border-input font-medium">
                {page} / {data.totalPages || 1}
              </div>
              <button 
                disabled={page >= (data.totalPages || 1)}
                onClick={() => setPage(p => Math.min(data.totalPages || 1, p + 1))}
                className="px-3 py-1 rounded bg-background border border-input disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
                title="Next Page"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
