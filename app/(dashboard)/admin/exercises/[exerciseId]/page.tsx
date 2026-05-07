'use client'

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { exerciseApi } from '@/api/exercise.api';
import { 
    ChevronLeft, 
    FileText, 
    Target, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    Loader2,
    Settings,
    Beaker,
    GraduationCap,
    ArrowRight
} from 'lucide-react';

interface PageProps {
    params: Promise<{ exerciseId: string }>;
}

export default function AdminExerciseDetailPage({ params }: PageProps) {
    const { exerciseId } = use(params);
    const router = useRouter();

    const { data: exercise, isLoading } = useQuery({
        queryKey: ['admin-exercise-detail', exerciseId],
        queryFn: () => exerciseApi.getExerciseDetail(Number(exerciseId))
    });

    if (isLoading) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="var(--accent-blue)" />
        </div>
    );

    if (!exercise) return (
        <div style={{ padding: 40, textAlign: 'center' }}>
            <AlertCircle size={48} color="var(--accent-red)" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Không tìm thấy bài tập</h2>
            <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={() => router.back()}>Quay lại</button>
        </div>
    );

    return (
        <div className="page-container animate-in">
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => router.back()}>
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="page-title" style={{ fontSize: 28 }}>{exercise.title}</h1>
                        <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Target size={14} /> Độ khó: {exercise.difficulty}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Beaker size={14} /> {exercise.score} điểm</span>
                            <span className={`badge ${exercise.status === 'APPROVED' ? 'badge-green' : 'badge-orange'}`}>
                                {exercise.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                            </span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-ghost" style={{ border: '1px solid var(--border)' }} onClick={() => router.push(`/admin/exercises/${exerciseId}/testcases`)}>
                        <Beaker size={18} style={{ marginRight: 8 }} /> Quản lý Testcase
                    </button>
                    <button className="btn btn-primary" style={{ background: 'var(--accent-blue)', borderColor: 'var(--accent-blue)', color: '#000' }}>
                        <Settings size={18} style={{ marginRight: 8 }} /> Chỉnh sửa
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 32 }}>
                <div>
                    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FileText size={20} color="var(--accent-blue)" /> Nội dung bài tập
                        </h3>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {exercise.description || 'Không có mô tả cho bài tập này.'}
                        </div>
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <GraduationCap size={20} color="var(--accent-purple)" /> Thuộc lớp học
                        </h3>
                        {exercise.course ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border)' }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{exercise.course.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{exercise.course.code} • {exercise.course.semester}</div>
                                </div>
                                <button className="btn btn-ghost" onClick={() => router.push(`/admin/courses/${exercise.course.id}`)}>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Bài tập này chưa được gán vào lớp học nào.</div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Thống kê bài nộp</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Tổng bài nộp</span>
                                <span style={{ fontWeight: 700 }}>{exercise.submissionsCount || 0}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Tỷ lệ hoàn thành</span>
                                <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>--%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
