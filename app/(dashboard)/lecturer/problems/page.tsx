'use client'


import Link from 'next/link';
import { useLecturerProblems } from '@/hooks/useProblems';
import { useRouter } from 'next/navigation';

const diffColors: Record<string, string> = { EASY: 'badge-green', MEDIUM: 'badge-yellow', HARD: 'badge-red' };
const diffLabels: Record<string, string> = { EASY: '🟢 Dễ', MEDIUM: '🟡 Trung bình', HARD: '🔴 Khó' };

export default function ProblemsListPage() {
    const router = useRouter()
    // Mock filter/search state omitted for brevity, passing empty params
    const { data, isLoading, isError } = useLecturerProblems({ page: 1, limit: 20 });
    console.log(data);

    return (
        <>
            <div className="page-container animate-in">
                <div className="page-header" style={{ padding: '0 24px', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">📁 Quản lý Bài Tập</h1>
                        <p className="page-subtitle">Danh sách các câu hỏi lập trình và vấn đáp bạn đang quản lý</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Link href="/lecturer/problems/create">
                            <button className="btn" style={{ background: 'var(--accent-purple-light)', color: 'white', padding: '8px 16px', borderRadius: 8, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                ➕ Thêm bài tập
                            </button>
                        </Link>
                    </div>
                </div>

                <div style={{ padding: '0 24px' }}>
                    <div className="card" style={{ padding: '14px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
                        <input className="input" placeholder="🔍 Tìm câu hỏi..." style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                        <select className="select" style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                            <option>Tất cả độ khó</option><option>Dễ</option><option>Trung bình</option><option>Khó</option>
                        </select>
                        <select className="select" style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                            <option>Tất cả trạng thái</option><option>Công khai</option><option>Riêng tư</option>
                        </select>
                    </div>

                    {isLoading && (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                            Đang tải danh sách bài tập...
                        </div>
                    )}

                    {isError && (
                        <div style={{ textAlign: 'center', padding: 40, color: 'red' }}>
                            Đã xảy ra lỗi khi tải danh sách bài tập.
                        </div>
                    )}

                    {!isLoading && !isError && data?.items?.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 60, border: '1px dashed var(--border)', borderRadius: 12, color: 'var(--text-muted)' }}>
                            Bạn chưa có bài tập nào. Hãy tạo bài tập đầu tiên!
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {data?.items?.map(p => (
                            <div key={p.id} className="card card-hover" style={{ cursor: 'pointer', padding: 16, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 12, transition: 'all 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                            <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 7px', borderRadius: 4 }}>ID: {p.id.substring(0, 8)}...</span>
                                            <span className={`badge ${diffColors[p.difficulty] || 'badge-gray'}`} style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                                                {diffLabels[p.difficulty] || p.difficulty}
                                            </span>
                                            <span className="badge" style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: 'rgba(124,58,237,0.15)', color: 'var(--accent-purple-light)', border: '1px solid rgba(124,58,237,0.3)' }}>
                                                {p.type}
                                            </span>
                                            {p.visibility === 'PRIVATE' && (
                                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔒 Riêng tư</span>
                                            )}
                                            <span className={`badge ${p.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`} style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, marginLeft: 10 }}>
                                                {p.status === 'ACTIVE' ? '✅ Sẵn sàng' : '⏳ Chờ duyệt (Inactive)'}
                                            </span>
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--text-primary)' }}>{p.title}</div>
                                        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                                            <span>Slug: <code>{p.slug}</code></span>
                                            {p.stats && <span>• Lượt nộp: {p.stats.totalSubmissions}</span>}
                                            {p.stats && <span>• Tỷ lệ đỗ: {p.stats.acceptanceRate}%</span>}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                            <button className="btn" style={{ padding: '6px 16px', fontSize: 12, borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => router.push(`/student/problem-test`)}>
                                                👁 Xem thử
                                            </button>
                                            <button className="btn" style={{ padding: '6px 16px', fontSize: 12, borderRadius: 6, background: 'var(--accent-purple-light)', color: 'white', border: 'none', cursor: 'pointer' }} onClick={() => router.push(`/lecturer/problems/${p.id}/edit`)}>
                                                ✏️ Sửa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
