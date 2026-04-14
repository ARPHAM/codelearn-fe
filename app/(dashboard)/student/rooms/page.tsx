'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useMyRooms } from '@/features/room/queries';
import { RoomData } from '@/features/room/api';
import { toast } from '@/components/ui/Toast';
import EditRoomModal from './_components/EditRoomModal';
import { Loader2, Plus, Edit2, Play, Users } from 'lucide-react';

export default function MyRoomsPage() {
    const router = useRouter();
    const { data: rooms = [], isLoading, refetch } = useMyRooms();
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

    const handleEdit = (room: RoomData) => {
        setSelectedRoom(room);
        setIsEditModalOpen(true);
    };

    const handleJoin = (roomId: string) => {
        router.push(`/student/rooms/${roomId}`);
    };

    const getStatusBadge = (status: RoomData['status']) => {
        switch (status) {
            case 'OPEN':
                return <span className="badge badge-green">🟢 Đang mở</span>;
            case 'CLOSED':
                return <span className="badge badge-red">🔴 Đã đóng</span>;
            default:
                return <span className="badge badge-ghost">{status}</span>;
        }
    };

    return (
        <>
            <div className="page-container animate-in">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">🏠 Quản lý Phòng học của tôi</h1>
                        <p className="page-subtitle">Quản lý các phiên code cộng tác do bạn tạo ra.</p>
                    </div>
                    <button 
                        className="btn btn-primary"
                        onClick={() => router.push('/student/rooms/create')}
                    >
                        <Plus size={16} style={{ marginRight: 6 }} />
                        Tạo phòng mới
                    </button>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Tên phòng</th>
                                <th>Loại</th>
                                <th>Sức chứa</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 60 }}>
                                        <Loader2 className="spin" size={32} style={{ margin: '0 auto 12px', color: 'var(--accent-purple)' }} />
                                        <div style={{ color: 'var(--text-secondary)' }}>Đang tải danh sách phòng...</div>
                                    </td>
                                </tr>
                            ) : rooms.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
                                        <p>Bạn chưa tạo phòng học nào.</p>
                                        <button 
                                            className="btn btn-ghost" 
                                            style={{ marginTop: 12 }}
                                            onClick={() => router.push('/student/rooms/create')}
                                        >
                                            🚀 Bắt đầu ngay
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                rooms.map((room) => (
                                    <tr key={room.id}>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{room.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {room.description || 'Không có mô tả'}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: 12 }}>
                                                {room.type === 'CODE' ? '💻 Coding' : '🎙️ Meeting'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                                <Users size={14} style={{ color: 'var(--text-muted)' }} />
                                                <span>{room.maxParticipants} người</span>
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(room.status)}</td>
                                        <td style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                            {new Date(room.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                <button 
                                                    className="btn btn-ghost" 
                                                    style={{ padding: '6px 10px', fontSize: 13 }}
                                                    onClick={() => handleEdit(room)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button 
                                                    className="btn btn-primary" 
                                                    style={{ padding: '6px 14px', fontSize: 13, gap: 6 }}
                                                    onClick={() => handleJoin(room.id)}
                                                >
                                                    <Play size={14} fill="currentColor" />
                                                    Vào phòng
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EditRoomModal 
                open={isEditModalOpen} 
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedRoom(null);
                }} 
                room={selectedRoom} 
            />
        </>
    );
}
