'use client'

import {
    useEditor,
    EditorContent,
    ReactNodeViewRenderer,
    NodeViewProps,
    NodeViewWrapper,
    NodeViewContent,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import { BubbleMenu } from '@tiptap/react/menus'
import { Node, mergeAttributes } from '@tiptap/core'
import { useState, useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { CreateProblemDto, Block, TestCase, LanguageFile } from '@/api/problems.api'
import { useLanguages } from '@/hooks/useLanguages'
import FillInTheBlankEditor from '@/components/FillInTheBlankEditor'
import './editor.css'

// ---------------- TOGGLE NODE ----------------
const ToggleComponent = () => {
    return (
        <NodeViewWrapper style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px', marginBottom: 8, border: '1px solid var(--border)' }}>
            <NodeViewContent as="div" />
        </NodeViewWrapper>
    )
}

const ToggleBlock = Node.create({
    name: 'toggle',
    group: 'block',
    content: 'block*',
    defining: true,
    addAttributes() {
        return { open: { default: true } }
    },
    parseHTML() { return [{ tag: 'div[data-type="toggle"]' }] },
    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'toggle' }), 0]
    },
    addNodeView() {
        return ReactNodeViewRenderer(ToggleComponent, { contentDOMElementTag: 'div' })
    },
    selectable: true,
    draggable: true,
})

const PRESET_COLORS = ['#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

// ---------------- EDITOR BLOCK ----------------
function EditorBlock({
    block,
    index,
    total,
    updateBlock,
    deleteBlock,
    moveBlock,
}: {
    block: Block
    index: number
    total: number
    updateBlock: (id: string, html: string) => void
    deleteBlock: (id: string) => void
    moveBlock: (from: number, to: number) => void
}) {
    const [isFocused, setIsFocused] = useState(false)

    const editor = useEditor({
        extensions: [StarterKit, TextStyle, Color, ToggleBlock, BubbleMenuExtension],
        content: block.content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            // Use setTimeout to avoid 'flushSync was called from inside a lifecycle method' in React 18
            setTimeout(() => {
                updateBlock(block.id, editor.getHTML())
            }, 0)
        },
        onFocus: () => setIsFocused(true),
        onBlur: () => {
            setTimeout(() => {
                if (!editor?.isFocused && !document.activeElement?.closest('.toolbar-wrapper')) {
                    setIsFocused(false)
                }
            }, 100)
        },
    })

    if (!editor) return null

    const setColor = (color: string) => editor.chain().focus().setColor(color).run()
    const insertToggle = (text: string) => {
        editor.chain().focus().insertContent({
            type: 'toggle',
            content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }],
        }).run()
    }

    return (
        <div className={`editor-block ${isFocused ? 'focused' : ''}`}>
            {isFocused && (
                <div className="toolbar-wrapper">
                    <div className="toolbar">
                        <div className="button-group">
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''} title="In đậm (Bold)"><b>B</b></button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''} title="In nghiêng (Italic)"><i>I</i></button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'active' : ''} title="Gạch ngang chữ"><s>S</s></button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'active' : ''} title="Code Highlight (Chữ dạng Code)"><code>{"{}"}</code></button>
                        </div>
                        <div className="button-group">
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'active' : ''} title="Văn bản đoạn (Paragraph)">¶</button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'active' : ''} title="Tiêu đề chính lớn (H1)">H1</button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'active' : ''} title="Tiêu đề phụ (H2)">H2</button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'active' : ''} title="Tiêu đề nhỏ (H3)">H3</button>
                        </div>
                        <div className="button-group">
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active' : ''} title="Danh sách gạch ngang (Bullet)">•</button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'active' : ''} title="Danh sách đánh số (Numeric)">1.</button>
                        </div>
                        <div className="button-group">
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'active' : ''} title="Thêm trích dẫn (Blockquote)">“</button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => {
                                const { from, to } = editor.state.selection
                                const selectedText = editor.state.doc.textBetween(from, to, ' ')
                                insertToggle(selectedText || "")
                            }} title="Khối đóng khung nội dung (Nhấn mạnh, Code, Panel)">⊞</button>
                        </div>
                        <div className="button-group color-picker-group">
                            <input type="color" onInput={(e) => setColor((e.target as HTMLInputElement).value)} value={editor.getAttributes('textStyle').color || '#ffffff'} title="Màu tùy chỉnh" />
                            {PRESET_COLORS.map(c => (
                                <button key={c} type="button" onMouseDown={e => e.preventDefault()} onClick={() => setColor(c)} style={{ background: c, width: 14, height: 14, padding: 0, borderRadius: '50%', border: '1px solid #555', margin: '0 2px' }} title={c} />
                            ))}
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().unsetColor().run()} title="Bỏ tô màu (Trở về mặc định)">↺</button>
                        </div>
                    </div>
                    <div className="block-actions">
                        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => deleteBlock(block.id)} title="Xóa toàn bộ khối này">❌</button>
                        <button type="button" onMouseDown={e => e.preventDefault()} disabled={index === 0} onClick={() => moveBlock(index, index - 1)} title="Đẩy khối lên trên">↑</button>
                        <button type="button" onMouseDown={e => e.preventDefault()} disabled={index === total - 1} onClick={() => moveBlock(index, index + 1)} title="Đẩy khối xuống dưới">↓</button>
                    </div>
                </div>
            )}
            <EditorContent editor={editor} className="editor-content" />
            {editor && (
                <BubbleMenu editor={editor} shouldShow={({ state, from, to }) => {
                    if (from === to) return false
                    let lineCount = 0
                    state.doc.nodesBetween(0, from, (node) => {
                        if (node.isBlock && ['paragraph', 'heading', 'listItem', 'codeBlock'].includes(node.type.name)) lineCount++
                    })
                    return lineCount >= 6
                }}>
                    <div className="bubble-menu">
                        <div className="button-group">
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}><b>B</b></button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}><i>I</i></button>
                        </div>
                        <div className="button-group color-picker-group">
                            <input type="color" onInput={(e) => setColor((e.target as HTMLInputElement).value)} value={editor.getAttributes('textStyle').color || '#ffffff'} />
                            {PRESET_COLORS.map(c => (
                                <button key={c} type="button" onMouseDown={e => e.preventDefault()} onClick={() => setColor(c)} style={{ background: c, width: 14, height: 14, padding: 0, borderRadius: '50%', border: '1px solid #555', margin: '0 2px' }} title={c} />
                            ))}
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().unsetColor().run()} title="Reset Color">↺</button>
                        </div>
                    </div>
                </BubbleMenu>
            )}
        </div>
    )
}

// ---------------- MONACO UTILS ----------------
const getMonacoLanguage = (ext: string, languages: any[] = [], languageId?: number): string => {
    // 0. Check for Resource/Attached file ID
    if (languageId === 0) return 'text';
    
    // 1. Try to find in the dynamic languages list from API
    const langObj = languages.find(l => (l.ext || '').toLowerCase() === ext.toLowerCase());
    if (langObj) {
        // Map common names to Monaco names if needed
        const name = langObj.name.toLowerCase();
        if (name === 'c++') return 'cpp';
        return name;
    }

    // 2. Fallback to common mapping
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

// ---------------- LANGUAGE FILE EDITOR ----------------
function LanguageFileEditor({ file, updateFile, languages }: { file: LanguageFile, updateFile: (id: string, field: keyof LanguageFile, value: any) => void, languages: any[] }) {
    const isTemplate = file.type === 'TEMPLATE';
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);

    const insertPlaceholder = () => {
        if (editorRef.current && monacoRef.current) {
            const editor = editorRef.current;
            const monaco = monacoRef.current;
            const position = editor.getPosition();
            editor.executeEdits("insertPlaceholder", [{
                range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                text: "{{  }}",
                forceMoveMarkers: true
            }]);
            editor.setPosition({ lineNumber: position.lineNumber, column: position.column + 3 });
            editor.focus();
            updateFile(file.id as string, 'content', editor.getValue());
        } else {
            updateFile(file.id as string, 'content', file.content + '{{  }}');
        }
    };

    const toggleWrapAll = () => {
        const cleanContent = (file.content || '').trim();
        const isWrapped = cleanContent.startsWith('{{') && cleanContent.endsWith('}}') && cleanContent.indexOf('{{') === cleanContent.lastIndexOf('{{');

        if (isWrapped) {
            const inner = cleanContent.slice(2, -2).trim();
            updateFile(file.id as string, 'content', inner);
        } else {
            let inner = file.content.replace(/\{\{|\}\}/g, '').trim();
            updateFile(file.id as string, 'content', `{{\n${inner}\n}}`);
        }
    };

    const isWrapped = (file.content || '').trim().startsWith('{{') && 
                      (file.content || '').trim().endsWith('}}') && 
                      (file.content || '').trim().indexOf('{{') === (file.content || '').trim().lastIndexOf('{{');

    return (
        <div className="template-editor-container" style={{ position: 'relative', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
            {isTemplate && (
                <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Công cụ Điền Khuyết:</span>
                    <button 
                        onClick={insertPlaceholder}
                        disabled={isWrapped}
                        style={{ background: isWrapped ? 'transparent' : 'var(--accent-purple)', border: '1px solid var(--accent-purple)', color: isWrapped ? 'var(--text-muted)' : '#fff', padding: '4px 10px', borderRadius: 4, cursor: isWrapped ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 500, opacity: isWrapped ? 0.5 : 1 }}
                        title="Chèn {{ }} tại vị trí con trỏ"
                    >
                        + Chèn {`{{ }}`} tại đây
                    </button>
                    <button 
                        onClick={toggleWrapAll}
                        style={{ background: isWrapped ? 'var(--accent-green)' : 'transparent', border: `1px solid ${isWrapped ? 'var(--accent-green)' : 'var(--accent-purple)'}`, color: isWrapped ? '#fff' : 'var(--accent-purple)', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
                        title="Bọc toàn bộ file để Học viên sửa toàn quyền"
                    >
                        {isWrapped ? 'Đang bọc toàn bộ (Tắt)' : '[ ] Bọc toàn bộ vào {{ }}'}
                    </button>
                </div>
            )}

            <div style={{ padding: '2px 0 0', background: '#0b0f1a' }}>
                <FillInTheBlankEditor 
                    file={file} 
                    updateFile={(id, field, value) => updateFile(id, field as keyof LanguageFile, value)}
                    languages={languages} 
                    height="220px"
                    onMount={(editor, monaco) => {
                        editorRef.current = editor;
                        monacoRef.current = monaco;
                    }}
                    isStudent={false}
                />
            </div>
        </div>
    )
}

// ---------------- MAIN COMPONENT ----------------
interface ProblemEditorProps {
    initialData?: CreateProblemDto
    onSubmit: (data: CreateProblemDto) => void
    isSubmitting?: boolean
    disableSave?: boolean
}

export default function ProblemEditor({ initialData, onSubmit, isSubmitting, disableSave }: ProblemEditorProps) {
    const { data: languagesData } = useLanguages()
    const languages = languagesData || []

    const [blocks, setBlocks] = useState<Block[]>(initialData?.description || [])
    const [activeTab, setActiveTab] = useState<'CODE' | 'SETTINGS'>('CODE')
    const [problemState, setProblemState] = useState({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        difficulty: initialData?.difficulty || 'EASY',
        type: initialData?.type || 'CODE',
        visibility: initialData?.visibility || 'PUBLIC',
        source: initialData?.source || ''
    })
    const [workspaceConfig, setWorkspaceConfig] = useState({
        canCreateFile: initialData?.workspaceConfig?.canCreateFile ?? false,
        canChangeMainFile: initialData?.workspaceConfig?.canChangeMainFile ?? false
    })
    const [testcases, setTestcases] = useState<TestCase[]>(initialData?.testcases || [])
    const [languageFiles, setLanguageFiles] = useState<LanguageFile[]>(initialData?.languageFiles || [])

    // --- Block Actions ---
    const addBlock = () => setBlocks(prev => [...prev, { id: Date.now().toString(), content: '<p></p>' }])
    const updateBlock = (id: string, html: string) => setBlocks(prev => prev.map(b => (b.id === id ? { ...b, content: html } : b)))
    const deleteBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id))
    const moveBlock = (from: number, to: number) => {
        setBlocks(prev => {
            const arr = [...prev]
            const item = arr.splice(from, 1)[0]
            arr.splice(to, 0, item)
            return arr
        })
    }

    // --- TestCase Actions ---
    const addTestcase = () => {
        setTestcases(prev => [...prev, {
            id: Date.now().toString(), input: '', expectedOutput: '', score: 10, order: prev.length + 1, isHidden: false
        }])
    }
    const updateTestcase = (id: string, field: keyof TestCase, value: any) => {
        setTestcases(prev => prev.map(tc => tc.id === id ? { ...tc, [field]: value } : tc))
    }
    const removeTestcase = (id: string) => setTestcases(prev => prev.filter(tc => tc.id !== id))

    // --- File Actions ---
    const addFile = () => {
        setLanguageFiles(prev => [...prev, {
            id: Date.now().toString(), languageId: languages[0]?.id || 1, path: 'main.js', type: 'TEMPLATE', content: '// Write code here'
        }])
    }
    const updateFile = (id: string, field: keyof LanguageFile, value: any) => {
        setLanguageFiles(prev => prev.map(f => {
            if (f.id === id) {
                const updated = { ...f, [field]: value };
                
                // --- Sync Logic ---
                if (field === 'path') {
                    const newExt = getExt(value);
                    const matchedLang = languages.find(l => l.ext.toLowerCase() === newExt.toLowerCase());
                    if (matchedLang) {
                        updated.languageId = matchedLang.id;
                    } else {
                        // If no match found, we could set it to 0 (Attached File) if you want strict sync
                        // updated.languageId = 0;
                    }
                } else if (field === 'languageId') {
                    if (value === 0) {
                        // Switch to .txt if it's an attached file and doesn't have an extension yet or has a code extension
                        const baseName = f.path.split('.')[0] || 'file';
                        const currentExt = getExt(f.path);
                        const isCodeExt = languages.some(l => l.ext.toLowerCase() === currentExt.toLowerCase());
                        if (isCodeExt || !currentExt) {
                            updated.path = baseName + '.txt';
                        }
                    } else {
                        const matchedLang = languages.find(l => l.id === value);
                        if (matchedLang) {
                            const baseName = f.path.split('.')[0] || 'file';
                            updated.path = baseName + matchedLang.ext;
                        }
                    }
                }
                return updated;
            }
            return f;
        }))
    }
    const removeFile = (id: string) => setLanguageFiles(prev => prev.filter(f => f.id !== id))

    // --- Data Submission ---
    const handleSave = () => {
        if (!problemState.title) {
            alert('Vui lòng nhập tên bài tập!');
            return;
        }

        const payload: CreateProblemDto = {
            ...problemState,
            workspaceConfig,
            description: blocks.map(({ id, ...rest }) => rest) as Block[],
            testcases: testcases.map(({ id, ...rest }) => rest) as TestCase[],
            languageFiles: languageFiles.map(({ id, ...rest }) => rest) as LanguageFile[],
            problemFiles: []
        }
        onSubmit(payload)
    }

    return (
        <div className="page-container">
            <div className="header-section" style={{ marginBottom: 16 }}>
                <div className="title-input-group">
                    <label htmlFor="title">Tên bài:</label>
                    <input 
                        type="text" 
                        id="title" 
                        placeholder="Nhập tên bài học..." 
                        value={problemState.title}
                        onChange={(e) => setProblemState(s => ({ ...s, title: e.target.value }))}
                    />
                </div>
                <button className={`save-btn ${disableSave ? 'disabled' : ''}`} onClick={handleSave} disabled={isSubmitting || disableSave} style={{ opacity: disableSave ? 0.5 : 1, cursor: disableSave ? 'not-allowed' : 'pointer' }}>
                    {isSubmitting ? 'Đang lưu...' : disableSave ? 'Chỉ Xem (Read-Only)' : 'Lưu Bài Tập'}
                </button>
            </div>

            <div className="layout-split">
                {/* LEFT PANEL */}
                <div className="left-panel">
                    <div className="panel-header">
                        <h3>Mô tả bài tập</h3>
                        <button className="add-block-btn" onClick={addBlock}>+ Thêm khối</button>
                    </div>
                    <div className="card">
                        {blocks.map((block, index) => (
                            <EditorBlock
                                key={block.id || index.toString()}
                                block={block}
                                index={index}
                                total={blocks.length}
                                updateBlock={updateBlock}
                                deleteBlock={deleteBlock}
                                moveBlock={moveBlock}
                            />
                        ))}
                    </div>

                    <div className="panel-header" style={{ marginTop: 16 }}>
                        <h3>Test Cases</h3>
                        <button className="add-block-btn" onClick={addTestcase} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>+ Case</button>
                    </div>
                    <div className="testcases-list">
                        {testcases.map((tc) => (
                            <div key={tc.id} className={`testcase-item ${tc.isHidden ? 'is-hidden' : ''}`}>
                                <div className="testcase-row">
                                    <label style={{ width: 60 }}>Input</label>
                                    <textarea value={tc.input} onChange={e => updateTestcase(tc.id as string, 'input', e.target.value)} placeholder="Nhập input (hỗ trợ xuống dòng)..." style={{ flex: 1, minHeight: 60, padding: 8, borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'monospace', resize: 'vertical' }} />
                                </div>
                                <div className="testcase-row">
                                    <label style={{ width: 60 }}>Output</label>
                                    <textarea value={tc.expectedOutput} onChange={e => updateTestcase(tc.id as string, 'expectedOutput', e.target.value)} placeholder="Nhập expected output (hỗ trợ xuống dòng)..." style={{ flex: 1, minHeight: 60, padding: 8, borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'monospace', resize: 'vertical' }} />
                                </div>
                                <div className="testcase-actions">
                                    <div className="testcase-row">
                                        <input type="number" value={tc.score} onChange={e => updateTestcase(tc.id as string, 'score', parseInt(e.target.value) || 0)} title="Điểm số" />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>điểm</span>
                                        <label className="checkbox-label" style={{ marginLeft: 12 }}>
                                            <input type="checkbox" checked={tc.isHidden} onChange={e => updateTestcase(tc.id as string, 'isHidden', e.target.checked)} />
                                            Ẩn (Dùng chấm điểm)
                                        </label>
                                    </div>
                                    <button className="btn-icon" onClick={() => removeTestcase(tc.id as string)} title="Xóa">❌</button>
                                </div>
                            </div>
                        ))}
                        {testcases.length === 0 && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px', border: '1px dashed var(--border)', borderRadius: 8 }}>
                                Chưa có testcase nào.
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="right-panel">
                    <div className="tabs-header">
                        <button className={activeTab === 'CODE' ? 'active' : ''} onClick={() => setActiveTab('CODE')}>Code Templates & Solutions</button>
                        <button className={activeTab === 'SETTINGS' ? 'active' : ''} onClick={() => setActiveTab('SETTINGS')}>Cài đặt chung</button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'SETTINGS' && (
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Slug (tùy chọn)</label>
                                    <input value={problemState.slug} onChange={e => setProblemState(s => ({ ...s, slug: e.target.value }))} placeholder="vi-du-bai-tap" />
                                </div>
                                <div className="form-group">
                                    <label>Độ khó</label>
                                    <select value={problemState.difficulty} onChange={e => setProblemState(s => ({ ...s, difficulty: e.target.value as any}))}>
                                        <option value="EASY">Dễ (EASY)</option>
                                        <option value="MEDIUM">Trung bình (MEDIUM)</option>
                                        <option value="HARD">Khó (HARD)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Loại hình</label>
                                    <select value={problemState.type} onChange={e => setProblemState(s => ({ ...s, type: e.target.value as any}))}>
                                        <option value="CODE">Lập trình (CODE)</option>
                                        <option value="SQL">Truy vấn (SQL)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Chế độ hiển thị</label>
                                    <select value={problemState.visibility} onChange={e => setProblemState(s => ({ ...s, visibility: e.target.value as any}))}>
                                        <option value="PUBLIC">Công khai (PUBLIC)</option>
                                        <option value="PRIVATE">Riêng tư (PRIVATE)</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Nguồn tham khảo (Source)</label>
                                    <input value={problemState.source} onChange={e => setProblemState(s => ({ ...s, source: e.target.value }))} placeholder="Ví dụ: LeetCode, Codeforces..." />
                                </div>
                                <div className="form-group full-width" style={{ marginTop: 8 }}>
                                    <label>Tùy chỉnh IDE (Workspace Config) cho Học viên</label>
                                    <div style={{ background: 'var(--bg-primary)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                                        <label className="checkbox-row">
                                            <input type="checkbox" checked={workspaceConfig.canCreateFile} onChange={e => setWorkspaceConfig(s => ({ ...s, canCreateFile: e.target.checked }))} />
                                            Cho phép Học viên tạo thêm file mới (Nút +)
                                        </label>
                                        <label className="checkbox-row">
                                            <input type="checkbox" checked={workspaceConfig.canChangeMainFile} onChange={e => setWorkspaceConfig(s => ({ ...s, canChangeMainFile: e.target.checked }))} />
                                            Cho phép Học viên đổi điểm thả Code (Entry point file)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'CODE' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <p style={{ color: 'var(--text-secondary)' }}>Khai báo các file template và solution cho bài tập</p>
                                    <button className="add-block-btn" onClick={addFile} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>+ Thêm file</button>
                                </div>
                                
                                {languageFiles.map(file => (
                                    <div key={file.id} className="code-file-item">
                                        <div className="code-file-header">
                                            <select value={file.languageId} onChange={e => updateFile(file.id as string, 'languageId', parseInt(e.target.value))}>
                                                {languages.length === 0 && <option value={file.languageId}>Loading...</option>}
                                                <option value={0}>📁 Tập tin đính kèm / Dữ liệu</option>
                                                {languages.map(l => (
                                                    <option key={l.id} value={l.id}>{l.name} ({l.version})</option>
                                                ))}
                                            </select>
                                            <select value={file.type} onChange={e => updateFile(file.id as string, 'type', e.target.value)}>
                                                <option value="TEMPLATE">Cho Học Sinh Làm (TEMPLATE)</option>
                                                <option value="SOLUTION">Đáp Án (SOLUTION)</option>
                                            </select>
                                            <input value={file.path} onChange={e => updateFile(file.id as string, 'path', e.target.value)} placeholder="Tên file (vd: main.js)" style={{ flex: 1 }} />
                                            <button className="btn-icon" onClick={() => removeFile(file.id as string)}>❌</button>
                                        </div>
                                        <LanguageFileEditor file={file} updateFile={updateFile} languages={languages} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
