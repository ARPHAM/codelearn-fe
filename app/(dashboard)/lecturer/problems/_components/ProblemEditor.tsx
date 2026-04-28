'use client'

import {
    useEditor,
    EditorContent,
    ReactNodeViewRenderer,
    NodeViewWrapper,
    NodeViewContent,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import { BubbleMenu } from '@tiptap/react/menus'
import { Node, mergeAttributes } from '@tiptap/core'
import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import { CreateProblemDto, Block, TestCase, LanguageFile } from '@/api/problems.api'
import { runApi, RunResult } from '@/api/run.api'
import { useLanguages } from '@/hooks/useLanguages'
import FillInTheBlankEditor from '@/components/FillInTheBlankEditor'
import Modal from '@/components/ui/Modal'
import {
    PlusSquare, RotateCcw, Trash2, ArrowUp, ArrowDown, Cpu, Zap, Timer,
    Circle, Star, Play, Copy, Lock, Unlock, FileCode, Plus, X, Edit3, Settings, BookOpen, AlertCircle
} from 'lucide-react'
import styles from './editor.module.css'
import CustomSelect from '@/components/ui/Select'
import { useRouter } from 'next/navigation'

// ---------------- TOGGLE NODE (Tiptap) ----------------
const ToggleComponent = () => (
    <NodeViewWrapper style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px', marginBottom: 8, border: '1px solid var(--border)' }}>
        <NodeViewContent as="div" />
    </NodeViewWrapper>
)

const ToggleBlock = Node.create({
    name: 'toggle', group: 'block', content: 'block*', defining: true,
    addAttributes() { return { open: { default: true } } },
    parseHTML() { return [{ tag: 'div[data-type="toggle"]' }] },
    renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'toggle' }), 0] },
    addNodeView() { return ReactNodeViewRenderer(ToggleComponent, { contentDOMElementTag: 'div' }) },
})

const PRESET_COLORS = ['#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

// ---------------- UTILS ----------------
const getExt = (filename: string) => {
    const parts = filename.split('.')
    return parts.length > 1 ? '.' + parts.pop() : ''
}

const DEFAULT_TEMPLATES: Record<string, string> = {
    '.py': 'import sys\n\ndef solve():\n    # Read input from stdin\n    # line = sys.stdin.read()\n    pass\n\nif __name__ == "__main__":\n    solve()',
    '.java': 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your code here\n    }\n}',
    '.cpp': '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}',
    '.js': 'console.log("Hello World");',
    '.ts': 'console.log("Hello World");',
    '.sql': '-- Write your query here\nSELECT * FROM table_name;',
}

const getDefaultContent = (ext: string) => {
    const key = ext.toLowerCase()
    return DEFAULT_TEMPLATES[key] || '// Write code here'
}

// ---------------- LANGUAGE WORKSPACE ----------------
const LanguageWorkspace = memo(function LanguageWorkspace({
    languageId,
    languages,
    files,
    updateFiles,
    onRemoveLanguage,
    onRunCode,
    openConfirm,
    openInput,
    openAlert,
    entryFile,
    setAsEntryFile,
    updateSingleFile
}: {
    languageId: number,
    languages: any[],
    files: LanguageFile[],
    updateFiles: (newFiles: LanguageFile[]) => void,
    updateSingleFile: (langId: number, path: string, type: 'TEMPLATE' | 'SOLUTION', updates: Partial<LanguageFile>) => void,
    onRemoveLanguage: () => void,
    onRunCode: (files: LanguageFile[]) => void,
    openConfirm: (title: string, msg: string, cb: () => void) => void,
    openInput: (title: string, msg: string, def: string, cb: (v: string) => void) => void,
    openAlert: (title: string, message: string) => void,
    entryFile: string,
    setAsEntryFile: (path: string) => void,
}) {
    const lang = useMemo(() => languages.find(l => l.id === languageId), [languages, languageId])
    const [activePath, setActivePath] = useState<string>(files[0]?.path || '')

    const templateRef = useRef<any>(null)
    const solutionRef = useRef<any>(null)
    const [blankStatus, setBlankStatus] = useState({ canWrap: true, isInside: false, isInvalid: false })

    const paths = useMemo(() => Array.from(new Set(files.map(f => f.path))), [files])

    useEffect(() => {
        if (!paths.includes(activePath) && paths.length > 0) {
            setActivePath(paths[0])
        }
    }, [paths, activePath])

    const getFile = useCallback((path: string, type: 'TEMPLATE' | 'SOLUTION') =>
        files.find(f => f.path === path && f.type === type), [files])

    const updateFileContent = useCallback((path: string, type: 'TEMPLATE' | 'SOLUTION', content: string) => {
        updateSingleFile(languageId, path, type, { content });
    }, [languageId, updateSingleFile])

    const toggleFlag = useCallback((path: string, flag: 'isReadonly' | 'isFillInTheBlank') => {
        const f = files.find(f => f.path === path && f.type === 'TEMPLATE');
        if (!f) return;

        const nextVal = !f[flag];
        let updates: Partial<LanguageFile> = { [flag]: nextVal };

        if (nextVal) {
            if (flag === 'isReadonly') {
                updates.isFillInTheBlank = false;
                updates.content = f.content.replace(/\{\{((?:(?!\{\{)[\s\S])*)\}\}/g, '$1');
            }
            if (flag === 'isFillInTheBlank') {
                updates.isReadonly = false;
            }
        }
        updateSingleFile(languageId, path, 'TEMPLATE', updates);
    }, [files, languageId, updateSingleFile])

    const addLocalFile = useCallback(() => {
        openInput('Tạo tập tin mới', 'Nhập tên file (vd: logic.py):', 'main' + (lang?.ext || '.py'), (name) => {
            if (!name) return
            if (paths.includes(name)) return openAlert('Lỗi', 'Tên tập tin đã tồn tại!')
            const template: LanguageFile = {
                languageId, path: name, type: 'TEMPLATE', content: getDefaultContent(lang?.name || ''), isReadonly: false, isFillInTheBlank: true, isEntryFile: false
            }
            const solution: LanguageFile = {
                languageId, path: name, type: 'SOLUTION', content: getDefaultContent(lang?.name || ''), isEntryFile: false
            }
            updateFiles([...files, template, solution])
            setActivePath(name)
        })
    }, [lang, paths, openInput, openAlert, languageId, files, updateFiles])

    const deleteLocalFile = useCallback((path: string) => {
        openConfirm('Xóa Testcase', `Tập tin "${path}" sẽ bị xóa khỏi ngôn ngữ này. Bạn chắc chắn chứ?`, () => {
            updateFiles(files.filter(f => f.path !== path))
        })
    }, [openConfirm, files, updateFiles])

    const renameLocalFile = useCallback((oldPath: string) => {
        openInput('Đổi tên tập tin', 'Nhập tên mới:', oldPath, (newPath) => {
            if (!newPath || newPath === oldPath) return
            if (paths.includes(newPath)) return openAlert('Lỗi', 'Tên tập tin đã tồn tại!')
            updateFiles(files.map(f => f.path === oldPath ? { ...f, path: newPath } : f))
            if (activePath === oldPath) setActivePath(newPath)
        })
    }, [openInput, paths, openAlert, files, updateFiles, activePath])


    const copyFromTemplate = useCallback((path: string) => {
        const template = files.find(f => f.path === path && f.type === 'TEMPLATE')
        if (template) {
            updateSingleFile(languageId, path, 'SOLUTION', { content: template.content });
        }
    }, [files, languageId, updateSingleFile])

    const activeTemplate = useMemo(() => getFile(activePath, 'TEMPLATE'), [getFile, activePath])
    const activeSolution = useMemo(() => getFile(activePath, 'SOLUTION'), [getFile, activePath])

    return (
        <div className={`${styles['workspace-item']} ${styles['animate-fade-in']}`}>
            <div className={styles['workspace-header']}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: '4px 10px', background: 'var(--accent-purple)', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
                        {lang?.name || 'Ngôn ngữ'}
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{files.length / 2} tập tin</span>
                </div>
                <button onClick={onRemoveLanguage} className={styles['btn-icon']} title="Gỡ ngôn ngữ này">
                    <Trash2 size={16} color="#ef4444" />
                </button>
            </div>

            <div className={styles['workspace-grid']}>
                <div className={styles['side-panel']} style={{ borderRight: '1px solid var(--border)' }}>
                    <div className={styles['side-header']}>
                        <div className={styles['side-title']}><BookOpen size={14} /> UI Học sinh (Template)</div>
                        <button onClick={addLocalFile} className={styles['action-btn']}>
                            <Plus size={14} /> Thêm file
                        </button>
                    </div>

                    <div className={styles['file-tabs-container']}>
                        {paths.map(p => (
                            <div
                                key={p}
                                className={`${styles['file-tab']} ${p === activePath ? styles['file-tab-active'] : ''}`}
                                onClick={() => setActivePath(p)}
                            >
                                <FileCode size={12} />
                                {p}
                                {p === activePath && (
                                    <div style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setAsEntryFile(p) }}
                                            className={`${styles['btn-icon']} ${getFile(p, 'TEMPLATE')?.isEntryFile ? styles['active-entry'] : ''}`}
                                            style={{ color: getFile(p, 'TEMPLATE')?.isEntryFile ? '#f59e0b' : '' }}
                                            title="Đặt làm file chính"
                                        >
                                            <Star size={10} fill={getFile(p, 'TEMPLATE')?.isEntryFile ? '#f59e0b' : 'none'} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); renameLocalFile(p) }} className={styles['btn-icon']} style={{ padding: 2 }}><Edit3 size={10} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteLocalFile(p) }} className={styles['btn-icon']} style={{ padding: 2 }}><X size={10} /></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {activeTemplate && (
                        <>
                            <div className={styles['editor-actions']}>
                                <button
                                    onClick={() => toggleFlag(activePath, 'isReadonly')}
                                    className={`${styles['action-btn']} ${activeTemplate.isReadonly ? styles['active'] : ''}`}
                                    title={activeTemplate.isReadonly ? "Tập tin chỉ đọc" : "Tập tin có thể sửa chuyên sâu"}
                                >
                                    {activeTemplate.isReadonly ? <Lock size={12} /> : <Unlock size={12} />} Chỉ đọc
                                </button>
                                <button
                                    onClick={() => {
                                        // Luôn đảm bảo flag FillInTheBlank được bật khi thao tác chèn
                                        if (!activeTemplate.isFillInTheBlank) {
                                            toggleFlag(activePath, 'isFillInTheBlank');
                                        }
                                        // Chèn hoặc Xóa {{ }} tại vị trí con trỏ
                                        setTimeout(() => templateRef.current?.insertBlank(), 50);
                                    }}
                                    disabled={blankStatus.isInvalid}
                                    className={`${styles['action-btn']} ${blankStatus.isInvalid ? styles['invalid-selection'] : ''}`}
                                    title={blankStatus.isInvalid ? "Bôi đen sai cú pháp (không được lấn một phần vào dấu ngoặc)" : blankStatus.isInside ? "Nhấn để xóa ô điền khuyết" : "Nhấn để tạo ô điền khuyết {{ }} (Ctrl + B)"}
                                    style={{
                                        position: 'relative',
                                        backgroundColor: blankStatus.isInvalid ? 'rgba(239, 68, 68, 0.15)' : (blankStatus.isInside ? '#8b5cf6' : 'transparent'),
                                        borderColor: blankStatus.isInvalid ? '#ef4444' : (blankStatus.isInside ? '#8b5cf6' : '#334155'),
                                        color: blankStatus.isInvalid ? '#ef4444' : (blankStatus.isInside ? '#fff' : '#94a3b8'),
                                        cursor: blankStatus.isInvalid ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    {`{{ }}`} Ô điền khuyết
                                    {blankStatus.isInside && <div style={{ position: 'absolute', top: -4, right: -4, width: 10, height: 10, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981', border: '2px solid #0b0f1a' }} />}
                                </button>
                            </div>
                            <FillInTheBlankEditor
                                ref={templateRef}
                                file={activeTemplate}
                                updateFile={(_, __, val) => updateFileContent(activePath, 'TEMPLATE', val)}
                                languages={languages}
                                height="320px"
                                isStudent={false}
                                onStatusChange={setBlankStatus}
                            />
                        </>
                    )}
                </div>

                <div className={styles['side-panel']}>
                    <div className={styles['side-header']}>
                        <div className={styles['side-title']}><Zap size={14} /> Lời giải (Solution)</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => onRunCode(files)} className={`${styles['action-btn']} ${styles['run-btn']}`}>
                                <Play size={12} fill="white" /> Run
                            </button>
                        </div>
                    </div>

                    <div className={styles['file-tabs-container']}>
                        {paths.map(p => (
                            <div
                                key={p}
                                className={`${styles['file-tab']} ${p === activePath ? styles['file-tab-active'] : ''}`}
                                onClick={() => setActivePath(p)}
                            >
                                <FileCode size={12} />
                                {p}
                                {p === activePath && entryFile === p && (
                                    <Star size={10} fill="#f59e0b" color="#f59e0b" style={{ marginLeft: 4 }} />
                                )}
                            </div>
                        ))}
                    </div>

                    {activeSolution && (
                        <>
                            <div className={styles['editor-actions']}>
                                <button onClick={() => copyFromTemplate(activePath)} className={`${styles['action-btn']} ${styles['sync-btn']}`}>
                                    <Copy size={12} /> Đồng bộ
                                </button>
                            </div>
                            <FillInTheBlankEditor
                                ref={solutionRef}
                                file={activeSolution}
                                updateFile={(_, __, val) => updateFileContent(activePath, 'SOLUTION', val)}
                                languages={languages}
                                height="320px"
                                isStudent={false}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
})

// ---------------- MAIN COMPONENT ----------------
interface ProblemEditorProps {
    initialData?: CreateProblemDto
    onSubmit: (data: CreateProblemDto) => void
    isSubmitting?: boolean
    disableSave?: boolean
}

export default function ProblemEditor({ initialData, onSubmit, isSubmitting, disableSave }: ProblemEditorProps) {
    const router = useRouter()
    const { data: languagesData } = useLanguages()
    const languages = useMemo(() => languagesData || [], [languagesData])

    const [problemState, setProblemState] = useState({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        difficulty: initialData?.difficulty || 'EASY',
        type: initialData?.type || 'CODE',
        visibility: initialData?.visibility || 'PUBLIC',
        source: initialData?.source || '',
        timeLimit: initialData?.timeLimit || 5000,
        memoryLimit: initialData?.memoryLimit || 256
    })

    const [workspaceConfig, setWorkspaceConfig] = useState({
        canCreateFile: initialData?.workspaceConfig?.canCreateFile ?? false,
        canChangeMainFile: initialData?.workspaceConfig?.canChangeMainFile ?? false
    })

    const [testcases, setTestcases] = useState<TestCase[]>(initialData?.testcases || [])
    const [languageFiles, setLanguageFiles] = useState<LanguageFile[]>(initialData?.problemFiles || (initialData as any)?.languageFiles || [])
    const [runResults, setRunResults] = useState<any[] | null>(null)

    // Dialog state
    const [modal, setModal] = useState<{
        isOpen: boolean;
        type: 'confirm' | 'input' | 'alert';
        title: string;
        message: string;
        value: string;
        onConfirm: (val: string) => void;
    }>({
        isOpen: false,
        type: 'confirm',
        title: '',
        message: '',
        value: '',
        onConfirm: () => { },
    })

    const openConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
        setModal({ isOpen: true, type: 'confirm', title, message, value: '', onConfirm: () => onConfirm() })
    }, [])

    const openInput = useCallback((title: string, message: string, defaultValue: string, onConfirm: (val: string) => void) => {
        setModal({ isOpen: true, type: 'input', title, message, value: defaultValue, onConfirm })
    }, [])

    const openAlert = useCallback((title: string, message: string) => {
        setModal({ isOpen: true, type: 'alert', title, message, value: '', onConfirm: () => { } })
    }, [])

    const closeModal = useCallback(() => setModal(prev => ({ ...prev, isOpen: false })), [])

    const setAsEntryFile = useCallback((langId: number, path: string) => {
        setLanguageFiles(prev => prev.map(f => {
            if (f.languageId === langId) {
                return { ...f, isEntryFile: f.path === path };
            }
            return f;
        }));
        openAlert('Thông báo', `Đã dặt "${path}" làm tập tin khởi chạy (Entry Point) cho ngôn ngữ này.`)
    }, [openAlert])

    // Tiptap setup
    const editor = useEditor({
        extensions: [StarterKit, TextStyle, Color, ToggleBlock, BubbleMenuExtension],
        content: (() => {
            const desc = initialData?.description;
            if (Array.isArray(desc)) return desc.map(b => b.content).join('');
            if (typeof desc === 'string') return desc;
            return '<p>Bắt soạn thảo mô tả tại đây...</p>';
        })(),
        immediatelyRender: false,
    })

    const insertToggle = useCallback((text: string) => editor?.chain().focus().insertContent({
        type: 'toggle', content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }],
    }).run(), [editor])

    const setColor = useCallback((color: string) => editor?.chain().focus().setColor(color).run(), [editor])

    const addTestcase = useCallback(() => setTestcases(prev => [...prev, { id: Date.now().toString(), input: '', expectedOutput: '', score: 10, order: prev.length + 1, isHidden: false }]), [])
    const updateTestcase = useCallback((id: string, field: keyof TestCase, value: any) => setTestcases(prev => prev.map(tc => tc.id === id ? { ...tc, [field]: value } : tc)), [])
    const removeTestcase = useCallback((id: string) => {
        openConfirm('Xóa Testcase', 'Bạn có chắc chắn muốn xóa testcase này?', () => {
            setTestcases(prev => prev.filter(tc => tc.id !== id))
        })
    }, [openConfirm])

    const activeLanguages = useMemo(() => Array.from(new Set(languageFiles.map(f => f.languageId))), [languageFiles])

    const addNewLanguage = useCallback((langId: number) => {
        if (activeLanguages.includes(langId)) return
        const lang = languages.find(l => l.id === langId)
        const ext = lang?.ext || '.py'
        const mainName = 'main' + ext
        const defaultContent = getDefaultContent(ext)
        const newFiles: LanguageFile[] = [
            { languageId: langId, path: mainName, type: 'TEMPLATE', content: defaultContent, isReadonly: false, isFillInTheBlank: true, isEntryFile: true },
            { languageId: langId, path: mainName, type: 'SOLUTION', content: defaultContent, isEntryFile: true }
        ]
        setLanguageFiles(prev => [...prev, ...newFiles])
    }, [activeLanguages, languages])

    const removeLanguage = useCallback((langId: number) => {
        openConfirm('Gỡ ngôn ngữ', 'Toàn bộ mã nguồn Boilerplate và Lời giải của ngôn ngữ này sẽ bị xóa. Bạn chắc chắn chứ?', () => {
            setLanguageFiles(prev => prev.filter(f => f.languageId !== langId))
        })
    }, [openConfirm])

    const updateSingleFile = useCallback((langId: number, path: string, type: 'TEMPLATE' | 'SOLUTION', updates: Partial<LanguageFile>) => {
        setLanguageFiles(prev => prev.map(f => {
            if (f.languageId === langId && f.path === path && f.type === type) {
                const nextContent = updates.content !== undefined ? updates.content : f.content;
                let finalUpdates = { ...updates };

                // LOGIC THÔNG MINH: Nếu đang Chỉ đọc mà lại xuất hiện dấu ngoặc {{ }} 
                // (do người dùng gõ tay hoặc dán), thì tự động tắt Chỉ đọc.
                if (type === 'TEMPLATE' && f.isReadonly) {
                    const hasBlanks = /\{\{((?:(?!\{\{)[\s\S])*)\}\}/.test(nextContent);
                    if (hasBlanks) {
                        finalUpdates.isReadonly = false;
                        finalUpdates.isFillInTheBlank = true;
                    }
                }
                return { ...f, ...finalUpdates };
            }
            return f;
        }))
    }, [])

    const updateLanguageFiles = useCallback((langId: number, newFiles: LanguageFile[]) => {
        setLanguageFiles(prev => {
            const others = prev.filter(f => f.languageId !== langId);
            return [...others, ...newFiles];
        });
    }, [])

    const handleSave = useCallback(() => {
        if (!problemState.title) return openAlert('Thông báo', 'Vui lòng nhập tên bài tập trước khi lưu!')
        const payload: CreateProblemDto = {
            ...problemState,
            workspaceConfig,
            description: [{ id: 'main-description', content: editor?.getHTML() || '' }] as Block[],
            testcases: testcases.map(({ input, expectedOutput, score, isHidden, order }) => ({
                input,
                expectedOutput,
                score,
                isHidden: !!isHidden,
                order
            })),
            problemFiles: languageFiles.map((f: LanguageFile) => ({
                languageId: f.languageId,
                path: f.path,
                type: f.type,
                content: f.content,
                isReadonly: !!f.isReadonly,
                isFillInTheBlank: !!f.isFillInTheBlank,
                isEntryFile: !!f.isEntryFile
            })),
            entryFile: languageFiles.find(f => f.isEntryFile)?.path || '',
        }
        onSubmit(payload)
    }, [problemState, workspaceConfig, editor, testcases, languageFiles, openAlert, onSubmit])

    const handleRunCode = useCallback(async (files: LanguageFile[]) => {
        const lang = languages.find(l => l.id === files[0]?.languageId)
        const currentEntry = files.find(f => f.isEntryFile)?.path;

        if (!lang) return openAlert('Lỗi', 'Không xác định được ngôn ngữ.')
        if (!currentEntry) return openAlert('Thiếu cấu hình', 'Vui lòng chọn 1 file làm Entry Point (Phím ngôi sao) để chạy code.')
        if (testcases.length === 0) return openAlert('Thiếu dữ liệu', 'Hãy thêm ít nhất một testcase để thực thi bài tập.')

        // BƯỚC 1: Khởi tạo danh sách kết quả ở trạng thái PENDING và mở Popup ngay
        const initialResults = testcases.map(tc => ({
            input: tc.input,
            expected: tc.expectedOutput,
            actual: '',
            status: 'PENDING',
            runtime: 0
        }))
        setRunResults(initialResults)

        console.log(`%c === BẮT ĐẦU CHẠY THỬ (${lang.name}) === `, 'background: #8b5cf6; color: white; padding: 4px; border-radius: 4px;')
        let passCount = 0

        for (let i = 0; i < testcases.length; i++) {
            const tc = testcases[i]

            // Cập nhật trạng thái đang chạy cho testcase hiện tại
            setRunResults(prev => prev ? prev.map((r, idx) => idx === i ? { ...r, status: 'RUNNING' } : r) : null)

            const runPayload = {
                languageId: lang.id,
                entryFile: currentEntry,
                files: files.map(f => ({ filePath: f.path, content: f.content })),
                input: tc.input || ''
            }

            try {
                const runExecution = await runApi.executeCode(runPayload)
                const result = await runApi.waitForResult(runExecution.id)

                const actualOutput = (result.stdout || '').trim()
                const expectedOutput = (tc.expectedOutput || '').trim()
                const isMatch = actualOutput === expectedOutput

                if (isMatch) passCount++

                const finalResult = {
                    input: tc.input,
                    expected: expectedOutput,
                    actual: actualOutput,
                    status: isMatch ? 'PASSED' : result.status === 'accepted' ? 'WRONG' : result.status.toUpperCase(),
                    runtime: result.runtime,
                    error: result.stderr
                }

                // Cập nhật kết quả ngay lập tức lên UI
                setRunResults(prev => prev ? prev.map((r, idx) => idx === i ? finalResult : r) : null)

            } catch (err: any) {
                const errorResult = {
                    input: tc.input,
                    expected: tc.expectedOutput,
                    actual: 'ERROR',
                    status: 'TIMEOUT/ERROR',
                    error: err.message
                }
                setRunResults(prev => prev ? prev.map((r, idx) => idx === i ? errorResult : r) : null)
            }
        }

        const summaryColor = passCount === testcases.length ? '#10b981' : '#f59e0b'
        console.log(`%c === KẾT QUẢ TỔNG QUAN: ${passCount}/${testcases.length} ĐẠT === `, `background: ${summaryColor}; color: white; padding: 4px; border-radius: 4px; font-weight: bold;`)
    }, [languages, openAlert, testcases])

    return (
        <div className={styles['page-container']}>
            <div className={styles['layout-split']}>
                <div className={styles['left-panel']}>
                    <div className={styles['panel-header']}>
                        <h3>
                            <div style={{ width: 4, height: 16, background: 'var(--accent-purple)', borderRadius: 2 }} />
                            Mô tả đề bài
                        </h3>
                    </div>
                    <div className={styles.card} style={{ padding: 0 }}>
                        {editor && (
                            <div className="unified-editor">
                                <div className={styles['toolbar-wrapper']} style={{ padding: '8px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
                                    <div className={styles.toolbar} style={{ margin: 0 }}>
                                        <div className={styles['button-group']}>
                                            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? styles.active : ''}><b>B</b></button>
                                            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? styles.active : ''}><i>I</i></button>
                                            <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? styles.active : ''}><code>{"{}"}</code></button>
                                        </div>
                                        <div className={styles['button-group']}>
                                            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? styles.active : ''}>H2</button>
                                            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? styles.active : ''}>H3</button>
                                        </div>
                                        <div className={styles['button-group']}>
                                            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? styles.active : ''}>•</button>
                                            <button type="button" onClick={() => {
                                                const { from, to } = editor.state.selection
                                                insertToggle(editor.state.doc.textBetween(from, to, ' '))
                                            }} title="Khối nhấn mạnh"><PlusSquare size={14} /></button>
                                        </div>
                                        <div className={`${styles['button-group']} ${styles['color-picker-group']}`}>
                                            <input type="color" onInput={(e) => setColor((e.target as HTMLInputElement).value)} />
                                            {PRESET_COLORS.map(c => (
                                                <button key={c} type="button" onClick={() => setColor(c)} style={{ background: c, width: 12, height: 12, borderRadius: '50%', minWidth: 12 }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: '16px' }}>
                                    <EditorContent editor={editor} className="editor-content" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles['panel-header']} style={{ marginTop: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, background: 'var(--accent-green)', borderRadius: 2 }} />
                            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bộ Test cases</h3>
                        </div>
                        <button className={styles['action-btn']} onClick={addTestcase} style={{ fontSize: 12 }}><Plus size={14} /> Thêm testcase</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {testcases.map((tc, idx) => (
                            <div key={tc.id || idx} className={styles['testcase-item']}>
                                <div className={styles['testcase-row']}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>DỮ LIỆU VÀO (INPUT)</label>
                                        <textarea value={tc.input} onChange={e => updateTestcase(tc.id as string, 'input', e.target.value)} placeholder="Trống (nếu không có input)..." style={{ width: '100%', minHeight: 40, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 6, color: '#fff', padding: 8, fontSize: 12, fontFamily: 'monospace' }} />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>KẾT QUẢ KỲ VỌNG (OUTPUT)</label>
                                        <textarea value={tc.expectedOutput} onChange={e => updateTestcase(tc.id as string, 'expectedOutput', e.target.value)} placeholder="Kết quả mong đợi..." style={{ width: '100%', minHeight: 40, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 6, color: '#fff', padding: 8, fontSize: 12, fontFamily: 'monospace' }} />
                                    </div>
                                </div>
                                <div className={styles['testcase-actions']}>
                                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Điểm:</span>
                                            <input type="number" value={tc.score} onChange={e => updateTestcase(tc.id as string, 'score', parseInt(e.target.value) || 0)} style={{ width: 50, background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', color: 'var(--accent-purple-light)', fontWeight: 700, textAlign: 'center' }} />
                                        </div>
                                        <label className={styles['checkbox-label']}>
                                            <input type="checkbox" checked={tc.isHidden} onChange={e => updateTestcase(tc.id as string, 'isHidden', e.target.checked)} />
                                            Ẩn testcase
                                        </label>
                                    </div>
                                    <button onClick={() => removeTestcase(tc.id as string)} className={styles['btn-icon']}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles['right-panel']}>
                    <div className={styles['panel-header']}>
                        <h3>
                            <Settings size={14} />
                            Cấu hình chung
                        </h3>
                    </div>
                    <div className={styles['tab-content']}>
                        <div className={styles['form-group']} style={{ marginBottom: 20 }}>
                            <div className={styles['main-title-group']}>
                                <label>Tên bài tập</label>
                                <input
                                    type="text"
                                    value={problemState.title}
                                    onChange={e => setProblemState(s => ({ ...s, title: e.target.value }))}
                                    placeholder="Nhập tên bài tập..."
                                />
                            </div>
                        </div>
                        <div className={styles['form-grid']} style={{ gridTemplateColumns: '1fr', gap: 16 }}>
                            <div className={styles['form-group']}>
                                <label>Đường dẫn bài tập (Slug)</label>
                                <input value={problemState.slug} onChange={e => setProblemState(s => ({ ...s, slug: e.target.value }))} placeholder="vi-du-ten-bai-viet" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className={styles['form-group']}>
                                    <label>Độ khó</label>
                                    <CustomSelect
                                        value={problemState.difficulty}
                                        onChange={val => setProblemState(s => ({ ...s, difficulty: val as any }))}
                                        options={[{ value: 'EASY', label: 'Dễ' }, { value: 'MEDIUM', label: 'Trung bình' }, { value: 'HARD', label: 'Khó' }]}
                                    />
                                </div>
                                <div className={styles['form-group']}>
                                    <label>Chế độ hiển thị</label>
                                    <CustomSelect
                                        value={problemState.visibility}
                                        onChange={val => setProblemState(s => ({ ...s, visibility: val as any }))}
                                        options={[
                                            { value: 'PUBLIC', label: 'Công khai (Public)' },
                                            { value: 'PRIVATE', label: 'Riêng tư (Private)' }
                                        ]}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className={styles['form-group']}>
                                    <label>Giới hạn Thời gian (ms)</label>
                                    <div className={styles['input-with-icon']}>
                                        <Timer size={14} color="var(--text-muted)" />
                                        <input type="number" value={problemState.timeLimit} onChange={e => setProblemState(s => ({ ...s, timeLimit: parseInt(e.target.value) || 0 }))} placeholder="ms" />
                                    </div>
                                </div>
                                <div className={styles['form-group']}>
                                    <label>Giới hạn Bộ nhớ (MB)</label>
                                    <div className={styles['input-with-icon']}>
                                        <Cpu size={14} color="var(--text-muted)" />
                                        <input type="number" value={problemState.memoryLimit} onChange={e => setProblemState(s => ({ ...s, memoryLimit: parseInt(e.target.value) || 0 }))} placeholder="MB" />
                                    </div>
                                </div>
                            </div>
                            <div className={styles['form-group']}>
                                <label>Tùy chỉnh IDE Học viên</label>
                                <div className={styles['ide-customization']}>
                                    <div className={styles['switch-group']}>
                                        <span>Cho phép học viên tạo thêm tập tin</span>
                                        <label className={styles.switch}>
                                            <input type="checkbox" checked={workspaceConfig.canCreateFile} onChange={e => setWorkspaceConfig(s => ({ ...s, canCreateFile: e.target.checked }))} />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </div>
                                    <div className={styles['switch-group']}>
                                        <span>Cho phép đổi File chính (Entry Point)</span>
                                        <label className={styles.switch}>
                                            <input type="checkbox" checked={workspaceConfig.canChangeMainFile} onChange={e => setWorkspaceConfig(s => ({ ...s, canChangeMainFile: e.target.checked }))} />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles['language-workspaces']}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent-purple)' }} />
                        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Khu vực lập trình</h2>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Thêm ngôn ngữ:</span>
                        <CustomSelect
                            value=""
                            onChange={v => addNewLanguage(Number(v))}
                            options={languages.filter(l => !activeLanguages.includes(l.id)).map(l => ({ value: l.id, label: l.name }))}
                            placeholder="+ Chọn ngôn ngữ"
                            minWidth="180px"
                        />
                    </div>
                </div>

                {activeLanguages.length === 0 && (
                    <div className={styles.card} style={{ padding: '40px', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' }}>
                        <Zap size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                        <p style={{ color: 'var(--text-muted)' }}>Hãy thêm ít nhất một ngôn ngữ lập trình để cấu hình Boilerplate & Lời giải.</p>
                    </div>
                )}

                {activeLanguages.map(langId => (
                    <LanguageWorkspace
                        key={langId}
                        languageId={langId}
                        languages={languages}
                        files={languageFiles.filter(f => f.languageId === langId)}
                        updateFiles={(newFiles) => updateLanguageFiles(langId, newFiles)}
                        updateSingleFile={updateSingleFile}
                        onRemoveLanguage={() => removeLanguage(langId)}
                        onRunCode={handleRunCode}
                        openConfirm={openConfirm}
                        openInput={openInput}
                        openAlert={openAlert}
                        entryFile={languageFiles.filter(f => f.languageId === langId).find(f => f.isEntryFile)?.path || ''}
                        setAsEntryFile={(path) => setAsEntryFile(langId, path)}
                    />
                ))}
            </div>

            <div style={{ padding: '24px 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                <button className="btn btn-ghost" style={{ border: '1px solid var(--border)', minWidth: 120, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }} onClick={() => router.back()}>Hủy bỏ</button>
                <button className={`${styles['add-block-btn']} ${disableSave ? 'disabled' : ''}`} onClick={handleSave} disabled={isSubmitting || disableSave} style={{ minWidth: 200, height: 48, fontSize: 16, borderRadius: 12, boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }}>{isSubmitting ? 'Đang lưu...' : 'Lưu bài tập ngay'}</button>
            </div>

            {/* Modal hiển thị kết quả Run */}
            <Modal
                open={runResults !== null}
                onClose={() => setRunResults(null)}
                title="Báo cáo thực thi Testcases"
                subtitle={`Tổng hợp kết quả chạy thử trên ${runResults?.length || 0} trường hợp.`}
                size="xl"
            >
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <table className={styles['results-table']}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Dữ liệu vào</th>
                                <th>Kỳ vọng</th>
                                <th>Thực tế</th>
                                <th>Trạng thái</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {runResults?.map((res, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontWeight: 800, color: 'var(--text-muted)' }}>{idx + 1}</td>
                                    <td><code className={styles.monospace}>{res.input || '(Trống)'}</code></td>
                                    <td><code className={styles.monospace}>{res.expected || '(Trống)'}</code></td>
                                    <td>
                                        <code className={styles.monospace} style={{ color: res.status === 'PASSED' ? '#10b981' : '#f43f5e' }}>
                                            {res.actual || '(Trống)'}
                                        </code>
                                    </td>
                                    <td>
                                        <span className={`${styles['status-badge']} ${styles[res.status.toLowerCase().replace(/[^a-z]/g, '')]}`}>
                                            {res.status === 'RUNNING' ? (
                                                <RotateCcw size={10} className={styles.spin} style={{ marginRight: 4 }} />
                                            ) : null}
                                            {res.status === 'PASSED' ? '✅ KHỚP' : res.status === 'WRONG' ? '❌ SAI' : res.status === 'PENDING' ? '⏳ CHỜ' : res.status === 'RUNNING' ? '⚡ CHẠY' : res.status}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{res.runtime ? `${res.runtime}ms` : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {runResults?.some(r => r.error) && (
                    <div style={{ marginTop: 20, padding: 16, background: 'rgba(239, 68, 68, 0.05)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 700, marginBottom: 8, fontSize: 13 }}>
                            <AlertCircle size={16} /> NHẬT KÝ LỖI (LOGS)
                        </div>
                        <div style={{ maxHeight: 150, overflowY: 'auto', fontSize: 12, fontFamily: 'monospace', color: '#fca5a5', whiteSpace: 'pre-wrap' }}>
                            {runResults.filter(r => r.error).map((r, i) => (
                                <div key={i} style={{ marginBottom: 8 }}>
                                    [Testcase #{runResults.indexOf(r) + 1}]: {r.error}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            {/* CUSTOM MODAL SYSTEM */}
            <Modal
                open={modal.isOpen}
                onClose={closeModal}
                title={modal.title}
                footer={
                    <>
                        <button className="btn btn-ghost" onClick={closeModal} style={{ border: '1px solid var(--border)', padding: '6px 16px', borderRadius: 8, fontSize: 13 }}>Đóng</button>
                        {modal.type !== 'alert' && (
                            <button
                                className="btn btn-primary"
                                style={{ background: 'var(--accent-purple)', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}
                                onClick={() => {
                                    modal.onConfirm(modal.value);
                                    closeModal();
                                }}
                            >
                                Xác nhận
                            </button>
                        )}
                    </>
                }
            >
                <div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: modal.type === 'input' ? 16 : 0 }}>
                        <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: modal.type === 'confirm' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {modal.type === 'confirm' ? <AlertCircle color="#ef4444" size={24} /> : <Edit3 color="var(--accent-purple)" size={24} />}
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.6 }}>{modal.message}</p>
                    </div>
                    {modal.type === 'input' && (
                        <input
                            autoFocus
                            value={modal.value}
                            onChange={e => setModal(prev => ({ ...prev, value: e.target.value }))}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    modal.onConfirm(modal.value);
                                    closeModal();
                                }
                            }}
                            placeholder="Nhập giá trị..."
                            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }}
                            onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                    )}
                </div>
            </Modal>
        </div>
    )
}
