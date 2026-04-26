'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { examApi } from '@/api/exam.api';
import { 
    Award, 
    CheckCircle2, 
    ChevronLeft, 
    ClipboardList, 
    Loader2, 
    Trophy,
    XCircle,
    RotateCcw
} from 'lucide-react';

export default function ExamResultPage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.examId as string;

    const { data: results, isLoading, isError } = useQuery({
        queryKey: ['exam-results', examId],
        queryFn: () => examApi.getResults(examId),
        refetchInterval: (query: any) => (query.state.data?.status === 'PROCESSING' || query.state.data?.status === 'QUEUED') ? 3000 : false,
    });

    if (isLoading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <Loader2 className="animate-spin" size={40} color="var(--accent-purple)" />
        </div>
    );

    return (
        <div className="page-container animate-in">
            <div style={{ marginBottom: 24 }}>
                <button className="btn btn-ghost" onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
                    <ChevronLeft size={16} /> Quay lại
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 40 }}>
                <div style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    background: 'var(--gradient-purple)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: 20,
                    boxShadow: 'var(--shadow-glow-purple)'
                }}>
                    <Trophy size={40} color="white" />
                </div>
                <h1 className="page-title">Kết quả Kỳ thi</h1>
                <p className="page-subtitle">Hệ thống đã hoàn tất chấm điểm bài làm của bạn</p>
            </div>

            {results?.status === 'PROCESSING' || results?.status === 'QUEUED' ? (
                <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                    <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 16px', color: 'var(--accent-cyan)' }} />
                    <h3 style={{ fontSize: 20, fontWeight: 700 }}>Đang chấm điểm...</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Vui lòng đợi trong giây lát, kết quả sẽ tự động cập nhật.</p>
                </div>
            ) : (
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Tổng điểm</div>
                            <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent-purple)' }}>{results?.totalScore || 0}</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Số bài đạt</div>
                            <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent-green)' }}>{results?.problemsPassed || 0}</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Trạng thái</div>
                            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>HOÀN TẤT</div>
                        </div>
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ClipboardList size={20} color="var(--accent-purple)" /> Chi tiết từng bài tập
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {results?.problemResults?.map((res: any, idx: number) => (
                            <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ 
                                        width: 36, height: 36, borderRadius: 8, 
                                        background: res.score >= 50 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {res.score >= 50 ? <CheckCircle2 size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{res.problemTitle}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{res.testcasesPassed} / {res.testcasesTotal} testcases</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: res.score >= 50 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{res.score}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>ĐIỂM</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {results?.isRegraded && (
                        <div style={{ 
                            marginTop: 32, 
                            padding: 16, 
                            background: 'rgba(6, 182, 212, 0.05)', 
                            border: '1px dashed var(--accent-cyan)', 
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            color: 'var(--accent-cyan)'
                        }}>
                            <RotateCcw size={20} />
                            <div style={{ fontSize: 13 }}>
                                <strong>Lưu ý:</strong> Bài thi này đã được chấm lại bởi Giảng viên/Admin. Điểm số hiển thị là điểm cao nhất bạn đạt được.
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
