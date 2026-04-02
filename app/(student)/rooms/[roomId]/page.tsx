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
import { Copy, Check, AlertTriangle, WifiOff, PlusCircle, ArrowLeft, Eye } from 'lucide-react';
import { useCurrentUserInfo } from '@/app/components/_api/queries';

interface PageProps {
    params: Promise<{ roomId: string }>;
}

export default function RoomPage({ params }: PageProps) {
    const { roomId } = use(params);
    const queryClient = useQueryClient();
    const router = useRouter();
    // Fetch static room metadata (REST DB query)
    const { data: roomInfo, isLoading: isRoomLoading, error } = useRoom(roomId);
    const { data: participants } = useParticipants(roomId);
    const { mutate: joinRoom, isPending: isJoining } = useJoinRoom({
        onSuccess: () => {
            console.log("Join room success!");
            // Mutation itself invalidates, but we can do extra if needed
        },
        onError: (err: any) => {
            console.error("Join room failed:", err.response?.data || err.message);
        }
    });

    console.log(`[RoomPage] isJoining: ${isJoining}, roomId: ${roomId}`);
    const room = roomInfo?.room;
    const sessionRest = roomInfo?.session;
    const currentUserRole = roomInfo?.currentUserRole;

    // Join room when room info is loaded
    useEffect(() => {
        if (room?.id) {
            console.log("Calling joinRoom for roomId:", room.id);
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

    // Find our own workspaceId (using id from auth/me)
    const currentUserParticipant = participants?.find(p => {
        // MUST check roomId to avoid stale cache from previous room
        if (p.roomId !== roomId) return false;
        
        // Match by id (UUID)
        const matched = currentUser?.id && String(p.userId) === String(currentUser?.id);
        if (matched) console.log("Matched participant by ID:", p.userId, "Workspace:", p.workspaceId);
        return matched;
    });
    const workspaceId = currentUserParticipant?.workspaceId;
    
    console.log("[RoomPage] Current User ID:", currentUser?.id);
    console.log("[RoomPage] Participants count:", participants?.length);
    console.log("[RoomPage] Final Workspace ID:", workspaceId);

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

    // LOADING STATE
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

    // ERROR STATE
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

    // WAITING FOR HOST (Guest + no session)
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
            {/* Modal Overlay for CLOSED state */}
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
                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 10, height: 10, borderRadius: '50%',
                                background: isConnected ? 'var(--accent-green)' : 'var(--accent-red)',
                                boxShadow: isConnected ? '0 0 8px var(--accent-green)' : '0 0 8px var(--accent-red)',
                            }} />
                            {room.name}
                        </h1>
                        <p className="page-subtitle">
                            {room.description || 'Code Meeting Room'}
                            {' · '}
                            <span style={{ color: sessionStatus === 'ACTIVE' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                {sessionStatus}
                            </span>
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        {/* Connection lost warning */}
                        {!isConnected && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#f87171',
                            }}>
                                <WifiOff size={14} /> Mất kết nối...
                            </div>
                        )}

                        {/* Closing countdown */}
                        {sessionStatus === 'CLOSING' && closingTimeLeft !== null && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 8, padding: '6px 14px',
                            }}>
                                <span style={{ fontSize: 14 }}>⏱</span>
                                <div>
                                    <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Phòng sắp đóng</div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: '#f87171' }}>{formatTime(closingTimeLeft)}</div>
                                </div>
                            </div>
                        )}

                        {/* Copy Link */}
                        <button className="btn btn-ghost" onClick={handleCopyLink} style={{ fontSize: 12 }}>
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Đã sao chép' : '🔗 Copy Link'}
                        </button>
                    </div>
                </div>

                {/* MAIN GRID */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 260px',
                        gap: 14,
                        flex: 1,
                        minHeight: 0,
                    }}
                >
                    {/* CENTER: Editor */}
                    <div
                        className="card"
                        style={{
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Editor fills rest */}
                        <div style={{ flex: 1 }}>
                            <CodeEditor roomId={roomId} viewingUser={viewingUser} workspaceId={workspaceId} />
                        </div>
                    </div>

                    {/* RIGHT: Participants */}
                    <div
                        className="card"
                        style={{
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        <Participants roomId={roomId} currentUserId={currentUser?.id} viewingUser={viewingUser} onSelectUser={setViewingUser} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
