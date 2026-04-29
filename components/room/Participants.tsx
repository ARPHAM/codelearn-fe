import { useState, useEffect } from 'react';
import { socket } from '@/features/realtime/socket';
import { useParticipants } from '@/features/room/queries';
import { useApproveParticipant as useApproveParticipantMutation } from '@/features/room/mutations';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUserInfo } from '@/app/components/_api/queries';
import { Eye, Crown } from 'lucide-react';
import { ParticipantData } from '@/features/room/api';

interface ParticipantsProps {
    roomId: string;
    currentUserId?: string;
    viewingUser: ParticipantData | null;
    onSelectUser: (user: ParticipantData | null) => void;
    onlineUserIds: Set<string>;
}

export default function Participants({ roomId, currentUserId, viewingUser, onSelectUser, onlineUserIds }: ParticipantsProps) {
    const { data: currentUser } = useCurrentUserInfo();
    const { data: initialParticipants, isLoading } = useParticipants(roomId);
    const queryClient = useQueryClient();
    const { mutate: approve } = useApproveParticipantMutation();

    const allUsers = initialParticipants || [];

    const checkIsSelf = (participant: ParticipantData) => {
        if (!currentUser) return false;
        if (String(participant.userId) === String(currentUser.id)) return true;
        if (participant.user?.email && participant.user.email === currentUser.email) return true;
        return false;
    };

    const allJoinedMembers = allUsers.filter(u => {
        // If status is missing (due to DB sync issue), treat as JOINED as fallback
        const status = u.status || 'JOINED';
        return status === 'JOINED' || u.role === 'HOST' || checkIsSelf(u);
    });
    const pendingUsers = allUsers.filter(u => {
        const status = u.status || 'JOINED';
        return status === 'PENDING' && u.role !== 'HOST' && !checkIsSelf(u);
    });
    const isHostSelf = allUsers.find(u => checkIsSelf(u) && u.role === 'HOST');

    useEffect(() => {
        const handleRefresh = (data?: any) => {
            console.log("[Participants] Event received, forcing REFETCH...", data);
            // Use refetch instead of just invalidate to be more aggressive
            queryClient.refetchQueries({ queryKey: ['room_participants', roomId] });
        };

        socket.on('user_joined', handleRefresh);
        socket.on('user_left', handleRefresh);
        socket.on('room_members_online', handleRefresh);
        socket.on('join_request', (data) => {
            console.log("[Participants] JOIN REQUEST RECEIVED!", data);
            handleRefresh(data);
        }); 
        socket.on('participant_approved', handleRefresh);

        return () => {
            socket.off('user_joined', handleRefresh);
            socket.off('user_left', handleRefresh);
            socket.off('room_members_online', handleRefresh);
            socket.off('join_request');
            socket.off('participant_approved', handleRefresh);
        };
    }, [roomId, queryClient]);

    useEffect(() => {
        console.log("[Participants] RAW DATA FROM SERVER:", allUsers.map(u => ({ id: u.userId, status: u.status, role: u.role })));
        console.log("[Participants] Rendering List:", {
            joinedCount: allJoinedMembers.length,
            pendingCount: pendingUsers.length,
            onlineCount: onlineUserIds.size,
            isHost: !!isHostSelf
        });
    }, [allUsers, allJoinedMembers, pendingUsers, onlineUserIds, isHostSelf]);

    if (isLoading) {
        return (
            <div style={{ padding: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                Đang tải danh sách...
            </div>
        );
    }


    const handleClick = (participant: ParticipantData) => {
        if (checkIsSelf(participant)) {
            console.log("Clicked self -> Exiting viewing mode");
            onSelectUser(null);
            return;
        }

        if (viewingUser?.userId === participant.userId) {
            onSelectUser(null);
        } else {
            console.log("Viewing user:", participant.userId);
            onSelectUser(participant);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* User List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
                {isHostSelf && pendingUsers.length > 0 && (
                    <div style={{ marginBottom: 20, border: '1px solid var(--accent-purple)', borderRadius: 12, padding: 8, background: 'rgba(124,58,237,0.05)' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-purple)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="blink" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-purple)' }}></span>
                            Yêu cầu tham gia ({pendingUsers.length})
                        </div>
                        {pendingUsers.map((p) => (
                            <div key={p.userId} style={{ 
                                display: 'flex', alignItems: 'center', gap: 8, padding: 10, 
                                background: 'var(--bg-tertiary)', borderRadius: 10, marginBottom: 8,
                                border: '1px solid var(--border)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {p.user?.fullName || p.user?.email || 'Học viên mới'}
                                </div>
                                <button 
                                    className="btn btn-primary" 
                                    style={{ padding: '6px 12px', fontSize: 11, height: 'auto', borderRadius: 6 }}
                                    onClick={() => approve({ roomId, userId: p.userId })}
                                >
                                    Duyệt
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {allJoinedMembers.length === 0 && onlineUserIds.size === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                        Chưa ai ở đây cả...
                    </div>
                )}

                {allJoinedMembers.map((participant, index) => {
                    const isOnline = onlineUserIds.has(participant.userId);
                    const isViewing = viewingUser?.userId === participant.userId;
                    const isSelf = checkIsSelf(participant);
                    
                    const displayName = participant.user?.fullName || participant.user?.email || 'Unknown';
                    const isHost = participant.role === 'HOST';

                    return (
                        <div
                            key={participant.userId || `fallback-idx-${index}`}
                            onClick={() => handleClick(participant)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '8px 10px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                border: isViewing ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
                                background: isViewing ? 'rgba(124,58,237,0.1)' : 'transparent',
                                marginBottom: 4,
                            }}
                            onMouseEnter={e => { if (!isViewing) (e.currentTarget.style.background = 'var(--bg-hover)') }}
                            onMouseLeave={e => { if (!isViewing) (e.currentTarget.style.background = 'transparent') }}
                        >
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div
                                    className="avatar"
                                    style={{
                                        background: isViewing ? 'var(--gradient-purple)' : 'var(--bg-tertiary)',
                                        color: isViewing ? 'white' : 'var(--text-secondary)',
                                        border: `2px solid ${isOnline ? 'var(--accent-green)' : 'var(--border)'}`,
                                    }}
                                >
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                                {isOnline && (
                                    <div style={{
                                        position: 'absolute', bottom: -1, right: -1,
                                        width: 10, height: 10, borderRadius: '50%',
                                        background: 'var(--accent-green)',
                                        border: '2px solid var(--bg-card)',
                                        boxShadow: '0 0 6px var(--accent-green)',
                                    }} />
                                )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: 13, fontWeight: 600,
                                    color: (isViewing || isSelf) ? 'var(--accent-purple-light)' : 'var(--text-primary)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                }}>
                                    {displayName}
                                    {isSelf && (
                                        <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 400 }}>(bạn)</span>
                                    )}
                                    {isHost && (
                                        <Crown size={12} style={{ color: 'var(--accent-yellow)' }} />
                                    )}
                                </div>
                                {isViewing && (
                                    <div style={{
                                        fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                                        color: 'var(--accent-purple)', letterSpacing: '0.06em',
                                        display: 'flex', alignItems: 'center', gap: 3, marginTop: 2,
                                    }}>
                                        <Eye size={10} /> Đang xem
                                    </div>
                                )}
                            </div>

                            {!isViewing && (
                                <div style={{
                                    fontSize: 10, fontWeight: 600,
                                    color: isOnline ? 'var(--accent-green)' : 'var(--text-muted)',
                                }}>
                                    {isOnline ? 'ON' : 'OFF'}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
