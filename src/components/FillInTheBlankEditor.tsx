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
    const isTemplate = file.type === 'TEMPLATE';
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const decorationsRef = useRef<string[]>([]);
    const [ranges, setRanges] = useState<any[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    
    const showOverlay = (isStudent || !isFocused) && isTemplate;
    
    const scanRanges = useCallback(() => {
        if (!editorRef.current || !monacoRef.current) return;
        const editor = editorRef.current;
        const monaco = monacoRef.current;
        const model = editor.getModel();
        if (!model) return;

        const text = model.getValue();
        const regex = /\{\{([\s\S]*?)\}\}/g;
        let match;
        const found: any[] = [];
        const newDecorations: any[] = [];
        
        while ((match = regex.exec(text)) !== null) {
            const startPos = model.getPositionAt(match.index);
            const endPos = model.getPositionAt(match.index + match[0].length);
            const range = new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column);
            
            newDecorations.push({
                range: new monaco.Range(startPos.lineNumber, startPos.column, startPos.lineNumber, startPos.column + 2),
                options: { inlineClassName: 'fill-in-the-blank-bracket' }
            });
            newDecorations.push({
                range: new monaco.Range(endPos.lineNumber, endPos.column - 2, endPos.lineNumber, endPos.column),
                options: { inlineClassName: 'fill-in-the-blank-bracket' }
            });
            newDecorations.push({
                range: new monaco.Range(startPos.lineNumber, startPos.column + 2, endPos.lineNumber, endPos.column - 2),
                options: { inlineClassName: 'fill-in-the-blank-highlight' }
            });

            const startPix = editor.getScrolledVisiblePosition(startPos);
            const endPix = editor.getScrolledVisiblePosition(endPos);
            
            if (startPix) {
                found.push({
                    id: match.index,
                    range: range,
                    content: match[1],
                    top: startPix.top,
                    left: startPix.left,
                    height: editor.getOption(monaco.editor.EditorOption.lineHeight) * (endPos.lineNumber - startPos.lineNumber + 1),
                    width: Math.max(40, (endPix ? endPix.left : editor.getLayoutInfo().width) - startPix.left),
                    isMultiLine: endPos.lineNumber > startPos.lineNumber
                });
            }
        }
        
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
        setRanges(found);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(scanRanges, 100);
        window.addEventListener('resize', scanRanges);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', scanRanges);
        };
    }, [file.content, scanRanges, isFocused]);

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

        editor.onDidScrollChange(() => scanRanges());
        editor.onDidLayoutChange(() => scanRanges());
        editor.onDidBlurEditorWidget(() => setIsFocused(false));
        editor.onDidFocusEditorWidget(() => setIsFocused(true));

        if (onMount) onMount(editor, monaco);
        scanRanges();
    };

    const handleOverlayChange = (range: any, value: string) => {
        const editor = editorRef.current;
        if (!editor || !monacoRef.current) return;
        
        editor.executeEdits("fill-in-the-blank", [{
            range: range,
            text: `{{${value}}}`,
            forceMoveMarkers: true
        }]);
        updateFile(file.id?.toString() || '', 'content', editor.getValue());
    };

    const ext = getExt(file.path || '');
    const lang = getMonacoLanguage(ext, languages, file.languageId);

    return (
        <div className="fill-in-the-blank-editor" style={{ position: 'relative', width: '100%', height: '100%' }}>
            <style dangerouslySetInnerHTML={{ __html: `
                .fill-in-the-blank-bracket {
                    font-size: 0 !important;
                    letter-spacing: -1px !important;
                    display: inline-block;
                    width: 0px;
                    opacity: 0;
                }
                .fill-in-the-blank-highlight {
                    background-color: ${showOverlay ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.3)'} !important;
                    border-bottom: 2px solid var(--accent-purple);
                    border-radius: 2px;
                }
                .monaco-input-overlay {
                    position: absolute;
                    z-index: 10;
                    pointer-events: none;
                    top: 0; left: 0; width: 100%; height: 100%;
                }
                .overlay-input {
                    position: absolute;
                    pointer-events: auto;
                    background: rgba(139, 92, 246, 0.08);
                    border: 1px solid rgba(139, 92, 246, 0.4);
                    color: #fff;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 13px;
                    padding: 0 6px;
                    outline: none;
                    box-sizing: border-box;
                    resize: none;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    border-radius: 4px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .overlay-input:hover {
                    background: rgba(139, 92, 246, 0.12);
                    border-color: rgba(139, 92, 246, 0.6);
                }
                .overlay-input:focus {
                    background: rgba(139, 92, 246, 0.15);
                    border-color: var(--accent-purple-light);
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.25), 0 4px 12px rgba(0, 0, 0, 0.3);
                    transform: translateY(-1px);
                }
                .overlay-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                    font-style: italic;
                }
            `}} />

            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Editor
                    height={height}
                    language={lang}
                    value={file.content}
                    onChange={val => {
                        if (isFocused) updateFile(file.id?.toString() || '', 'content', val || '');
                    }}
                    onMount={handleMount}
                    theme="aiDark"
                    options={{ 
                        fontSize: 13, 
                        minimap: { enabled: false }, 
                        scrollBeyondLastLine: false,
                        padding: { top: 12, bottom: 12 },
                        fontFamily: "'JetBrains Mono', monospace",
                        readOnly: showOverlay && isStudent,
                        domReadOnly: showOverlay && isStudent,
                    }}
                />

                {showOverlay && (
                    <div className="monaco-input-overlay">
                        {ranges.map((r, idx) => (
                            r.isMultiLine ? (
                                <textarea
                                    key={r.id}
                                    className="overlay-input"
                                    style={{ top: r.top + 12, left: r.left, width: r.width, height: r.height }}
                                    value={r.content}
                                    tabIndex={idx + 1}
                                    onChange={e => handleOverlayChange(r.range, e.target.value)}
                                    placeholder="..."
                                />
                            ) : (
                                <input
                                    key={r.id}
                                    className="overlay-input"
                                    style={{ top: r.top + 12, left: r.left, width: r.width, height: r.height }}
                                    value={r.content}
                                    tabIndex={idx + 1}
                                    onChange={e => handleOverlayChange(r.range, e.target.value)}
                                    placeholder="..."
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
