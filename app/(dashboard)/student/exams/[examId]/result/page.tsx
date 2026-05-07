'use client'

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useExamResult } from '@/src/hooks/useExams';
import { 
    Trophy, 
    CheckCircle2, 
    AlertCircle, 
    ChevronLeft, 
    Loader2, 
    Target,
    Clock,
    Award
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PageProps {
    params: Promise<{ examId: string }>;
}

export default function ExamResultPage({ params }: PageProps) {
    const { examId } = use(params);
    const router = useRouter();
    const { data: result, isLoading, error } = useExamResult(examId);

    if (isLoading) return (
        <div style={{ height: 'calc(100vh - 124px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="var(--accent-purple)" />
        </div>
    );

    if (error || !result) return (
        <div style={{ height: 'calc(100vh - 124px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={48} color="var(--accent-red)" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Không tìm thấy kết quả</h2>
            <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={() => router.push('/student/dashboard')}>Quay lại Dashboard</button>
        </div>
    );

    const maxTotalScore = result.problems.reduce((acc: number, p: any) => acc + p.maxScore, 0);
    const scorePercentage = (result.score / maxTotalScore) * 100;

    return (
        <div className="page-container animate-in" style={{ maxWidth: 800, margin: '0 auto' }}>
            <button className="btn btn-ghost" style={{ marginBottom: 24 }} onClick={() => router.push('/student/dashboard')}>
                <ChevronLeft size={18} /> Quay lại Dashboard
            </button>

            <div className="card" style={{ padding: 40, textAlign: 'center', background: 'var(--gradient-dark)', borderRadius: 32, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 32 }}>
                <div style={{ 
                    width: 80, height: 80, borderRadius: 24, 
                    background: 'var(--gradient-purple)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)'
                }}>
                    <Award size={40} color="white" />
                </div>
                
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{result.exam.title}</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Chúc mừng bạn đã hoàn thành kỳ thi!</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, textAlign: 'left' }}>
                    <div className="card" style={{ padding: 20, background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Tổng điểm</div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-purple)' }}>{result.score} <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/ {maxTotalScore}</span></div>
                    </div>
                    <div className="card" style={{ padding: 20, background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Thời gian nộp</div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{new Date(result.endTime).toLocaleString('vi-VN')}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{formatDistanceToNow(new Date(result.endTime), { addSuffix: true, locale: vi })}</div>
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Target size={22} color="var(--accent-cyan)" /> Chi tiết từng bài
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {result.problems.map((p: any) => (
                    <div key={p.id} className="card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ 
                                width: 36, height: 36, borderRadius: 10, 
                                background: p.score === p.maxScore ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {p.score === p.maxScore ? <CheckCircle2 size={20} color="var(--accent-green)" /> : <Award size={20} color="var(--text-muted)" />}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15 }}>{p.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Trạng thái: {p.status}</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: 18 }}>{p.score} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ {p.maxScore}</span></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
