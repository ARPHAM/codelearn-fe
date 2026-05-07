'use client'

import Link from 'next/link';
import { useStudentProblems } from '@/hooks/useProblems';
import { useRouter } from 'next/navigation';
import {
    Trophy,
    Search,
    Filter,
    ChevronRight,
    Users,
    Zap,
    Target,
    Rocket,
    Circle,
    ChevronDown,
    CheckCircle2,
    Inbox,
    ArrowUpDown
} from 'lucide-react';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { useState, useRef, useEffect } from 'react';

const diffColors: Record<string, string> = { EASY: 'badge-green', MEDIUM: 'badge-yellow', HARD: 'badge-red' };
const diffLabels: Record<string, string> = { EASY: 'Dễ', MEDIUM: 'Trung bình', HARD: 'Khó' };

function CustomSelect({ label, options, value, onChange, placeholder, icon: Icon, minWidth = 160 }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt: any) => opt.value === value) || options[0];

    return (
        <div
            ref={containerRef}
            style={{ position: 'relative', minWidth }}
            onMouseLeave={() => setIsOpen(false)}
        >
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    height: 44,
                    background: 'rgba(13, 17, 23, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    padding: Icon ? '0 36px 0 40px' : '0 36px 0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: '#e6edf3',
                    fontSize: 13,
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    position: 'relative',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
            >
                {Icon && <Icon size={16} style={{ position: 'absolute', left: 14, color: '#94a3b8' }} />}
                <div style={{ flex: 1, display: 'flex', gap: 4, alignItems: 'center', overflow: 'hidden' }}>
                    {label && <span style={{ color: '#64748b', flexShrink: 0 }}>{label}:</span>}
                    <span style={{
                        color: '#e6edf3',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {selectedOption.label}
                    </span>
                </div>
                <ChevronDown size={14} style={{
                    position: 'absolute',
                    right: 12,
                    color: '#64748b',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                }} />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    paddingTop: '8px',
                    zIndex: 100,
                    animation: 'fadeInUp 0.1s ease'
                }}>
                    <div style={{
                        background: '#161b22',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        padding: '6px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        overflow: 'hidden'
                    }}>
                        {options.map((opt: any) => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: 8,
                                    color: value === opt.value ? '#a78bfa' : '#94a3b8',
                                    background: value === opt.value ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                    fontSize: 13,
                                    fontWeight: value === opt.value ? 600 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                    if (value !== opt.value) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                        e.currentTarget.style.color = '#e6edf3';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (value !== opt.value) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#94a3b8';
                                    }
                                }}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function StudentProblemsListPage() {
    const router = useRouter()
    const [difficulty, setDifficulty] = useState('ALL');
    const [status, setStatus] = useState('ALL');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
    const PAGE_LIMIT = 10;

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [difficulty, status, debouncedSearch]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isError } = useStudentProblems({
        page: currentPage,
        limit: PAGE_LIMIT,
        search: debouncedSearch || undefined,
        difficulty: difficulty === 'ALL' ? undefined : difficulty,
        status: status === 'ALL' ? undefined : status,
        sortBy,
        sortOrder
    });

    const totalPages = data ? Math.ceil(data.total / PAGE_LIMIT) : 0;

    return (
        <div className="page-container animate-in">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 54, height: 54, borderRadius: 16,
                        background: 'var(--gradient-purple)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-glow-purple)'
                    }}>
                        <Trophy size={28} color="white" />
                    </div>
                    <div>
                        <p className="page-title" style={{
                            fontSize: 26,
                            background: 'linear-gradient(to right, #e6edf3, #9461f7)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em'
                        }}>
                            Luyện Tập Lập Trình
                        </p>
                        <p className="page-subtitle" style={{ fontSize: 14, marginTop: 0 }}>Chinh phục thử thách, nâng tầm kỹ năng cùng AI Assistant</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link href="/student/problems/code-editor">
                        <button className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: 12 }}>
                            <Rocket size={18} />
                            <span>Code Tự Do</span>
                        </button>
                    </Link>
                </div>
            </div>

            <div>
                <div className="card" style={{
                    padding: '16px 20px',
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    marginBottom: 28,
                    background: 'rgba(30, 35, 48, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 16,
                }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input"
                            placeholder="Tìm kiếm bài tập theo tên, slug..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: 42, borderRadius: 12, height: 44, background: 'rgba(13, 17, 23, 0.4)', width: '100%' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                        <CustomSelect
                            label="Độ khó"
                            icon={Filter}
                            value={difficulty}
                            onChange={setDifficulty}
                            options={[
                                { value: 'ALL', label: 'Tất cả' },
                                { value: 'EASY', label: 'Dễ' },
                                { value: 'MEDIUM', label: 'Trung bình' },
                                { value: 'HARD', label: 'Khó' },
                            ]}
                            minWidth={170}
                        />
                        <CustomSelect
                            label="Trạng thái"
                            icon={Filter}
                            value={status}
                            onChange={setStatus}
                            options={[
                                { value: 'ALL', label: 'Tất cả' },
                                { value: 'UNSOLVED', label: 'Chưa giải' },
                                { value: 'SOLVED', label: 'Đã giải' },
                            ]}
                            minWidth={160}
                        />
                        <CustomSelect
                            label="Sắp xếp"
                            icon={ArrowUpDown}
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(val: string) => {
                                const [field, order] = val.split('-');
                                setSortBy(field);
                                setSortOrder(order as 'ASC' | 'DESC');
                            }}
                            options={[
                                { value: 'createdAt-DESC', label: 'Mới nhất' },
                                { value: 'createdAt-ASC', label: 'Cũ nhất' },
                                { value: 'title-ASC', label: 'Tên A-Z' },
                                { value: 'title-DESC', label: 'Tên Z-A' },
                                { value: 'totalSubmissions-DESC', label: 'Nộp bài nhiều' },
                                { value: 'acceptanceRate-DESC', label: 'Dễ trúng tuyển' },
                            ]}
                            minWidth={190}
                        />
                    </div>
                </div>

                {isLoading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height={80} borderRadius={16} />)}
                    </div>
                )}

                {isError && (
                    <div style={{ textAlign: 'center', padding: 40, color: 'red' }}>
                        Đã xảy ra lỗi khi tải danh sách bài tập.
                    </div>
                )}

                {!isLoading && !isError && data?.items?.length === 0 && (
                    <div className="animate-in" style={{ textAlign: 'center', padding: '80px 40px', border: '1px dashed var(--border)', borderRadius: 16, background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
                            <div style={{ padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}>
                                <Inbox size={48} color="var(--text-muted)" />
                            </div>
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Không tìm thấy bài tập nào</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 300, margin: '0 auto' }}>
                            Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để có kết quả khác.
                        </p>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {data?.items?.map((p, idx) => (
                        <div
                            key={p.id}
                            className="card card-hover"
                            style={{
                                cursor: 'pointer',
                                padding: '16px 20px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: 16,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 20,
                                animationDelay: `${idx * 0.05}s`
                            }}
                            onClick={() => router.push(`/student/problems/code-editor?slug=${p.slug}`)}
                        >
                            {/* Status Indicator */}
                            <div style={{
                                flexShrink: 0,
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                background: 'rgba(255, 255, 255, 0.02)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                                {p.status === 'SOLVED' ? (
                                    <CheckCircle2 size={20} color="#10b981" />
                                ) : (
                                    <Circle size={18} color="#4b5563" strokeWidth={1.5} />
                                )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                                    <h3 style={{
                                        fontWeight: 700,
                                        fontSize: 17,
                                        color: 'var(--text-primary)',
                                        letterSpacing: '-0.01em',
                                        margin: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {p.title}
                                    </h3>
                                    <span className={`badge ${diffColors[p.difficulty] || 'badge-gray'}`} style={{
                                        padding: '4px 10px',
                                        borderRadius: 8,
                                        fontSize: 11,
                                        height: 'fit-content',
                                        flexShrink: 0
                                    }}>
                                        {diffLabels[p.difficulty] || p.difficulty}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <Users size={14} style={{ opacity: 0.6 }} />
                                        <span>Lượt nộp: <strong style={{ color: 'var(--text-primary)' }}>{p.stats?.totalSubmissions || 0}</strong></span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <Zap size={14} className="text-yellow-400" style={{ opacity: 0.8 }} />
                                        <span>Trúng tuyển: <strong style={{ color: 'var(--text-primary)' }}>{Number(p.stats?.acceptanceRate || 0).toFixed(1)}%</strong></span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <Target size={14} style={{ opacity: 0.6 }} />
                                        <span>Điểm: <strong style={{ color: p.status === 'SOLVED' ? '#10b981' : 'var(--text-primary)' }}>{p.studentScore || 0} / {p.maxScore || 0}</strong></span>
                                    </div>
                                    {p.solvedLanguages && p.solvedLanguages.length > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <span style={{ opacity: 0.6 }}>Đã giải bằng:</span>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                {p.solvedLanguages.map((lang: string) => (
                                                    <span key={lang} style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, fontSize: 11, color: 'var(--text-primary)' }}>{lang}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ flexShrink: 0 }}>
                                <button
                                    className="btn btn-primary"
                                    style={{
                                        padding: '8px 20px',
                                        fontSize: 14,
                                        borderRadius: 10,
                                        fontWeight: 600,
                                        height: 40
                                    }}
                                >
                                    <span>Làm bài</span>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {!isLoading && !isError && totalPages > 1 && (
                    <div style={{
                        marginTop: 40,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="btn btn-ghost"
                            style={{
                                padding: '8px 12px',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                opacity: currentPage === 1 ? 0.3 : 1,
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                borderRadius: 8
                            }}
                        >
                            Trước
                        </button>

                        <div style={{ display: 'flex', gap: 6 }}>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 8,
                                        border: '1px solid',
                                        borderColor: currentPage === page ? '#7c3aed' : 'rgba(255, 255, 255, 0.05)',
                                        background: currentPage === page ? 'var(--gradient-purple)' : 'rgba(255, 255, 255, 0.02)',
                                        color: currentPage === page ? 'white' : 'var(--text-secondary)',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="btn btn-ghost"
                            style={{
                                padding: '8px 12px',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                opacity: currentPage === totalPages ? 0.3 : 1,
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                borderRadius: 8
                            }}
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
