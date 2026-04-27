'use client'

import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import Editor from '@monaco-editor/react'
import { Eye } from 'lucide-react'
import { LanguageFile } from '@/api/problems.api'

// ---------------- MONACO UTILS ----------------
const getMonacoLanguage = (ext: string, languages: any[] = [], languageId?: number): string => {
    const extMapping: Record<string, string> = {
        '.py': 'python', '.cpp': 'cpp', '.cxx': 'cpp', '.java': 'java', '.js': 'javascript',
        '.ts': 'typescript', '.cs': 'csharp', '.go': 'go', '.rs': 'rust', '.php': 'php',
        '.rb': 'ruby', '.sql': 'sql', '.css': 'css', '.html': 'html',
    }

    if (languageId === 0) return 'text';
    
    // 1. Ưu tiên số 1: Ánh xạ theo đuôi file chuẩn
    const normalizedExt = ext.toLowerCase();
    if (extMapping[normalizedExt]) return extMapping[normalizedExt];

    // 2. Dự phòng: Tìm trong mảng languages theo id hoặc ext gán kèm
    const langObj = languages.find(l => l.id === languageId || (l.ext || '').toLowerCase() === normalizedExt);
    if (langObj) {
        const name = langObj.name.toLowerCase();
        if (name.includes('python')) return 'python';
        if (name.includes('javascript') || name === 'js') return 'javascript';
        if (name.includes('typescript') || name === 'ts') return 'typescript';
        if (name === 'c++' || name === 'cpp') return 'cpp';
        if (name === 'c#' || name === 'csharp') return 'csharp';
        return name;
    }

    return 'text';
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
    onStatusChange?: (status: { canWrap: boolean, isInside: boolean, isInvalid: boolean }) => void;
}

const FillInTheBlankEditor = forwardRef<any, FillInTheBlankEditorProps>(({ file, updateFile, languages, isStudent = false, height = "220px", onMount, onStatusChange }, ref) => {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const widgetsCacheRef = useRef<Map<number, { widget: any, domNode: HTMLElement, textarea: HTMLTextAreaElement }>>(new Map());
    const decorationsRef = useRef<string[]>([]);

    const getStatus = useCallback(() => {
        if (!editorRef.current || !monacoRef.current) return { canWrap: true, isInside: false, isInvalid: false };
        const editor = editorRef.current;
        const model = editor.getModel();
        if (!model) return { canWrap: true, isInside: false, isInvalid: false };

        const selection = editor.getSelection();
        const startOffset = model.getOffsetAt(selection.getStartPosition());
        const endOffset = model.getOffsetAt(selection.getEndPosition());
        const text = model.getValue();

        const regex = /\{\{((?:(?!\{\{)[\s\S])*)\}\}/g;
        let m;
        let isInside = false;
        let isInvalid = false;
        let insideRange: any = null;

        while ((m = regex.exec(text)) !== null) {
            const mStart = m.index;
            const mEnd = mStart + m[0].length;

            // Kiểm tra con trỏ/vùng chọn có nằm trọn trong 1 cặp {{}} không
            // Chúng ta dùng > mStart và < mEnd để loại trừ vị trí sát mép ngoài (ví dụ {{a}}| )
            const isStrictlyInside = startOffset >= mStart + 2 && endOffset <= mEnd - 2;
            const isExactlyWrapped = startOffset === mStart && endOffset === mEnd;

            // Kiểm tra giao cắt
            const hasIntersection = Math.max(startOffset, mStart) < Math.min(endOffset, mEnd);
            if (hasIntersection) {
                const isFullWrap = startOffset <= mStart && endOffset >= mEnd;
                const isInternal = startOffset >= mStart && endOffset <= mEnd;
                
                // Nếu giao cắt mà không phải nằm trọn bên trong, và cũng không phải trùm toàn bộ (hoặc trùm nhưng có râu ria)
                // Theo yêu cầu mới: bôi "quá khối" (trong + ngoài) -> đỏ
                if (!isInternal && !isExactlyWrapped) {
                    isInvalid = true;
                }
                
                // Chi tiết hơn: nếu trùm toàn bộ nhưng lấn ra ngoài (ví dụ " {{abc}} ") -> đỏ
                if (isFullWrap && !isExactlyWrapped) {
                    isInvalid = true;
                }
            }

            if (isStrictlyInside || isExactlyWrapped) {
                isInside = true;
                if (!insideRange || (mEnd - mStart < insideRange.end - insideRange.start)) {
                    insideRange = { start: mStart, end: mEnd, content: m[1] };
                }
            }
        }

        return { canWrap: !isInvalid, isInside, isInvalid, insideRange };
    }, []);

    useImperativeHandle(ref, () => ({
        insertBlank: () => {
            if (!editorRef.current || !monacoRef.current) return;
            const editor = editorRef.current;
            const monaco = monacoRef.current;
            const model = editor.getModel();
            if (!model) return;

            const { isInside, insideRange, isInvalid } = getStatus();
            if (isInvalid) return;

            if (isInside && insideRange) {
                const range = new monaco.Range(
                    model.getPositionAt(insideRange.start).lineNumber,
                    model.getPositionAt(insideRange.start).column,
                    model.getPositionAt(insideRange.end).lineNumber,
                    model.getPositionAt(insideRange.end).column
                );
                editor.executeEdits("unwrap-blank", [{
                    range: range,
                    text: insideRange.content,
                    forceMoveMarkers: true
                }]);
            } else {
                let selection = editor.getSelection();
                
                // Nếu chọn nhiều dòng, mở rộng vùng chọn ra toàn bộ các dòng đó
                if (selection.startLineNumber !== selection.endLineNumber) {
                    const startLine = selection.startLineNumber;
                    const endLine = selection.endLineNumber;
                    const endMaxCol = model.getLineMaxColumn(endLine);
                    selection = new monaco.Selection(startLine, 1, endLine, endMaxCol);
                }

                const text = model.getValueInRange(selection);
                // Gộp adjacent blanks: }}{{ -> 4 spaces
                const processedText = text.replace(/\}\}\{\{/g, '    ');
                const wrappedText = `{{${processedText}}}`;

                editor.executeEdits("insert-blank", [{
                    range: selection,
                    text: wrappedText,
                    forceMoveMarkers: true
                }]);

                if (!text) {
                    const pos = selection.getStartPosition();
                    editor.setSelection(new monaco.Selection(pos.lineNumber, pos.column + 2, pos.lineNumber, pos.column + 2));
                }
            }
            editor.focus();
        },
        getStatus
    }));

    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const isTemplate = file.type === 'TEMPLATE';
    const showWidgets = isTemplate && (file as any).isFillInTheBlank && (isStudent || isPreviewMode);

    const clearWidgets = useCallback(() => {
        if (!editorRef.current) return;
        widgetsCacheRef.current.forEach(val => {
            try { editorRef.current.removeContentWidget(val.widget); } catch (e) {}
        });
        widgetsCacheRef.current.clear();
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
        const currentMatchIndices = new Set<number>();
        const newDecorations: any[] = [];

        const syncSize = (ta: HTMLTextAreaElement) => {
            const val = ta.value;
            const lines = val.split('\n');
            const lineCount = lines.length;
            ta.style.height = 'auto';

            if (lineCount === 1 && val.length < 50) {
                ta.style.width = (val.length + 4) + 'ch';
                ta.style.minWidth = '4ch';
                ta.style.maxWidth = '60ch';
                ta.classList.add('inline-blank');
                ta.classList.remove('block-blank');
                ta.style.display = 'inline-block';
                ta.rows = 1;
            } else {
                ta.style.width = '100vw'; 
                ta.style.minWidth = '280px';
                ta.style.maxWidth = 'min(850px, 95%)';
                ta.style.height = (lineCount * 1.6) + 'em';
                ta.classList.add('block-blank');
                ta.classList.remove('inline-blank');
                ta.style.display = 'block';
                ta.rows = lineCount;
            }
        };

        const allMatches: { start: number, end: number, content: string }[] = [];
        let m;
        const mRegex = /\{\{((?:(?!\{\{)[\s\S])*)\}\}/g;
        while ((m = mRegex.exec(text)) !== null) {
            allMatches.push({ start: m.index, end: m.index + m[0].length, content: m[1] });
        }

        allMatches.forEach((match, idx) => {
            const currentIdx = idx;
            currentMatchIndices.add(currentIdx);
            
            const startPos = model.getPositionAt(match.start);
            const endPos = model.getPositionAt(match.end);
            const content = match.content;
            const isMultiLine = startPos.lineNumber !== endPos.lineNumber;

            if (isMultiLine) {
                // MULTI-LINE: Đổi màu dòng, không dùng textarea overlay
                newDecorations.push({
                    range: new monaco.Range(startPos.lineNumber, 1, endPos.lineNumber, model.getLineMaxColumn(endPos.lineNumber)),
                    options: { 
                        isWholeLine: true,
                        className: 'fill-blank-line-highlight',
                    }
                });
                // Ẩn riêng {{ và }}
                newDecorations.push({
                    range: new monaco.Range(startPos.lineNumber, startPos.column, startPos.lineNumber, startPos.column + 2),
                    options: { inlineClassName: 'fill-blank-marker-hidden' }
                });
                newDecorations.push({
                    range: new monaco.Range(endPos.lineNumber, endPos.column - 2, endPos.lineNumber, endPos.column),
                    options: { inlineClassName: 'fill-blank-marker-hidden' }
                });
                return;
            }

            // SINGLE-LINE: Giữ nguyên ô nhập liệu overlay
            const range = new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column);
            newDecorations.push({
                range: range,
                options: { inlineClassName: 'fill-blank-hidden' }
            });

            let cached = widgetsCacheRef.current.get(currentIdx);
            if (!cached) {
                const domNode = document.createElement('div');
                domNode.className = 'monaco-input-widget';
                const textarea = document.createElement('textarea');
                textarea.placeholder = '...';
                
                textarea.oninput = (e: Event) => {
                    const ta = e.target as HTMLTextAreaElement;
                    syncSize(ta);
                    const currentModel = editor.getModel();
                    if (!currentModel) return;
                    const cText = currentModel.getValue();
                    const mmRegex = /\{\{((?:(?!\{\{)[\s\S])*)\}\}/g;
                    const matches: any[] = [];
                    let mm;
                    while ((mm = mmRegex.exec(cText)) !== null) matches.push(mm);
                    const target = matches[currentIdx];
                    if (target) {
                        const mRange = new monaco.Range(
                            currentModel.getPositionAt(target.index).lineNumber,
                            currentModel.getPositionAt(target.index).column,
                            currentModel.getPositionAt(target.index + target[0].length).lineNumber,
                            currentModel.getPositionAt(target.index + target[0].length).column
                        );
                        editor.executeEdits("fill-blank", [{ range: mRange, text: `{{${ta.value}}}`, forceMoveMarkers: true }]);
                    }
                };

                domNode.appendChild(textarea);
                const widget = {
                    getId: () => `blank-${currentIdx}`,
                    getDomNode: () => domNode,
                    getPosition: () => ({ position: model.getPositionAt(match.start), preference: [monaco.editor.ContentWidgetPositionPreference.EXACT] })
                };
                editor.addContentWidget(widget);
                cached = { widget, domNode, textarea };
                widgetsCacheRef.current.set(currentIdx, cached);
            }

            if (document.activeElement !== cached.textarea) {
                cached.textarea.value = content;
                syncSize(cached.textarea);
            }

            const nextMatch = allMatches[idx + 1];
            cached.textarea.style.marginRight = (nextMatch && nextMatch.start === match.end) ? '4ch' : '0';

            const mStartStatic = match.start;
            cached.widget.getPosition = () => ({
                position: model.getPositionAt(mStartStatic),
                preference: [monaco.editor.ContentWidgetPositionPreference.EXACT]
            });
            editor.layoutContentWidget(cached.widget);
        });

        widgetsCacheRef.current.forEach((val, idx) => {
            if (!currentMatchIndices.has(idx)) {
                editor.removeContentWidget(val.widget);
                widgetsCacheRef.current.delete(idx);
            }
        });

        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
    }, [showWidgets, file.id, clearWidgets, getStatus]);

    const renderWidgetsRef = useRef(renderWidgets);
    renderWidgetsRef.current = renderWidgets;
    const latestContentRef = useRef(file.content);
    
    useEffect(() => { 
        latestContentRef.current = file.content;
        renderWidgets(); 
    }, [renderWidgets, showWidgets, file.content]);

    const handleMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        
        monaco.editor.defineTheme('aiDark', { base: 'vs-dark', inherit: true, rules: [], colors: { 'editor.background': '#0b0f1a', 'editor.lineHighlightBackground': '#1b1f3a' } });
        monaco.editor.setTheme('aiDark');

        editor.onDidChangeModelContent(() => {
            const newVal = editor.getValue();
            // CHẶN VÒNG LẶP: Dùng ref để tránh stale closure của file.content
            if (newVal === latestContentRef.current) {
                renderWidgetsRef.current();
                return;
            }
            renderWidgetsRef.current();
            updateFile(file.id?.toString() || '', 'content', newVal);
        });

        // TẮT TOÀN BỘ VALIDATION CHO JS/TS (Để tránh báo lỗi giả cho Boilerplate/Fill-in-the-blank)
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
        });
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
        });

        // Vô hiệu hóa cấu hình mode diagnostics
        if (monaco.languages.typescript.javascriptDefaults.setModeConfiguration) {
            monaco.languages.typescript.javascriptDefaults.setModeConfiguration({
                diagnostics: false,
                tokens: true,
                completionItems: true,
                hovers: true,
                documentSymbols: true,
                definitions: true,
                references: true,
                documentHighlights: true,
                rename: true,
            });
        }

        // Tắt bổ sung cho HTML/CSS nếu cần
        if (monaco.languages.html) {
            monaco.languages.html.htmlDefaults.setOptions({ validate: false });
        }
        if (monaco.languages.css) {
            monaco.languages.css.cssDefaults.setDiagnosticsOptions({ validate: false });
        }

        if (onMount) onMount(editor, monaco);
        
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
            (ref as any)?.current?.insertBlank();
        });

        editor.onDidChangeCursorSelection(() => {
            if (onStatusChange) {
                const { canWrap, isInside, isInvalid } = getStatus();
                onStatusChange({ canWrap, isInside, isInvalid });
            }
        });

        if (onStatusChange) {
            const { canWrap, isInside, isInvalid } = getStatus();
            onStatusChange({ canWrap, isInside, isInvalid });
        }

        renderWidgets();
    };

    useEffect(() => {
        if (editorRef.current && file.content !== editorRef.current.getValue()) {
            editorRef.current.setValue(file.content || '');
            renderWidgets();
        }
    }, [file.id, file.path, file.content, renderWidgets]);

    const ext = getExt(file.path || '');
    const lang = getMonacoLanguage(ext, languages, file.languageId);

    return (
        <div className="fill-in-the-blank-wrapper" style={{ position: 'relative', width: '100%', height: height, display: 'flex', flexDirection: 'column' }}>
            <style dangerouslySetInnerHTML={{ __html: `
                .fill-blank-marker-hidden {
                    display: none !important;
                    width: 0 !important;
                    height: 0 !important;
                    overflow: hidden !important;
                    position: absolute !important;
                    opacity: 0 !important;
                }
                .fill-blank-hidden {
                    color: transparent !important;
                    background: transparent !important;
                }
                .fill-blank-line-highlight { background: rgba(139, 92, 246, 0.08) !important; border-left: 3px solid #8b5cf6 !important; display: block !important; }
                .monaco-input-widget { z-index: 10; display: inline-flex; align-items: center; background: transparent; pointer-events: auto !important; }
                .monaco-input-widget textarea {
                    background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); color: #fff;
                    font-family: Consolas, 'Courier New', monospace; font-size: 13px; outline: none; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 4px; resize: none; overflow: hidden; line-height: 1.5; box-sizing: border-box; box-shadow: 0 2px 8px rgba(0,0,0,0.2); margin: 0; padding: 0; vertical-align: top;
                }
                .monaco-input-widget textarea.inline-blank { border-left: none; border-right: none; border-top: none; border-bottom: 2px solid #8b5cf6; padding-left: 2ch; padding-right: 1ch; height: 1.5em; }
                .monaco-input-widget textarea.block-blank { background: rgba(13, 17, 26, 0.98); border-left: 5px solid #8b5cf6; border-bottom: 1px solid rgba(139, 92, 246, 0.3); padding: 10px 14px; margin: 6px 0; border-radius: 0 10px 10px 0; display: block; width: 100% !important; }
                .monaco-input-widget textarea:focus { background: rgba(139, 92, 246, 0.2); border-color: #a78bfa; box-shadow: 0 0 15px rgba(139, 92, 246, 0.3); z-index: 20; }
                .raw-mode-toggle { position: absolute; top: 8px; right: 24px; z-index: 20; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); color: #94a3b8; padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.1s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.2); backdrop-filter: blur(4px); }
                .raw-mode-toggle.active { color: #fff; background: #8b5cf6; border-color: #8b5cf6; transform: scale(0.96); box-shadow: 0 0 15px rgba(139, 92, 246, 0.4); }
            `}} />

            {!isStudent && isTemplate && (
                <div 
                    className={`raw-mode-toggle ${isPreviewMode ? 'active' : ''}`}
                    onPointerDown={() => setIsPreviewMode(true)}
                    onPointerUp={() => setIsPreviewMode(false)}
                    onPointerLeave={() => { if (isPreviewMode) setIsPreviewMode(false); }}
                    style={{ userSelect: 'none', top: '-36px', right: '8px', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                >
                    <Eye size={16} />
                </div>
            )}

            <Editor
                height={height}
                language={lang}
                defaultValue={file.content}
                onMount={handleMount}
                theme="aiDark"
                options={{ 
                    fontSize: 13, 
                    minimap: { enabled: false }, 
                    scrollBeyondLastLine: false, 
                    padding: { top: 12, bottom: 12 },
                    fontFamily: "Consolas, 'Courier New', monospace", 
                    readOnly: false, // Để false để hỗ trợ điền trực tiếp vào highlight nếu là đa dòng
                    domReadOnly: false,
                    automaticLayout: true, 
                    autoClosingBrackets: 'always', 
                    autoClosingQuotes: 'always', 
                    autoClosingOvertype: 'always',
                    autoSurround: 'languageDefined', 
                    suggestOnTriggerCharacters: true, 
                    quickSuggestions: true,
                    acceptSuggestionOnEnter: 'on', 
                    wordBasedSuggestions: 'currentDocument',
                }}
            />
        </div>
    );
});

export default FillInTheBlankEditor;
