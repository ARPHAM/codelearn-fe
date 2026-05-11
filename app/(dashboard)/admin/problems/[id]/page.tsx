'use client'

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    useProblemDetail,
    useApproveProblemVersion,
    useRejectProblemVersion
} from '@/hooks/useProblems';
import Editor from '@monaco-editor/react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import {
    ChevronLeft,
    CheckCircle2,
    XCircle,
    Beaker,
    FileText,
    Code2,
    Clock,
    User,
    Shield,
    Star
} from 'lucide-react';

export default function AdminProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data, isLoading } = useProblemDetail(id);
    const { mutate: approve, isPending: isApproving } = useApproveProblemVersion();
    const { mutate: reject, isPending: isRejecting } = useRejectProblemVersion();

    const [activeTab, setActiveTab] = useState<'description' | 'testcases' | 'code'>('description');

    // Modal state
    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        title: string;
        message: string;
        variant: 'danger' | 'warning' | 'info';
        onConfirm: () => void;
    }>({
        open: false,
        title: '',
        message: '',
        variant: 'info',
        onConfirm: () => {}
    });

    if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Đang tải chi tiết bài tập...</div>;
    if (!data) return <div style={{ padding: 40, textAlign: 'center' }}>Không tìm thấy dữ liệu.</div>;

    const { problem, testcases, languageFiles } = data;
    // Assume we're approving the latest version for now
    const latestVersion = data.versions?.[0] || { id: `${problem.id}-v1` };

    const handleApprove = () => {
        setConfirmState({
            open: true,
            title: 'Phê duyệt bài tập',
            message: `Bạn có chắc chắn muốn PHÊ DUYỆT bài tập "${problem.title}"? Sinh viên sẽ có thể nhìn thấy và làm bài tập này.`,
            variant: 'info',
            onConfirm: () => {
                approve(latestVersion.id, {
                    onSuccess: () => {
                        toast({ type: 'success', title: 'Thành công', message: 'Đã phê duyệt bài tập.' });
                        router.push('/admin/problems');
                    }
                });
                setConfirmState(prev => ({ ...prev, open: false }));
            }
        });
    };

    const handleReject = () => {
        setConfirmState({
            open: true,
            title: 'Từ chối bài tập',
            message: `Bạn có chắc chắn muốn TỪ CHỐI bài tập "${problem.title}"? Bài tập sẽ bị gửi trả lại cho giảng viên.`,
            variant: 'danger',
            onConfirm: () => {
                reject(latestVersion.id, {
                    onSuccess: () => {
                        toast({ type: 'warning', title: 'Đã từ chối', message: 'Bài tập đã bị từ chối phê duyệt.' });
                        router.push('/admin/problems');
                    }
                });
                setConfirmState(prev => ({ ...prev, open: false }));
            }
        });
    };

    const statusMap: Record<string, { label: string; class: string }> = {
        ACTIVE: { label: 'Đang hoạt động', class: 'badge-green' },
        INACTIVE: { label: 'Chờ duyệt', class: 'badge-yellow' },
        REJECTED: { label: 'Đã từ chối', class: 'badge-red' }
    };

    const typeMap: Record<string, { label: string; class: string }> = {
        TEMPLATE: { label: 'Mã mẫu', class: 'badge-purple' },
        SOLUTION: { label: 'Lời giải', class: 'badge-green' }
    };

    return (
        <div className="page-container animate-in" style={{ paddingBottom: 100 }}>
            {/* Header Area */}
            <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{problem.title}</h1>
                            <span className={`badge ${statusMap[problem.status]?.class || 'badge-gray'}`} style={{ padding: '4px 12px', fontSize: 11 }}>
                                {statusMap[problem.status]?.label || problem.status}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: 20, color: 'var(--text-secondary)', fontSize: 13 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} color="var(--accent-purple-light)" /> <strong style={{ color: 'var(--text-primary)' }}>{problem.createdBy?.fullName}</strong></span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} color="var(--accent-yellow)" /> {problem.difficulty}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Shield size={14} color="var(--accent-blue-light)" /> <code>{problem.slug}</code></span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            className="btn"
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}
                            onClick={handleReject}
                            disabled={isRejecting || isApproving}
                        >
                            <XCircle size={18} /> Từ chối
                        </button>
                        <button
                            className="btn"
                            style={{ background: 'var(--gradient-green)', color: 'white', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}
                            onClick={handleApprove}
                            disabled={isApproving || isRejecting}
                        >
                            <CheckCircle2 size={18} /> Phê duyệt bài tập
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: 32, padding: '0 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <button
                    onClick={() => setActiveTab('description')}
                    style={{
                        padding: '18px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'description' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                        color: activeTab === 'description' ? 'var(--accent-blue)' : 'var(--text-muted)',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.2s'
                    }}
                >
                    <FileText size={18} /> Đề bài
                </button>
                <button
                    onClick={() => setActiveTab('testcases')}
                    style={{
                        padding: '18px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'testcases' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                        color: activeTab === 'testcases' ? 'var(--accent-blue)' : 'var(--text-muted)',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.2s'
                    }}
                >
                    <Beaker size={18} /> Bộ testcases <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, marginLeft: 4 }}>{testcases.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('code')}
                    style={{
                        padding: '18px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'code' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                        color: activeTab === 'code' ? 'var(--accent-blue)' : 'var(--text-muted)',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.2s'
                    }}
                >
                    <Code2 size={18} /> Mã nguồn & Boilerplate
                </button>
            </div>

            {/* Content Area */}
            <div>
                {activeTab === 'description' && (
                    <div className="card" style={{ padding: 40, maxWidth: 1000, margin: '0 auto', background: 'var(--bg-primary)', border: '1px solid var(--border)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
                        <div className="prose dark:prose-invert max-w-none" style={{ color: 'var(--text-primary)', lineHeight: 1.8 }}>
                            {Array.isArray(latestVersion?.description) && latestVersion.description.map((block: any, idx: number) => (
                                <div key={idx} dangerouslySetInnerHTML={{ __html: block.content }} />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'testcases' && (
                    <div className="card" style={{ overflow: 'hidden', padding: 0, border: '1px solid var(--border)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '16px 20px', fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>Input</th>
                                    <th style={{ padding: '16px 20px', fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>Kết quả kỳ vọng</th>
                                    <th style={{ padding: '16px 20px', fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, textAlign: 'center' }}>Điểm</th>
                                    <th style={{ padding: '16px 20px', fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, textAlign: 'center' }}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {testcases.map((tc, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 20px' }}><pre style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: 8, fontSize: 12, border: '1px solid var(--border)', color: '#fff', fontFamily: 'var(--font-mono)' }}>{tc.input || '(Trống)'}</pre></td>
                                        <td style={{ padding: '16px 20px' }}><pre style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: 8, fontSize: 12, border: '1px solid var(--border)', color: '#10b981', fontFamily: 'var(--font-mono)' }}>{tc.expectedOutput}</pre></td>
                                        <td style={{ padding: '16px 20px', fontWeight: 800, fontSize: 16, color: 'var(--accent-purple-light)', textAlign: 'center' }}>{tc.score}</td>
                                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                            <span className={`badge ${tc.isHidden ? 'badge-yellow' : 'badge-green'}`} style={{ padding: '4px 10px', fontSize: 11 }}>
                                                {tc.isHidden ? 'Ẩn' : 'Công khai'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'code' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 48, maxWidth: 1200 }}>
                        {Object.entries(
                            languageFiles.reduce((acc, file) => {
                                const langName = file.language?.name || (file.languageId === 1 ? 'Java' : file.languageId === 2 ? 'Python' : 'Khác');
                                if (!acc[langName]) acc[langName] = [];
                                acc[langName].push(file);
                                return acc;
                            }, {} as Record<string, typeof languageFiles>)
                        ).map(([langName, files], langIdx) => (
                            <div key={langIdx} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px' }}>
                                    <div style={{ width: 4, height: 24, background: 'var(--accent-blue)', borderRadius: 2 }}></div>
                                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Ngôn ngữ: {langName}
                                    </h3>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>({files.length} tập tin)</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                    {files
                                        .sort((a, b) => (a.type === 'TEMPLATE' ? -1 : 1)) // Sắp xếp Mã mẫu lên trước
                                        .map((file, fileIdx) => (
                                            <div key={fileIdx} className="card shadow-card" style={{ overflow: 'hidden', padding: 0, border: '1px solid var(--border)', borderRadius: 16 }}>
                                                <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        {data.entryFile === file.path && <Star size={14} fill="var(--accent-yellow)" color="var(--accent-yellow)" />}
                                                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{file.path}</span>
                                                        <span className={`badge ${typeMap[file.type]?.class || 'badge-gray'}`} style={{ padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                                                            {typeMap[file.type]?.label || file.type}
                                                        </span>
                                                    </div>
                                                    <div className="badge" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '2px 8px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                                                        {file.path.split('.').pop()?.toUpperCase()}
                                                    </div>
                                                </div>
                                                <div style={{ borderTop: 'none' }}>
                                                    <Editor
                                                        height="400px"
                                                        defaultLanguage={file.language?.name?.toLowerCase() || (file.languageId === 1 ? 'java' : file.languageId === 2 ? 'python' : 'sql')}
                                                        value={file.content}
                                                        theme="vs-dark"
                                                        options={{
                                                            readOnly: true,
                                                            minimap: { enabled: false },
                                                            scrollBeyondLastLine: false,
                                                            fontSize: 12,
                                                            padding: { top: 12, bottom: 12 },
                                                            lineNumbers: 'on',
                                                            renderLineHighlight: 'all',
                                                            scrollbar: {
                                                                vertical: 'visible',
                                                                horizontal: 'hidden'
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                variant={confirmState.variant}
                onConfirm={confirmState.onConfirm}
                onClose={() => setConfirmState(prev => ({ ...prev, open: false }))}
                loading={isApproving || isRejecting}
            />
        </div>
    );
}
