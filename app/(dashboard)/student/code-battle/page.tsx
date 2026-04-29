'use client';


import { useBattleSocket } from '@/hooks/useBattleSocket';
import { battlesApi } from '@/api/battles.api';
import { leaderboardApi, LeaderboardItem } from '@/api/leaderboard.api';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Swords, Timer, User, Zap, Globe, Target, Code2 } from 'lucide-react';

const battleCode = [
  '// Tìm dãy con có tổng lớn nhất (Kadanes Algorithm)',
  'def max_subarray(nums):',
  '    max_sum = nums[0]',
  '    cur_sum = nums[0]',
  '    for n in nums[1:]:',
  '        cur_sum = max(n, cur_sum + n)',
  '        max_sum = max(max_sum, cur_sum) |',
];

export default function CodeBattlePage() {
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  const { timer, progress, isStarted, battleData } = useBattleSocket(activeBattleId || undefined);
  const [isFinding, setIsFinding] = useState(false);

  // Lấy danh sách đối thủ thực tế từ Leaderboard
  const { data: boardData, isLoading: isLoadingOpponents } = useQuery({
    queryKey: ['opponents-lobby'],
    queryFn: async () => {
      const resp = await leaderboardApi.getLeaderboard('ALL_TIME', 'RATING', 10);
      return resp;
    },
  });


  const opponents: LeaderboardItem[] = boardData?.items || [];
  const currentUserRank = boardData?.currentUser?.rank;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleChallenge = async (opponentId: string) => {
    setIsFinding(true);
    try {
      const resp = await battlesApi.challenge(opponentId, 15, 'Random');
      setActiveBattleId(resp.id);
    } catch (e: any) {

      const msg = e.response?.data?.message || 'Không thể thách đấu lúc này';
      alert(`Lỗi: ${msg}`);
    } finally {
      setIsFinding(false);
    }
  };

  const handleCancel = async () => {
    if (activeBattleId) {
      try {
        await battlesApi.cancel(activeBattleId);
      } finally {
        setActiveBattleId(null);
      }
    }
  };

  return (
    <>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Swords size={28} color="var(--accent-red)" /> Code Battle
            </h1>
            <p className="page-subtitle">Thi đấu thuật toán 1v1 - Dữ liệu thời gian thực</p>
          </div>
        </div>

        {/* Active battle banner */}
        {isStarted && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(249,115,22,0.1))',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: 12, padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Zap className="animate-pulse" color="#ef4444" size={20} />
              <span style={{ fontWeight: 800, fontSize: 16, color: '#f87171' }}>TRẬN ĐẤU ĐANG DIỄN RA</span>
              <span className="badge badge-red">LIVE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Thời gian còn lại</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#f87171', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
                  {formatTime(timer)}
                </div>
              </div>
              <button className="btn btn-ghost" onClick={handleCancel}>Hủy trận</button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Lobby */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={16} color="var(--accent-purple)" /> Chế độ đấu
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{
                  padding: '12px', borderRadius: 10, textAlign: 'center',
                  background: 'rgba(124,58,237,0.12)', border: '1px solid var(--accent-purple)',
                }}>
                  <Swords style={{ margin: '0 auto 4px' }} color="var(--accent-purple)" />
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-purple)' }}>1 vs 1</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Đấu đơn xếp hạng</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Globe size={16} color="var(--accent-cyan)" /> Lobby Trực Tuyến
                </span>
                {isLoadingOpponents && <Loader2 className="animate-spin" size={14} />}
              </div>
              {opponents.length === 0 && !isLoadingOpponents && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Chưa có đối thủ nào khả dụng.</div>
              )}
              {opponents.map((op) => (
                <div key={op.userId} style={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid var(--border-light)', 
                  display: 'flex', alignItems: 'center', gap: 12,
                  opacity: op.rank === currentUserRank ? 0.6 : 1,
                  background: op.rank === currentUserRank ? 'var(--bg-secondary)' : 'transparent'
                }}>
                  <div className="avatar" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {op.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {op.name} {op.rank === currentUserRank && '(Bạn)'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Hạng #{op.rank} • Rating {op.score}</div>
                  </div>
                  {op.rank !== currentUserRank && (
                    <button 
                       className="btn btn-primary" 
                       style={{ padding: '5px 12px', fontSize: 11 }}
                       onClick={() => handleChallenge(op.userId)}
                       disabled={isFinding}
                    >
                      {isFinding ? <Loader2 className="animate-spin" size={14} /> : 'Thách đấu'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             {isStarted ? (
               <div className="card" style={{ padding: '14px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <div className="avatar" style={{ background: '#7c3aed', color: 'white', width: 40, height: 40 }}>K</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>Bạn</div>
                      <div style={{ fontSize: 11, color: 'var(--accent-purple-light)' }}>Tiến độ: {progress['me'] || 0}%</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0 16px' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent-red)' }}>VS</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>Đối thủ</div>
                      <div style={{ fontSize: 11, color: '#f59e0b' }}>Tiến độ: {progress['opponent'] || 0}%</div>
                    </div>
                    <div className="avatar" style={{ background: '#f59e0b', color: 'white', width: 40, height: 40 }}>?</div>
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 8 }}>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${progress['me'] || 0}%`, background: 'var(--accent-purple)', float: 'right' }} />
                    </div>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${progress['opponent'] || 0}%`, background: '#f59e0b' }} />
                    </div>
                  </div>
                </div>
              </div>
             ) : (
               <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Swords size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                  <div>Chưa có trận đấu nào. Chọn đối thủ trong Lobby để thách đấu!</div>
                  <div style={{ fontSize: 11, marginTop: 8 }}>Lưu ý: Đối thủ cần chấp nhận lời thách đấu để bắt đầu.</div>
               </div>
             )}

            {isStarted && (
              <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Code2 size={14} /> Code Editor
                  </span>
                  <span className="badge badge-cyan">Python 3.11</span>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '10px 0', minHeight: 200 }}>
                   <div style={{ padding: '16px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                   {battleCode.map((line, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12 }}>
                        <span style={{ width: 24, textAlign: 'right', opacity: 0.3, userSelect: 'none' }}>{i + 1}</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
