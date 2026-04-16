'use client';

import { useQuery } from '@tanstack/react-query';
import { roomApi, Room } from '@/api/room.api';
import { useRouter } from 'next/navigation';
import { Loader2, Users, Plus, Play, Sparkles } from 'lucide-react';

export default function PairProgrammingLobbyPage() {
  const router = useRouter();

  const { data: roomsData, isLoading } = useQuery({
    queryKey: ['pair-rooms-lobby'],
    queryFn: async () => {
      const resp = await roomApi.getRooms();
      // Chỉ lấy các phòng loại PAIR
      const allRooms = resp as Room[];
      return allRooms.filter(r => r.type === 'PAIR');
    },
    refetchInterval: 10000, // Cập nhật mỗi 10 giây
  });

  const rooms = roomsData || [];

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🤝 Lập trình Cặp (Pair Programming)</h1>
          <p className="page-subtitle">Tìm kiếm cộng sự, cùng nhau giải quyết các thử thách thuật toán khó</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => router.push('/student/rooms/create?type=PAIR')}
        >
          <Plus size={16} /> Tạo phòng Pair mới
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Hero section for finding partners */}
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.1))',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Bạn đang tìm kiếm cộng sự?</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 450 }}>
                Học tập cùng nhau giúp bạn tiến bộ nhanh gấp 2 lần. Tham gia vào các phòng đang mở hoặc tạo phòng riêng để mời bạn bè.
              </p>
            </div>
            <div style={{ 
                width: 64, height: 64, borderRadius: 20, 
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Sparkles size={32} color="var(--accent-purple)" className="animate-pulse" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>🌐 Các phiên đang chờ cộng sự</h3>
            <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>● {rooms.length} phòng đang online</span>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Loader2 className="animate-spin" size={32} color="var(--accent-purple)" />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {rooms.map((room) => (
                <div key={room.id} className="card card-hover" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{room.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {room.id.substring(0, 8)}</div>
                    </div>
                    <span className="badge badge-cyan">PAIR</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: 'var(--bg-secondary)' }}>
                      {room.createdBy?.fullName?.charAt(0)}
                    </div>
                    <div style={{ fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Chủ phòng:</span>{' '}
                      <span style={{ fontWeight: 600 }}>{room.createdBy?.fullName}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <Users size={14} color="var(--text-muted)" />
                      <span>{room.participantsCount}/2 thành viên</span>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '6px 14px', fontSize: 12 }}
                      onClick={() => router.push(`/student/rooms/${room.id}`)}
                      disabled={room.participantsCount >= 2}
                    >
                      {room.participantsCount >= 2 ? 'Đã đầy' : 'Tham gia ngay'}
                    </button>
                  </div>
                </div>
              ))}
              {rooms.length === 0 && (
                <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border)', borderRadius: 16, color: 'var(--text-muted)' }}>
                  Chưa có phòng PAIR nào đang mở. Hãy là người đầu tiên tạo phòng!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>🥇 Lợi ích của Pair Programming</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { title: 'Tối ưu thuật toán', desc: 'Có thêm một góc nhìn giúp code sạch và tối ưu hơn.', icon: '🧠' },
                { title: 'Học hỏi lẫn nhau', desc: 'Chia sẻ kiến thức về cú pháp và các mẹo lập trình.', icon: '🤝' },
                { title: 'Giải quyết lỗi nhanh', desc: 'Phát hiện lỗi logic ngay khi đang gõ.', icon: '🐛' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(6, 182, 212, 0.05)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>
            <h4 style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent-cyan)', marginBottom: 12 }}>🛡️ Quy tắc cộng tác</h4>
            <ul style={{ paddingLeft: 16, fontSize: 11, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Luôn tôn trọng ý kiến của cộng sự.</li>
              <li>Thay đổi vai trò (Driver - Navigator) thường xuyên.</li>
              <li>Sử dụng chatbox hoặc voice để giao tiếp.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
