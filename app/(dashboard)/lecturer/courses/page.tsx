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
    ClipboardCheck,
    ChevronRight,
    GraduationCap,
    Clock,
    LayoutGrid,
    ListFilter
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
            <style jsx>{`
                .course-card {
                    background: rgba(30, 35, 48, 0.4);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 28px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    backdrop-filter: blur(10px);
                }
                .course-card:hover {
                    transform: translateY(-8px);
                    border-color: var(--accent-cyan);
                    background: rgba(30, 35, 48, 0.6);
                    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(34, 211, 238, 0.1);
                }
                .course-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 150px;
                    height: 150px;
                    background: radial-gradient(circle at top right, rgba(34, 211, 238, 0.08), transparent 70%);
                    pointer-events: none;
                }
                .stat-box {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 14px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .course-title {
                    font-size: 22px;
                    font-weight: 800;
                    color: #fff;
                    line-height: 1.2;
                    margin-bottom: 4px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .search-container {
                    background: rgba(30, 35, 48, 0.6);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    padding: 0 16px;
                    height: 52px;
                    margin-bottom: 32px;
                    transition: all 0.2s;
                }
                .search-container:focus-within {
                    border-color: var(--accent-cyan);
                    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15);
                }
            `}</style>

            <div className="page-header" style={{ marginBottom: 40 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(34, 211, 238, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={28} color="var(--accent-cyan)" />
                        </div>
                        Lớp học giảng dạy
                    </h1>
                    <p className="page-subtitle">Nơi quản lý học liệu, kì thi và theo dõi sát sao tiến độ học tập của sinh viên</p>
                </div>
            </div>

            <div className="search-container">
                <Search size={20} style={{ color: 'var(--text-muted)', marginRight: 12 }} />
                <input 
                    className="input" 
                    placeholder="Tìm kiếm theo tên hoặc mã lớp học..." 
                    style={{ background: 'transparent', border: 'none', height: '100%', fontSize: 15, padding: 0, width: '100%' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 0', gap: 16 }}>
                    <Loader2 className="animate-spin" size={48} color="var(--accent-cyan)" />
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Đang tải danh sách lớp học...</p>
                </div>
            ) : filteredCourses?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(30, 35, 48, 0.3)', borderRadius: 32, border: '1px dashed var(--border)' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <GraduationCap size={40} style={{ opacity: 0.2 }} />
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Không tìm thấy lớp học nào</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>Bạn hiện không phụ trách lớp học nào hoặc không có lớp học nào khớp với từ khóa tìm kiếm.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 24 }}>
                    {filteredCourses?.map((course: any) => (
                        <div 
                            key={course.id} 
                            className="course-card" 
                            onClick={() => router.push(`/lecturer/courses/${course.id}`)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <span style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-cyan)', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {course.semester}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}>•</span>
                                        <code style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{course.code}</code>
                                    </div>
                                    <h3 className="course-title">{course.name}</h3>
                                </div>
                                <button className="btn btn-ghost" style={{ padding: 8, borderRadius: 12 }} onClick={(e) => { e.stopPropagation(); }}>
                                    <MoreVertical size={18} style={{ color: 'var(--text-muted)' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <div className="stat-box">
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Users size={14} color="var(--accent-cyan)" /> SINH VIÊN
                                    </div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{course.studentsCount || 0}</div>
                                </div>
                                <div className="stat-box">
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <ClipboardCheck size={14} color="var(--accent-purple)" /> KÌ THI
                                    </div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>--</div>
                                </div>
                                <div className="stat-box">
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Clock size={14} color="var(--accent-orange)" /> TRẠNG THÁI
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}></div> ĐANG DIỄN RA
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Calendar size={16} style={{ opacity: 0.6 }} /> 
                                    <span>Bắt đầu: {course.startDate ? new Date(course.startDate).toLocaleDateString('vi-VN') : '---'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-cyan)', fontWeight: 600, fontSize: 14 }}>
                                    Chi tiết <ChevronRight size={18} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
