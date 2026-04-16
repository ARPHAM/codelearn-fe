'use client';

import { useQuery } from '@tanstack/react-query';
import { roomApi, Room } from '@/api/room.api';
import { Loader2, Users, Calendar, Shield, Trash2, Home } from 'lucide-react';

export default function AdminRoomsPage() {
  const { data: roomsData, isLoading } = useQuery({
    queryKey: ['admin-all-rooms'],
    queryFn: async () => {
      const resp = await roomApi.getRooms();
      return resp as Room[];
    },
  });

  const rooms = roomsData || [];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PAIR': return <span className="badge badge-cyan">🤝 Lập trình cặp</span>;
      case 'GROUP': return <span className="badge badge-purple">👥 Nhóm học tập</span>;
      case 'CLASS': return <span className="badge badge-green">🎓 Lớp học</span>;
      default: return <span className="badge badge-gray">{type}</span>;
    }
  };

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🏠 Quản lý Phòng học</h1>
          <p className="page-subtitle">Giám sát và quản lý các phòng học/phiên lập trình cặp đang hoạt động</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-danger">🚫 Đóng toàn bộ phòng</button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tổng số phòng</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{rooms.length}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Người đang online</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: 'var(--accent-green)' }}>
            {rooms.reduce((acc, r) => acc + (r.participantsCount || 0), 0)}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Loader2 className="animate-spin" size={40} color="var(--accent-purple)" />
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Thông tin phòng</th>
                <th>Chủ phòng</th>
                <th>Loại phòng</th>
                <th>Người tham gia</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{room.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {room.id}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
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
                      <button className="btn btn-ghost" style={{ padding: 8 }} title="Tham gia giám sát">
                        <Shield size={16} />
                      </button>
                      <button className="btn btn-ghost" style={{ padding: 8, color: 'var(--accent-red)' }} title="Đóng phòng">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr>
                   <td colSpan={6} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                      Hiện không có phòng học nào đang hoạt động.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
