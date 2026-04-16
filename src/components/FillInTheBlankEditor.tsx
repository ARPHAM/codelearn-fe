'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { LanguageFile } from '@/api/problems.api'

// ---------------- MONACO UTILS ----------------
const getMonacoLanguage = (ext: string, languages: any[] = [], languageId?: number): string => {
    if (languageId === 0) return 'text';
    const langObj = languages.find(l => (l.ext || '').toLowerCase() === ext.toLowerCase());
    if (langObj) {
        const name = langObj.name.toLowerCase();
        if (name === 'c++') return 'cpp';
        return name;
    }
    const mapping: Record<string, string> = {
        '.py': 'python', '.cpp': 'cpp', '.cxx': 'cpp', '.java': 'java', '.js': 'javascript',
        '.ts': 'typescript', '.cs': 'csharp', '.go': 'go', '.rs': 'rust', '.php': 'php',
        '.rb': 'ruby', '.sql': 'sql', '.css': 'css', '.html': 'html',
    }
    return mapping[ext.toLowerCase()] || 'text'
}

const getExt = (filename: string) => {
    const parts = filename.split('.');
    return parts.length > 1 ? '.' + parts.pop() : '';
}

interface FillInTheBlankEditorProps {
    file: LanguageFile | { id: string | number, path: string, content: string, type: string, languageId?: number };
    updateFile: (id: string, field: string, value: any) => void;
    languages: any[];
    isStudent?: boolean;
    height?: string;
    onMount?: (editor: any, monaco: any) => void;
}

export default function FillInTheBlankEditor({ file, updateFile, languages, isStudent = false, height = "220px", onMount }: FillInTheBlankEditorProps) {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const [isRawMode, setIsRawMode] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const widgetsRef = useRef<any[]>([]);
    const decorationsRef = useRef<string[]>([]);

    const isTemplate = file.type === 'TEMPLATE';
    const showWidgets = isTemplate && !isRawMode;

    const clearWidgets = useCallback(() => {
        if (!editorRef.current) return;
        widgetsRef.current.forEach(w => editorRef.current.removeContentWidget(w));
        widgetsRef.current = [];
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }, []);

    const renderWidgets = useCallback(() => {
        if (!editorRef.current || !monacoRef.current || !showWidgets) {
            clearWidgets();
            return;
        }

        const editor = editorRef.current;
        const monaco = monacoRef.current;
        const model = editor.getModel();
        if (!model) return;

        const text = model.getValue();
        const regex = /\{\{([\s\S]*?)\}\}/g;
        let match;
        const newWidgets: any[] = [];
        const newDecorations: any[] = [];

        while ((match = regex.exec(text)) !== null) {
            const startPos = model.getPositionAt(match.index);
            const endPos = model.getPositionAt(match.index + match[0].length);
            const content = match[1];
            const range = new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column);

            // 1. Decoration to hide original text
            newDecorations.push({
                range: range,
                options: { 
                    inlineClassName: 'fill-blank-hidden',
                    stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                }
            });

            // 2. Content Widget (The input)
            const widgetId = `blank-${match.index}`;
            const domNode = document.createElement('div');
            domNode.className = 'monaco-input-widget';
            
            const input = document.createElement('input');
            input.value = content;
            input.placeholder = '...';
            input.oninput = (e) => {
                const val = (e.target as HTMLInputElement).value;
                editor.executeEdits("fill-in-the-blank", [{
                    range: range,
                    text: `{{${val}}}`,
                    forceMoveMarkers: true
                }]);
                updateFile(file.id?.toString() || '', 'content', editor.getValue());
            };
            
            domNode.appendChild(input);

            const widget = {
                getId: () => widgetId,
                getDomNode: () => domNode,
                getPosition: () => ({
                    position: startPos,
                    preference: [monaco.editor.ContentWidgetPositionPreference.EXACT]
                })
            };

            editor.addContentWidget(widget);
            newWidgets.push(widget);
        }

        // Cleanup old widgets before setting new ones
        widgetsRef.current.forEach(w => editor.removeContentWidget(w));
        widgetsRef.current = newWidgets;
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
    }, [showWidgets, file.id, updateFile]);

    useEffect(() => {
        renderWidgets();
    }, [file.content, renderWidgets]);

    const handleMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        
        monaco.editor.defineTheme('aiDark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#0b0f1a',
                'editor.lineHighlightBackground': '#1b1f3a',
            },
        });
        monaco.editor.setTheme('aiDark');

        editor.onDidBlurEditorWidget(() => setIsFocused(false));
        editor.onDidFocusEditorWidget(() => setIsFocused(true));

        if (onMount) onMount(editor, monaco);
        renderWidgets();
    };

    const ext = getExt(file.path || '');
    const lang = getMonacoLanguage(ext, languages, file.languageId);

    return (
        <div className="fill-in-the-blank-wrapper" style={{ position: 'relative', width: '100%', height: height, display: 'flex', flexDirection: 'column' }}>
            <style dangerouslySetInnerHTML={{ __html: `
                .fill-blank-hidden {
                    opacity: 0 !important;
                    font-size: 0 !important;
                    letter-spacing: -100px !important;
                }
                .monaco-input-widget {
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    background: transparent;
                }
                .monaco-input-widget input {
                    background: rgba(139, 92, 246, 0.1);
                    border: none;
                    border-bottom: 2px solid var(--accent-purple);
                    color: var(--accent-purple-light);
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 13px;
                    padding: 0 4px;
                    outline: none;
                    min-width: 40px;
                    max-width: 300px;
                    transition: all 0.2s;
                    border-radius: 2px 2px 0 0;
                }
                .monaco-input-widget input:focus {
                    background: rgba(139, 92, 246, 0.2);
                    border-bottom-color: var(--accent-purple-light);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .raw-mode-toggle {
                    position: absolute;
                    top: 8px;
                    right: 24px;
                    z-index: 20;
                    background: rgba(0,0,0,0.6);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .raw-mode-toggle:hover {
                    color: var(--text-primary);
                    background: rgba(255,255,255,0.05);
                }
                .raw-mode-toggle.active {
                    color: var(--accent-purple-light);
                    border-color: var(--accent-purple-light);
                }
            `}} />

            {!isStudent && isTemplate && (
                <button 
                    className={`raw-mode-toggle ${isRawMode ? 'active' : ''}`}
                    onClick={() => setIsRawMode(!isRawMode)}
                >
                    {isRawMode ? '🟢 Mode: RAW (Code)' : '🟣 Mode: FILL (UI)'}
                </button>
            )}

            <Editor
                height={height}
                language={lang}
                value={file.content}
                onChange={val => {
                    if (isRawMode || !isTemplate) updateFile(file.id?.toString() || '', 'content', val || '');
                }}
                onMount={handleMount}
                theme="aiDark"
                options={{ 
                    fontSize: 13, 
                    minimap: { enabled: false }, 
                    scrollBeyondLastLine: false,
                    padding: { top: 12, bottom: 12 },
                    fontFamily: "'JetBrains Mono', monospace",
                    readOnly: isStudent && !showWidgets,
                }}
            />
        </div>
    )
}
