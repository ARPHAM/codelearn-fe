import React, { useState, useEffect } from 'react';

export interface Testcase {
  input: string;
  output: string;
  hidden: boolean;
}

interface TestcaseEditorProps {
  initialTestcases: Testcase[];
  onSave: (testcases: Testcase[]) => void;
  isSaving?: boolean;
}

export default function TestcaseEditor({ initialTestcases, onSave, isSaving }: TestcaseEditorProps) {
  const [testcases, setTestcases] = useState<Testcase[]>([]);

  useEffect(() => {
    setTestcases([...initialTestcases]);
  }, [initialTestcases]);

  const handleUpdate = (index: number, field: keyof Testcase, value: any) => {
    const newTcs = [...testcases];
    newTcs[index] = { ...newTcs[index], [field]: value };
    setTestcases(newTcs);
  };

  const handleAdd = () => {
    setTestcases([...testcases, {
      input: '',
      output: '',
      hidden: false
    }]);
  };

  const handleDelete = (index: number) => {
    const newTcs = [...testcases];
    newTcs.splice(index, 1);
    setTestcases(newTcs);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newTcs = [...testcases];
    const temp = newTcs[index];
    newTcs[index] = newTcs[index - 1];
    newTcs[index - 1] = temp;
    setTestcases(newTcs);
  };

  const moveDown = (index: number) => {
    if (index === testcases.length - 1) return;
    const newTcs = [...testcases];
    const temp = newTcs[index];
    newTcs[index] = newTcs[index + 1];
    newTcs[index + 1] = temp;
    setTestcases(newTcs);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-foreground">Manage Testcases ({testcases.length})</h3>
        <div className="flex gap-3">
          <button 
            onClick={handleAdd}
            className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-semibold rounded-md hover:bg-secondary/80 transition-colors"
          >
            + Add Testcase
          </button>
          <button 
            onClick={() => onSave(testcases)}
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin"></div>}
            {isSaving ? 'Saving...' : '💾 Save All'}
          </button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto bg-card shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-secondary/50 text-xs text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="p-3 font-semibold border-b border-border w-16 text-center">Order</th>
              <th className="p-3 font-semibold border-b border-border min-w-[300px]">Input</th>
              <th className="p-3 font-semibold border-b border-border min-w-[300px]">Output</th>
              <th className="p-3 font-semibold border-b border-border w-24 text-center">Hidden?</th>
              <th className="p-3 font-semibold border-b border-border w-28 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {testcases.map((tc, idx) => (
              <tr key={idx} className="hover:bg-secondary/10 transition-colors">
                <td className="p-3 text-center">
                  <div className="flex flex-col gap-1 items-center font-mono font-medium text-muted-foreground">
                    <button onClick={() => moveUp(idx)} disabled={idx === 0} className="hover:text-foreground disabled:opacity-20">▲</button>
                    {idx + 1}
                    <button onClick={() => moveDown(idx)} disabled={idx === testcases.length - 1} className="hover:text-foreground disabled:opacity-20">▼</button>
                  </div>
                </td>
                <td className="p-3">
                  <textarea 
                    className="w-full bg-background border border-input rounded p-2 text-xs font-mono h-24 resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    value={tc.input} 
                    onChange={(e) => handleUpdate(idx, 'input', e.target.value)}
                    placeholder="Input data"
                  />
                </td>
                <td className="p-3">
                  <textarea 
                    className="w-full bg-background border border-input rounded p-2 text-xs font-mono h-24 resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    value={tc.output} 
                    onChange={(e) => handleUpdate(idx, 'output', e.target.value)}
                    placeholder="Expected output"
                  />
                </td>
                <td className="p-3 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    checked={tc.hidden}
                    onChange={(e) => handleUpdate(idx, 'hidden', e.target.checked)}
                  />
                </td>
                <td className="p-3 text-center">
                  <button 
                    onClick={() => handleDelete(idx)}
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 p-2 rounded-md transition-colors"
                    title="Delete Testcase"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            
            {testcases.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                  No testcases available. Click "Add Testcase" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
