'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminProblems } from '@/hooks/useProblems';
import { getProblemAuthors, UserSummary } from '@/api/user.api';
import {
    ShieldCheck,
    Search,
    Filter,
    User as UserIcon,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Eye
} from 'lucide-react';

export default function AdminProblemsPage() {
    const router = useRouter();

    // Filters & Pagination State
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [status, setStatus] = useState<string>('');
    const [difficulty, setDifficulty] = useState<string>('');
    const [authorId, setAuthorId] = useState<string>('');

    // Data
    const [authors, setAuthors] = useState<UserSummary[]>([]);
    const { data, isLoading } = useAdminProblems({
        page,
        limit: 10,
        search: debouncedSearch,
        status,
        difficulty,
        authorId
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch lecturers for filter
    useEffect(() => {
        getProblemAuthors().then(setAuthors).catch(console.error);
    }, []);

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setDifficulty('');
        setAuthorId('');
        setPage(1);
    };

    const totalPages = data ? Math.ceil(data.total / 10) : 0;

    return (
        <div className="page-container animate-in">
            <div className="page-header">
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ShieldCheck size={32} color="var(--accent-blue)" />
                    Quản lý bài tập
                </h1>
            </div>

            {/* Filters Bar */}
            <div>
                <div style={{
                    display: 'flex',
                    gap: 12,
                    background: 'var(--bg-secondary)',
                    padding: 16,
                    borderRadius: 12,
                    border: '1px solid var(--border)'
                }}>
                    {/* Search */}
                    <div style={{ flex: 3, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input"
                            placeholder="Tìm theo tiêu đề hoặc slug..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: 38, width: '100%' }}
                        />
                    </div>

                    {/* Status */}
                    <select className="input" style={{ flex: 1 }} value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">Tất cả trạng thái</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Chờ duyệt</option>
                        <option value="REJECTED">Đã từ chối</option>
                    </select>

                    {/* Difficulty */}
                    <select className="input" style={{ flex: 1 }} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                        <option value="">Tất cả độ khó</option>
                        <option value="EASY">Dễ</option>
                        <option value="MEDIUM">Trung bình</option>
                        <option value="HARD">Khó</option>
                    </select>

                    {/* Author */}
                    <select className="input" style={{ flex: 1 }} value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
                        <option value="">Tất cả tác giả</option>
                        {Array.isArray(authors) && authors.map(l => (
                            <option key={l.id} value={l.id}>{l.fullName}</option>
                        ))}
                    </select>

                    <button className="btn btn-secondary" onClick={handleReset} title="Xóa lọc">
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            <div>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Đang tải danh sách...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {data?.items?.map((p: any) => (
                            <div key={p.id} className="card hover-card" style={{ padding: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                                            <span className={`badge ${p.difficulty === 'EASY' ? 'badge-green' :
                                                p.difficulty === 'MEDIUM' ? 'badge-yellow' : 'badge-red'
                                                }`}>{p.difficulty}</span>

                                            <span className={`badge ${p.status === 'ACTIVE' ? 'badge-green' :
                                                p.status === 'REJECTED' ? 'badge-red' : 'badge-yellow'
                                                }`}>
                                                {p.status === 'INACTIVE' ? 'Chờ duyệt' : p.status}
                                            </span>

                                            <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <UserIcon size={14} />
                                                Tạo bởi: <span style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>{p.createdBy?.fullName || 'N/A'}</span>
                                            </span>
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>{p.title}</h3>
                                        <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--text-secondary)' }}>Slug: {p.slug}</p>
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                                        onClick={() => router.push(`/admin/problems/${p.id}`)}
                                    >
                                        <Eye size={18} />
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}

                        {data?.items?.length === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 60, border: '1px dashed var(--border)', borderRadius: 12, color: 'var(--text-muted)' }}>
                                <Filter size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                                <p>Không tìm thấy bài tập nào phù hợp với bộ lọc.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32, paddingBottom: 40 }}>
                        <button
                            className="btn btn-secondary"
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                            Trang <strong>{page}</strong> / {totalPages}
                        </span>
                        <button
                            className="btn btn-secondary"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
