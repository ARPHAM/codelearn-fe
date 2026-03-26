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
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import './editor.css'

// ---------------- TYPES ----------------
type Block = {
    id: string
    content: string
}

type ToggleAttrs = {
    open: boolean
}

// ---------------- DEFAULT ----------------
const defaultBlocks: Block[] = [
    { id: '1', content: '<h3><span style=\"color: rgb(230, 237, 243);\"><strong>Find Peak Element</strong></span></h3><p><span style=\"color: rgb(139, 148, 158);\">Một phần tử đỉnh là phần tử lớn hơn các phần tử kề cạnh. Cho mảng </span><code>nums</code><span style=\"color: rgb(139, 148, 158);\">, tìm và trả về chỉ số của một phần tử đỉnh bất kỳ.</span></p><p></p><p><span style=\"color: rgb(255, 255, 255);\"><strong>Ví dụ: </strong></span></p><div open=\"true\" data-type=\"toggle\"><p>Ví dụ 1</p><p><span style=\"color: rgb(72, 79, 88);\">Input:</span> <span style=\"color: rgb(165, 214, 255);\">[1, 2, 3, 1]</span></p><p><span style=\"color: rgb(72, 79, 88);\">Output:</span> <span style=\"color: rgb(121, 192, 255);\">2</span></p><p>nums[2]=3 là đỉnh</p></div><div open=\"true\" data-type=\"toggle\"><p>Ví dụ 2</p><p><span style=\"color: rgb(72, 79, 88);\">Input:</span> <span style=\"color: rgb(165, 214, 255);\">[1, 2, 1, 3, 5, 6, 4]</span></p><p><span style=\"color: rgb(72, 79, 88);\">Output:</span> <span style=\"color: rgb(121, 192, 255);\">5</span></p><p>nums[5]=6 là đỉnh</p></div><p><strong>Ràng buộc:</strong></p><ul><li><p>1 ≤ nums.length ≤ 1000</p></li><li><p>O(log n) (Bonus)</p></li><li><p>nums[i] ≠ nums[i+1]</p></li></ul><p></p>' },
    { id: '2', content: '<p>Cho một mảng số nguyên <code>nums</code>...</p>' },
]

// ---------------- TOGGLE NODE ----------------
// const ToggleComponent = ({ node, updateAttributes }: NodeViewProps) => {
//     const { open } = node.attrs as ToggleAttrs

//     const handleToggle = () => {
//         updateAttributes({ open: !open })
//     }

//     return (
//         <NodeViewWrapper style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px', marginBottom: 8, border: '1px solid var(--border)' }}>
//             <div className="toggle-header" onClick={handleToggle}>
//                 {open ? '▼' : '▶'} Toggle
//             </div>

//             <div
//                 className="toggle-content"
//                 style={{ display: open ? 'block' : 'none' }}
//             >
//                 <NodeViewContent as="div" />
//             </div>
//         </NodeViewWrapper>
//     )
// }

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
        return {
            open: {
                default: true,
            },
        }
    },

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
        return ReactNodeViewRenderer(ToggleComponent, {
            contentDOMElementTag: 'div',
        })
    },

    selectable: true,
    draggable: true,
})

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
            updateBlock(block.id, editor.getHTML())
        },
        onFocus: () => {
            setIsFocused(true)
        },
        onBlur: () => {
            setTimeout(() => {
                if (!editor?.isFocused && !document.activeElement?.closest('.toolbar-wrapper')) {
                    setIsFocused(false)
                }
            }, 100)
        },
    })

    if (!editor) return null

    const setColor = (color: string) => {
        editor.chain().focus().setColor(color).run()
    }

    const insertToggle = (text: string) => {
        editor
            .chain()
            .focus()
            .insertContent({
                type: 'toggle',
                content: [
                    {
                        type: 'paragraph',
                        content: text ? [{ type: 'text', text: text }] : [],
                    },
                ],
            })
            .run()
    }

    return (
        <div className={`editor-block ${isFocused ? 'focused' : ''}`}>
            {/* Actions */}


            {/* Toolbar */}
            {isFocused && (
                <div className="toolbar-wrapper">
                    <div className="toolbar">
                        <div className="button-group">
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''} title="Bold">𝐁</button>
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''} title="Italic">𝑖</button>
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'active' : ''} title="Strikethrough"><s>S</s></button>
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'active' : ''} title="Inline Code"><code>{"{ }"}</code></button>
                        </div>

                        <div className="button-group">
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'active' : ''} title="Normal Text">¶ Text</button>
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'active' : ''} title="Heading 1">H1</button>
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'active' : ''} title="Heading 2">H2</button>
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'active' : ''} title="Heading 3">H3</button>
                        </div>

                        <div className="button-group">
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active' : ''} title="Bullet List">• Danh sách</button>
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'active' : ''} title="Ordered List">1. Danh sách</button>
                        </div>

                        <div className="button-group">
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'active' : ''} title="Quote">“ Trích dẫn</button>
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'active' : ''} title="Code Block">{"</>"} Code</button>
                        </div>

                        <div className="button-group">
                            <button onMouseDown={e => e.preventDefault()} onClick={() => {
                                const { from, to } = editor.state.selection
                                const selectedText = editor.state.doc.textBetween(from, to, ' ')
                                insertToggle(selectedText || "")
                            }} title="Insert Toggle">⊞ Toggle</button>
                        </div>

                        <div className="button-group color-picker-group">
                            <input type="color" onInput={(e) => setColor((e.target as HTMLInputElement).value)} value={editor.getAttributes('textStyle').color || '#ffffff'} title="Text Color" />
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().unsetColor().run()} title="Reset Color">↺</button>
                        </div>
                    </div>
                    <div className="block-actions">
                        <button onMouseDown={e => e.preventDefault()} onClick={() => deleteBlock(block.id)} title="Delete Block">❌</button>
                        <button onMouseDown={e => e.preventDefault()} disabled={index === 0} onClick={() => moveBlock(index, index - 1)} title="Move Up">↑</button>
                        <button onMouseDown={e => e.preventDefault()} disabled={index === total - 1} onClick={() => moveBlock(index, index + 1)} title="Move Down">↓</button>
                    </div>
                </div>
            )}

            <EditorContent editor={editor} className="editor-content" />
            {editor && (
                <BubbleMenu
                    editor={editor}
                    shouldShow={({ state, from, to }) => {
                        // 1. Phải có bôi đen
                        if (from === to) return false

                        // 2. Thuật toán đếm dòng sâu (vào cả các khối lồng nhau)
                        let lineCount = 0
                        state.doc.nodesBetween(0, from, (node) => {
                            // Chỉ đếm các node dạng block "lá" (có nội dung trực tiếp) 
                            // hoặc các node mà người dùng coi là 1 dòng
                            if (node.isBlock && ['paragraph', 'heading', 'listItem', 'codeBlock'].includes(node.type.name)) {
                                lineCount++
                            }
                        })

                        // 3. Chỉ hiện từ dòng thứ 6 trở đi
                        return lineCount >= 6
                    }}
                >
                    <div className="bubble-menu">
                        <div className="button-group">
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}><b>B</b></button>
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}><i>I</i></button>
                        </div>

                        <div className="button-group">
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'active' : ''}>P</button>
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}>H1</button>
                            <button onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}>H2</button>
                        </div>

                        <div className="button-group">
                            <button onMouseDown={e => e.preventDefault()} onClick={() => {
                                const { from, to } = editor.state.selection
                                const selectedText = editor.state.doc.textBetween(from, to, ' ')
                                insertToggle(selectedText || "")
                            }}>Toggle</button>
                        </div>

                        <div className="button-group color-picker-group">
                            <input type="color" onInput={(e) => setColor((e.target as HTMLInputElement).value)} value={editor.getAttributes('textStyle').color || '#ffffff'} />
                        </div>
                    </div>
                </BubbleMenu>
            )}
        </div>
    )
}

// ---------------- MAIN ----------------
export default function CodeBattlePage() {
    const [blocks, setBlocks] = useState<Block[]>(defaultBlocks)

    const addBlock = () => {
        setBlocks(prev => [...prev, { id: Date.now().toString(), content: '<p></p>' }])
    }

    const updateBlock = (id: string, html: string) => {
        setBlocks(prev => prev.map(b => (b.id === id ? { ...b, content: html } : b)))
    }

    const deleteBlock = (id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id))
    }

    const moveBlock = (from: number, to: number) => {
        setBlocks(prev => {
            const arr = [...prev]
            const item = arr.splice(from, 1)[0]
            arr.splice(to, 0, item)
            return arr
        })
    }

    return (
        <DashboardLayout>
            <div className="page-container">
                <div className="header-section">
                    <div className="title-input-group">
                        <label htmlFor="title">Tên bài:</label>
                        <input type="text" id="title" placeholder="Nhập tên bài học..." />
                    </div>
                    <button className="add-block-btn" onClick={addBlock}>+ Thêm khối</button>
                </div>
                <div className="card">
                    {blocks.map((block, index) => (
                        <EditorBlock
                            key={block.id}
                            block={block}
                            index={index}
                            total={blocks.length}
                            updateBlock={updateBlock}
                            deleteBlock={deleteBlock}
                            moveBlock={moveBlock}
                        />
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}