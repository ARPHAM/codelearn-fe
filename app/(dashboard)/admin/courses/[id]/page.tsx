'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/api/course.api';
import { examApi } from '@/api/exam.api';
import { exerciseApi } from '@/api/exercise.api';
import { getLecturers, getStudents } from '@/api/user.api';
import { useExamsByCourse } from '@/hooks/useExams';
import { useExercisesByCourse } from '@/hooks/useExercises';
import {
    GraduationCap,
    Info,
    Users,
    UserPlus,
    BookOpen,
    ChevronLeft,
    Save,
    Loader2,
    Plus,
    Search,
    Check,
    X,
    Calendar,
    FileText,
    Trophy,
    User,
    ArrowRight
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/Toast';
import { useRouter, useParams } from 'next/navigation';

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
                    borderColor: isOpen ? 'var(--accent-purple)' : 'var(--border)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {Icon && <Icon size={18} style={{ opacity: 0.6 }} />}
                    <span style={{ fontSize: 14 }}>{selectedOption ? selectedOption.label : placeholder}</span>
                </div>
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
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(12px)',
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
                                }}
                            >
                                <span style={{ fontSize: 14 }}>{opt.label}</span>
                                {value === opt.value && <Check size={14} />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function AdminCourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const id = params.id as string;
    const isNew = id === 'new';

    const [activeTab, setActiveTab] = useState(1);
    const [courseData, setCourseData] = useState({
        name: '',
        code: '',
        semester: 'HK2-2025',
        startDate: '',
        endDate: '',
        description: '',
        lecturerId: ''
    });

    const [studentSearch, setStudentSearch] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [studentPage, setStudentPage] = useState(1);

    const [lecturerSearch, setLecturerSearch] = useState('');
    const [selectedLecturerIds, setSelectedLecturerIds] = useState<string[]>([]);
    const [lecturerPage, setLecturerPage] = useState(1);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [modalRole, setModalRole] = useState<'student' | 'lecturer'>('student');
    const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);

    const [assignedLecturerPage, setAssignedLecturerPage] = useState(1);
    const [assignedStudentPage, setAssignedStudentPage] = useState(1);

    const isStudentsInitialized = useRef(false);
    const isLecturersInitialized = useRef(false);

    // Queries
    const { data: course, isLoading: isCourseLoading } = useQuery({
        queryKey: ['admin-course-detail', id],
        queryFn: () => courseApi.getCourseDetail(id),
        enabled: !isNew
    });

    // Get all available lecturers for assignment
    const { data: allLecturers } = useQuery({
        queryKey: ['all-lecturers-search', lecturerSearch, lecturerPage],
        queryFn: () => getLecturers(), // Assuming this fetches enough for now, but in real app we'd paginate
    });

    // Get all available students for assignment
    const { data: allStudents } = useQuery({
        queryKey: ['all-students-search', studentSearch, studentPage],
        queryFn: () => getStudents(), // Assuming this fetches enough for now
    });

    // Get ALREADY ASSIGNED students
    const { data: courseStudents, isLoading: isStudentsLoading } = useQuery({
        queryKey: ['course-users', id, 'student'],
        queryFn: () => courseApi.getCourseUsers(id, { role: 'student', limit: 1000 }),
        enabled: !isNew && activeTab === 3
    });

    // Get ALREADY ASSIGNED lecturers
    const { data: courseLecturers, isLoading: isLecturersLoading } = useQuery({
        queryKey: ['course-users', id, 'lecturer'],
        queryFn: () => courseApi.getCourseUsers(id, { role: 'lecturer', limit: 1000 }),
        enabled: !isNew && activeTab === 2
    });

    const { data: exams, isLoading: isExamsLoading } = useExamsByCourse(id);
    const { data: exercisesData, isLoading: isExercisesLoading } = useExercisesByCourse(id);

    const exerciseList = exercisesData?.exercises || [];

    useEffect(() => {
        if (course) {
            setCourseData({
                name: course.name,
                code: course.code,
                semester: course.semester,
                startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
                endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '',
                description: course.description || '',
                lecturerId: course.lecturer?.id || ''
            });
        }
    }, [course]);

    useEffect(() => {
        isStudentsInitialized.current = false;
        isLecturersInitialized.current = false;
    }, [id]);

    useEffect(() => {
        if (courseStudents) {
            setSelectedStudentIds(courseStudents.users.map((u: any) => u.id));
        }
    }, [courseStudents]);

    useEffect(() => {
        if (courseLecturers) {
            setSelectedLecturerIds(courseLecturers.users.map((u: any) => u.id));
        }
    }, [courseLecturers]);

    // Mutations
    const createCourseMutation = useMutation({
        mutationFn: (data: any) => courseApi.createCourse(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            toast({ type: 'success', title: 'Thành công', message: 'Lớp học mới đã được tạo.' });
            router.push(`/admin/courses/${data.id}`);
        }
    });

    const updateCourseMutation = useMutation({
        mutationFn: (data: any) => courseApi.updateCourse(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            queryClient.invalidateQueries({ queryKey: ['admin-course-detail', id] });
            toast({ type: 'success', title: 'Thành công', message: 'Thông tin lớp học đã được cập nhật.' });
        }
    });

    const assignUsersMutation = useMutation({
        mutationFn: ({ userIds, role }: { userIds: string[], role: string }) =>
            courseApi.assignUsers(id, { userIds, role }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['course-users', id, variables.role] });
            toast({ type: 'success', title: 'Thành công', message: `Danh sách ${variables.role === 'student' ? 'sinh viên' : 'giảng viên'} đã được cập nhật.` });
        }
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isNew) {
            createCourseMutation.mutate(courseData);
        } else {
            updateCourseMutation.mutate(courseData);
        }
    };

    const toggleUserSelection = (userId: string, role: 'student' | 'lecturer') => {
        if (role === 'student') {
            setSelectedStudentIds(prev =>
                prev.includes(userId) ? prev.filter(i => i !== userId) : [...prev, userId]
            );
        } else {
            setSelectedLecturerIds(prev =>
                prev.includes(userId) ? prev.filter(i => i !== userId) : [...prev, userId]
            );
        }
    };

    const handleAssign = (role: 'student' | 'lecturer') => {
        assignUsersMutation.mutate({
            userIds: role === 'student' ? selectedStudentIds : selectedLecturerIds,
            role
        });
    };

    const removeUserMutation = useMutation({
        mutationFn: (userId: string) => courseApi.removeUser(id, userId),
        onSuccess: (_, userId) => {
            const role = activeTab === 2 ? 'lecturer' : 'student';
            queryClient.invalidateQueries({ queryKey: ['course-users', id, role] });
            toast({ type: 'info', title: 'Thông báo', message: 'Đã xóa người dùng khỏi lớp học.' });
        }
    });

    // Approval Mutations
    const approveExamMutation = useMutation({
        mutationFn: (examId: string) => examApi.approveExam(examId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exams', id] });
            toast({ type: 'success', title: 'Thành công', message: 'Kì thi đã được phê duyệt.' });
        }
    });

    const rejectExamMutation = useMutation({
        mutationFn: (examId: string) => examApi.rejectExam(examId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exams', id] });
            toast({ type: 'info', title: 'Đã từ chối', message: 'Kì thi đã bị từ chối phê duyệt.' });
        }
    });

    const approveExerciseMutation = useMutation({
        mutationFn: (exerciseId: string) => exerciseApi.approveExercise(exerciseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-exercises', id] });
            toast({ type: 'success', title: 'Thành công', message: 'Bài tập đã được phê duyệt.' });
        }
    });

    const rejectExerciseMutation = useMutation({
        mutationFn: (exerciseId: string) => exerciseApi.rejectExercise(exerciseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-exercises', id] });
            toast({ type: 'info', title: 'Đã từ chối', message: 'Bài tập đã bị từ chối phê duyệt.' });
        }
    });

    const filteredStudents = allStudents?.filter((s: any) =>
        s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (s.mssv && s.mssv.toLowerCase().includes(studentSearch.toLowerCase())) ||
        s.email.toLowerCase().includes(studentSearch.toLowerCase())
    );

    const filteredLecturers = allLecturers?.filter((l: any) =>
        l.fullName.toLowerCase().includes(lecturerSearch.toLowerCase()) ||
        l.email.toLowerCase().includes(lecturerSearch.toLowerCase())
    );

    // Pagination for ASSIGNED users
    const ASSIGNED_ITEMS_PER_PAGE = 10;
    const paginatedAssignedStudents = courseStudents?.users?.slice((assignedStudentPage - 1) * ASSIGNED_ITEMS_PER_PAGE, assignedStudentPage * ASSIGNED_ITEMS_PER_PAGE);
    const paginatedAssignedLecturers = courseLecturers?.users?.slice((assignedLecturerPage - 1) * ASSIGNED_ITEMS_PER_PAGE, assignedLecturerPage * ASSIGNED_ITEMS_PER_PAGE);

    const assignedStudentTotalPages = Math.ceil((courseStudents?.users?.length || 0) / ASSIGNED_ITEMS_PER_PAGE);
    const assignedLecturerTotalPages = Math.ceil((courseLecturers?.users?.length || 0) / ASSIGNED_ITEMS_PER_PAGE);

    // Pagination for MODAL users
    const MODAL_ITEMS_PER_PAGE = 8;
    const paginatedModalStudents = filteredStudents?.slice((studentPage - 1) * MODAL_ITEMS_PER_PAGE, studentPage * MODAL_ITEMS_PER_PAGE);
    const paginatedModalLecturers = filteredLecturers?.slice((lecturerPage - 1) * MODAL_ITEMS_PER_PAGE, lecturerPage * MODAL_ITEMS_PER_PAGE);

    const modalStudentTotalPages = Math.ceil((filteredStudents?.length || 0) / MODAL_ITEMS_PER_PAGE);
    const modalLecturerTotalPages = Math.ceil((filteredLecturers?.length || 0) / MODAL_ITEMS_PER_PAGE);

    const handleOpenAddModal = (role: 'student' | 'lecturer') => {
        setModalRole(role);
        setTempSelectedIds(role === 'student' ? [...selectedStudentIds] : [...selectedLecturerIds]);
        setIsAddModalOpen(true);
    };

    const handleConfirmAdd = () => {
        assignUsersMutation.mutate({ userIds: tempSelectedIds, role: modalRole });
        setIsAddModalOpen(false);
    };

    const getPageNumbers = (current: number, total: number) => {
        const pages: (number | string)[] = [];
        if (total <= 1) return [1];

        // Always include page 1
        pages.push(1);

        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);

        if (start > 2) {
            pages.push('...');
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < total - 1) {
            pages.push('...');
        }

        // Always include last page
        pages.push(total);

        return Array.from(new Set(pages));
    };

    if (!isNew && isCourseLoading) {
        return <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Loader2 className="animate-spin" size={40} color="var(--accent-purple)" /></div>;
    }

    return (
        <div className="page-container animate-in">
            <style jsx>{`
                .tab-btn {
                    padding: 12px 24px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-muted);
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .tab-btn:hover {
                    color: var(--text-primary);
                }
                .tab-btn.active {
                    color: var(--accent-purple-light);
                    border-bottom-color: var(--accent-purple);
                }
                .card-section {
                    background: rgba(30, 35, 48, 0.4);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                }
                .pagination-btn {
                    padding: 6px 12px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pagination-btn:hover:not(:disabled) {
                    border-color: var(--accent-purple);
                    color: var(--accent-purple-light);
                    background: rgba(124, 58, 237, 0.05);
                }
                .pagination-btn.active {
                    background: var(--accent-purple);
                    border-color: var(--accent-purple);
                    color: white;
                }
                .pagination-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .pagination-ellipsis {
                    color: var(--text-muted);
                    padding: 0 4px;
                }
                .jump-input {
                    width: 44px;
                    height: 32px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    text-align: center;
                    color: var(--text-primary);
                    font-size: 13px;
                }
                .jump-input:focus {
                    border-color: var(--accent-purple);
                    outline: none;
                }
            `}</style>

            <div className="page-header" style={{ marginBottom: 32 }}>
                <div>
                    <button className="btn btn-ghost" onClick={() => router.push('/admin/courses')} style={{ marginBottom: 12, padding: '4px 8px', marginLeft: -8 }}>
                        <ChevronLeft size={16} /> Quay lại danh sách
                    </button>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <GraduationCap size={32} color="var(--accent-purple)" /> {isNew ? 'Tạo lớp học mới' : `Lớp học: ${course?.name}`}
                    </h1>
                </div>
                {!isNew && (
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={updateCourseMutation.isPending}>
                            {updateCourseMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Lưu thay đổi
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
                <div className={`tab-btn ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}><Info size={18} /> Thông tin cơ bản</div>
                <div className={`tab-btn ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}><User size={18} /> Giảng viên</div>
                <div className={`tab-btn ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)}><Users size={18} /> Học sinh</div>
                <div className={`tab-btn ${activeTab === 4 ? 'active' : ''}`} onClick={() => setActiveTab(4)}><BookOpen size={18} /> Bài tập / Kì thi</div>
            </div>

            <div className="tab-content">
                {/* TAB 1: BASIC INFO */}
                {activeTab === 1 && (
                    <div className="animate-in">
                        <form onSubmit={handleSubmit}>
                            <div className="card-section">
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--accent-purple-light)' }}>Chi tiết lớp học</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Mã lớp <span className="text-red">*</span></label>
                                        <input className="input" required value={courseData.code} onChange={e => setCourseData({ ...courseData, code: e.target.value })} placeholder="VD: IT101" style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Học kỳ <span className="text-red">*</span></label>
                                        <input className="input" required value={courseData.semester} onChange={e => setCourseData({ ...courseData, semester: e.target.value })} placeholder="VD: HK2-2025" style={{ width: '100%' }} />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Tên lớp học <span className="text-red">*</span></label>
                                        <input className="input" required value={courseData.name} onChange={e => setCourseData({ ...courseData, name: e.target.value })} placeholder="VD: Lập trình C nâng cao" style={{ width: '100%' }} />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Mô tả ngắn</label>
                                        <textarea className="input" rows={4} value={courseData.description} onChange={e => setCourseData({ ...courseData, description: e.target.value })} placeholder="Nhập mô tả về khóa học..." style={{ width: '100%', height: 'auto', padding: '12px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Ngày bắt đầu</label>
                                        <div style={{ position: 'relative' }}>
                                            <Calendar size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input type="date" className="input" value={courseData.startDate} onChange={e => setCourseData({ ...courseData, startDate: e.target.value })} style={{ width: '100%', paddingLeft: 40 }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Ngày kết thúc</label>
                                        <div style={{ position: 'relative' }}>
                                            <Calendar size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input type="date" className="input" value={courseData.endDate} onChange={e => setCourseData({ ...courseData, endDate: e.target.value })} style={{ width: '100%', paddingLeft: 40 }} />
                                        </div>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Giảng viên phụ trách chính</label>
                                        <PremiumSelect 
                                            options={allLecturers ? allLecturers.map((l: any) => ({ value: l.id, label: `${l.fullName} (${l.email})` })) : []}
                                            value={courseData.lecturerId}
                                            onChange={(val: string) => setCourseData({ ...courseData, lecturerId: val })}
                                            placeholder="Chọn giảng viên..."
                                            icon={User}
                                        />
                                    </div>
                                </div>
                            </div>
                            {isNew && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                    <button type="button" className="btn btn-ghost" onClick={() => router.push('/admin/courses')}>Hủy</button>
                                    <button type="submit" className="btn btn-primary" disabled={createCourseMutation.isPending}>
                                        {createCourseMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Tạo lớp học
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                )}

                {/* TAB 2: LECTURER */}
                {activeTab === 2 && (
                    <div className="animate-in">
                        {isNew ? (
                            <div className="card-section" style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <User size={48} style={{ opacity: 0.2, marginBottom: 20 }} />
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Vui lòng tạo lớp học trước</h3>
                            </div>
                        ) : (
                            <div className="card-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <div>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-purple-light)' }}>Giảng viên phụ trách</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Danh sách giảng viên tham gia quản lý lớp học này.</p>
                                    </div>
                                    <button className="btn btn-primary" onClick={() => handleOpenAddModal('lecturer')} style={{ background: 'var(--accent-purple)' }}>
                                        <Plus size={16} /> Thêm giảng viên
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {isLecturersLoading ? (
                                        <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
                                    ) : !courseLecturers?.users || courseLecturers.users.length === 0 ? (
                                        <div style={{ padding: 60, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed var(--border)' }}>
                                            <User size={40} style={{ opacity: 0.1, marginBottom: 12 }} />
                                            <div style={{ color: 'var(--text-muted)' }}>Chưa có giảng viên nào được gán cho lớp học này.</div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                                                {paginatedAssignedLecturers.map((l: any) => (
                                                    <div key={l.id} style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                                                {l.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600 }}>{l.name}</div>
                                                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.email}</div>
                                                            </div>
                                                        </div>
                                                        <button className="btn btn-ghost" onClick={() => removeUserMutation.mutate(l.id)} style={{ color: 'var(--text-muted)' }} title="Gỡ khỏi lớp">
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {assignedLecturerTotalPages > 1 && (
                                                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <button className="pagination-btn" disabled={assignedLecturerPage === 1} onClick={() => setAssignedLecturerPage(p => p - 1)}>Trước</button>
                                                        {getPageNumbers(assignedLecturerPage, assignedLecturerTotalPages).map((n, i) => (
                                                            n === '...' ? <span key={`ellipsis-al-${i}`} className="pagination-ellipsis">...</span> :
                                                                <button key={`page-al-${n}`} className={`pagination-btn ${assignedLecturerPage === n ? 'active' : ''}`} onClick={() => setAssignedLecturerPage(n as number)}>{n}</button>
                                                        ))}
                                                        <button className="pagination-btn" disabled={assignedLecturerPage >= assignedLecturerTotalPages} onClick={() => setAssignedLecturerPage(p => p + 1)}>Sau</button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: STUDENTS */}
                {activeTab === 3 && (
                    <div className="animate-in">
                        {isNew ? (
                            <div className="card-section" style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <Users size={48} style={{ opacity: 0.2, marginBottom: 20 }} />
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Vui lòng tạo lớp học trước</h3>
                            </div>
                        ) : (
                            <div className="card-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <div>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-blue)' }}>Danh sách sinh viên</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Quản lý các sinh viên đã được ghi danh vào lớp học này.</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button className="btn btn-ghost" onClick={() => setIsImportModalOpen(true)} style={{ borderColor: 'var(--border)' }}>
                                            <FileText size={16} /> Import Excel
                                        </button>
                                        <button className="btn btn-primary" onClick={() => handleOpenAddModal('student')} style={{ background: 'var(--accent-blue)' }}>
                                            <Plus size={16} /> Thêm sinh viên
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {isStudentsLoading ? (
                                        <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
                                    ) : !courseStudents?.users || courseStudents.users.length === 0 ? (
                                        <div style={{ padding: 60, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed var(--border)' }}>
                                            <Users size={40} style={{ opacity: 0.1, marginBottom: 12 }} />
                                            <div style={{ color: 'var(--text-muted)' }}>Chưa có sinh viên nào trong lớp học này.</div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                                                {paginatedAssignedStudents.map((s: any) => (
                                                    <div key={s.id} style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                                                {s.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600 }}>{s.name}</div>
                                                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.mssv || 'N/A'} • {s.email}</div>
                                                            </div>
                                                        </div>
                                                        <button className="btn btn-ghost" onClick={() => removeUserMutation.mutate(s.id)} style={{ color: 'var(--text-muted)' }} title="Gỡ khỏi lớp">
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {assignedStudentTotalPages > 1 && (
                                                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <button className="pagination-btn" disabled={assignedStudentPage === 1} onClick={() => setAssignedStudentPage(p => p - 1)}>Trước</button>
                                                        {getPageNumbers(assignedStudentPage, assignedStudentTotalPages).map((n, i) => (
                                                            n === '...' ? <span key={`ellipsis-as-${i}`} className="pagination-ellipsis">...</span> :
                                                                <button key={`page-as-${n}`} className={`pagination-btn ${assignedStudentPage === n ? 'active' : ''}`} onClick={() => setAssignedStudentPage(n as number)}>{n}</button>
                                                        ))}
                                                        <button className="pagination-btn" disabled={assignedStudentPage >= assignedStudentTotalPages} onClick={() => setAssignedStudentPage(p => p + 1)}>Sau</button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: EXAMS & EXERCISES */}
                {activeTab === 4 && (
                    <div className="animate-in">
                        {isNew ? (
                            <div className="card-section" style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <BookOpen size={48} style={{ opacity: 0.2, marginBottom: 20 }} />
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Vui lòng tạo lớp học trước</h3>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                {/* Kì thi */}
                                <div className="card-section">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <Trophy size={20} color="var(--accent-purple-light)" /> Kì thi
                                        </h3>
                                        <span className="badge badge-purple">{exams?.length || 0} kì thi</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {isExamsLoading ? (
                                            <div style={{ padding: 20, textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
                                        ) : !exams || exams.length === 0 ? (
                                            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Chưa có kì thi nào cho lớp này.</div>
                                        ) : exams.map((exam: any) => (
                                            <div key={exam.id} style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ fontWeight: 700, fontSize: 15 }}>{exam.title}</div>
                                                        <span className={`badge ${exam.status === 'APPROVED' ? 'badge-green' : exam.status === 'PENDING' ? 'badge-orange' : 'badge-red'}`} style={{ fontSize: 9 }}>
                                                            {exam.status === 'APPROVED' ? 'Đã duyệt' : exam.status === 'PENDING' ? 'Chờ duyệt' : 'Đã từ chối'}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                                        {new Date(exam.startTime).toLocaleDateString('vi-VN')} • {exam.duration} phút
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    {exam.status === 'PENDING' && (
                                                        <>
                                                            <button 
                                                                className="btn btn-ghost" 
                                                                style={{ color: '#10B981', padding: '6px 12px', fontSize: 12, border: '1px solid rgba(16, 185, 129, 0.2)' }}
                                                                onClick={() => approveExamMutation.mutate(exam.id)}
                                                                disabled={approveExamMutation.isPending}
                                                            >
                                                                {approveExamMutation.isPending ? <Loader2 className="animate-spin" size={12} /> : <Check size={14} />} Duyệt
                                                            </button>
                                                    <button
                                                        className="btn btn-ghost"
                                                        style={{ color: '#EF4444', padding: '6px 12px', fontSize: 12, border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                                        onClick={() => rejectExamMutation.mutate(exam.id)}
                                                        disabled={rejectExamMutation.isPending}
                                                    >
                                                        {rejectExamMutation.isPending ? <Loader2 className="animate-spin" size={12} /> : <X size={14} />} Từ chối
                                                    </button>
                                                </>
                                                    )}
                                                <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => router.push(`/admin/exams/${exam.id}`)}><ArrowRight size={16} /></button>
                                            </div>
                                            </div>
                                        ))}
                                </div>
                            </div>

                                {/* Bài tập */}
                        <div className="card-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <FileText size={20} color="var(--accent-blue)" /> Bài tập
                                </h3>
                                <span className="badge badge-blue">{exerciseList.length} bài tập</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {isExercisesLoading ? (
                                    <div style={{ padding: 20, textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
                                ) : exerciseList.length === 0 ? (
                                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Chưa có bài tập nào cho lớp này.</div>
                                ) : exerciseList.map((ex: any) => (
                                    <div key={ex.id} style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ fontWeight: 700, fontSize: 15 }}>{ex.title}</div>
                                                <span className={`badge ${ex.status === 'APPROVED' ? 'badge-green' : ex.status === 'PENDING' ? 'badge-orange' : 'badge-red'}`} style={{ fontSize: 9 }}>
                                                    {ex.status === 'APPROVED' ? 'Đã duyệt' : ex.status === 'PENDING' ? 'Chờ duyệt' : 'Đã từ chối'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                                Độ khó: <span style={{ color: ex.difficulty === 'EASY' ? '#10B981' : ex.difficulty === 'MEDIUM' ? '#FBBF24' : '#EF4444' }}>{ex.difficulty}</span> • {ex.score} điểm
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {ex.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        className="btn btn-ghost"
                                                        style={{ color: '#10B981', padding: '6px 12px', fontSize: 12, border: '1px solid rgba(16, 185, 129, 0.2)' }}
                                                        onClick={() => approveExerciseMutation.mutate(ex.id)}
                                                        disabled={approveExerciseMutation.isPending}
                                                    >
                                                        {approveExerciseMutation.isPending ? <Loader2 className="animate-spin" size={12} /> : <Check size={14} />} Duyệt
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost"
                                                        style={{ color: '#EF4444', padding: '6px 12px', fontSize: 12, border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                                        onClick={() => rejectExerciseMutation.mutate(ex.id)}
                                                        disabled={rejectExerciseMutation.isPending}
                                                    >
                                                        {rejectExerciseMutation.isPending ? <Loader2 className="animate-spin" size={12} /> : <X size={14} />} Từ chối
                                                    </button>
                                                </>
                                            )}
                                            <button className="btn btn-ghost" style={{ padding: 8 }}><ArrowRight size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
                )}
        </div>

            {/* --- MODALS --- */ }
    {
        isAddModalOpen && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                <div className="animate-in" style={{ background: '#1E2330', border: '1px solid var(--border)', borderRadius: 24, width: '100%', maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: 20, fontWeight: 800 }}>Thêm {modalRole === 'student' ? 'sinh viên' : 'giảng viên'} vào lớp</h3>
                        <button onClick={() => setIsAddModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                    </div>

                    <div style={{ padding: '24px 32px', flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
                        <div style={{ position: 'relative', marginBottom: 24 }}>
                            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input"
                                placeholder={`Tìm kiếm ${modalRole === 'student' ? 'sinh viên' : 'giảng viên'}...`}
                                style={{ paddingLeft: 42, width: '100%' }}
                                value={modalRole === 'student' ? studentSearch : lecturerSearch}
                                onChange={e => {
                                    if (modalRole === 'student') { setStudentSearch(e.target.value); setStudentPage(1); }
                                    else { setLecturerSearch(e.target.value); setLecturerPage(1); }
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(modalRole === 'student' ? paginatedModalStudents : paginatedModalLecturers)?.map((u: any) => {
                                const isSelected = tempSelectedIds.includes(u.id);
                                return (
                                    <div
                                        key={u.id}
                                        onClick={() => setTempSelectedIds(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])}
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: 14,
                                            background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                                            border: `1px solid ${isSelected ? 'rgba(124, 58, 237, 0.3)' : 'transparent'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: isSelected ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                                                {u.fullName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{u.fullName}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email} {u.mssv ? `• ${u.mssv}` : ''}</div>
                                            </div>
                                        </div>
                                        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--accent-purple)' : 'var(--border)'}`, background: isSelected ? 'var(--accent-purple)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {isSelected && <Check size={12} color="#fff" strokeWidth={4} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination in Modal */}
                        {((modalRole === 'student' ? modalStudentTotalPages : modalLecturerTotalPages) || 0) > 1 && (
                            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
                                <button className="pagination-btn" disabled={(modalRole === 'student' ? studentPage : lecturerPage) === 1} onClick={() => modalRole === 'student' ? setStudentPage(p => p - 1) : setLecturerPage(p => p - 1)}>Trước</button>
                                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Trang {modalRole === 'student' ? studentPage : lecturerPage} / {modalRole === 'student' ? modalStudentTotalPages : modalLecturerTotalPages}</span>
                                <button className="pagination-btn" disabled={(modalRole === 'student' ? studentPage : lecturerPage) >= (modalRole === 'student' ? modalStudentTotalPages : modalLecturerTotalPages)} onClick={() => modalRole === 'student' ? setStudentPage(p => p + 1) : setLecturerPage(p => p + 1)}>Sau</button>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <div style={{ marginRight: 'auto', fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>Đã chọn: <span style={{ color: 'var(--accent-purple-light)', fontWeight: 700, marginLeft: 6 }}>{tempSelectedIds.length} người</span></div>
                        <button className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)}>Hủy</button>
                        <button className="btn btn-primary" style={{ background: 'var(--accent-purple)' }} onClick={handleConfirmAdd} disabled={assignUsersMutation.isPending}>
                            {assignUsersMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Xác nhận thêm
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    {
        isImportModalOpen && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                <div className="animate-in" style={{ background: '#1E2330', border: '1px solid var(--border)', borderRadius: 24, width: '100%', maxWidth: 500, padding: 32, textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <FileText size={32} />
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Import danh sách sinh viên</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Tải lên file Excel (.xlsx, .csv) chứa danh sách MSSV hoặc Email để ghi danh hàng loạt vào lớp học.</p>

                    <div style={{ border: '2px dashed var(--border)', borderRadius: 16, padding: 40, cursor: 'pointer', transition: 'all 0.2s' }}>
                        <Plus size={24} style={{ opacity: 0.3, marginBottom: 12 }} />
                        <div style={{ fontWeight: 600, fontSize: 14 }}>Kéo thả file hoặc click để chọn</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Hỗ trợ .xlsx, .csv (Tối đa 10MB)</div>
                    </div>

                    <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
                        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsImportModalOpen(false)}>Đóng</button>
                        <button className="btn btn-primary" style={{ flex: 1, background: 'var(--accent-blue)' }}>Bắt đầu tải lên</button>
                    </div>
                </div>
            </div>
        )
    }
        </div >
    );
}
