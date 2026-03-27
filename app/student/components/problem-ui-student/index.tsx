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
interface ProblemUiStudentProps {
    blocks: Block[]
    title?: string
}

export default function ProblemUiStudent({ blocks, title }: ProblemUiStudentProps) {
    return (
        <div className="page-container student-view">
            {title && (
                <div className="header-section">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {title}
                    </h2>
                </div>
            )}
            
            <div className="card">
                {blocks.map((block) => (
                    <StudentEditorBlock key={block.id} content={block.content} />
                ))}
            </div>
        </div>
    )
}
