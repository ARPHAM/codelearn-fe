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
import { Node, mergeAttributes } from '@tiptap/core'
import './editor.css'

// ---------------- TYPES ----------------
type Block = {
    id: string
    content: string
}

interface TestCase {
    input: string
    expectedOutput: string
    order: number
}

interface ProblemUiStudentProps {
    title?: string
    description?: Block[]
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
    stats?: {
        totalSubmissions: number
        acceptanceRate: number
    }
    testcases?: TestCase[]
    
    // Fallback cho UI cũ
    blocks?: Block[]
}

// ---------------- TOGGLE NODE (Read-only) ----------------
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
    parseHTML() {
        return [{ tag: 'div[data-type="toggle"]' }]
    },
    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'toggle',
            }),
            0,
        ]
    },
    addNodeView() {
        return ReactNodeViewRenderer(ToggleComponent)
    },
})

// ---------------- EDITOR BLOCK (Read-only) ----------------
function StudentEditorBlock({ content }: { content: string }) {
    const editor = useEditor({
        extensions: [StarterKit, TextStyle, Color, ToggleBlock],
        content: content,
        editable: false,
        immediatelyRender: false,
    })

    if (!editor) return null

    return (
        <div className="editor-block read-only">
            <EditorContent editor={editor} className="editor-content" />
        </div>
    )
}

// ---------------- MAIN COMPONENT ----------------

export default function ProblemUiStudent({ blocks, title, description, difficulty, stats, testcases }: ProblemUiStudentProps) {

    return (
        <div className="page-container student-view">
            {title && (
                <div className="header-section" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {title}
                    </h2>
                    <div className="problem-meta">
                        {difficulty && (
                            <span className={`badge difficulty-${difficulty.toLowerCase()}`}>
                                {difficulty === 'EASY' ? 'Dễ' : difficulty === 'MEDIUM' ? 'Trung bình' : 'Khó'}
                            </span>
                        )}
                        {stats && (
                            <span className="stats-text" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Lượt nộp: <strong>{stats.totalSubmissions}</strong> &nbsp;|&nbsp; Tỷ lệ đỗ: <strong>{stats.acceptanceRate}%</strong>
                            </span>
                        )}
                    </div>
                </div>
            )}
            
            <div className="card read-only-wrapper" style={{ padding: 16 }}>
                {description && description.length > 0 ? (
                    description.map((block, idx) => (
                        <StudentEditorBlock key={block.id || idx} content={block.content} />
                    ))
                ) : blocks && blocks.length > 0 ? (
                    blocks.map((block, idx) => (
                        <StudentEditorBlock key={block.id || idx} content={block.content} />
                    ))
                ) : null}

                {testcases && testcases.length > 0 && (
                    <div className="public-testcases" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 12 }}>Testcases / Ví dụ:</h3>
                        {testcases.map((tc, idx) => (
                            <div key={idx} className="testcase-example" style={{
                                background: 'var(--bg-secondary)', 
                                padding: 12, 
                                borderRadius: 8, 
                                marginBottom: 12,
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ marginBottom: 6 }}>
                                    <strong style={{ color: 'var(--text-secondary)' }}>Input:</strong>
                                    <pre style={{ margin: '4px 0 0', padding: 8, background: '#1e1e1e', borderRadius: 4, color: '#a5d6ff' }}>{tc.input}</pre>
                                </div>
                                <div>
                                    <strong style={{ color: 'var(--text-secondary)' }}>Output:</strong>
                                    <pre style={{ margin: '4px 0 0', padding: 8, background: '#1e1e1e', borderRadius: 4, color: '#79c0ff' }}>{tc.expectedOutput}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
