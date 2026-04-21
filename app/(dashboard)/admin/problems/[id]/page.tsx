'use client'

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    useProblemDetail, 
    useApproveProblemVersion, 
    useRejectProblemVersion 
} from '@/hooks/useProblems';
import Editor from '@monaco-editor/react';
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

    if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Đang tải chi tiết bài tập...</div>;
    if (!data) return <div style={{ padding: 40, textAlign: 'center' }}>Không tìm thấy dữ liệu.</div>;

    const { problem, testcases, languageFiles } = data;
    // Assume we're approving the latest version for now
    const latestVersion = data.versions?.[0] || { id: `${problem.id}-v1` };

    const handleApprove = () => {
        if (confirm('Bạn có chắc chắn muốn PHÊ DUYỆT bài tập này?')) {
            approve(latestVersion.id, {
                onSuccess: () => {
                    alert('Đã phê duyệt thành công!');
                    router.push('/admin/problems');
                }
            });
        }
    };

    const handleReject = () => {
        if (confirm('Bạn có chắc chắn muốn TỪ CHỐI bài tập này?')) {
            reject(latestVersion.id, {
                onSuccess: () => {
                    alert('Đã từ chối bài tập.');
                    router.push('/admin/problems');
                }
            });
        }
    };

    return (
        <div className="page-container animate-in" style={{ paddingBottom: 100 }}>
            {/* Header Area */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)', position: 'sticky', top: 0, zIndex: 10 }}>
                <button 
                    onClick={() => router.back()}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12 }}
                >
                    <ChevronLeft size={16} /> Quay lại danh sách
                </button>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{problem.title}</h1>
                            <span className={`badge ${
                                problem.status === 'ACTIVE' ? 'badge-green' : 
                                problem.status === 'REJECTED' ? 'badge-red' : 'badge-yellow'
                            }`}>{problem.status}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: 13 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={14}/> {problem.createdBy?.fullName}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14}/> {problem.difficulty}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Shield size={14}/> {problem.slug}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button 
                            className="btn" 
                            style={{ background: 'var(--accent-red)', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}
                            onClick={handleReject}
                            disabled={isRejecting || isApproving}
                        >
                            <XCircle size={18} /> Từ chối
                        </button>
                        <button 
                            className="btn" 
                            style={{ background: 'var(--accent-green)', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}
                            onClick={handleApprove}
                            disabled={isApproving || isRejecting}
                        >
                            <CheckCircle2 size={18} /> Phê duyệt
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: 24, padding: '0 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <button 
                    onClick={() => setActiveTab('description')}
                    style={{ 
                        padding: '16px 0', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: activeTab === 'description' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                        color: activeTab === 'description' ? 'var(--accent-blue)' : 'var(--text-muted)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    <FileText size={18} /> Đề bài
                </button>
                <button 
                    onClick={() => setActiveTab('testcases')}
                    style={{ 
                        padding: '16px 0', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: activeTab === 'testcases' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                        color: activeTab === 'testcases' ? 'var(--accent-blue)' : 'var(--text-muted)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    <Beaker size={18} /> Testcases ({testcases.length})
                </button>
                <button 
                    onClick={() => setActiveTab('code')}
                    style={{ 
                        padding: '16px 0', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: activeTab === 'code' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                        color: activeTab === 'code' ? 'var(--accent-blue)' : 'var(--text-muted)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    <Code2 size={18} /> Templates ({languageFiles.filter(f => f.type === 'TEMPLATE').length})
                </button>
            </div>

            {/* Content Area */}
            <div style={{ padding: 24 }}>
                {activeTab === 'description' && (
                    <div className="card shadow-sm" style={{ padding: 32, maxWidth: 900, margin: '0 auto', background: 'var(--bg-primary)' }}>
                        <div className="prose dark:prose-invert max-w-none">
                            {Array.isArray(latestVersion?.description) && latestVersion.description.map((block: any, idx: number) => (
                                <div key={idx} dangerouslySetInnerHTML={{ __html: block.content }} />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'testcases' && (
                    <div className="card shadow-sm" style={{ overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: 16 }}>Input</th>
                                    <th style={{ padding: 16 }}>Output mong đợi</th>
                                    <th style={{ padding: 16 }}>Điểm</th>
                                    <th style={{ padding: 16 }}>Chế độ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {testcases.map((tc, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: 16 }}><pre style={{ background: 'var(--bg-secondary)', padding: 8, borderRadius: 4, fontSize: 12 }}>{tc.input}</pre></td>
                                        <td style={{ padding: 16 }}><pre style={{ background: 'var(--bg-secondary)', padding: 8, borderRadius: 4, fontSize: 12 }}>{tc.expectedOutput}</pre></td>
                                        <td style={{ padding: 16, fontWeight: 600 }}>{tc.score}</td>
                                        <td style={{ padding: 16 }}>
                                            <span className={`badge ${tc.isHidden ? 'badge-yellow' : 'badge-green'}`}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {languageFiles.map((file, idx) => (
                            <div key={idx} className="card shadow-sm" style={{ overflow: 'hidden', borderLeft: `4px solid ${file.type === 'TEMPLATE' ? 'var(--accent-purple)' : 'var(--accent-green)'}` }}>
                                <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {data.entryFile === file.path && <Star size={14} fill="var(--accent-yellow)" color="var(--accent-yellow)" />}
                                        <span style={{ fontWeight: 600, fontSize: 14 }}>{file.path}</span>
                                        <span className={`badge ${file.type === 'TEMPLATE' ? 'badge-purple' : 'badge-green'}`} style={{ fontSize: 10 }}>
                                            {file.type}
                                        </span>
                                    </div>
                                    <span className="badge badge-gray" style={{ fontSize: 11 }}>
                                        {file.language?.name || (file.languageId === 1 ? 'Java' : file.languageId === 2 ? 'Python' : 'SQL')}
                                    </span>
                                </div>
                                <Editor
                                    height="280px"
                                    defaultLanguage={file.language?.name?.toLowerCase() || (file.languageId === 1 ? 'java' : file.languageId === 2 ? 'python' : 'sql')}
                                    value={file.content}
                                    theme="vs-dark"
                                    options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 12 }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
