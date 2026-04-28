'use client'


import ProblemEditor from '../_components/ProblemEditor'
import { useCreateProblem } from '@/hooks/useProblems'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

export default function CreateProblemPage() {
    const router = useRouter()
    const { mutate: createProblem, isPending } = useCreateProblem()

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="page-header">
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Plus size={28} color="var(--accent-purple-light)" /> Thêm Bài Tập Mới
                </h1>
                <p className="page-subtitle">Soạn thảo đề bài, cấu hình testcase và gán ngôn ngữ lập trình.</p>
            </div>

            <ProblemEditor
                isSubmitting={isPending}
                onSubmit={(data) => {
                    createProblem(data, {
                        onSuccess: () => {
                            alert('Thêm bài tập thành công!');
                            router.push('/lecturer/problems');
                        },
                        onError: (error) => {
                            alert('Đã có lỗi xảy ra khi thêm bài tập!');
                            console.error(error);
                        }
                    })
                }}
            />
        </div>
    )
}
