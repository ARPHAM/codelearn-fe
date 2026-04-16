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
  Circle
} from 'lucide-react';

const diffColors: Record<string, string> = { EASY: 'badge-green', MEDIUM: 'badge-yellow', HARD: 'badge-red' };
const diffLabels: Record<string, string> = { EASY: 'Dễ', MEDIUM: 'Trung bình', HARD: 'Khó' };

export default function StudentProblemsListPage() {
  const router = useRouter()
  const { data, isLoading, isError } = useStudentProblems({ page: 1, limit: 20 });

  return (
    <>
      <div className="page-container animate-in">
        <div className="page-header" style={{ padding: '0 24px', paddingTop: 32, marginBottom: 8 }}>
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
              <h1 className="page-title" style={{ 
                fontSize: 32, 
                background: 'linear-gradient(to right, #e6edf3, #9461f7)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}>
                Luyện Tập Lập Trình
              </h1>
              <p className="page-subtitle" style={{ fontSize: 14, marginTop: 4 }}>Chinh phục thử thách, nâng tầm kỹ năng cùng AI Assistant</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/student/code-editor">
              <button className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: 12 }}>
                <Rocket size={18} />
                <span>Code Tự Do</span>
              </button>
            </Link>
          </div>
        </div>

        <div style={{ padding: '0 24px' }}>
            <div className="card" style={{ 
                padding: '16px 20px', 
                display: 'flex', 
                gap: 16, 
                flexWrap: 'nowrap', 
                alignItems: 'center', 
                marginBottom: 28,
                background: 'rgba(30, 35, 48, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 16,
                overflowX: 'auto'
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        className="input" 
                        placeholder="Tìm kiếm bài tập theo tên, slug..." 
                        style={{ paddingLeft: 42, borderRadius: 12, height: 44, background: 'rgba(13, 17, 23, 0.4)', width: '100%' }} 
                    />
                </div>
                <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                    <div style={{ position: 'relative' }}>
                        <Filter size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <select className="select" style={{ paddingLeft: 36, borderRadius: 10, height: 44, background: 'rgba(13, 17, 23, 0.4)', minWidth: 150 }}>
                            <option>Tất cả độ khó</option><option>Dễ</option><option>Trung bình</option><option>Khó</option>
                        </select>
                    </div>
                    <select className="select" style={{ borderRadius: 10, height: 44, background: 'rgba(13, 17, 23, 0.4)', minWidth: 130 }}>
                        <option>Chưa giải</option><option>Đã giải</option>
                    </select>
                </div>
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
                    Chưa có bài tập nào khả dụng.
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {data?.items?.map((p, idx) => (
                <div 
                    key={p.id} 
                    className="card card-hover" 
                    style={{ 
                        cursor: 'pointer', 
                        padding: '24px', 
                        background: 'var(--bg-card)', 
                        border: '1px solid var(--border)', 
                        borderRadius: 20, 
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        animationDelay: `${idx * 0.05}s`
                    }}
                    onClick={() => router.push(`/student/code-editor?slug=${p.slug}`)}
                >
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <div style={{ 
                                padding: '6px 12px', 
                                background: 'rgba(255, 255, 255, 0.03)', 
                                borderRadius: 8, 
                                fontSize: 13, 
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-muted)',
                                fontFamily: 'monospace'
                            }}>
                                #{p.id.substring(0, 8)}
                            </div>
                            <span className={`badge ${diffColors[p.difficulty] || 'badge-gray'}`} style={{ padding: '6px 14px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <Circle size={8} fill="currentColor" />
                                {diffLabels[p.difficulty] || p.difficulty}
                            </span>
                        </div>
                        <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 12, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                            {p.title}
                        </h3>
                        <div style={{ display: 'flex', gap: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Users size={16} />
                                <span>Lượt nộp: <strong style={{ color: 'var(--text-primary)' }}>{p.stats?.totalSubmissions || 0}</strong></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Zap size={16} className="text-yellow-400" />
                                <span>Tỷ lệ đỗ: <strong style={{ color: 'var(--text-primary)' }}>{p.stats?.acceptanceRate || 0}%</strong></span>
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <button 
                            className="btn btn-primary" 
                            style={{ 
                                padding: '12px 28px', 
                                fontSize: 15, 
                                borderRadius: 14, 
                                fontWeight: 700, 
                                transition: 'all 0.3s'
                            }} 
                        >
                            <span>Bắt đầu bài tập</span>
                            <ChevronRight size={18} style={{ transition: 'transform 0.3s' }} className="group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
                ))}
            </div>
        </div>
      </div>
    </>
  );
}
