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
import { PlusSquare, RotateCcw, Trash2, ArrowUp, ArrowDown, Cpu, Zap, Timer, Circle, Paperclip, Star } from 'lucide-react'
import styles from './editor.module.css'
import CustomSelect from '@/components/ui/Select'

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
        <div className={`${styles['editor-block']} ${isFocused ? styles.focused : ''}`}>
            {isFocused && (
                <div className={styles['toolbar-wrapper']}>
                    <div className={styles.toolbar}>
                        <div className={styles['button-group']}>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? styles.active : ''} title="In đậm (Bold)"><b>B</b></button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? styles.active : ''} title="In nghiêng (Italic)"><i>I</i></button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? styles.active : ''} title="Gạch ngang chữ"><s>S</s></button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? styles.active : ''} title="Code Highlight (Chữ dạng Code)"><code>{"{}"}</code></button>
                        </div>
                        <div className={styles['button-group']}>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? styles.active : ''} title="Văn bản đoạn (Paragraph)">¶</button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? styles.active : ''} title="Tiêu đề chính lớn (H1)">H1</button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? styles.active : ''} title="Tiêu đề phụ (H2)">H2</button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? styles.active : ''} title="Tiêu đề nhỏ (H3)">H3</button>
                        </div>
                        <div className={styles['button-group']}>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? styles.active : ''} title="Danh sách gạch ngang (Bullet)">•</button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? styles.active : ''} title="Danh sách đánh số (Numeric)">1.</button>
                        </div>
                        <div className={styles['button-group']}>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? styles.active : ''} title="Thêm trích dẫn (Blockquote)">“</button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => {
                                const { from, to } = editor.state.selection
                                const selectedText = editor.state.doc.textBetween(from, to, ' ')
                                insertToggle(selectedText || "")
                            }} title="Khối đóng khung nội dung (Nhấn mạnh, Code, Panel)"><PlusSquare size={14} /></button>
                        </div>
                        <div className={`${styles['button-group']} ${styles['color-picker-group']}`}>
                            <input type="color" onInput={(e) => setColor((e.target as HTMLInputElement).value)} value={editor.getAttributes('textStyle').color || '#ffffff'} title="Màu tùy chỉnh" />
                            {PRESET_COLORS.map(c => (
                                <button key={c} type="button" onMouseDown={e => e.preventDefault()} onClick={() => setColor(c)} style={{ background: c, width: 14, height: 14, padding: 0, borderRadius: '50%', border: '1px solid #555', margin: '0 2px' }} title={c} />
                            ))}
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().unsetColor().run()} title="Bỏ tô màu (Trở về mặc định)"><RotateCcw size={14} /></button>
                        </div>
                    </div>
                    <div className={styles['block-actions']}>
                        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => deleteBlock(block.id)} title="Xóa toàn bộ khối này" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={12} color="var(--accent-red)" />
                        </button>
                        <button type="button" onMouseDown={e => e.preventDefault()} disabled={index === 0} onClick={() => moveBlock(index, index - 1)} title="Đẩy khối lên trên" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowUp size={12} />
                        </button>
                        <button type="button" onMouseDown={e => e.preventDefault()} disabled={index === total - 1} onClick={() => moveBlock(index, index + 1)} title="Đẩy khối xuống dưới" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowDown size={12} />
                        </button>
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
                    <div className={styles['bubble-menu']}>
                        <div className={styles['button-group']}>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? styles.active : ''}><b>B</b></button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? styles.active : ''}><i>I</i></button>
                        </div>
                        <div className={`${styles['button-group']} ${styles['color-picker-group']}`}>
                            <input type="color" onInput={(e) => setColor((e.target as HTMLInputElement).value)} value={editor.getAttributes('textStyle').color || '#ffffff'} />
                            {PRESET_COLORS.map(c => (
                                <button key={c} type="button" onMouseDown={e => e.preventDefault()} onClick={() => setColor(c)} style={{ background: c, width: 14, height: 14, padding: 0, borderRadius: '50%', border: '1px solid #555', margin: '0 2px' }} title={c} />
                            ))}
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().unsetColor().run()} title="Reset Color"><RotateCcw size={14} /></button>
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

const DEFAULT_TEMPLATES: Record<string, string> = {
    'python': 'import sys\n\ndef solve():\n    # Read input from stdin\n    # line = sys.stdin.read()\n    pass\n\nif __name__ == "__main__":\n    solve()',
    'java': 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your code here\n    }\n}',
    'cpp': '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}',
    'sql': '-- Write your query here\nSELECT * FROM table_name;',
}

const getDefaultContent = (langName: string) => {
    const key = langName.toLowerCase();
    if (key.includes('python')) return DEFAULT_TEMPLATES['python'];
    if (key.includes('java')) return DEFAULT_TEMPLATES['java'];
    if (key.includes('c++') || key.includes('cpp')) return DEFAULT_TEMPLATES['cpp'];
    if (key.includes('sql')) return DEFAULT_TEMPLATES['sql'];
    return '// Write code here';
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
    const [selectedTestcaseIds, setSelectedTestcaseIds] = useState<string[]>([])
    const [languageFiles, setLanguageFiles] = useState<LanguageFile[]>(initialData?.languageFiles || [])
    const [entryFile, setEntryFile] = useState<string>(initialData?.entryFile || initialData?.languageFiles?.[0]?.path || '')

    // --- Unified Editor Setup ---
    const editor = useEditor({
        extensions: [StarterKit, TextStyle, Color, ToggleBlock, BubbleMenuExtension],
        content: (() => {
            const desc = initialData?.description;
            if (Array.isArray(desc)) return desc.map(b => b.content).join('');
            if (desc && typeof desc === 'string') return desc;
            if (desc && typeof desc === 'object') return ''; // Handle legacy JSON if needed
            return '<p>Nhấn vào đây để bắt đầu soạn thảo mô tả bài tập...</p>';
        })(),
        immediatelyRender: false,
    })

    const insertToggle = (text: string) => {
        if (!editor) return
        editor.chain().focus().insertContent({
            type: 'toggle',
            content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }],
        }).run()
    }

    const setColor = (color: string) => editor?.chain().focus().setColor(color).run()

    // --- TestCase Actions ---
    const addTestcase = () => {
        setTestcases(prev => [...prev, {
            id: Date.now().toString(), input: '', expectedOutput: '', score: 10, order: prev.length + 1, isHidden: false
        }])
    }
    const updateTestcase = (id: string, field: keyof TestCase, value: any) => {
        setTestcases(prev => prev.map(tc => tc.id === id ? { ...tc, [field]: value } : tc))
    }
    const removeTestcase = (id: string) => {
        setTestcases(prev => prev.filter(tc => tc.id !== id))
        setSelectedTestcaseIds(prev => prev.filter(i => i !== id))
    }

    const toggleSelectTestcase = (id: string) => {
        setSelectedTestcaseIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const toggleSelectAllTestcases = () => {
        if (selectedTestcaseIds.length === testcases.length && testcases.length > 0) {
            setSelectedTestcaseIds([])
        } else {
            setSelectedTestcaseIds(testcases.map(tc => tc.id as string))
        }
    }

    const deleteSelectedTestcases = () => {
        if (!confirm(`Xóa ${selectedTestcaseIds.length} test cases đã chọn?`)) return
        setTestcases(prev => prev.filter(tc => !selectedTestcaseIds.includes(tc.id as string)))
        setSelectedTestcaseIds([])
    }

    const setScoreForSelected = () => {
        const scoreStr = prompt('Nhập điểm số cho các mục đã chọn:', '10')
        if (scoreStr === null) return
        const score = parseInt(scoreStr) || 0
        setTestcases(prev => prev.map(tc => selectedTestcaseIds.includes(tc.id as string) ? { ...tc, score } : tc))
    }

    // --- File Actions ---
    const addFile = () => {
        const firstLang = languages[0] || { id: 1, name: 'Python' };
        setLanguageFiles(prev => [...prev, {
            id: Date.now().toString(), 
            languageId: firstLang.id, 
            path: 'solution' + (firstLang.ext || '.py'), 
            type: 'TEMPLATE', 
            content: getDefaultContent(firstLang.name)
        }])
    }
    const updateFile = (id: string, field: keyof LanguageFile, value: any) => {
        setLanguageFiles(prev => prev.map(f => {
            if (f.id === id) {
                const updated = { ...f, [field]: value };
                if (field === 'path') {
                    const newExt = getExt(value);
                    const matchedLang = languages.find(l => l.ext.toLowerCase() === newExt.toLowerCase());
                    if (matchedLang) updated.languageId = matchedLang.id;
                } else if (field === 'languageId') {
                    const matchedLang = languages.find(l => l.id === value);
                    if (matchedLang) {
                        const baseName = f.path.split('.')[0] || 'file';
                        updated.path = baseName + matchedLang.ext;
                        
                        // Nếu nội dung cũ là trống hoặc là template mặc định của ngôn ngữ khác, thì cập nhật template mới
                        const oldLang = languages.find(l => l.id === f.languageId);
                        const isOldContentDefault = !f.content || (oldLang && f.content === getDefaultContent(oldLang.name)) || f.content === '// Write code here';
                        
                        if (isOldContentDefault) {
                            updated.content = getDefaultContent(matchedLang.name);
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
            // Convert single HTML back to Array of Block for Backend Compatibility
            description: [{ id: 'main-description', content: editor?.getHTML() || '' }] as Block[],
            testcases: testcases.map(({ input, expectedOutput, score, isHidden, order }) => ({
                input, expectedOutput, score, isHidden: isHidden ?? false, order
            })) as TestCase[],
            languageFiles: languageFiles.map((file: any) => ({
                languageId: file.languageId || file.language?.id,
                path: file.path,
                type: file.type,
                content: file.content
            })) as LanguageFile[],
            entryFile,
            problemFiles: []
        }
        onSubmit(payload)
    }

    return (
        <div className={styles['page-container']}>
            <div className={styles['header-section']} style={{ marginBottom: 16 }}>
                <div className={styles['title-input-group']}>
                    <label htmlFor="title">Tên bài:</label>
                    <input 
                        type="text" 
                        id="title" 
                        placeholder="Nhập tên bài học..." 
                        value={problemState.title}
                        onChange={(e) => setProblemState(s => ({ ...s, title: e.target.value }))}
                    />
                </div>
                <button className={`save-btn ${disableSave ? 'disabled' : ''}`} onClick={handleSave} disabled={isSubmitting || disableSave}>
                    {isSubmitting ? 'Đang lưu...' : disableSave ? 'Chỉ Xem' : 'Lưu Bài Tập'}
                </button>
            </div>
            {entryFile && (
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '6px 12px', borderRadius: 6, marginBottom: 16, border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Star size={14} fill="var(--accent-blue)" color="var(--accent-blue)" />
                    <span style={{ fontSize: 13, color: 'var(--accent-blue-light)' }}>File chạy chính hiện tại: <strong>{entryFile}</strong></span>
                </div>
            )}

            <div className={styles['layout-split']}>
                {/* LEFT PANEL */}
                <div className={styles['left-panel']}>
                    <div className={styles['panel-header']} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 4, height: 18, background: 'var(--accent-purple)', borderRadius: 2 }} />
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Mô tả bài tập</h3>
                        </div>
                    </div>

                    <div className={`${styles.card} description-card`} style={{ padding: 0, overflow: 'visible' }}>
                        {editor && (
                            <div className="unified-editor">
                                <div className={styles['toolbar-wrapper']} style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '4px 8px', borderRadius: '12px 12px 0 0' }}>
                                    <div className={styles.toolbar} style={{ margin: 0 }}>
                                        <div className={styles['button-group']}>
                                            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? styles.active : ''}><b>B</b></button>
                                            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? styles.active : ''}><i>I</i></button>
                                            <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? styles.active : ''}><code>{"{}"}</code></button>
                                        </div>
                                        <div className={styles['button-group']}>
                                            <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? styles.active : ''}>¶</button>
                                            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? styles.active : ''}>H1</button>
                                            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? styles.active : ''}>H2</button>
                                            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? styles.active : ''}>H3</button>
                                        </div>
                                        <div className={styles['button-group']}>
                                            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? styles.active : ''}>•</button>
                                            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? styles.active : ''}>1.</button>
                                        </div>
                                        <div className={styles['button-group']}>
                                            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? styles.active : ''}>“</button>
                                            <button type="button" onClick={() => {
                                                const { from, to } = editor.state.selection
                                                const selectedText = editor.state.doc.textBetween(from, to, ' ')
                                                insertToggle(selectedText || "")
                                            }} title="Khối đóng khung"><PlusSquare size={14} /></button>
                                        </div>
                                        <div className={`${styles['button-group']} ${styles['color-picker-group']}`}>
                                            <input type="color" onInput={(e) => setColor((e.target as HTMLInputElement).value)} />
                                            {PRESET_COLORS.map(c => (
                                                <button key={c} type="button" onClick={() => setColor(c)} style={{ background: c, width: 12, height: 12, borderRadius: '50%', padding: 0, minWidth: 12 }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: '4px 8px' }}>
                                    <EditorContent editor={editor} className="editor-content" />
                                    <BubbleMenu editor={editor} shouldShow={({ from, to }) => from !== to}>
                                        <div className={styles['bubble-menu']}>
                                            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? styles.active : ''}><b>B</b></button>
                                            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? styles.active : ''}><i>I</i></button>
                                            <button type="button" onClick={() => editor.chain().focus().setColor('#ef4444').run()}><Circle size={14} fill="#ef4444" /></button>
                                        </div>
                                    </BubbleMenu>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles['panel-header']} style={{ marginTop: 20 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {selectedTestcaseIds.length > 0 && (
                                <div className="bulk-actions" style={{ display: 'flex', gap: 6, background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(239, 68, 68, 0.2)', alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', marginRight: 4 }}>{selectedTestcaseIds.length} đã chọn:</span>
                                    <button type="button" onClick={setScoreForSelected} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}>Đặt điểm</button>
                                    <button type="button" onClick={deleteSelectedTestcases} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>Xóa</button>
                                </div>
                            )}
                            <button className={styles['add-block-btn']} onClick={addTestcase} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 11, padding: '4px 12px' }}>+ Thêm Case</button>
                        </div>
                    </div>

                    {testcases.length > 0 && (
                        <div style={{ padding: '0 8px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <input type="checkbox" checked={selectedTestcaseIds.length === testcases.length && testcases.length > 0} onChange={toggleSelectAllTestcases} />
                                Chọn tất cả
                            </label>
                        </div>
                    )}
                    <div className="testcases-list">
                        {testcases.map((tc) => (
                            <div key={tc.id} className={`${styles['testcase-item']} ${tc.isHidden ? styles['is-hidden'] : ''}`} style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: -22, top: 12 }}>
                                    <input type="checkbox" checked={selectedTestcaseIds.includes(tc.id as string)} onChange={() => toggleSelectTestcase(tc.id as string)} />
                                </div>
                                <div className={styles['testcase-row']}>
                                    <label style={{ width: 60, fontSize: 11, color: 'var(--text-muted)' }}>INPUT</label>
                                    <textarea value={tc.input} onChange={e => updateTestcase(tc.id as string, 'input', e.target.value)} placeholder="Nhập input..." style={{ flex: 1, minHeight: 40, borderRadius: 6, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: 12, padding: 8 }} />
                                </div>
                                <div className={styles['testcase-row']}>
                                    <label style={{ width: 60, fontSize: 11, color: 'var(--text-muted)' }}>OUTPUT</label>
                                    <textarea value={tc.expectedOutput} onChange={e => updateTestcase(tc.id as string, 'expectedOutput', e.target.value)} placeholder="Kỳ vọng..." style={{ flex: 1, minHeight: 40, borderRadius: 6, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: 12, padding: 8 }} />
                                </div>
                                <div className={styles['testcase-actions']} style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <input type="number" value={tc.score} onChange={e => updateTestcase(tc.id as string, 'score', parseInt(e.target.value) || 0)} style={{ width: 40, background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', color: 'var(--accent-purple-light)', fontWeight: 700, textAlign: 'center' }} />
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>đ</span>
                                        </div>
                                        <label className={styles['checkbox-label']}>
                                            <input type="checkbox" checked={tc.isHidden} onChange={e => updateTestcase(tc.id as string, 'isHidden', e.target.checked)} />
                                            Ẩn
                                        </label>
                                    </div>
                                    <button className={styles['btn-icon']} onClick={() => removeTestcase(tc.id as string)}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className={styles['right-panel']}>
                    <div className={styles['tabs-header']}>
                        <button className={activeTab === 'CODE' ? styles.active : ''} onClick={() => setActiveTab('CODE')}>Templates & Solutions</button>
                        <button className={activeTab === 'SETTINGS' ? styles.active : ''} onClick={() => setActiveTab('SETTINGS')}>Cấu hình</button>
                    </div>

                    <div className={styles['tab-content']} style={{ padding: 16 }}>
                        {activeTab === 'SETTINGS' && (
                            <div className={styles['form-grid']}>
                                <div className={styles['form-group']}>
                                    <label>Slug</label>
                                    <input value={problemState.slug} onChange={e => setProblemState(s => ({ ...s, slug: e.target.value }))} placeholder="vi-du-bai-tap" />
                                </div>
                                <div className={styles['form-group']}>
                                    <label>Độ khó</label>
                                    <CustomSelect 
                                        value={problemState.difficulty} 
                                        onChange={val => setProblemState(s => ({ ...s, difficulty: val as any}))}
                                        options={[
                                            { value: 'EASY', label: 'Dễ' },
                                            { value: 'MEDIUM', label: 'Trung bình' },
                                            { value: 'HARD', label: 'Khó' },
                                        ]}
                                        minWidth="100%"
                                    />
                                </div>
                                <div className={`${styles['form-group']} ${styles['full-width']}`}>
                                    <label>Loại hình</label>
                                    <CustomSelect 
                                        value={problemState.type} 
                                        onChange={val => setProblemState(s => ({ ...s, type: val as any}))}
                                        options={[
                                            { value: 'CODE', label: 'Lập trình (CODE)' },
                                            { value: 'SQL', label: 'Truy vấn (SQL)' },
                                        ]}
                                        minWidth="100%"
                                    />
                                </div>
                                <div className={`${styles['form-group']} ${styles['full-width']}`}>
                                    <label>Tùy chỉnh IDE Học viên</label>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                                        <label className="checkbox-row" style={{ display: 'flex', gap: 8, fontSize: 13, marginBottom: 8 }}>
                                            <input type="checkbox" checked={workspaceConfig.canCreateFile} onChange={e => setWorkspaceConfig(s => ({ ...s, canCreateFile: e.target.checked }))} />
                                            Cho phép tạo thêm file
                                        </label>
                                        <label className="checkbox-row" style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                                            <input type="checkbox" checked={workspaceConfig.canChangeMainFile} onChange={e => setWorkspaceConfig(s => ({ ...s, canChangeMainFile: e.target.checked }))} />
                                            Cho phép đổi Entry point
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'CODE' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Danh sách tập tin</h4>
                                    <button className={styles['add-block-btn']} onClick={addFile} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 11 }}>+ Thêm file</button>
                                </div>
                                
                                {languageFiles.map(file => (
                                    <div key={file.id} className={styles['code-file-item']}>
                                        <div className={styles['code-file-header']} style={{ padding: '8px 12px' }}>
                                            <CustomSelect 
                                                value={file.languageId} 
                                                onChange={val => updateFile(file.id as string, 'languageId', val)}
                                                options={[
                                                    { value: 0, label: 'Đính kèm' },
                                                    ...languages.map(l => ({ value: l.id, label: l.name }))
                                                ]}
                                                minWidth={130}
                                                height={36}
                                            />
                                            <CustomSelect 
                                                value={file.type} 
                                                onChange={val => updateFile(file.id as string, 'type', val)}
                                                options={[
                                                    { value: 'TEMPLATE', label: 'TEMPLATE' },
                                                    { value: 'SOLUTION', label: 'SOLUTION' },
                                                ]}
                                                minWidth={120}
                                                height={36}
                                            />
                                            <input value={file.path} onChange={e => updateFile(file.id as string, 'path', e.target.value)} placeholder="Tên file" style={{ flex: 1, fontSize: 12 }} />
                                            <button 
                                                className={styles['btn-icon']} 
                                                onClick={() => setEntryFile(file.path)}
                                                style={{ color: entryFile === file.path ? 'var(--accent-yellow)' : 'var(--text-muted)' }}
                                                title="Đặt làm file chạy chính"
                                            >
                                                <Star size={16} fill={entryFile === file.path ? 'var(--accent-yellow)' : 'none'} />
                                            </button>
                                            <button className={styles['btn-icon']} onClick={() => removeFile(file.id as string)}><Trash2 size={16} /></button>
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
