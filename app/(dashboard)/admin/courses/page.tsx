'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/api/course.api';
import { 
    Plus, 
    Users, 
    Search, 
    Filter, 
    GraduationCap, 
    MoreVertical, 
    Edit2, 
    Trash2,
    Calendar,
    Loader2,
    UserPlus
} from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/ui/Toast';

export default function AdminCoursesPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [semester, setSemester] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-courses', page, semester],
        queryFn: () => courseApi.getCourses({ 
            page, 
            limit: 10, 
            semester: semester === 'ALL' ? undefined : semester 
        }),
    });

    const createCourseMutation = useMutation({
        mutationFn: (newCourse: any) => courseApi.createCourse(newCourse),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            toast({ type: 'success', title: 'Thành công', message: 'Lớp học mới đã được tạo.' });
            setIsCreateModalOpen(false);
        }
    });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({
        name: '',
        code: '',
        semester: 'HK2-2025',
        startDate: '',
        endDate: '',
        description: ''
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createCourseMutation.mutate(newCourse);
    };

    const items = Array.isArray(data) ? data : (data?.items || []);
    const total = data?.total || items.length;

    return (
        <div className="page-container animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <GraduationCap size={28} color="var(--accent-purple)" /> Quản lý Lớp học
                    </h1>
                    <p className="page-subtitle">Quản trị toàn bộ danh sách lớp, học kỳ và phân quyền giảng dạy</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={16} /> Tạo lớp học mới
                </button>
            </div>

            <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: 16, marginBottom: 28, background: 'rgba(30, 35, 48, 0.6)', borderRadius: 16 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        className="input" 
                        placeholder="Tìm theo tên/mã lớp..." 
                        style={{ paddingLeft: 42, background: 'rgba(13, 17, 23, 0.4)', borderRadius: 12, height: 44, width: '100%' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="input" 
                    style={{ width: 160, borderRadius: 12, height: 44, background: 'rgba(13, 17, 23, 0.4)' }}
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                >
                    <option value="ALL">Tất cả học kỳ</option>
                    <option value="HK1-2025">HK1-2025</option>
                    <option value="HK2-2025">HK2-2025</option>
                </select>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Mã lớp</th>
                            <th>Tên lớp học</th>
                            <th>Học kỳ</th>
                            <th>Giảng viên</th>
                            <th>Sinh viên</th>
                            <th style={{ textAlign: 'right' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><Loader2 className="animate-spin" /></td></tr>
                        ) : items.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((course: any) => (
                            <tr key={course.id}>
                                <td><code style={{ background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-purple-light)', padding: '2px 6px', borderRadius: 4 }}>{course.code}</code></td>
                                <td style={{ fontWeight: 700 }}>{course.name}</td>
                                <td>{course.semester}</td>
                                <td>{course.lecturer?.fullName || <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Chưa gán</span>}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Users size={14} color="var(--text-muted)" />
                                        <span>{course.studentsCount || 0}</span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                        <button className="btn btn-ghost" style={{ padding: '6px' }} title="Gán thành viên"><UserPlus size={16} /></button>
                                        <button className="btn btn-ghost" style={{ padding: '6px' }}><Edit2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CREATE MODAL */}
            {isCreateModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: 500, padding: 32, border: '1px solid var(--accent-purple)' }}>
                        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Tạo Lớp học mới</h2>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Mã lớp</label>
                                    <input className="input" required value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} placeholder="IT101" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Học kỳ</label>
                                    <input className="input" required value={newCourse.semester} onChange={e => setNewCourse({...newCourse, semester: e.target.value})} placeholder="HK2-2025" />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Tên lớp học</label>
                                <input className="input" required value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} placeholder="Lập trình C nâng cao" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Ngày bắt đầu</label>
                                    <input type="date" className="input" value={newCourse.startDate} onChange={e => setNewCourse({...newCourse, startDate: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Ngày kết thúc</label>
                                    <input type="date" className="input" value={newCourse.endDate} onChange={e => setNewCourse({...newCourse, endDate: e.target.value})} />
                                </div>
                            </div>
                            <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setIsCreateModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary" disabled={createCourseMutation.isPending}>
                                    {createCourseMutation.isPending ? <Loader2 className="animate-spin" /> : 'Tạo lớp học'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
