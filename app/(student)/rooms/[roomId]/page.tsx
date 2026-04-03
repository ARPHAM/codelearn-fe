'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRoom, useParticipants } from '@/features/room/queries';
import { useJoinRoom } from '@/features/room/mutations';
import { ParticipantData, WorkspaceFile, getWorkspaceFiles } from '@/features/room/api';
import { useRoomSocket } from '@/features/realtime/useRoomSocket';
import CodeEditor from '@/components/editor/CodeEditor';
import Participants from '@/components/room/Participants';
import { Copy, Check, AlertTriangle, WifiOff, PlusCircle, ArrowLeft, Play, Send } from 'lucide-react';
import { useCurrentUserInfo } from '@/app/components/_api/queries';
import { useRunCode, useSubmitCode } from '@/features/problems/mutations';
import { useLanguages } from '@/src/hooks/useLanguages';
import { socket } from '@/features/realtime/socket';
import { toast } from '@/components/ui/Toast';

interface PageProps {
    params: Promise<{ roomId: string }>;
}

export default function RoomPage({ params }: PageProps) {
    const { roomId } = use(params);
    const queryClient = useQueryClient();
    const router = useRouter();
    const { data: roomInfo, isLoading: isRoomLoading, error } = useRoom(roomId);
    const { data: participants } = useParticipants(roomId);
    const { mutate: joinRoom, isPending: isJoining } = useJoinRoom({
        onSuccess: () => {
            console.log("Join room success!");
        },
        onError: (err: any) => {
            console.error("Join room failed:", err.response?.data || err.message);
        }
    });

    const room = roomInfo?.room;
    const sessionRest = roomInfo?.session;
    const currentUserRole = roomInfo?.currentUserRole;

    useEffect(() => {
        if (room?.id) {
            joinRoom(room.id);
        }
    }, [room?.id, joinRoom]);

    const shouldEnableSocket = !!room && (sessionRest !== null || currentUserRole === 'HOST');

    const { isConnected, sessionStatus, closingTimeLeft } = useRoomSocket({
        roomId,
        enabled: shouldEnableSocket
    });

    const { data: currentUser } = useCurrentUserInfo();
    const [viewingUser, setViewingUser] = useState<ParticipantData | null>(null);
    const [copied, setCopied] = useState(false);

    const currentUserParticipant = participants?.find(p => {
        if (p.roomId !== roomId) return false;
        return currentUser?.id && String(p.userId) === String(currentUser?.id);
    });
    const workspaceId = currentUserParticipant?.workspaceId;

    // Core Logic for Run/Submit
    const { data: languages = [] } = useLanguages();
    const runMutation = useRunCode();
    const submitMutation = useSubmitCode();

    const [execStatus, setExecStatus] = useState<"IDLE" | "RUNNING" | "QUEUED" | "COMPLETED" | "ERROR">("IDLE");
    const [runResult, setRunResult] = useState<any>(null);
    const [submitResult, setSubmitResult] = useState<any>(null);
    const [showResult, setShowResult] = useState(false);

    const currentEventRef = useRef<string | null>(null);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleCopyLink = () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        if (!url) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url);
        } else {
            const el = document.createElement('textarea');
            el.value = url;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRunSubmitResult = (data: any) => {
        setExecStatus("COMPLETED");
        if (data.score !== undefined) {
            setSubmitResult(data);
            setRunResult(null);
        } else {
            setRunResult(data);
            setSubmitResult(null);
        }
        setShowResult(true);
    };

    const listenForExecution = (id: string) => {
        if (currentEventRef.current) socket.off(currentEventRef.current);
        const eventName = `submission-${id}`;
        currentEventRef.current = eventName;
        socket.on(eventName, handleRunSubmitResult);

        setTimeout(() => {
            if (execStatus === "QUEUED" || execStatus === "RUNNING") {
                setExecStatus("ERROR");
            }
        }, 30000); // 30s timeout
    };

    const handleRun = async () => {
        if (!workspaceId) return;
        setExecStatus("RUNNING");
        setShowResult(false);
        try {
            // In room mode, we might need to fetch the local main file content
            const files = await getWorkspaceFiles(workspaceId);
            const mainFile = files.find(f => f.filePath === 'main.ts' || f.filePath === 'main.py' || f.filePath.includes('main')) || files[0];
            const ext = mainFile.filePath.split('.').pop();
            const langObj = languages.find(l => l.extension.replace('.', '') === ext) || languages[0];

            const resp = await runMutation.mutateAsync({
                languageId: langObj?.id || 1,
                code: mainFile.content,
                input: ""
            });
            setExecStatus("QUEUED");
            listenForExecution(resp.id);
        } catch (err) {
            setExecStatus("ERROR");
        }
    };

    const handleSubmit = async () => {
        if (!workspaceId) return;
        setExecStatus("RUNNING");
        setShowResult(false);
        try {
            const files = await getWorkspaceFiles(workspaceId);
            const mainFile = files.find(f => f.filePath === 'main.ts' || f.filePath === 'main.py' || f.filePath.includes('main')) || files[0];
            const ext = mainFile.filePath.split('.').pop();
            const langObj = languages.find(l => l.extension.replace('.', '') === ext) || languages[0];

            const resp = await submitMutation.mutateAsync({
                language: langObj?.name || 'python',
                mainFile: mainFile.filePath,
                files: files.map(f => ({
                    filename: f.filePath,
                    content: f.content
                }))
            });
            setExecStatus("QUEUED");
            listenForExecution(resp.submissionId);
        } catch (err) {
            setExecStatus("ERROR");
        }
    };

    const isLoading = isRoomLoading || isJoining;

    if (isLoading) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 120px)' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="spin" style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', margin: '0 auto 16px' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Đang kết nối phòng học...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !room) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 120px)', textAlign: 'center', padding: 24 }}>
                    <AlertTriangle size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Phòng không tồn tại</h2>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-ghost" onClick={() => router.push('/dashboard')}>← Dashboard</button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>
                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                            width: 12, height: 12, borderRadius: '50%',
                            background: isConnected ? 'var(--accent-green)' : 'var(--accent-red)',
                            boxShadow: isConnected ? '0 0 12px var(--accent-green)' : '0 0 12px var(--accent-red)',
                        }} className={isConnected ? "pulse-glow" : ""} />
                        <div>
                            <h1 className="page-title" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>
                                {room.name}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                <span className={`badge ${sessionStatus === 'ACTIVE' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>
                                    {sessionStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <button className="btn btn-ghost" onClick={handleRun} disabled={execStatus === "RUNNING" || execStatus === "QUEUED" || !!viewingUser}>
                            <Play size={16} />
                            <span>Run</span>
                        </button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={execStatus === "RUNNING" || execStatus === "QUEUED" || !!viewingUser}>
                            <Send size={16} />
                            <span>Submit</span>
                        </button>
                        <button className="btn btn-ghost" onClick={handleCopyLink} style={{ borderRadius: 'var(--radius-md)', padding: '10px 16px' }}>
                            {copied ? <Check size={16} style={{ color: 'var(--accent-green)' }} /> : <Copy size={16} />}
                            <span style={{ fontSize: 13 }}>{copied ? 'Đã copy' : 'Mời bạn bè'}</span>
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 14, flex: 1, minHeight: 0 }}>
                    <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0b0f1a', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', position: 'relative' }}>
                        <div style={{ flex: 1 }}>
                            <CodeEditor roomId={roomId} viewingUser={viewingUser} workspaceId={workspaceId} />
                        </div>

                        {/* EXECUTION RESULTS OVERLAY */}
                        {showResult && (
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: '#0b0f1a', borderTop: '2px solid var(--accent-purple)', zIndex: 100, padding: 16, overflowY: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <h3 style={{ fontWeight: 'bold' }}>Kết quả thực thi</h3>
                                    <button onClick={() => setShowResult(false)} className="btn btn-ghost" style={{ padding: '2px 8px' }}>Đóng</button>
                                </div>

                                {runResult && (
                                    <div style={{ fontSize: 13 }}>
                                        <div style={{ color: runResult.status === 'ACCEPTED' ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 'bold', marginBottom: 4 }}>
                                            Trạng thái: {runResult.status}
                                        </div>
                                        <pre style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, fontSize: 12 }}>
                                            {runResult.compileOutput || runResult.output || 'No output.'}
                                        </pre>
                                    </div>
                                )}

                                {submitResult && (
                                    <div>
                                        <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--accent-purple)' }}>{submitResult.score}%</div>
                                        <div style={{ marginBottom: 12 }}>Vượt qua: {submitResult.testcasesPassed} / {submitResult.testcasesTotal} cases</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10 }}>
                                            {submitResult.results?.map((r: any, i: number) => (
                                                <div key={i} style={{
                                                    padding: 8, borderRadius: 6, textAlign: 'center', fontSize: 11,
                                                    background: r.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                                    border: `1px solid ${r.passed ? 'var(--accent-green)' : 'var(--accent-red)'}`
                                                }}>
                                                    TC {i + 1}: {r.status}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {execStatus === "QUEUED" && (
                            <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'var(--accent-cyan)', padding: '4px 12px', borderRadius: 4, fontSize: 12, color: 'white', fontWeight: 'bold' }} className="blink">
                                Đang chấm bài...
                            </div>
                        )}
                    </div>

                    <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0b0f1a', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                        <Participants roomId={roomId} currentUserId={currentUser?.id} viewingUser={viewingUser} onSelectUser={setViewingUser} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
