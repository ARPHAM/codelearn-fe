'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRoom, useParticipants } from '@/features/room/queries';
import { useJoinRoom } from '@/features/room/mutations';
import { ParticipantData } from '@/features/room/api';
import { useRoomSocket } from '@/features/realtime/useRoomSocket';
import CodeEditor from '@/components/editor/CodeEditor';
import Participants from '@/components/room/Participants';
import { Copy, Check, AlertTriangle, WifiOff, PlusCircle, ArrowLeft } from 'lucide-react';
import { useCurrentUserInfo } from '@/app/components/_api/queries';

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
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 340, marginBottom: 24 }}>
                        Phòng này đã đóng hoặc bạn không có quyền truy cập. Hãy tạo phòng mới để tiếp tục.
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-ghost" onClick={() => router.push('/dashboard')}>← Dashboard</button>
                        <button className="btn btn-primary" onClick={() => router.push('/rooms/create')}>
                            <PlusCircle size={16} /> Tạo phòng mới
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!shouldEnableSocket && currentUserRole === 'GUEST') {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 120px)', textAlign: 'center' }}>
                    <div className="spin" style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', marginBottom: 20 }} />
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Đang đợi Chủ phòng...</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 320, marginBottom: 20 }}>
                        Phiên học chưa được bắt đầu. Vui lòng chờ Host mở phòng.
                    </p>
                    <button className="btn btn-ghost" onClick={() => window.location.reload()}>🔄 Tải lại trang</button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {sessionStatus === 'CLOSED' && (
                <div className="modal-backdrop">
                    <div className="modal-box" style={{ width: 380 }}>
                        <div style={{ padding: 24, textAlign: 'center' }}>
                            <div style={{ height: 3, background: 'var(--gradient-fire)', marginTop: -24, marginLeft: -1, marginRight: -1, borderRadius: '16px 16px 0 0' }} />
                            <AlertTriangle size={48} style={{ color: 'var(--accent-red)', margin: '24px auto 12px' }} />
                            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Phiên kết thúc</h3>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
                                Phòng mã này đã bị đóng. Thay đổi chưa lưu đã tự động lưu cục bộ vào thiết bị.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => router.push('/rooms/create')}>
                                    <PlusCircle size={16} /> Tạo phòng mới
                                </button>
                                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => router.push('/dashboard')}>
                                    <ArrowLeft size={16} /> Về Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>
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
                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>•</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>
                                    {room.description || 'Collaborative Workspace'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {!isConnected && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 'var(--radius-md)', padding: '8px 16px', fontSize: 12, fontWeight: 700, color: '#f87171',
                            }}>
                                <WifiOff size={16} /> Mất kết nối
                            </div>
                        )}

                        {sessionStatus === 'CLOSING' && closingTimeLeft !== null && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 'var(--radius-md)', padding: '8px 16px',
                            }}>
                                <span style={{ fontSize: 18 }}>⏱</span>
                                <div>
                                    <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Sắp đóng</div>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: '#f87171', lineHeight: 1 }}>{formatTime(closingTimeLeft)}</div>
                                </div>
                            </div>
                        )}

                        <button className="btn btn-ghost" onClick={handleCopyLink} style={{ borderRadius: 'var(--radius-md)', padding: '10px 16px' }}>
                            {copied ? <Check size={16} style={{ color: 'var(--accent-green)' }} /> : <Copy size={16} />}
                            <span style={{ fontSize: 13 }}>{copied ? 'Đã copy' : 'Mời bạn bè'}</span>
                        </button>
                    </div>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 260px',
                        gap: 14,
                        flex: 1,
                        minHeight: 0,
                    }}
                >
                    <div
                        className="card"
                        style={{
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            background: '#0b0f1a',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-card)',
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <CodeEditor roomId={roomId} viewingUser={viewingUser} workspaceId={workspaceId} />
                        </div>
                    </div>

                    <div
                        className="card"
                        style={{
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            background: '#0b0f1a',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-card)',
                        }}
                    >
                        <Participants roomId={roomId} currentUserId={currentUser?.id} viewingUser={viewingUser} onSelectUser={setViewingUser} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
