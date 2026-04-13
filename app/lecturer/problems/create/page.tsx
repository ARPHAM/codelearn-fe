'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import ProblemEditor from '../_components/ProblemEditor'
import { useCreateProblem } from '@/hooks/useProblems'
import { useRouter } from 'next/navigation'

export default function CreateProblemPage() {
    const router = useRouter()
    const { mutate: createProblem, isPending } = useCreateProblem()

    return (
        <DashboardLayout>
            <div className="page-header" style={{ padding: '0 24px', paddingTop: 24 }}>
                <h1 className="page-title">➕ Thêm Bài Tập Mới</h1>
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
        </DashboardLayout>
    )
}
