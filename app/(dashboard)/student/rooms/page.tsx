'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { roomApi, Room } from '@/api/room.api';
import EditRoomModal from './_components/EditRoomModal';
import { Loader2, Plus, Play, Users, Search, Globe, Lock, Edit2, Handshake, GraduationCap, Wind, Home } from 'lucide-react';

export default function StudentRoomsLobbyPage() {
    const router = useRouter();
    const [tab, setTab] = useState<'mine' | 'public'>('public');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch My Rooms
    const { data: myRoomsData, isLoading: isMyRoomsLoading } = useQuery({
        queryKey: ['my-rooms'],
        queryFn: async () => {
            const resp = await roomApi.getMyRooms();
            return resp as Room[];
        },
    });

    // Fetch Public Rooms
    const { data: publicRoomsData, isLoading: isPublicLoading } = useQuery({
        queryKey: ['public-rooms'],
        queryFn: async () => {
            const resp = await roomApi.getRooms();
            return resp as Room[];
        },
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

    const rawRooms = tab === 'mine' ? (myRoomsData || []) : (publicRoomsData || []);
    const isLoading = tab === 'mine' ? isMyRoomsLoading : isPublicLoading;

    // Search and Filter
    const filteredRooms = useMemo(() => {
        if (!searchTerm.trim()) return rawRooms;
        const lowSearch = searchTerm.toLowerCase();
        return rawRooms.filter(r => 
            r.name.toLowerCase().includes(lowSearch) || 
            r.description?.toLowerCase().includes(lowSearch)
        );
    }, [rawRooms, searchTerm]);

    const handleJoin = (roomId: string) => {
        router.push(`/student/rooms/${roomId}`);
    };

    const handleEdit = (room: Room) => {
        setSelectedRoom(room);
        setIsEditModalOpen(true);
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
          case 'PAIR': return <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Handshake size={14} /> Lập trình cặp</span>;
          case 'GROUP': return <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Users size={14} /> Nhóm học tập</span>;
          case 'CLASS': return <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GraduationCap size={14} /> Lớp học</span>;
          default: return <span className="badge badge-gray">{type}</span>;
        }
    };

    return (
        <div className="page-container animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Home size={28} color="var(--accent-purple)" /> Phòng học trực tuyến
                    </h1>
                    <p className="page-subtitle">Tham gia các phiên học tập cộng tác hoặc tạo không gian riêng của bạn</p>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={() => router.push('/student/rooms/create')}
                >
                    <Plus size={16} /> Tạo phòng mới
                </button>
            </div>

            {/* Tabs & Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: 4, borderRadius: 10, gap: 4 }}>
                    <button 
                        className={tab === 'public' ? 'btn btn-primary' : 'btn btn-ghost'} 
                        style={{ padding: '6px 16px', fontSize: 13, borderRadius: 8 }}
                        onClick={() => setTab('public')}
                    >
                        <Globe size={14} style={{ marginRight: 6 }} /> Khám phá
                    </button>
                    <button 
                        className={tab === 'mine' ? 'btn btn-primary' : 'btn btn-ghost'} 
                        style={{ padding: '6px 16px', fontSize: 13, borderRadius: 8 }}
                        onClick={() => setTab('mine')}
                    >
                        <Lock size={14} style={{ marginRight: 6 }} /> Phòng của tôi
                    </button>
                </div>
                <div style={{ position: 'relative', width: 280 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        className="input" 
                        placeholder="Tìm tên phòng..." 
                        style={{ paddingLeft: 36, height: 38, fontSize: 13 }} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Thông tin phòng</th>
                            <th>Chủ phòng</th>
                            <th>Loại</th>
                            <th>Người tham gia</th>
                            <th>Ngày tạo</th>
                            <th style={{ textAlign: 'right' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 60 }}>
                                    <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 12px', color: 'var(--accent-purple)' }} />
                                    <div style={{ color: 'var(--text-secondary)' }}>Đang tải danh sách phòng...</div>
                                </td>
                            </tr>
                        ) : filteredRooms.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
                                    <div style={{ marginBottom: 16 }}><Wind size={48} opacity={0.3} style={{ margin: '0 auto' }} /></div>
                                    <p style={{ fontWeight: 600 }}>
                                        {searchTerm ? 'Không tìm thấy phòng phù hợp' : (tab === 'mine' ? 'Bạn chưa tạo phòng nào' : 'Hiện chưa có phòng học nào hoạt động')}
                                    </p>
                                    <p style={{ fontSize: 13, marginTop: 4 }}>Hãy thử tạo một phòng mới hoặc tìm kiếm với từ khóa khác.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredRooms.map((room) => (
                                <tr key={room.id}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{room.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {room.description || 'Không có mô tả'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="avatar" style={{ width: 24, height: 24, fontSize: 10, background: 'var(--bg-secondary)', color: 'white' }}>
                                                {room.createdBy?.fullName?.charAt(0)}
                                            </div>
                                            <span style={{ fontSize: 13 }}>{room.createdBy?.fullName}</span>
                                        </div>
                                    </td>
                                    <td>{getTypeBadge(room.type)}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Users size={14} color="var(--text-muted)" />
                                            <span style={{ fontWeight: 600 }}>{room.participantsCount || 0}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                        {new Date(room.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            {tab === 'mine' && (
                                                <button 
                                                    className="btn btn-ghost" 
                                                    style={{ padding: '6px 10px' }}
                                                    onClick={() => handleEdit(room)}
                                                    title="Chỉnh sửa phòng"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            )}
                                            <button 
                                                className="btn btn-primary" 
                                                style={{ padding: '6px 16px', fontSize: 12 }}
                                                onClick={() => handleJoin(room.id)}
                                            >
                                                <Play size={12} fill="currentColor" /> Vào phòng
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <EditRoomModal 
                open={isEditModalOpen} 
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedRoom(null);
                }} 
                room={selectedRoom} 
            />
        </div>
    );
}
