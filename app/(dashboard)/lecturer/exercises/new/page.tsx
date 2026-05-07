'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseApi } from '@/api/exercise.api';
import { getLecturerProblems, getProblemDetail } from '@/api/problems.api';
import { 
    ChevronLeft, 
    Save, 
    Loader2, 
    FileText, 
    Target,
    Zap,
    Info,
    Check,
    Tag,
    Award,
    Database,
    Search,
    X,
    ArrowRight
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

// --- Problem Selection Modal ---
const ProblemSelectionModal = ({ isOpen, onClose, onSelect }: any) => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [problems, setProblems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (isOpen) {
            loadProblems();
        }
    }, [isOpen, search, page]);

    const loadProblems = async () => {
        setIsLoading(true);
        try {
            const res = await getLecturerProblems({ search, page, limit: 8 });
            setProblems(res.items);
            setTotal(res.total);
        } catch (error) {
            toast({ type: 'error', title: 'Lỗi', message: 'Không thể tải danh sách bài tập.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div className="animate-in" style={{ background: '#1E2330', border: '1px solid var(--border)', borderRadius: 24, width: '100%', maxWidth: 700, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800 }}>Chọn bài tập từ Ngân hàng</h3>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>

                <div style={{ padding: '24px 32px', flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
                    <div style={{ position: 'relative', marginBottom: 24 }}>
                        <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            className="input" 
                            placeholder="Tìm kiếm theo tiêu đề..." 
                            style={{ paddingLeft: 42, width: '100%' }}
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>

                    {isLoading ? (
                        <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {problems.map((p: any) => (
                                <div 
                                    key={p.id} 
                                    className="toggle-card" 
                                    style={{ padding: '14px 20px' }}
                                    onClick={() => onSelect(p.id)}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ fontWeight: 700, fontSize: 15 }}>{p.title}</div>
                                            <span className={`badge ${p.difficulty === 'EASY' ? 'badge-green' : p.difficulty === 'MEDIUM' ? 'badge-orange' : 'badge-red'}`} style={{ fontSize: 9 }}>
                                                {p.difficulty}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                            Loại: {p.type} • Trạng thái: {p.status}
                                        </div>
                                    </div>
                                    <ArrowRight size={18} color="var(--accent-cyan)" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <style jsx>{`
                .toggle-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 16px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .toggle-card:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: var(--accent-cyan);
                }
            `}</style>
        </div>
    );
};

export default function NewExercisePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseId = searchParams.get('courseId');
    const queryClient = useQueryClient();

    const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'MEDIUM',
        score: 10,
        courseId: courseId || '',
        languages: ['javascript', 'python', 'cpp', 'java'],
        tags: [] as string[],
        testCases: [] as any[]
    });

    const [tagInput, setTagInput] = useState('');

    const handleSelectFromBank = async (problemId: string) => {
        setIsImporting(true);
        setIsProblemModalOpen(false);
        try {
            const detail = await getProblemDetail(problemId);
            const { problem, testcases, versions } = detail;
            
            // Flatten description blocks
            const fullDesc = versions?.[0]?.description?.map((b: any) => b.content).join('\n\n') || '';
            
            setFormData({
                ...formData,
                title: problem.title,
                description: fullDesc,
                difficulty: problem.difficulty?.toLowerCase() as any,
                tags: problem.tags || [],
                testCases: testcases.map(tc => ({
                    input: tc.input,
                    output: tc.expectedOutput,
                    hidden: tc.isHidden
                }))
            });
            
            toast({ type: 'success', title: 'Đã nhập dữ liệu', message: 'Thông tin bài tập đã được lấy từ ngân hàng.' });
        } catch (error) {
            toast({ type: 'error', title: 'Lỗi', message: 'Không thể lấy chi tiết bài tập.' });
        } finally {
            setIsImporting(false);
        }
    };

    const createMutation = useMutation({
        mutationFn: (data: any) => exerciseApi.createExercise(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-exercises', courseId] });
            toast({ type: 'success', title: 'Thành công', message: 'Bài tập mới đã được tạo và đang chờ phê duyệt.' });
            router.push(`/lecturer/courses/${courseId}`);
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Lỗi', message: error.response?.data?.message || 'Không thể tạo bài tập.' });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) {
            toast({ type: 'warning', title: 'Thiếu thông tin', message: 'Vui lòng nhập tiêu đề bài tập.' });
            return;
        }

        // Clean up data for BE
        const payload = {
            ...formData,
            difficulty: formData.difficulty.toLowerCase(),
            courseId: formData.courseId || undefined,
            score: Number(formData.score),
            testCases: formData.testCases.length > 0 ? formData.testCases : undefined
        };

        createMutation.mutate(payload);
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({...formData, tags: [...formData.tags, tagInput.trim()]});
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData({...formData, tags: formData.tags.filter(t => t !== tag)});
    };

    return (
        <div className="page-container animate-in">
            <style jsx>{`
                .form-card {
                    background: rgba(30, 35, 48, 0.4);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 40px;
                    max-width: 900px;
                    margin: 0 auto;
                    backdrop-filter: blur(10px);
                }
                .form-group {
                    margin-bottom: 24px;
                }
                .form-label {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-muted);
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .form-input, .form-textarea {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 12px 16px;
                    color: #fff;
                    font-size: 15px;
                    transition: all 0.2s;
                }
                .form-textarea {
                    min-height: 120px;
                    resize: vertical;
                }
                .form-input:focus, .form-textarea:focus {
                    border-color: var(--accent-cyan);
                    background: rgba(34, 211, 238, 0.05);
                    outline: none;
                }
                .difficulty-btn {
                    padding: 10px 16px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid var(--border);
                    background: transparent;
                    color: var(--text-muted);
                    flex: 1;
                }
                .difficulty-btn.active.EASY { background: rgba(16, 185, 129, 0.1); border-color: #10B981; color: #10B981; }
                .difficulty-btn.active.MEDIUM { background: rgba(245, 158, 11, 0.1); border-color: #F59E0B; color: #F59E0B; }
                .difficulty-btn.active.HARD { background: rgba(239, 68, 68, 0.1); border-color: #EF4444; color: #EF4444; }
                
                .tag-chip {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 4px 10px;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <button className="btn btn-ghost" onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', marginLeft: -12, borderRadius: 12 }}>
                    <ChevronLeft size={18} /> Quay lại
                </button>

                <button 
                    className="btn btn-ghost" 
                    onClick={() => setIsProblemModalOpen(true)}
                    style={{ border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', background: 'rgba(34, 211, 238, 0.05)', borderRadius: 12, padding: '8px 20px' }}
                >
                    <Database size={18} style={{ marginRight: 8 }} /> Chọn từ Ngân hàng Bài tập
                </button>
            </div>

            <div className="page-header" style={{ marginBottom: 40, textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: 16, background: 'rgba(34, 211, 238, 0.1)', borderRadius: 20, marginBottom: 20 }}>
                    <FileText size={32} color="var(--accent-cyan)" />
                </div>
                <h1 className="page-title">Soạn thảo Bài tập mới</h1>
                <p className="page-subtitle">Xây dựng nội dung bài tập, thiết lập độ khó và điểm số</p>
            </div>

            {isImporting ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--accent-cyan)" style={{ marginBottom: 20 }} />
                    <p style={{ color: 'var(--text-muted)' }}>Đang lấy dữ liệu từ ngân hàng...</p>
                </div>
            ) : (
                <div className="form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Tiêu đề bài tập</label>
                            <input 
                                className="form-input" 
                                placeholder="Ví dụ: Thuật toán tìm kiếm nhị phân"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mô tả & Yêu cầu</label>
                            <textarea 
                                className="form-textarea" 
                                placeholder="Mô tả chi tiết các yêu cầu của bài tập, định dạng đầu vào/đầu ra..."
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <div className="form-group">
                                <label className="form-label"><Target size={16} /> Độ khó dự kiến</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {['EASY', 'MEDIUM', 'HARD'].map(d => (
                                        <button 
                                            key={d}
                                            type="button" 
                                            className={`difficulty-btn ${formData.difficulty?.toUpperCase() === d ? 'active ' + d : ''}`}
                                            onClick={() => setFormData({...formData, difficulty: d as any})}
                                        >
                                            {d === 'EASY' ? 'Dễ' : d === 'MEDIUM' ? 'Vừa' : 'Khó'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label"><Award size={16} /> Điểm số</label>
                                <input 
                                    type="number" 
                                    className="form-input"
                                    value={formData.score}
                                    onChange={e => setFormData({...formData, score: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label"><Tag size={16} /> Gắn thẻ (Tags)</label>
                            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                                <input 
                                    className="form-input" 
                                    placeholder="Nhập tag và nhấn Thêm..."
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                />
                                <button type="button" className="btn btn-ghost" style={{ padding: '0 20px', borderRadius: 12, border: '1px solid var(--border)' }} onClick={addTag}>Thêm</button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {formData.tags.map(tag => (
                                    <div key={tag} className="tag-chip">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}>×</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {formData.testCases.length > 0 && (
                            <div style={{ marginTop: 24, padding: 20, background: 'rgba(16, 185, 129, 0.05)', borderRadius: 16, border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', gap: 16 }}>
                                <Check size={20} color="#10B981" style={{ flexShrink: 0 }} />
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                    Đã nhập <strong>{formData.testCases.length} Test Cases</strong> từ bài tập gốc. Bạn có thể thay đổi chúng sau khi lưu bài tập này.
                                </p>
                            </div>
                        )}

                        <div style={{ marginTop: 40, padding: 20, background: 'rgba(34, 211, 238, 0.05)', borderRadius: 16, border: '1px solid rgba(34, 211, 238, 0.1)', display: 'flex', gap: 16 }}>
                            <Zap size={20} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                Sau khi tạo bài tập này, bạn có thể tiếp tục thêm các <strong>Test Cases</strong> để hệ thống tự động chấm điểm bài làm của sinh viên.
                            </p>
                        </div>

                        <div style={{ marginTop: 40, display: 'flex', gap: 12 }}>
                            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => router.back()}>Hủy bỏ</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2, background: 'var(--accent-cyan)', color: '#000', fontWeight: 700 }} disabled={createMutation.isPending}>
                                {createMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} style={{ marginRight: 8 }} />} 
                                Tạo bài tập & Tiếp tục
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <ProblemSelectionModal 
                isOpen={isProblemModalOpen} 
                onClose={() => setIsProblemModalOpen(false)} 
                onSelect={handleSelectFromBank} 
            />
        </div>
    );
}
