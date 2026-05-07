'use client'

import { useCurrentUserInfo, useUserStats } from '@/app/components/_api/queries';
import { useStudentProblems } from '@/src/hooks/useProblems';
import { useExamsByCourse, useUpcomingExams } from '@/src/hooks/useExams';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { useRouter } from 'next/navigation';
import { 
    Trophy, 
    Calendar, 
    Clock, 
    Target, 
    Rocket, 
    CheckCircle2, 
    AlertCircle,
    ChevronRight,
    Layout,
    BookOpen
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function StudentDashboardPage() {
    const router = useRouter();
    const { data: user, isLoading: userLoading } = useCurrentUserInfo();
    const { data: stats, isLoading: statsLoading } = useUserStats();
    
    // We can fetch data from various hooks to build the dashboard
    const { data: problemsRes, isLoading: problemsLoading } = useStudentProblems({ limit: 5 });
    const { data: upcomingExams, isLoading: examsLoading } = useUpcomingExams();

    return (
        <div className="page-container animate-in">
            <div className="page-header" style={{ marginBottom: 40 }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 32 }}>
                        {userLoading ? <Skeleton width={300} height={40} /> : `Chào quay trở lại, ${user?.name}! 👋`}
                    </h1>
                    <p className="page-subtitle">Hôm nay bạn muốn chinh phục thử thách nào?</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
                {/* Left Column: Summary & Problems */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {/* Thống kê nhanh */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                        {[
                            { label: 'HẠNG CỦA BẠN', value: stats?.rank || 'Bronze', icon: Trophy, color: 'var(--accent-purple)', sub: 'Dựa trên XP' },
                            { label: 'BÀI TẬP ĐÃ GIẢI', value: `${stats?.solvedCount || 0}`, icon: CheckCircle2, color: 'var(--accent-green)', sub: 'Đã hoàn thành' },
                            { label: 'RATING ELO', value: stats?.rating || 1500, icon: Rocket, color: 'var(--accent-blue)', sub: 'Xếp hạng toàn cầu' },
                        ].map((stat, i) => (
                            <div key={i} className="card animate-in" style={{ 
                                padding: '24px 28px', 
                                background: `linear-gradient(145deg, rgba(30, 35, 48, 0.6), rgba(13, 17, 23, 0.8))`, 
                                border: `1px solid ${stat.color}40`, 
                                boxShadow: `0 10px 30px -10px ${stat.color}30`,
                                animationDelay: `${i * 0.1}s`,
                                minHeight: 150,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div style={{ 
                                        padding: 10, 
                                        borderRadius: 12, 
                                        background: `${stat.color}15`, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        boxShadow: `0 0 15px ${stat.color}20`
                                    }}>
                                        <stat.icon size={22} color={stat.color} />
                                    </div>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>{stat.label}</span>
                                </div>
                                <div>
                                    {statsLoading ? <Skeleton width="60%" height={32} /> : (
                                        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{stat.value}</div>
                                    )}
                                    <div style={{ fontSize: 12, color: stat.color, opacity: 0.8, fontWeight: 500 }}>{stat.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Problems */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Target size={24} color="var(--accent-cyan)" /> Bài tập gợi ý
                            </h2>
                            <button className="btn btn-ghost" style={{ fontSize: 13, color: 'var(--accent-cyan)' }} onClick={() => router.push('/student/problems')}>
                                Xem tất cả <ChevronRight size={16} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {problemsLoading ? [1, 2, 3].map(i => <Skeleton key={i} height={80} />) : 
                             problemsRes?.items?.slice(0, 3).map((p: any) => (
                                <div key={p.id} className="card card-hover animate-in" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => router.push(`/student/problems/${p.id}`)}>
                                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Layout size={20} color="var(--text-muted)" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15 }}>{p.title}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.difficulty} • {p.maxScore || 10} điểm</div>
                                        </div>
                                    </div>
                                    <button className="btn btn-ghost" style={{ padding: 8 }}><ChevronRight size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Timeline & Upcoming */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div className="card" style={{ padding: 24, background: 'rgba(30, 35, 48, 0.4)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Calendar size={22} color="var(--accent-purple)" /> Lịch trình học tập
                        </h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
                            <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.05)' }}></div>
                            
                            {examsLoading ? [1, 2].map(i => <Skeleton key={i} height={60} />) : 
                             (!upcomingExams || upcomingExams.length === 0) ? (
                                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                                    Không có sự kiện sắp tới
                                </div>
                            ) : upcomingExams.map((event: any) => (
                                <div key={event.id} className="animate-in" style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1, cursor: 'pointer' }} onClick={() => router.push(`/student/exams/${event.id}`)}>
                                    <div style={{ 
                                        width: 24, height: 24, borderRadius: '50%', 
                                        background: '#0d1117', border: `2px solid var(--accent-purple)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-purple)' }}></div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                                            {formatDistanceToNow(new Date(event.startTime), { addSuffix: true, locale: vi })}
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{event.title}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11, color: 'var(--accent-purple)', opacity: 0.8 }}>
                                            <BookOpen size={12} />
                                            KỲ THI
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="btn btn-ghost" style={{ width: '100%', marginTop: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                            Xem lịch chi tiết
                        </button>
                    </div>

                    {/* Quick Links */}
                    <div className="card" style={{ padding: 24, borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)', background: 'transparent' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 16 }}>Truy cập nhanh</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <button 
                                className="btn btn-ghost" 
                                style={{ padding: '12px', height: 'auto', flexDirection: 'column', gap: 8, fontSize: 11, borderRadius: 16 }}
                                onClick={() => router.push('/student/code-battle')}
                            >
                                <Rocket size={20} /> Code Battle
                            </button>
                            <button 
                                className="btn btn-ghost" 
                                style={{ padding: '12px', height: 'auto', flexDirection: 'column', gap: 8, fontSize: 11, borderRadius: 16 }}
                                onClick={() => router.push('/student/docs')}
                            >
                                <BookOpen size={20} /> Tài liệu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
