'use client'

import { useState, useRef } from 'react'

import Editor from '@monaco-editor/react'
import { useCreateExercise } from '../_api/mutations'
import { useRouter } from 'next/navigation'
import { Plus, Save, Code2, Lightbulb } from 'lucide-react'

const languageOptions = [
    { label: "C++", value: "cpp", extension: ".cpp" },
    { label: "Java", value: "java", extension: ".java" },
    { label: "Python", value: "python", extension: ".py" },
    { label: "JavaScript", value: "javascript", extension: ".js" },
    { label: "TypeScript", value: "typescript", extension: ".ts" },
    { label: "PHP", value: "php", extension: ".php" },
    { label: "Ruby", value: "ruby", extension: ".rb" },
];

export default function CreateQuestionPage() {
    const router = useRouter()
    const { mutate: createExercise, isPending } = useCreateExercise()

    // --- Form State ---
    const [title, setTitle] = useState('')
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
    const [score, setScore] = useState(10)
    const [tags, setTags] = useState('')
    const [description, setDescription] = useState('')

    // --- Editor State ---
    const [selectedLanguage, setSelectedLanguage] = useState('python')
    const [languageCodes, setLanguageCodes] = useState<Record<string, string>>({
        python: "# Viết code khởi tạo tại đây\ndef solution():\n    pass",
        cpp: "// Viết code khởi tạo tại đây\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}",
        java: "// Viết code khởi tạo tại đây\npublic class Solution {\n    public static void main(String[] args) {\n    }\n}",
    })

    const handleEditorChange = (value: string | undefined) => {
        setLanguageCodes(prev => ({
            ...prev,
            [selectedLanguage]: value || ""
        }))
    }

    const handleSave = () => {
        if (!title.trim() || !description.trim()) {
            alert("Vui lòng nhập tiêu đề và đề bài")
            return
        }

        const tagList = tags.split(',').map(t => t.trim()).filter(t => t !== "")
        
        // Prepare initial files from languageCodes
        const initialFiles = Object.entries(languageCodes).reduce((acc, [lang, content]) => {
            const ext = languageOptions.find(l => l.value === lang)?.extension || ""
            acc[`main${ext}`] = content
            return acc
        }, {} as Record<string, string>)

        createExercise({
            title,
            description,
            difficulty,
            tags: tagList,
            score,
            languages: Object.keys(languageCodes),
            testCases: [], // To be implemented in a separate tab or section if needed
            hints: [],
            initialCode: initialFiles
        }, {
            onSuccess: () => {
                router.push('/lecturer/question-bank')
            }
        })
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Plus size={28} color="var(--accent-purple-light)" /> Tạo câu hỏi mới
                        </h1>
                        <p className="page-subtitle">Thiết lập nội dung và code mẫu cho các ngôn ngữ</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-ghost" onClick={() => router.back()}>Hủy</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={isPending} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {isPending ? "Đang lưu..." : <><Save size={18} /> Lưu câu hỏi</>}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1, minHeight: 0 }}>
                    {/* LEFT: Metadata Form */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
                        <div>
                            <label className="label">Tiêu đề câu hỏi</label>
                            <input 
                                className="input" 
                                placeholder="VD: Tìm phần tử lớn nhất trong mảng" 
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            <div>
                                <label className="label">Độ khó</label>
                                <select className="select" value={difficulty} onChange={e => setDifficulty(e.target.value as any)}>
                                    <option value="easy">Dễ</option>
                                    <option value="medium">Trung bình</option>
                                    <option value="hard">Khó</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Điểm số</label>
                                <input 
                                    type="number" 
                                    className="input" 
                                    value={score}
                                    onChange={e => setScore(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="label">Tags (cách nhau dấu phẩy)</label>
                                <input 
                                    className="input" 
                                    placeholder="Array, Sort, ..." 
                                    value={tags}
                                    onChange={e => setTags(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label className="label">Nội dung đề bài (Markdown support)</label>
                            <textarea 
                                className="input" 
                                style={{ flex: 1, resize: 'none', padding: 12, minHeight: 200 }} 
                                placeholder="Nhập mô tả chi tiết, ví dụ, ràng buộc..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* RIGHT: Editor for Default Code */}
                    <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Code2 size={16} /> Code khởi tạo (Template)
                            </div>
                            <select 
                                className="select" 
                                value={selectedLanguage} 
                                onChange={e => setSelectedLanguage(e.target.value)}
                            >
                                {languageOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div style={{ padding: '8px 14px', background: 'rgba(59,130,246,0.05)', fontSize: 11, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Lightbulb size={14} color="var(--accent-yellow)" /> Sinh viên sẽ bắt đầu làm bài với code này khi chọn ngôn ngữ tương ứng.
                        </div>

                        <div style={{ flex: 1 }}>
                            <Editor
                                height="100%"
                                language={selectedLanguage}
                                value={languageCodes[selectedLanguage] || ""}
                                onChange={handleEditorChange}
                                theme="vs-dark"
                                options={{
                                    fontSize: 13,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 10 }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .label {
                    display: block;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                    margin-bottom: 6px;
                }
            `}</style>
        </>
    )
}
