'use client';

import { useMyCourses } from '@/hooks/useCourses';
import { useRouter } from 'next/navigation';
import { 
    BookOpen, 
    Users, 
    Calendar, 
    ShieldCheck, 
    Loader2, 
    Search,
    Settings,
    MoreVertical,
    ClipboardCheck
} from 'lucide-react';
import { useState } from 'react';

export default function LecturerCoursesPage() {
    const router = useRouter();
    const { data: courses, isLoading } = useMyCourses();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCourses = courses?.filter((c: any) => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <BookOpen size={28} color="var(--accent-cyan)" /> Lớp học đang giảng dạy
                    </h1>
                    <p className="page-subtitle">Quản lý bài tập, kì thi và theo dõi tiến độ sinh viên</p>
                </div>
            </div>

            <div style={{ marginBottom: 24, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                    className="input" 
                    placeholder="Tìm kiếm lớp học..." 
                    style={{ paddingLeft: 42, background: 'rgba(30, 35, 48, 0.4)', borderRadius: 12, height: 48, width: '100%' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--accent-cyan)" />
                </div>
            ) : filteredCourses?.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                    <BookOpen size={48} style={{ opacity: 0.1, margin: '0 auto 16px' }} />
                    <p>Bạn hiện không phụ trách lớp học nào.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
                    {filteredCourses?.map((course: any) => (
                        <div 
                            key={course.id} 
                            className="card card-hover" 
                            style={{ padding: 24, cursor: 'pointer' }}
                            onClick={() => router.push(`/lecturer/courses/${course.id}`)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <div>
                                    <span className="badge badge-cyan" style={{ fontSize: 10, marginBottom: 8 }}>{course.semester}</span>
                                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>{course.name}</h3>
                                    <code style={{ fontSize: 11, color: 'var(--text-muted)' }}>{course.code}</code>
                                </div>
                                <button className="btn btn-ghost" style={{ padding: 8 }} onClick={(e) => { e.stopPropagation(); }}><MoreVertical size={16} /></button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 10, border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Sinh viên</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Users size={16} color="var(--accent-cyan)" /> {course.studentsCount || 0}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 10, border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Kì thi</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <ClipboardCheck size={16} color="var(--accent-purple)" /> --
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Calendar size={14} /> {course.startDate ? new Date(course.startDate).toLocaleDateString('vi-VN') : '---'}
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>Quản lý</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
