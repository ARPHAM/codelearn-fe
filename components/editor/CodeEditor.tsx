'use client';

import React, { useRef, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  onRun?: () => void;
  onSubmit?: () => void;
}

export default function CodeEditor({
  language,
  value,
  onChange,
  onRun,
  onSubmit,
}: CodeEditorProps) {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('customDark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#0f172a', // Tailwind slate-900
          'editor.lineHighlightBackground': '#1e293b',
        },
      });
      monaco.editor.setTheme('customDark');
    }
  }, [monaco]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // Add shortcuts
    editor.addCommand(monaco!.KeyMod.CtrlCmd | monaco!.KeyCode.Enter, () => {
      onRun?.();
    });

    editor.addCommand(monaco!.KeyMod.CtrlCmd | monaco!.KeyMod.Shift | monaco!.KeyCode.Enter, () => {
      onSubmit?.();
    });
  };

  return (
    <div className="w-full h-full min-h-0 bg-slate-900">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        theme="customDark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
        }}
      />
    </div>
  );
}
