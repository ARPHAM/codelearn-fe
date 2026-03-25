'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import TestcaseEditor, { Testcase } from '@/components/admin/TestcaseEditor';
import { useExerciseDetail } from './_api/queries';
import { useUpdateExerciseTestcases } from './_api/mutations';

export default function AdminExerciseTestcasesPage() {
  const params = useParams();
  const exerciseId = Array.isArray(params.exerciseId) ? params.exerciseId[0] : params.exerciseId || '';
  const router = useRouter();

  const {
    data: exerciseDetail,
    isLoading: isExerciseDetailLoading
  } = useExerciseDetail(exerciseId);

  const saveMutation = useUpdateExerciseTestcases(exerciseId);

  const handleSaveTestcases = async (testcases: Testcase[]) => {
    if (!exerciseId) return;
    try {
      await saveMutation.mutateAsync(testcases);
    } catch {
      // Error is handled in the mutation hook (toast)
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground mb-2 text-sm font-semibold flex items-center gap-1">
            ← Back to Exercise Settings
          </button>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Manage Testcases</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage testcases for exercise: {exerciseDetail?.title ? `"${exerciseDetail.title}"` : exerciseId}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm min-h-[500px]">
        {isExerciseDetailLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
            Loading testcases data...
          </div>
        ) : (
          <TestcaseEditor
            initialTestcases={exerciseDetail?.testCases || []}
            onSave={handleSaveTestcases}
            isSaving={saveMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}
