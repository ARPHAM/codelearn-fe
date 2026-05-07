'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/api/course.api';
import { getLecturers, getStudents } from '@/api/user.api';
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
    UserPlus,
    X,
    Check,
    ChevronDown,
    LayoutGrid,
    ListFilter,
    Inbox
} from 'lucide-react';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

// --- Custom Premium Select Component ---
const PremiumSelect = ({ options, value, onChange, placeholder, icon: Icon, label }: any) => {
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

    const selectedOption = options.find((o: any) => o.value === value);

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            {label && <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</label>}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    height: 44, 
                    background: 'rgba(30, 35, 48, 0.6)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 12, 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0 16px', 
                    cursor: 'pointer',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                    boxShadow: isOpen ? '0 0 0 2px rgba(124, 58, 237, 0.2)' : 'none',
                    borderColor: isOpen ? 'var(--accent-purple)' : 'var(--border)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {Icon && <Icon size={18} style={{ opacity: 0.6 }} />}
                    <span style={{ fontSize: 14 }}>{selectedOption ? selectedOption.label : placeholder}</span>
                </div>
                <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', color: 'var(--text-muted)' }} />
            </div>

            {isOpen && (
                <div style={{ 
                    position: 'absolute', 
                    top: 'calc(100% + 8px)', 
                    left: 0, 
                    right: 0, 
                    background: '#1E2330', 
                    borderRadius: 14, 
                    border: '1px solid var(--border)', 
                    zIndex: 100, 
                    padding: 6,
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(12px)',
                    animation: 'fadeInUp 0.2s ease-out'
                }}>
                    <div style={{ maxHeight: 240, overflowY: 'auto' }} className="custom-scrollbar">
                        {options.map((opt: any) => (
                            <div 
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                style={{ 
                                    padding: '10px 12px', 
                                    borderRadius: 10, 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: value === opt.value ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                                    color: value === opt.value ? 'var(--accent-purple-light)' : 'var(--text-secondary)',
                                    transition: 'all 0.15s'
                                }}
                                className="dropdown-item-hover"
                            >
                                <span style={{ fontSize: 14, fontWeight: value === opt.value ? 600 : 400 }}>{opt.label}</span>
                                {value === opt.value && <Check size={14} />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function AdminCoursesPage() {
    const router = useRouter();
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

    const { data: lecturers } = useQuery({
        queryKey: ['lecturers'],
        queryFn: getLecturers
    });

    const { data: allStudents } = useQuery({
        queryKey: ['all-students'],
        queryFn: getStudents
    });

    const { data: semesters } = useQuery({
        queryKey: ['course-semesters'],
        queryFn: courseApi.getSemesters
    });

    const [studentSearch, setStudentSearch] = useState('');

    const deleteCourseMutation = useMutation({
        mutationFn: (id: string) => courseApi.deleteCourse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            queryClient.invalidateQueries({ queryKey: ['course-semesters'] });
            toast({ type: 'success', title: 'Thành công', message: 'Lớp học đã được xóa.' });
        }
    });

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa lớp học này không?')) {
            deleteCourseMutation.mutate(id);
        }
    };

    const items = Array.isArray(data) ? data : (data?.items || []);
    const total = data?.total || items.length;

    const filteredStudents = allStudents?.filter((s: any) => 
        s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) || 
        (s.mssv && s.mssv.toLowerCase().includes(studentSearch.toLowerCase())) ||
        s.email.toLowerCase().includes(studentSearch.toLowerCase())
    );

    const semesterOptions = [
        { value: 'ALL', label: 'Tất cả học kỳ' },
        ...(semesters || []).map((s: string) => ({ value: s, label: s }))
    ];

    const lecturerOptions = [
        { value: '', label: '-- Chưa gán --' },
        ...(lecturers || []).map((l: any) => ({ value: l.id, label: `${l.fullName} (${l.email})` }))
    ];

    return (
        <div className="page-container animate-in">
            <style jsx>{`
                .dropdown-item-hover:hover {
                    background: rgba(255, 255, 255, 0.05) !important;
                    color: #fff !important;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <GraduationCap size={28} color="var(--accent-purple)" /> Quản lý Lớp học
                    </h1>
                    <p className="page-subtitle">Quản trị toàn bộ danh sách lớp, học kỳ và phân quyền giảng dạy</p>
                </div>
                <button className="btn btn-primary" onClick={() => router.push('/admin/courses/new')}>
                    <Plus size={16} /> Tạo lớp học mới
                </button>
            </div>

            <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: 16, marginBottom: 28, background: 'rgba(30, 35, 48, 0.6)', borderRadius: 16, border: '1px solid var(--border)' }}>
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
                <div style={{ width: 220 }}>
                    <PremiumSelect 
                        options={semesterOptions} 
                        value={semester} 
                        onChange={setSemester} 
                        icon={ListFilter}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
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
                        {isLoading ? [1, 2, 3, 4, 5].map(i => (
                            <tr key={i}>
                                <td colSpan={6} style={{ padding: 16 }}>
                                    <Skeleton height={44} borderRadius={8} />
                                </td>
                            </tr>
                        )) : items.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '80px 40px', textAlign: 'center' }}>
                                    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: '50%', marginBottom: 16 }}>
                                            <Inbox size={48} color="var(--text-muted)" />
                                        </div>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Chưa có lớp học nào</h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 300, margin: '0 auto' }}>
                                            Hãy bắt đầu bằng việc tạo lớp học mới để quản lý sinh viên và kỳ thi.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : items.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase())).map((course: any) => (
                            <tr key={course.id}>
                                <td><code style={{ background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-purple-light)', padding: '2px 6px', borderRadius: 4 }}>{course.code}</code></td>
                                <td style={{ fontWeight: 700 }}>{course.name}</td>
                                <td><span className="badge badge-purple" style={{ fontSize: 11 }}>{course.semester}</span></td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {course.lecturers && course.lecturers.length > 0 ? (
                                            course.lecturers.map((l: any, idx: number) => (
                                                <div key={l.id} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-purple)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, border: '2px solid rgba(255,255,255,0.1)' }}>
                                                        {l.fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontWeight: idx === 0 ? 600 : 400, color: 'var(--text-primary)' }}>{l.fullName}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Chưa gán</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Users size={14} color="var(--text-muted)" />
                                        <span style={{ fontWeight: 600 }}>{course.studentsCount || 0}</span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                        <button className="btn btn-ghost" style={{ padding: '8px', borderRadius: 10 }} title="Chi tiết & Gán sinh viên" onClick={() => router.push(`/admin/courses/${course.id}`)}><Edit2 size={16} /></button>
                                        <button className="btn btn-ghost text-red" style={{ padding: '8px', borderRadius: 10 }} title="Xóa" onClick={() => handleDelete(course.id)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
