'use client';

import { useMyCourses } from '@/hooks/useCourses';
import { useRouter } from 'next/navigation';
import { 
    BookOpen, 
    Calendar, 
    ChevronRight, 
    Clock, 
    GraduationCap, 
    Loader2, 
    Search,
    Trophy
} from 'lucide-react';
import { useState } from 'react';

export default function StudentCoursesPage() {
    const router = useRouter();
    const { data: courses, isLoading } = useMyCourses();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCourses = courses?.filter((c: any) => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (date: string) => {
        if (!date) return 'Chưa xác định';
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="page-container animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <GraduationCap size={28} color="var(--accent-purple)" /> Lớp học của tôi
                    </h1>
                    <p className="page-subtitle">Danh sách các lớp học và kì thi bạn đã tham gia</p>
                </div>
            </div>

            <div style={{ marginBottom: 24, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                    className="input" 
                    placeholder="Tìm kiếm theo tên hoặc mã học phần..." 
                    style={{ paddingLeft: 42, height: 48, borderRadius: 12, background: 'rgba(30, 35, 48, 0.4)', width: '100%' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--accent-purple)" />
                </div>
            ) : filteredCourses?.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                    <BookOpen size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                    <p>Bạn chưa tham gia lớp học nào.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                    {filteredCourses?.map((course: any) => (
                        <div 
                            key={course.id} 
                            className="card card-hover" 
                            style={{ 
                                padding: 0, 
                                overflow: 'hidden', 
                                display: 'flex', 
                                flexDirection: 'column',
                                cursor: 'pointer'
                            }}
                            onClick={() => router.push(`/student/courses/${course.id}`)}
                        >
                            <div style={{ padding: 20, background: 'linear-gradient(to bottom right, rgba(124, 58, 237, 0.1), transparent)', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <span className="badge badge-purple" style={{ fontSize: 10 }}>{course.semester}</span>
                                    <code style={{ fontSize: 11, color: 'var(--accent-cyan)', background: 'black', padding: '2px 6px', borderRadius: 4 }}>{course.code}</code>
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{course.name}</h3>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Calendar size={14} /> {formatDate(course.startDate)} — {formatDate(course.endDate)}
                                </p>
                            </div>
                            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Kì thi</div>
                                        <div style={{ fontWeight: 700 }}>--</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bài tập</div>
                                        <div style={{ fontWeight: 700 }}>--</div>
                                    </div>
                                </div>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
