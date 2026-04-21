'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLecturerProblems } from '@/hooks/useProblems';
import { useRouter } from 'next/navigation';
import { Folder, Plus, Search, Circle, Lock, CheckCircle2, Loader2, Eye, Edit2, ChevronLeft, ChevronRight, X, User as UserIcon } from 'lucide-react';

const diffColors: Record<string, string> = { EASY: 'badge-green', MEDIUM: 'badge-yellow', HARD: 'badge-red' };
const diffLabels: Record<string, React.ReactNode> = {
    EASY: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Circle size={8} fill="currentColor" /> Dễ</span>,
    MEDIUM: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Circle size={8} fill="currentColor" /> Trung bình</span>,
    HARD: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Circle size={8} fill="currentColor" /> Khó</span>
};

export default function ProblemsListPage() {
    const router = useRouter()

    // State for filters and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [status, setStatus] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const limit = 10;

    // Main problems query
    const { data, isLoading, isError } = useLecturerProblems({
        page,
        limit,
        search: searchQuery,
        difficulty: difficulty || undefined,
        status: status || undefined,
        filter: filter || 'ALL'
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleFilterChange = (setter: any) => (e: any) => {
        setter(e.target.value);
        setPage(1);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSearchQuery('');
        setDifficulty('');
        setStatus('');
        setFilter('ALL');
        setPage(1);
    };

    const totalPages = data ? Math.ceil(data.total / limit) : 0;

    return (
        <>
            <div className="page-container animate-in">
                <div className="page-header" style={{ padding: '0 24px', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Folder size={28} color="var(--accent-purple)" /> Quản lý Bài Tập
                        </h1>
                        <p className="page-subtitle">Danh sách các câu hỏi lập trình và vấn đáp bạn đang quản lý</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Link href="/lecturer/problems/create">
                            <button className="btn" style={{ background: 'var(--accent-purple-light)', color: 'white', padding: '8px 16px', borderRadius: 8, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Plus size={16} /> Thêm bài tập
                                </div>
                            </button>
                        </Link>
                    </div>
                </div>

                <div style={{ padding: '0 24px' }}>
                    <div className="card" style={{ padding: '14px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input"
                                placeholder="Tìm câu hỏi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '8px 12px', paddingLeft: 36, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                            />
                        </div>

                        <select
                            className="select"
                            value={filter}
                            onChange={handleFilterChange(setFilter)}
                            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600 }}
                        >
                            <option value="ALL">Tất cả bài tập</option>
                            <option value="ME">Bài tập của tôi</option>
                        </select>

                        <select
                            className="select"
                            value={difficulty}
                            onChange={handleFilterChange(setDifficulty)}
                            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        >
                            <option value="">Tất cả độ khó</option>
                            <option value="EASY">Dễ</option>
                            <option value="MEDIUM">Trung bình</option>
                            <option value="HARD">Khó</option>
                        </select>

                        <select
                            className="select"
                            value={status}
                            onChange={handleFilterChange(setStatus)}
                            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="ACTIVE">Sẵn sàng (Active)</option>
                            <option value="INACTIVE">Chờ duyệt (Inactive)</option>
                        </select>

                        {(searchQuery || difficulty || status || filter !== 'ALL') && (
                            <button
                                onClick={clearFilters}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
                            >
                                <X size={14} /> Xóa lọc
                            </button>
                        )}
                    </div>

                    {isLoading && (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                            <Loader2 className="spin" style={{ margin: '0 auto', marginBottom: 12 }} />
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
                            Không tìm thấy bài tập nào khớp với bộ lọc.
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
                                                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <Lock size={12} /> Riêng tư
                                                </span>
                                            )}
                                            <span className={`badge ${p.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`} style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, marginLeft: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                {p.status === 'ACTIVE' ? <><CheckCircle2 size={12} /> Sẵn sàng</> : <><Loader2 size={12} className="spin" /> Chờ duyệt (Inactive)</>}
                                            </span>
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--text-primary)' }}>{p.title}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-purple-light)', fontWeight: 500 }}>
                                                <UserIcon size={14} /> {p.createdBy?.fullName || 'Hệ thống'}
                                            </span>
                                            <span>• Slug: <code>{p.slug}</code></span>
                                            {p.stats && <span>• Lượt nộp: {p.stats.totalSubmissions}</span>}
                                            {p.stats && <span>• Tỷ lệ đỗ: {p.stats.acceptanceRate}%</span>}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                            <button className="btn" style={{ padding: '6px 16px', fontSize: 12, borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => router.push(`/student/code-editor?slug=${p.slug}`)}>
                                                <Eye size={14} /> Xem thử
                                            </button>
                                            <button className="btn" style={{ padding: '6px 16px', fontSize: 12, borderRadius: 6, background: 'var(--accent-purple-light)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => router.push(`/lecturer/problems/${p.id}/edit`)}>
                                                <Edit2 size={14} /> Sửa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 32, marginBottom: 32 }}>
                            <button
                                className="btn-icon"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                style={{ opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer', background: 'var(--bg-secondary)', padding: 8, borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
                                Trang <input
                                    type="number"
                                    min={1}
                                    max={totalPages}
                                    value={page}
                                    onChange={(e) => {
                                        const p = parseInt(e.target.value);
                                        if (p >= 1 && p <= totalPages) setPage(p);
                                    }}
                                    style={{ width: 40, textAlign: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)', margin: '0 4px' }}
                                /> / {totalPages}
                            </div>

                            <button
                                className="btn-icon"
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                                style={{ opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer', background: 'var(--bg-secondary)', padding: 8, borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
