'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { examApi } from '@/api/exam.api';
import { bankApi } from '@/api/bank.api';
import { getLanguages } from '@/api/problems.api';
import { useExamDetail } from '@/src/hooks/useExams';
import { 
    ChevronLeft, 
    Save, 
    Loader2, 
    Clock, 
    Calendar, 
    Trophy, 
    Settings,
    AlertCircle,
    Plus,
    Trash2,
    Info,
    Check,
    Database,
    ChevronDown
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

// --- Custom Bank Select ---
const BankSelect = ({ value, onChange, options }: any) => {
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

    const selectedOption = options.find((o: any) => String(o.id) === String(value));

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    height: 48, 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 12, 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0 16px', 
                    cursor: 'pointer',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                    borderColor: isOpen ? 'var(--accent-cyan)' : 'var(--border)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: selectedOption ? '#fff' : 'var(--text-muted)' }}>
                    <Database size={18} style={{ opacity: 0.6 }} />
                    <span style={{ fontSize: 14 }}>{selectedOption ? selectedOption.name : 'Chọn ngân hàng đề thi...'}</span>
                </div>
                <ChevronDown size={18} style={{ opacity: 0.4, transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
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
                        {options.length === 0 ? (
                            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Không có ngân hàng nào.</div>
                        ) : options.map((opt: any) => (
                            <div 
                                key={opt.id}
                                onClick={() => { onChange(opt.id); setIsOpen(false); }}
                                style={{ 
                                    padding: '12px 14px', 
                                    borderRadius: 10, 
                                    cursor: 'pointer',
                                    background: value === opt.id ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                                    color: value === opt.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = value === opt.id ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255,255,255,0.03)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = value === opt.id ? 'rgba(34, 211, 238, 0.1)' : 'transparent'}
                            >
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.name}</div>
                                <div style={{ fontSize: 11, opacity: 0.6 }}>Loại: {opt.type}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

interface PageProps {
    params: Promise<{ id: string }>;
}

const toLocalISO = (dateStr: string) => {
    const date = new Date(dateStr);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export default function EditExamPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: exam, isLoading: isLoadingExam } = useExamDetail(id);
    const [banks, setBanks] = useState<any[]>([]);
    const [languages, setLanguages] = useState<any[]>([]);
    const [isLoadingBanks, setIsLoadingBanks] = useState(true);
    const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        startTime: '',
        duration: 90 as number | string,
        courseId: '',
        bankId: null as number | null,
        shuffle: true,
        isPerUserRandom: true,
        generationRules: [] as any[],
        allowedLanguageIds: [] as number[]
    });

    useEffect(() => {
        loadBanks();
        loadLanguages();
    }, []);

    const loadLanguages = async () => {
        try {
            const data = await getLanguages();
            setLanguages(data);
        } catch (error) {
            toast({ type: 'error', title: 'Lỗi', message: 'Không thể tải danh sách ngôn ngữ.' });
        } finally {
            setIsLoadingLanguages(false);
        }
    };

    useEffect(() => {
        if (exam) {
            setFormData({
                title: exam.title,
                startTime: toLocalISO(exam.startTime),
                duration: exam.duration,
                courseId: exam.course?.id || '',
                bankId: exam.bank?.id ? Number(exam.bank.id) : null,
                shuffle: exam.shuffle ?? true,
                isPerUserRandom: exam.isPerUserRandom ?? true,
                generationRules: exam.generationRules || [],
                allowedLanguageIds: exam.allowedLanguageIds || []
            });
        }
    }, [exam]);

    const addRule = () => {
        if (!formData.bankId) {
            toast({ type: 'warning', title: 'Thiếu thông tin', message: 'Vui lòng chọn ngân hàng đề trước.' });
            return;
        }
        setFormData({
            ...formData,
            generationRules: [
                ...formData.generationRules,
                { bankId: formData.bankId, difficulty: 'EASY', count: 5, scorePerQuestion: 10 }
            ]
        });
    };

    const removeRule = (index: number) => {
        const newRules = [...formData.generationRules];
        newRules.splice(index, 1);
        setFormData({ ...formData, generationRules: newRules });
    };

    const updateRule = (index: number, field: string, value: any) => {
        const newRules = [...formData.generationRules];
        newRules[index] = { ...newRules[index], [field]: value };
        setFormData({ ...formData, generationRules: newRules });
    };

    const loadBanks = async () => {
        try {
            const data = await bankApi.getBanks();
            setBanks(data);
        } catch (error) {
            toast({ type: 'error', title: 'Lỗi', message: 'Không thể tải ngân hàng đề thi.' });
        } finally {
            setIsLoadingBanks(false);
        }
    };

    const updateMutation = useMutation({
        mutationFn: (data: any) => examApi.updateExam(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exam', id] });
            queryClient.invalidateQueries({ queryKey: ['exams', formData.courseId] });
            toast({ type: 'success', title: 'Thành công', message: 'Kì thi đã được cập nhật.' });
            router.push(`/lecturer/courses/${formData.courseId}`);
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Lỗi', message: error.response?.data?.message || 'Không thể cập nhật kì thi.' });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.startTime) {
            toast({ type: 'warning', title: 'Thiếu thông tin', message: 'Vui lòng nhập đầy đủ tiêu đề và thời gian bắt đầu.' });
            return;
        }

        if (formData.isPerUserRandom && formData.generationRules.length === 0) {
            toast({ type: 'warning', title: 'Thiếu quy tắc', message: 'Vui lòng thêm ít nhất một quy tắc bốc đề.' });
            return;
        }

        updateMutation.mutate(formData);
    };

    if (isLoadingExam) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="var(--accent-cyan)" />
        </div>
    );

    return (
        <div className="page-container animate-in">
            <style jsx>{`
                .form-card {
                    background: rgba(30, 35, 48, 0.4);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 40px;
                    max-width: 800px;
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
                .form-input {
                    width: 100%;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 0 16px;
                    color: #fff;
                    font-size: 15px;
                    transition: all 0.2s;
                }
                .form-input:focus {
                    border-color: var(--accent-cyan);
                    background: rgba(34, 211, 238, 0.05);
                    outline: none;
                }
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
                }
                .toggle-switch {
                    width: 44px;
                    height: 24px;
                    background: #334155;
                    border-radius: 12px;
                    position: relative;
                    transition: all 0.2s;
                }
                .toggle-switch.active {
                    background: var(--accent-cyan);
                }
                .toggle-knob {
                    width: 18px;
                    height: 18px;
                    background: #fff;
                    border-radius: 50%;
                    position: absolute;
                    top: 3px;
                    left: 3px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .toggle-switch.active .toggle-knob {
                    left: 23px;
                }
            `}</style>

            <div style={{ marginBottom: 32 }}>
                <button className="btn btn-ghost" onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', marginLeft: -12, borderRadius: 12 }}>
                    <ChevronLeft size={18} /> Quay lại
                </button>
            </div>

            <div className="page-header" style={{ marginBottom: 40, textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: 16, background: 'rgba(34, 211, 238, 0.1)', borderRadius: 20, marginBottom: 20 }}>
                    <Settings size={32} color="var(--accent-cyan)" />
                </div>
                <h1 className="page-title">Chỉnh sửa Kì thi</h1>
                <p className="page-subtitle">Cập nhật cấu trúc kì thi, thời gian và các quy tắc làm bài</p>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Tên kì thi</label>
                        <input 
                            className="form-input" 
                            placeholder="Ví dụ: Kiểm tra giữa kỳ Cấu trúc dữ liệu"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Ngân hàng đề thi</label>
                        {isLoadingBanks ? (
                            <div style={{ height: 48, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13 }}>
                                <Loader2 size={16} className="animate-spin" /> Đang tải ngân hàng...
                            </div>
                        ) : (
                            <BankSelect 
                                value={formData.bankId} 
                                onChange={(id: number) => setFormData({...formData, bankId: id})} 
                                options={banks} 
                            />
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Ngôn ngữ cho phép (Mặc định: Tất cả)</label>
                        {isLoadingLanguages ? (
                            <div style={{ height: 48, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13 }}>
                                <Loader2 size={16} className="animate-spin" /> Đang tải ngôn ngữ...
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                                {languages.map((lang: any) => {
                                    const isActive = formData.allowedLanguageIds.includes(lang.id);
                                    return (
                                        <button
                                            key={lang.id}
                                            type="button"
                                            onClick={() => {
                                                const newIds = isActive 
                                                    ? formData.allowedLanguageIds.filter(id => id !== lang.id)
                                                    : [...formData.allowedLanguageIds, lang.id];
                                                setFormData({ ...formData, allowedLanguageIds: newIds });
                                            }}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: 8,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                transition: 'all 0.2s',
                                                background: isActive ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                                                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                                border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border)'}`,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {lang.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div className="form-group">
                            <label className="form-label"><Calendar size={16} /> Thời gian bắt đầu</label>
                            <input 
                                type="datetime-local" 
                                className="form-input"
                                value={formData.startTime}
                                onChange={e => setFormData({...formData, startTime: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label"><Clock size={16} /> Thời lượng (phút)</label>
                            <input 
                                type="number" 
                                className="form-input"
                                value={formData.duration}
                                onChange={e => setFormData({...formData, duration: e.target.value === '' ? '' : (parseInt(e.target.value) || 0) as any})}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
                        <div className="toggle-card" onClick={() => setFormData({...formData, shuffle: !formData.shuffle})}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>Xáo trộn câu hỏi</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mỗi sinh viên sẽ có thứ tự câu hỏi khác nhau</div>
                            </div>
                            <div className={`toggle-switch ${formData.shuffle ? 'active' : ''}`}>
                                <div className="toggle-knob" />
                            </div>
                        </div>

                        <div className="toggle-card" onClick={() => setFormData({...formData, isPerUserRandom: !formData.isPerUserRandom})}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>Đề riêng biệt (Per User Random)</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tự động bốc câu hỏi từ ngân hàng đề cho từng sinh viên</div>
                            </div>
                            <div className={`toggle-switch ${formData.isPerUserRandom ? 'active' : ''}`}>
                                <div className="toggle-knob" />
                            </div>
                        </div>

                        {formData.isPerUserRandom && (
                            <div className="card" style={{ marginTop: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: 20, borderRadius: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Settings size={18} color="var(--accent-cyan)" /> Quy tắc bốc đề
                                    </div>
                                    <button type="button" className="btn btn-ghost" style={{ fontSize: 12, color: 'var(--accent-cyan)' }} onClick={addRule}>
                                        <Plus size={14} /> Thêm quy tắc
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {formData.generationRules.length === 0 ? (
                                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, border: '1px dashed var(--border)', borderRadius: 12 }}>
                                            Chưa có quy tắc nào. Vui lòng thêm quy tắc để sinh đề.
                                        </div>
                                    ) : formData.generationRules.map((rule: any, idx: number) => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 50px', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12 }}>
                                            <div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Độ khó</div>
                                                <select 
                                                    className="form-input" 
                                                    style={{ height: 36, fontSize: 13, padding: '0 8px' }}
                                                    value={rule.difficulty}
                                                    onChange={e => updateRule(idx, 'difficulty', e.target.value)}
                                                >
                                                    <option value="EASY">Dễ (EASY)</option>
                                                    <option value="MEDIUM">Trung bình (MEDIUM)</option>
                                                    <option value="HARD">Khó (HARD)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Số câu</div>
                                                <input 
                                                    type="number" 
                                                    className="form-input" 
                                                    style={{ height: 36, fontSize: 13 }}
                                                    value={rule.count}
                                                    onChange={e => updateRule(idx, 'count', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Điểm/Câu</div>
                                                <input 
                                                    type="number" 
                                                    className="form-input" 
                                                    style={{ height: 36, fontSize: 13 }}
                                                    value={rule.scorePerQuestion}
                                                    onChange={e => updateRule(idx, 'scorePerQuestion', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                        <button type="button" className="btn btn-ghost" style={{ color: 'var(--accent-red)', padding: 8, borderRadius: 10 }} onClick={() => removeRule(idx)}>
                                            <Trash2 size={18} />
                                        </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 40, padding: 20, background: 'rgba(59, 130, 246, 0.05)', borderRadius: 16, border: '1px solid rgba(59, 130, 246, 0.1)', display: 'flex', gap: 16 }}>
                        <Info size={20} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                            Sau khi lưu thay đổi, kì thi sẽ quay lại trạng thái <strong>CHỜ DUYỆT</strong>. Bạn cần chờ Quản trị viên hệ thống phê duyệt lại.
                        </p>
                    </div>

                    <div style={{ marginTop: 40, display: 'flex', gap: 12 }}>
                        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => router.back()}>Hủy bỏ</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2, background: 'var(--accent-cyan)', color: '#000', fontWeight: 700 }} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} style={{ marginRight: 8 }} />} 
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
