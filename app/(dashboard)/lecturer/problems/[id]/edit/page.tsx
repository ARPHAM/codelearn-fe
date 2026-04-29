'use client'


import ProblemEditor from '../../_components/ProblemEditor'
import { useProblemDetail, useUpdateProblem } from '@/hooks/useProblems'
import { useParams, useRouter } from 'next/navigation'
import { Edit2, History } from 'lucide-react'

export default function EditProblemPage() {
    const params = useParams()
    const router = useRouter()
    const problemId = params.id as string

    const { data: detailData, isLoading, isError } = useProblemDetail(problemId)
    const { mutate: updateProblem, isPending } = useUpdateProblem()

    if (isLoading) {
        return (
            <>
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Đang tải dữ liệu bài tập...
                </div>
            </>
        )
    }

    if (isError || !detailData) {
        return (
            <>
                <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>
                    Lỗi khi tải bài tập. Vui lòng thử lại.
                </div>
            </>
        )
    }

    const { problem, versions, testcases, languageFiles, problemFiles, canEdit } = detailData

    // Chuyển đổi dữ liệu BE sang structure Form cần
    const initialData = {
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
        type: problem.type as 'CODE' | 'SQL',
        visibility: problem.visibility as 'PUBLIC' | 'PRIVATE',
        source: problem.source || '',
        workspaceConfig: problem.workspaceConfig || { canCreateFile: false, canChangeMainFile: false },
        description: versions?.[0]?.description || [],
        testcases: testcases || [],
        languageFiles: languageFiles || [],
        problemFiles: problemFiles || []
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="page-header">
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Edit2 size={28} color="var(--accent-purple-light)" /> Chỉnh Sửa Bài Tập
                </h1>
                <p className="page-subtitle">ID Bài tập: {problemId}</p>
                {!canEdit && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px 16px', borderRadius: 8, marginTop: 12, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <strong>Lưu ý:</strong> Bạn chỉ có quyền Read, không được lưu đè lên bài này do bài không thuộc sở hữu của bạn.
                    </div>
                )}
            </div>
            <div className="layout-split">
                <div className="card" style={{ padding: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <History size={16} /> Lịch sử các phiên bản
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {versions?.map((v: any, idx: number) => (
                            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: 13 }}>
                                    <strong>{v.id}</strong> {idx === 0 && <span style={{ color: 'var(--accent-purple-light)', fontSize: 11 }}>(Mới nhất)</span>}
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(v.createdAt).toLocaleString('vi-VN')}</div>
                                </div>
                                <span className={`badge ${v.status === 'APPROVED' ? 'badge-green' : v.status === 'PENDING' ? 'badge-yellow' : 'badge-gray'}`} style={{ fontSize: 11 }}>
                                    {v.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ProblemEditor
                initialData={initialData}
                isSubmitting={isPending}
                disableSave={!canEdit}
                onSubmit={(data) => {
                    if (!canEdit) {
                        alert('Bạn không có quyền chỉnh sửa bài này!')
                        return
                    }
                    updateProblem({ id: problemId, data }, {
                        onSuccess: () => {
                            alert('Cập nhật bài tập thành công!');
                            router.push('/lecturer/problems');
                        },
                        onError: (error) => {
                            alert('Đã có lỗi xảy ra khi cập nhật!');
                            console.error(error);
                        }
                    })
                }}
            />
        </div>
    )
}
