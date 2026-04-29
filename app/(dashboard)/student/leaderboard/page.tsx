'use client';


import { useQuery } from '@tanstack/react-query';
import { leaderboardApi, LeaderboardItem } from '@/api/leaderboard.api';
import { Loader2, Flame, Award, Crosshair, Swords, Zap, Trophy, ClipboardList, Star, Medal, Handshake, Brain, BarChart3, Target } from 'lucide-react';
import { useState } from 'react';

const badges = [
  { icon: <Zap size={24} />, name: 'Speed Coder', desc: 'Giải trong < 5 phút', color: '#f59e0b', earned: true },
  { icon: <Flame size={24} />, name: 'On Fire', desc: 'Streak 7 ngày', color: '#ef4444', earned: true },
  { icon: <Target size={24} />, name: 'Perfect Score', desc: '100% test cases', color: '#10b981', earned: true },
  { icon: <Handshake size={24} />, name: 'Helper', desc: 'Giúp 10 bạn', color: '#06b6d4', earned: false },
  { icon: <Trophy size={24} />, name: 'Battle Master', desc: 'Thắng 50 trận', color: '#7c3aed', earned: false },
  { icon: <Brain size={24} />, name: 'Algorithm God', desc: 'Giải 100 bài hard', color: '#ec4899', earned: false },
];

export default function LeaderboardPage() {
  const [boardType, setBoardType] = useState<'RATING' | 'XP'>('RATING');

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard', boardType],
    queryFn: async () => {
      const resp = await leaderboardApi.getLeaderboard('ALL_TIME', boardType, 20);
      return resp;
    },
  });




  const items: LeaderboardItem[] = leaderboardData?.items || [];
  const currentUser = leaderboardData?.currentUser;

  // Top 3 Podium logic
  const top1 = items.find(i => i.rank === 1);
  const top2 = items.find(i => i.rank === 2);
  const top3 = items.find(i => i.rank === 3);

  const podium = [
    { sv: top2, rank: 2, height: 140, badge: <Medal size={28} color="#94a3b8" />, color: '#94a3b8' },
    { sv: top1, rank: 1, height: 180, badge: <Medal size={36} color="#f59e0b" />, color: '#f59e0b' },
    { sv: top3, rank: 3, height: 120, badge: <Medal size={28} color="#b45309" />, color: '#b45309' },
  ];

  return (
    <>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Trophy size={28} color="#f59e0b" /> Leaderboard & Danh hiệu
            </h1>
            <p className="page-subtitle">Bảng xếp hạng thực tế từ hệ thống — Cập nhật thời gian thực</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 8, padding: 4, gap: 4 }}>
              <button 
                className={boardType === 'RATING' ? 'btn btn-primary' : 'btn btn-ghost'} 
                style={{ padding: '7px 14px', borderRadius: 6, fontSize: 13 }}
                onClick={() => setBoardType('RATING')}
              >
                <Swords size={16} style={{ display: 'inline', marginRight: 6 }} /> Thi đấu (Rating)
              </button>
              <button 
                className={boardType === 'XP' ? 'btn btn-primary' : 'btn btn-ghost'} 
                style={{ padding: '7px 14px', borderRadius: 6, fontSize: 13 }}
                onClick={() => setBoardType('XP')}
              >
                <Flame size={16} style={{ display: 'inline', marginRight: 6 }} /> Cày cuốc (XP)
              </button>
            </div>
          </div>
        </div>


        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <Loader2 className="animate-spin" size={40} color="var(--accent-purple)" />
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, padding: '20px 0' }}>
              {podium.map((p) => {
                if (!p.sv) return null;
                return (
                  <div key={p.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 28 }}>{p.badge}</div>
                    <div className="avatar" style={{
                      background: 'var(--bg-secondary)', color: 'white',
                      width: p.rank === 1 ? 56 : 44, height: p.rank === 1 ? 56 : 44,
                      fontSize: p.rank === 1 ? 16 : 13,
                      boxShadow: p.rank === 1 ? '0 0 24px rgba(245,158,11,0.5)' : 'none',
                      border: `2px solid ${p.color}`,
                    }}>
                      {p.sv.name.split(' ').pop()?.charAt(0)}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>
                      {p.sv.name.split(' ').slice(-2).join(' ')}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: p.color }}>
                      {p.sv.score.toLocaleString()} pts
                    </div>
                    <div style={{
                      width: p.rank === 1 ? 100 : 80,
                      height: p.height,
                      background: p.rank === 1 ? 'linear-gradient(to top, rgba(245,158,11,0.3), rgba(245,158,11,0.1))' : 'var(--bg-card)',
                      border: `1px solid ${p.color}`,
                      borderRadius: '8px 8px 0 0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, fontWeight: 900, color: p.color,
                    }}>#{p.rank}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
              {/* Full leaderboard */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ClipboardList size={16} color="var(--accent-purple)" /> Danh sách xếp hạng
                </div>
                <table className="table">
                  <thead>
                    <tr><th>#</th><th>Sinh viên</th><th>Điểm</th><th>Solved</th><th>Win Rate</th><th>Streak</th></tr>
                  </thead>
                  <tbody>
                    {items.map(sv => (
                      <tr key={sv.userId} style={{ background: sv.userId === currentUser?.userId ? 'rgba(124,58,237,0.06)' : 'transparent' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 800, fontSize: 14, color: sv.rank <= 3 ? '#f59e0b' : 'var(--text-muted)' }}>{sv.rank}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar" style={{ background: 'var(--bg-secondary)', color: 'white', width: 30, height: 30, fontSize: 11 }}>
                              {sv.name.split(' ').pop()?.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{sv.name}</div>
                              {sv.userId === currentUser?.userId && (
                                <span style={{ fontSize: 10, color: 'var(--accent-purple-light)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                  <Star size={8} fill="currentColor" /> Bạn
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td><span style={{ fontWeight: 800, fontSize: 15, color: sv.rank === 1 ? '#f59e0b' : 'var(--text-primary)' }}>{sv.score.toLocaleString()}</span></td>
                        <td><span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{sv.solvedCount}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-bar" style={{ width: 60 }}>
                              <div className="progress-fill" style={{ width: `${Math.round(sv.winRate * 100)}%`, background: 'var(--accent-green)' }} />
                            </div>
                            <span style={{ fontSize: 11 }}>{Math.round(sv.winRate * 100)}%</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: 'var(--accent-orange)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Flame size={14} /> {sv.streak}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Badges & Personal details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Medal size={18} color="var(--accent-purple)" /> Huy chương của bạn
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {badges.map(b => (
                      <div key={b.name} style={{
                        padding: '14px 12px', borderRadius: 10, textAlign: 'center',
                        background: b.earned ? `rgba(124,58,237, 0.1)` : 'var(--bg-secondary)',
                        border: `1px solid ${b.earned ? 'var(--accent-purple)55' : 'var(--border)'}`,
                        opacity: b.earned ? 1 : 0.4,
                      }}>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>{b.icon}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: b.earned ? 'var(--text-primary)' : 'var(--text-muted)', marginBottom: 3 }}>{b.name}</div>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.3 }}>{b.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.25)' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-purple-light)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BarChart3 size={18} /> Thống kê cá nhân
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-secondary)' }}><Award size={14} style={{ display: 'inline', marginRight: 4 }} /> Hạng hiện tại</span>
                      <span style={{ fontWeight: 700 }}>#{currentUser?.rank || '?'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-secondary)' }}><Crosshair size={14} style={{ display: 'inline', marginRight: 4 }} /> Điểm tổng</span>
                      <span style={{ fontWeight: 700 }}>{currentUser?.score.toLocaleString() || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-secondary)' }}><Flame size={14} style={{ display: 'inline', marginRight: 4 }} /> Chuỗi (Streak)</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>Dữ liệu real-time</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

