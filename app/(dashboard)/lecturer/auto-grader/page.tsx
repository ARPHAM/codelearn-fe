
'use client';
// Refactored with dynamic status monitoring from backend

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLecturerProblems } from '@/src/hooks/useProblems';
import ConfirmModal from '@/app/components/ui/ConfirmModal';
import { submissionsApi, Submission } from '@/src/api/submissions.api';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  RefreshCcw,
  Clock,
  Cpu,
  Database as MemoryIcon,
  Zap,
  ClipboardList,
  LayoutGrid,
  ChevronRight,
  Code,
  Trophy,
  History,
  Settings2,
  ExternalLink,
  MousePointer2
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string; label: string; icon: any }> = {
    accepted: { color: 'var(--accent-green)', label: 'Đạt (Accepted)', icon: CheckCircle2 },
    wrong_answer: { color: 'var(--accent-red)', label: 'Sai kết quả', icon: XCircle },
    time_limit: { color: 'var(--accent-red)', label: 'Quá thời gian', icon: Clock },
    memory_limit: { color: 'var(--accent-red)', label: 'Tràn bộ nhớ', icon: AlertCircle },
    runtime_error: { color: 'var(--accent-red)', label: 'Lỗi thực thi', icon: XCircle },
    compile_error: { color: 'var(--accent-red)', label: 'Lỗi biên dịch', icon: XCircle },
    queued: { color: 'var(--text-muted)', label: 'Đang chờ', icon: RefreshCcw },
    pending: { color: 'var(--text-muted)', label: 'Đang chờ', icon: RefreshCcw },
    running: { color: 'var(--accent-purple)', label: 'Đang chấm', icon: RefreshCcw },
  };
  const c = cfg[status] || { color: 'var(--accent-red)', label: 'Thất bại', icon: XCircle };
  const Icon = c.icon;
  return (
    <span className="badge" style={{ 
      background: 'rgba(255,255,255,0.03)', 
      color: c.color, 
      border: `1px solid ${c.color}33`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      fontSize: 11,
      fontWeight: 600
    }}>
      <Icon size={14} className={(status === 'running' || status === 'queued') ? 'spin' : ''} />
      {c.label}
    </span>
  );
}

export default function AutoGraderPage() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [problemSearch, setProblemSearch] = useState('');
  const [debouncedProblemSearch, setDebouncedProblemSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [debouncedStudentSearch, setDebouncedStudentSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isConfirmRegradeOpen, setIsConfirmRegradeOpen] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const pageSize = 15;
  const queryClient = useQueryClient();

  const regradeMutation = useMutation({
    mutationFn: (exerciseId: string) => submissionsApi.regradeExercise(exerciseId),
    onSuccess: (data) => {
      setIsConfirmRegradeOpen(false);
      // Automatically refresh list to show QUEUED status
      setTimeout(() => refetch(), 1000);
    },
    onError: (err) => {
      console.error(err);
      setIsConfirmRegradeOpen(false);
      alert('Có lỗi xảy ra khi yêu cầu chấm lại.');
    }
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedStudentSearch(studentSearch);
      setCurrentPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(handler);
  }, [studentSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProblemSearch(problemSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [problemSearch]);

  // 1. Fetch lecturer's problems
  const { data: problemsData, isLoading: loadingProblems } = useLecturerProblems({
    search: debouncedProblemSearch,
    limit: 50
  });

  // 2. Fetch submissions for selected exercise
  const { data: submissionsData, isLoading: loadingSubmissions, refetch, isPlaceholderData } = useQuery({
    queryKey: ['exercise-submissions', selectedExerciseId, debouncedStudentSearch, currentPage],
    queryFn: async () => {
      const resp = await submissionsApi.getExerciseSubmissions(selectedExerciseId, { 
          search: debouncedStudentSearch,
          page: currentPage,
          limit: pageSize
      });
      return resp;
    },
    enabled: !!selectedExerciseId,
    placeholderData: (previousData) => previousData, // Keep old data while fetching new
  });

  const activeSubmissions: Submission[] = submissionsData?.submissions || [];
  const selectedProblem = problemsData?.items?.find((p: any) => p.id === selectedExerciseId);
  const selectedSubmission = activeSubmissions.find(s => s.id === selectedSubmissionId);

  // Global summary stats from server
  const summary = submissionsData?.summary || { totalSubmissions: 0, passRate: 0, averageScore: 0 };

  // Filtered problems for modal
  const filteredProblems = problemsData?.items || [];

  const handleSelectProblem = (id: string) => {
    setSelectedExerciseId(id);
    setSelectedSubmissionId(null);
    setIsProblemModalOpen(false);
  };

  return (
    <div className="page-container animate-in" style={{ paddingBottom: 40 }}>
      {/* Dynamic Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{ 
                width: 40, height: 40, borderRadius: 12, 
                background: 'var(--gradient-purple)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-glow-purple)'
            }}>
                <Zap size={24} color="white" fill="white" />
            </div>
            <h1 className="page-title" style={{ margin: 0 }}>
                {selectedProblem ? `Monitoring: ${selectedProblem.title}` : 'Auto-Grader Workbench'}
            </h1>
          </div>
          <p className="page-subtitle">
            {selectedProblem ? `Đang giám sát các lượt nộp bài cho thử thách ${selectedProblem.slug}` : 'Quản lý và theo dõi kết quả chấm điểm tự động cho các bài tập của bạn'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsProblemModalOpen(true)}
            style={{ gap: 8, height: 44, padding: '0 20px', borderRadius: 12, border: '1px solid var(--border)' }}
          >
            <LayoutGrid size={18} />
            <span>{selectedProblem ? 'Đổi bài tập' : 'Chọn bài tập'}</span>
          </button>
          
          {selectedProblem && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                  className="btn btn-secondary" 
                  onClick={() => setIsConfirmRegradeOpen(true)}
                  disabled={loadingSubmissions || regradeMutation.isPending}
                  style={{ gap: 8, height: 44, padding: '0 20px', borderRadius: 12, border: '1px solid rgba(251, 191, 36, 0.3)', color: 'var(--accent-yellow)' }}
              >
                  <Zap size={18} className={regradeMutation.isPending ? 'spin' : ''} />
                  <span>Chấm lại hàng loạt</span>
              </button>
              
              <button 
                  className="btn btn-primary" 
                  onClick={() => refetch()}
                  disabled={loadingSubmissions || regradeMutation.isPending}
                  style={{ gap: 8, height: 44, padding: '0 20px', borderRadius: 12 }}
              >
                  <RefreshCcw size={18} className={loadingSubmissions ? 'spin' : ''} />
                  <span>Cập nhật</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {!selectedExerciseId ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', textAlign: 'center' }}>
            <div style={{ 
                width: 120, height: 120, borderRadius: '50%', 
                background: 'rgba(139, 92, 246, 0.05)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24, border: '1px dashed rgba(139, 92, 246, 0.2)'
            }}>
                <ClipboardList size={60} color="var(--accent-purple-light)" style={{ opacity: 0.5 }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Sẵn sàng giám sát?</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, lineHeight: 1.6, marginBottom: 32 }}>
                Chọn một bài tập từ danh sách của bạn để xem lịch sử nộp bài, phân tích kết quả thực thi và quản lý điểm số của sinh viên.
            </p>
            <button 
                className="btn btn-primary" 
                onClick={() => setIsProblemModalOpen(true)}
                style={{ padding: '14px 32px', fontSize: 16, fontWeight: 700, borderRadius: 16 }}
            >
                Bắt đầu ngay
            </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Quick Stats & Context Card */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <History size={24} color="var(--accent-purple)" />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Tổng lượt nộp</div>
                        <div style={{ fontSize: 20, fontWeight: 800 }}>{summary.totalSubmissions}</div>
                    </div>
                </div>
                <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(34, 211, 238, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={24} color="var(--accent-cyan)" />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Tỷ lệ đạt</div>
                        <div style={{ fontSize: 20, fontWeight: 800 }}>{summary.passRate}%</div>
                    </div>
                </div>
                <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(251, 191, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trophy size={24} color="var(--accent-yellow)" />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Điểm trung bình</div>
                        <div style={{ fontSize: 20, fontWeight: 800 }}>{summary.averageScore}</div>
                    </div>
                </div>
                <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Settings2 size={24} color="var(--accent-red)" />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Giới hạn thời gian</div>
                        <div style={{ fontSize: 20, fontWeight: 800 }}>{selectedProblem?.timeLimit || 5000}ms</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: 24, alignItems: 'flex-start' }}>
                {/* Main Table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Lịch sử nộp bài</h3>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                className="input" 
                                placeholder="Tìm theo tên sinh viên..." 
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                style={{ width: 220, height: 38, paddingLeft: 38, fontSize: 13, borderRadius: 10 }} 
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="table" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead>
                                <tr style={{ background: 'rgba(0,0,0,0.1)' }}>
                                    <th style={{ padding: '16px 20px', fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Sinh viên</th>
                                    <th style={{ padding: '16px 20px', fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Ngôn ngữ</th>
                                    <th style={{ padding: '16px 20px', fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Điểm số</th>
                                    <th style={{ padding: '16px 20px', fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeSubmissions.map((s) => (
                                    <tr 
                                        key={s.id} 
                                        onClick={() => setSelectedSubmissionId(s.id)}
                                        style={{ 
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            background: selectedSubmissionId === s.id ? 'rgba(139, 92, 246, 0.08)' : 'transparent'
                                        }}
                                        className="table-row-hover"
                                    >
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div className="avatar" style={{ 
                                                    width: 36, height: 36, 
                                                    background: 'var(--bg-tertiary)', 
                                                    border: '1px solid var(--border)',
                                                    fontSize: 12, fontWeight: 700
                                                }}>
                                                    {s.user.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.user.fullName}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                        {new Date(s.createdAt).toLocaleDateString('vi-VN')} {new Date(s.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 11 }}>
                                                {s.language}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <div style={{ fontSize: 16, fontWeight: 800, color: s.score >= (s.maxScore * 0.8) ? 'var(--accent-green)' : s.score >= (s.maxScore * 0.5) ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>
                                                    {s.score} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>/ {s.maxScore}</span>
                                                </div>
                                                <div style={{ height: 4, width: 60, background: 'var(--bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${(s.score / s.maxScore) * 100}%`, background: s.score >= (s.maxScore * 0.8) ? 'var(--accent-green)' : s.score >= (s.maxScore * 0.5) ? 'var(--accent-yellow)' : 'var(--accent-red)' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                            <StatusBadge status={s.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {submissionsData && (
                        <div style={{ 
                            padding: '16px 20px', 
                            borderTop: '1px solid var(--border)', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            background: 'rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                Hiển thị <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeSubmissions.length}</span> trên <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{submissionsData.total}</span> kết quả
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button 
                                    className="btn btn-secondary" 
                                    disabled={currentPage === 1 || loadingSubmissions}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    style={{ height: 36, padding: '0 12px', fontSize: 13, borderRadius: 8 }}
                                >
                                    Trước
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 13, fontWeight: 600 }}>
                                    Trang {currentPage} / {Math.ceil(submissionsData.total / pageSize) || 1}
                                </div>
                                <button 
                                    className="btn btn-secondary" 
                                    disabled={currentPage >= Math.ceil(submissionsData.total / pageSize) || loadingSubmissions}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    style={{ height: 36, padding: '0 12px', fontSize: 13, borderRadius: 8 }}
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Detail Panel */}
                <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {selectedSubmission ? (
                        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--accent-purple-light)22' }}>
                            <div style={{ padding: '20px', background: 'rgba(139, 92, 246, 0.05)', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <ClipboardList size={20} color="var(--accent-purple-light)" /> Chi tiết thực thi
                                    </h3>
                                    <button className="btn-icon" style={{ padding: 6, borderRadius: 8, background: 'var(--bg-tertiary)' }}>
                                        <ExternalLink size={14} />
                                    </button>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ID: {selectedSubmission.id}</div>
                            </div>
                            
                            <div style={{ padding: 24 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                                    <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 16, border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Thời gian chạy</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800 }}>
                                            <Cpu size={20} color="var(--accent-cyan)" />
                                            <span>{selectedSubmission.executionTime || 0} ms</span>
                                        </div>
                                    </div>
                                    <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 16, border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bộ nhớ</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800 }}>
                                            <MemoryIcon size={20} color="var(--accent-purple)" />
                                            <span>{selectedSubmission.memoryUsage || 0} KB</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <span style={{ fontSize: 14, fontWeight: 700 }}>Test Cases</span>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedSubmission.status === 'accepted' ? 'Tất cả đạt' : 'Chưa hoàn thiện'}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {selectedSubmission.results && selectedSubmission.results.length > 0 ? (
                                            selectedSubmission.results.map((res, i) => (
                                                <div 
                                                    key={i} 
                                                    title={`${res.passed ? 'Đạt' : 'Thất bại'} - ${res.runtime || 0}ms ${!res.passed && res.error ? `(${res.error})` : ''}`}
                                                    style={{ 
                                                        width: 40, height: 40, borderRadius: 10, 
                                                        background: res.passed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        border: '1px solid',
                                                        borderColor: res.passed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: res.passed ? 'var(--accent-green)' : 'var(--accent-red)',
                                                        fontSize: 12, fontWeight: 700,
                                                        cursor: 'help'
                                                    }}
                                                >
                                                    #{i + 1}
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '10px 0' }}>
                                                Không có dữ liệu test case hoặc đang chấm...
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    className="btn btn-secondary" 
                                    onClick={() => {
                                        setIsCodeModalOpen(true);
                                        setActiveFileIndex(0);
                                    }}
                                    style={{ width: '100%', justifyContent: 'center', height: 44, borderRadius: 12, gap: 10, background: 'var(--bg-secondary)' }}
                                >
                                    <Code size={18} />
                                    <span>Xem mã nguồn đã nộp</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="card" style={{ padding: 40, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderStyle: 'dashed' }}>
                            <div style={{ marginBottom: 16, opacity: 0.3 }}>
                                <MousePointer2 size={40} style={{ margin: '0 auto' }} />
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                                Chọn một bản ghi để xem chi tiết kết quả thực thi và test case.
                            </p>
                        </div>
                    )}

                    <div className="card" style={{ background: 'var(--gradient-dark)', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                             <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)' }} />
                             <span style={{ fontSize: 13, fontWeight: 700 }}>Thông tin Sandbox</span>
                         </div>
                         <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                             Các lượt nộp bài đang được xử lý trong môi trường cô lập Docker. Hệ thống đảm bảo tính công bằng và bảo mật tuyệt đối.
                         </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Code Viewer Modal */}
      {isCodeModalOpen && selectedSubmission && selectedSubmission.code && (
        <div className="modal-overlay" style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
            padding: 40
        }}>
            <div className="modal-content card animate-in" style={{ 
                width: '100%', maxWidth: 1000, height: '80vh', padding: 0, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 30px 60px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, marginBottom: 4 }}>Mã nguồn đã nộp</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                            Sinh viên: {selectedSubmission.user.fullName} • Ngôn ngữ: {selectedSubmission.language}
                        </p>
                    </div>
                    <button className="btn-icon" onClick={() => setIsCodeModalOpen(false)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-tertiary)' }}>×</button>
                </div>
                
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* File Explorer Sidebar */}
                    <div style={{ width: 240, borderRight: '1px solid var(--border)', background: 'var(--bg-secondary)', overflowY: 'auto' }}>
                        <div style={{ padding: '16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Tệp tin</div>
                        {selectedSubmission.code.files.map((file, idx) => (
                            <div 
                                key={idx}
                                onClick={() => setActiveFileIndex(idx)}
                                style={{ 
                                    padding: '12px 20px', 
                                    fontSize: 13, 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    background: activeFileIndex === idx ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                    color: activeFileIndex === idx ? 'var(--accent-purple-light)' : 'var(--text-secondary)',
                                    borderLeft: `3px solid ${activeFileIndex === idx ? 'var(--accent-purple)' : 'transparent'}`,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Code size={14} opacity={0.6} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.filePath}</span>
                                {file.filePath === selectedSubmission.code?.entryFile && (
                                    <span title="Tệp tin thực thi chính (Entry File)" style={{ display: 'flex', alignItems: 'center' }}>
                                        <Zap size={12} color="var(--accent-yellow)" />
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Code Content Area */}
                    <div style={{ flex: 1, background: '#0d0d0d', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 12, color: 'var(--accent-purple-light)', fontWeight: 600 }}>
                            {selectedSubmission.code.files[activeFileIndex]?.filePath}
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', padding: 20 }} className="custom-scrollbar">
                            <pre style={{ margin: 0, fontFamily: '"JetBrains Mono", monospace', fontSize: 13, lineHeight: 1.6, color: '#d4d4d4' }}>
                                {selectedSubmission.code.files[activeFileIndex]?.content.split('\n').map((line, i) => (
                                    <div key={i} style={{ display: 'flex' }}>
                                        <span style={{ width: 40, color: '#454545', textAlign: 'right', paddingRight: 15, userSelect: 'none', flexShrink: 0 }}>{i + 1}</span>
                                        <span style={{ whiteSpace: 'pre-wrap' }}>{line}</span>
                                    </div>
                                ))}
                            </pre>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '16px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                    <button className="btn btn-primary" onClick={() => setIsCodeModalOpen(false)} style={{ borderRadius: 10, padding: '10px 24px' }}>Đóng lại</button>
                </div>
            </div>
        </div>
      )}

      {/* Problem Selection Modal */}
      {isProblemModalOpen && (
        <div className="modal-overlay" style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: 20
        }}>
            <div className="modal-content card animate-in" style={{ 
                width: '100%', maxWidth: 600, padding: 0, overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Chọn bài tập cần giám sát</h3>
                    <button className="btn-icon" onClick={() => setIsProblemModalOpen(false)}>×</button>
                </div>
                
                <div style={{ padding: 20 }}>
                    <div style={{ position: 'relative', marginBottom: 20 }}>
                        <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            className="input" 
                            placeholder="Tìm kiếm bài tập theo tên hoặc slug..." 
                            value={problemSearch}
                            onChange={(e) => setProblemSearch(e.target.value)}
                            style={{ width: '100%', paddingLeft: 44, height: 48, borderRadius: 14, fontSize: 14 }}
                            autoFocus
                        />
                    </div>

                    <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }} className="custom-scrollbar">
                        {loadingProblems ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                                <Loader2 className="animate-spin" />
                            </div>
                        ) : filteredProblems.length > 0 ? (
                            filteredProblems.map((p: any) => (
                                <div 
                                    key={p.id} 
                                    onClick={() => handleSelectProblem(p.id)}
                                    style={{ 
                                        padding: '14px 18px', 
                                        background: selectedExerciseId === p.id ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-secondary)',
                                        border: selectedExerciseId === p.id ? '1px solid var(--accent-purple)' : '1px solid var(--border)',
                                        borderRadius: 14,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => {
                                        if (selectedExerciseId !== p.id) {
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (selectedExerciseId !== p.id) {
                                            e.currentTarget.style.borderColor = 'var(--border)';
                                            e.currentTarget.style.background = 'var(--bg-secondary)';
                                        }
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.title}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>slug: {p.slug}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                                        <ChevronRight size={18} color="var(--text-muted)" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                                Không tìm thấy bài tập nào khớp với từ khóa.
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                    <button className="btn btn-ghost" onClick={() => setIsProblemModalOpen(false)}>Hủy bỏ</button>
                </div>
            </div>
        </div>
      )}

      {/* Confirm Regrade Modal */}
      <ConfirmModal 
        isOpen={isConfirmRegradeOpen}
        onClose={() => !regradeMutation.isPending && setIsConfirmRegradeOpen(false)}
        onConfirm={() => selectedExerciseId && regradeMutation.mutate(selectedExerciseId)}
        title="Xác nhận chấm lại hàng loạt"
        message="Hành động này sẽ đưa toàn bộ bài nộp của thử thách này vào hàng đợi để chấm lại bằng bộ Testcase mới nhất. Mức điểm của sinh viên sẽ không bị giảm nếu điểm chấm lại thấp hơn lần nộp cũ. Bạn có chắc chắn muốn tiếp tục?"
        type="warning"
        confirmText="Chấm lại ngay"
        loading={regradeMutation.isPending}
      />

      <style jsx>{`
        .badge-easy { color: var(--accent-green); background: rgba(34, 197, 94, 0.1); }
        .badge-medium { color: var(--accent-yellow); background: rgba(251, 191, 36, 0.1); }
        .badge-hard { color: var(--accent-red); background: rgba(239, 68, 68, 0.1); }
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .table-row-hover:hover { background: rgba(255,255,255,0.02) !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); borderRadius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
      `}</style>
    </div>
  );
}

