'use client'

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAdminProblems, useApproveProblemVersion } from '@/hooks/useProblems';
import { ProblemSummary } from '@/api/problems.api';

export default function AdminProblemsPage() {
    const { data, isLoading, isError } = useAdminProblems();
    console.log(data);
    const { mutate: approveVersion, isPending: isApproving } = useApproveProblemVersion();

    const handleApprove = (problemId: string) => {
        // In a real scenario, we might want to let admin choose which version to approve.
        // For now, based on the lifecycle provided, we approve version v1 or the latest pending.
        // Here we assume versionId follows the pattern [problemId]-v1 as seen in backend create()
        const versionId = `${problemId}-v1`;
        if (confirm(`Bạn có chắc muốn duyệt phiên bản ${versionId} cho bài tập này?`)) {
            approveVersion(versionId, {
                onSuccess: () => alert('Duyệt bài tập thành công! Bài tập hiện đã sẵn sàng (ACTIVE).'),
                onError: (err) => {
                    console.error(err);
                    alert('Lỗi khi duyệt bài tập. Vui lòng kiểm tra lại.');
                }
            });
        }
    };

    return (
        <DashboardLayout>
            <div className="page-container animate-in">
                <div className="page-header" style={{ padding: '24px' }}>
                    <h1 className="page-title">🛡️ Quản lý Duyệt Bài Tập</h1>
                    <p className="page-subtitle">Duyệt các bài tập mới tạo từ Giảng viên để kích hoạt cho Học sinh.</p>
                </div>

                <div style={{ padding: '0 24px' }}>
                    {isLoading && <div style={{ textAlign: 'center', padding: 40 }}>Đang tải danh sách...</div>}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {data?.items?.map((p: any) => (
                            <div key={p.id} className="card" style={{ padding: 20, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                            <span className="badge badge-gray">{p.difficulty}</span>
                                            <span className={`badge ${p.status === 'ACTIVE' ? 'badge-green' : 'badge-yellow'}`}>
                                                {p.status}
                                            </span>
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tạo bởi: {p.createdBy?.name || 'Giảng viên'}</span>
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: 18 }}>{p.title}</h3>
                                        <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--text-secondary)' }}>Slug: {p.slug}</p>
                                    </div>

                                    <div>
                                        {p.status === 'INACTIVE' ? (
                                            <button
                                                className="btn"
                                                style={{ background: 'var(--accent-green)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                                                onClick={() => handleApprove(p.id)}
                                                disabled={isApproving}
                                            >
                                                {isApproving ? 'Đang duyệt...' : '✅ Duyệt Ngay'}
                                            </button>
                                        ) : (
                                            <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>🌟 Đã Kích Hoạt</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {data?.items?.length === 0 && (
                            <div style={{ textAlign: 'center', padding: 40, border: '1px dashed var(--border)', borderRadius: 12, color: 'var(--text-muted)' }}>
                                Hiện không có bài tập nào cần duyệt.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
