import { useState, useEffect } from 'react';
import { socket } from '@/features/realtime/socket';
import { useParticipants } from '@/features/room/queries';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUserInfo } from '@/app/components/_api/queries';
import { Eye, Crown } from 'lucide-react';
import { ParticipantData } from '@/features/room/api';

interface ParticipantsProps {
    roomId: string;
    currentUserId?: string;
    viewingUser: ParticipantData | null;
    onSelectUser: (user: ParticipantData | null) => void;
}

export default function Participants({ roomId, currentUserId, viewingUser, onSelectUser }: ParticipantsProps) {
    const { data: currentUser } = useCurrentUserInfo();
    const { data: initialParticipants, isLoading } = useParticipants(roomId);
    const queryClient = useQueryClient();
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const handleMembersOnline = (data: { roomId: string; userIds: string[] }) => {
            setOnlineUserIds(new Set(data.userIds));
        };

        const handleUserJoined = (data: { userId: string }) => {
            console.log("User joined socket:", data.userId);
            setOnlineUserIds(prev => {
                const next = new Set(prev);
                next.add(data.userId);
                return next;
            });
            // Re-fetch the full list from DB to see the new person
            queryClient.invalidateQueries({ queryKey: ['room_participants', roomId] });
        };

        const handleUserLeft = (data: { userId: string }) => {
            console.log("User left socket:", data.userId);
            setOnlineUserIds(prev => {
                const next = new Set(prev);
                next.delete(data.userId);
                return next;
            });
            // Re-fetch the full list from DB to remove the person (if BE deleted them)
            queryClient.invalidateQueries({ queryKey: ['room_participants', roomId] });
        };

        socket.on('room_members_online', handleMembersOnline);
        socket.on('user_joined', handleUserJoined);
        socket.on('user_left', handleUserLeft);

        return () => {
            socket.off('room_members_online', handleMembersOnline);
            socket.off('user_joined', handleUserJoined);
            socket.off('user_left', handleUserLeft);
        };
    }, []);

    if (isLoading) {
        return (
            <div style={{ padding: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                Đang tải danh sách...
            </div>
        );
    }

    const allUsers = initialParticipants || [];

    const checkIsSelf = (participant: ParticipantData) => {
        if (!currentUser) return false;
        
        // Match by ID
        if (String(participant.userId) === String(currentUser.id)) return true;
        
        // Match by Email (Robust fallback)
        if (participant.user?.email && participant.user.email === currentUser.email) return true;
        
        return false;
    };

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
            {/* Header */}
            <div style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>👥 Thành viên</div>
                <span className="badge badge-green" style={{ fontSize: 9 }}>
                    {onlineUserIds.size} online
                </span>
            </div>

            {/* User List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
                {allUsers.length === 0 && onlineUserIds.size === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                        Chưa ai ở đây cả...
                    </div>
                )}

                {allUsers.map((participant, index) => {
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
