'use client';


import { io, Socket } from 'socket.io-client';
import { useBattleSocket } from '@/hooks/useBattleSocket';
import { useCurrentUserInfo } from '@/app/components/_api/queries';
import { battlesApi } from '@/api/battles.api';
import { leaderboardApi, LeaderboardItem } from '@/api/leaderboard.api';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Swords, Timer, User, Zap, Globe, Target, Code2, Play, Upload, Star, Trophy, X, ChevronRight } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { toast } from '@/components/ui/Toast';
import ProblemUiStudent from '../components/problem-ui-student';
import { useStudentProblemDetail } from '@/hooks/useProblems';
import { useSubmitCode } from '../problems/code-editor/_api/mutations';

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
  const { data: user } = useCurrentUserInfo();
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  const { timer, progress, isStarted, battleData } = useBattleSocket(activeBattleId || undefined);
  const [isFinding, setIsFinding] = useState(false);
  const [userStatuses, setUserStatuses] = useState<Record<string, string>>({});
  const [incomingChallenge, setIncomingChallenge] = useState<any>(null);
  const notificationSocketRef = useRef<Socket | null>(null);

  // IDE States
  const [code, setCode] = useState<string>('# Bắt đầu viết code của bạn ở đây\n');
  const [problemSlug, setProblemSlug] = useState<string | null>(null);

  useEffect(() => {
    if (battleData?.problemSlug) {
      setProblemSlug(battleData.problemSlug);
    }
  }, [battleData]);

  const { data: problemDetail, isLoading: isLoadingProblem } = useStudentProblemDetail(
    problemSlug || '',
    undefined,
    undefined,
    !!problemSlug
  );

  const submitMutation = useSubmitCode();

  // Socket for notifications (Presence)
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const s = io(`${apiUrl}/notifications`, {
      transports: ['websocket'],
      auth: { token: localStorage.getItem('accessToken') }
    });
    notificationSocketRef.current = s;

    s.on('statuses_updated', (statuses) => {
      setUserStatuses(prev => ({ ...prev, ...statuses }));
    });

    s.on('notification_received', (notif) => {
      if (notif.type === 'battle' && notif.metadata?.battleId) {
        setIncomingChallenge(notif);
        toast({ type: 'info', title: 'Thách đấu mới', message: `Bạn nhận được lời mời từ ${notif.metadata.challengerName}` });
      }
    });

    return () => { s.disconnect(); };
  }, []);

  // Poll for statuses when opponents load
  const opponentsQuery = useQuery({
    queryKey: ['opponents-lobby'],
    queryFn: async () => {
      const resp = await leaderboardApi.getLeaderboard('ALL_TIME', 'RATING', 20);
      return resp;
    },
    refetchInterval: 10000, // Refresh lobby every 10s
  });

  const opponents: LeaderboardItem[] = opponentsQuery.data?.items || [];
  const currentUserRank = opponentsQuery.data?.currentUser?.rank;

  useEffect(() => {
    if (opponents.length > 0 && notificationSocketRef.current) {
      notificationSocketRef.current.emit('get_statuses', {
        userIds: opponents.map(o => o.userId)
      });
    }
  }, [opponents]);

  const handleChallenge = async (opponentId: string) => {
    setIsFinding(true);
    try {
      const resp = await battlesApi.challenge(opponentId, 15, 'Random');
      setActiveBattleId(resp.id);
      toast({ type: 'success', title: 'Đã gửi lời mời', message: 'Đang chờ đối thủ chấp nhận...' });
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Không thể thách đấu lúc này';
      toast({ type: 'error', title: 'Lỗi', message: msg });
    } finally {
      setIsFinding(false);
    }
  };

  const handleCancel = async () => {
    if (activeBattleId) {
      try {
        await battlesApi.cancel(activeBattleId);
        setActiveBattleId(null);
        setProblemSlug(null);
        setIsFinding(false);
        toast({ type: 'info', title: 'Đã hủy', message: 'Lời mời thách đấu đã được rút lại.' });
      } catch (e) {
        toast({ type: 'error', title: 'Lỗi', message: 'Không thể hủy lúc này' });
      }
    }
  };

  const handleAccept = async (battleId: string) => {
    try {
      // Tham gia vào phòng socket trước để không bỏ lỡ sự kiện battle_started
      setActiveBattleId(battleId);
      await battlesApi.accept(battleId);
      setIncomingChallenge(null);
      toast({ type: 'success', title: 'Thành công', message: 'Trận đấu đang bắt đầu!' });
    } catch (e) {
      toast({ type: 'error', title: 'Lỗi', message: 'Không thể chấp nhận thách đấu' });
    }
  };

  const handleReject = async (battleId: string) => {
    try {
      await battlesApi.cancel(battleId);
      setIncomingChallenge(null);
    } catch (e) {
      setIncomingChallenge(null);
    }
  };

  const handleSurrender = async () => {
    if (!activeBattleId) return;
    if (!confirm('Bạn có chắc chắn muốn đầu hàng? Bạn sẽ bị trừ điểm Rating.')) return;
    
    try {
      await battlesApi.surrender(activeBattleId);
    } catch (e) {
      toast({ type: 'error', title: 'Lỗi', message: 'Không thể đầu hàng lúc này' });
    }
  };

  const handleSubmit = async () => {
    if (!activeBattleId || !problemDetail?.version?.id) return;

    try {
      toast({ type: 'info', title: 'Đang nộp bài', message: 'Vui lòng chờ trong giây lát...' });
      await submitMutation.mutateAsync({
        languageId: 1, // Default to Python for battle simplicity for now
        language: 'python',
        entryFile: 'main.py',
        files: [{ filename: 'main.py', content: code, language: 'python' }],
        answers: {},
        problemVersionId: problemDetail.version.id,
        battleId: activeBattleId
      });
    } catch (e) {
      toast({ type: 'error', title: 'Lỗi', message: 'Không thể nộp bài' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return '#22c55e';
      case 'BUSY': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'Online';
      case 'BUSY': return 'Đang bận';
      default: return 'Offline';
    }
  };

  return (
    <>
      <div className="page-container animate-in">
        {isStarted && (
          <div className="battle-active-header card" style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderRadius: 16, padding: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 20,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Thời gian</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: timer < 60 ? '#ef4444' : '#fff', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                  {formatTime(timer)}
                </div>
              </div>
              <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Bài tập</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-purple-light)' }}>{problemDetail?.title || 'Đang tải...'}</div>
              </div>
            </div>

            <div style={{ flex: 1, margin: '0 60px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, fontWeight: 700 }}>
                <span style={{ color: 'var(--accent-purple-light)' }}>BẠN: {progress[user?.id || ''] || 0}%</span>
                <span style={{ color: '#f59e0b' }}>ĐỐI THỦ: {Object.entries(progress).find(([id]) => id !== user?.id)?.[1] || 0}%</span>
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${progress[user?.id || ''] || 0}%`, background: 'var(--accent-purple)', transition: 'width 0.5s ease' }} />
                <div style={{ flex: 1 }} />
                <div style={{ width: `${Object.entries(progress).find(([id]) => id !== user?.id)?.[1] || 0}%`, background: '#f59e0b', transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -15%)', fontSize: 18, fontWeight: 900, color: '#ef4444', textShadow: '0 0 10px rgba(239,68,68,0.5)' }}>VS</div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
               <button className="btn btn-ghost" onClick={handleSurrender} style={{ color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: 12 }}>Đầu hàng</button>
               <button className="btn btn-ghost" onClick={() => window.location.reload()} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Rời trận</button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isStarted ? '350px 1fr' : '1fr 380px', gap: 20, height: isStarted ? 'calc(100vh - 250px)' : 'auto' }}>
          {/* Sidebar / Lobby */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', minHeight: 0 }}>
            {isStarted ? (
              <div className="card" style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', fontWeight: 700, fontSize: 13 }}>
                  Đề bài chi tiết
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {isLoadingProblem ? (
                    <div style={{ padding: 20, textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
                  ) : (
                    <ProblemUiStudent
                      title={problemDetail?.title}
                      description={problemDetail?.version?.description}
                      difficulty={problemDetail?.difficulty as any}
                      testcases={problemDetail?.testcases}
                    />
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="card">
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Target size={16} color="var(--accent-purple)" /> Chế độ thi đấu
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                    <div style={{
                      padding: '16px', borderRadius: 12,
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.05))',
                      border: '1px solid rgba(124,58,237,0.3)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <Swords color="var(--accent-purple)" size={20} />
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-purple-light)' }}>Ranked 1v1</div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tham gia đấu hạng để tích lũy điểm Rating và leo lên bảng xếp hạng toàn cầu.</div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14, display: 'flex', justifyContent: 'space-between', background: 'var(--bg-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Globe size={16} color="var(--accent-cyan)" /> Lobby Trực Tuyến
                    </span>
                    {opponentsQuery.isLoading && <Loader2 className="animate-spin" size={14} />}
                  </div>
                  <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                    {opponents.length === 0 && !opponentsQuery.isLoading && (
                      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                        <User size={32} style={{ margin: '0 auto 12px', opacity: 0.1 }} />
                        Chưa có đối thủ nào khả dụng.
                      </div>
                    )}
                    {opponents.map((op) => {
                      const isMe = op.userId === user?.id;
                      const status = userStatuses[op.userId] || 'OFFLINE';
                      const canChallenge = status === 'ONLINE' && !isMe;

                      return (
                        <div key={op.userId} style={{
                          padding: '14px 16px',
                          borderBottom: '1px solid var(--border-light)',
                          display: 'flex', alignItems: 'center', gap: 12,
                          background: isMe ? 'rgba(124, 58, 237, 0.05)' : 'transparent',
                          transition: 'all 0.2s'
                        }}>
                          <div style={{ position: 'relative' }}>
                            <div className="avatar" style={{ background: isMe ? 'var(--accent-purple)' : 'var(--bg-secondary)', color: isMe ? '#fff' : 'var(--text-primary)', width: 36, height: 36, fontSize: 14 }}>
                              {op.name.charAt(0)}
                            </div>
                            <div style={{
                              position: 'absolute', bottom: 0, right: 0, width: 10, height: 10,
                              borderRadius: '50%', background: getStatusColor(status),
                              border: '2px solid var(--bg-primary)'
                            }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                              {op.name} {isMe && <span style={{ fontSize: 10, color: 'var(--accent-purple-light)' }}>(Bạn)</span>}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Trophy size={10} color="#eab308" /> {op.score} • #{op.rank} • <span style={{ color: getStatusColor(status) }}>{getStatusText(status)}</span>
                            </div>
                          </div>
                          {canChallenge && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: 11, borderRadius: 8 }}
                              onClick={() => handleChallenge(op.userId)}
                              disabled={isFinding}
                            >
                              {isFinding ? <Loader2 className="animate-spin" size={14} /> : 'Thách đấu'}
                            </button>
                          )}
                          {!isMe && status === 'BUSY' && (
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>Đang bận</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Main IDE / Result Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
            {isStarted ? (
              <div className="card" style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Code2 size={16} color="var(--accent-purple)" />
                    <span style={{ fontSize: 13, fontWeight: 700 }}>Trình soạn thảo</span>
                    <div className="badge badge-purple" style={{ fontSize: 10 }}>Python</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }} onClick={handleSubmit} disabled={submitMutation.isPending}>
                      {submitMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <><Play size={14} /> Chạy thử</>}
                    </button>
                    <button className="btn btn-primary" style={{ padding: '4px 16px', fontSize: 12 }} onClick={handleSubmit} disabled={submitMutation.isPending}>
                      {submitMutation.isPending ? 'Đang nộp...' : <><Upload size={14} /> Nộp bài</>}
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1, background: '#1e1e1e' }}>
                  <Editor
                    height="100%"
                    defaultLanguage="python"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, monospace',
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 16, bottom: 16 }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card" style={{ padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary))', border: '1px dashed var(--border)' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <Swords size={40} color="var(--accent-purple)" style={{ opacity: 0.5 }} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Sẵn sàng thi đấu?</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 300, margin: '0 auto 24px' }}>
                    Chọn một đối thủ đang trực tuyến trong Lobby để bắt đầu trận đấu 1v1.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                    <div style={{ padding: '10px 16px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 12 }}>
                      <div style={{ fontWeight: 700 }}>{opponentsQuery.data?.currentUser?.score || user?.rating || 1500}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Rating của bạn</div>
                    </div>
                    <div style={{ padding: '10px 16px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 12 }}>
                      <div style={{ fontWeight: 700 }}>#{opponentsQuery.data?.currentUser?.rank || '---'}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Hạng hiện tại</div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Star size={16} color="#eab308" /> Trận đấu gần đây
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2].map(i => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="badge badge-green">WIN</div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>vs Opponent_{i}</div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>+24 RP</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Challenge Modal */}
        {incomingChallenge && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000
          }}>
            <div className="card" style={{ width: 400, textAlign: 'center', padding: '30px' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Swords size={30} color="var(--accent-purple)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Thách đấu mới!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{incomingChallenge.metadata.challengerName}</span> đã thách đấu bạn một trận Ranked 1v1.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleReject(incomingChallenge.metadata.battleId)}
                  style={{ border: '1px solid var(--border)' }}
                >
                  Từ chối
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleAccept(incomingChallenge.metadata.battleId)}
                >
                  Chấp nhận
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Battle End Modal */}
        {battleData?.winner && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, animation: 'fadeIn 0.5s ease'
          }}>
            <div className="card" style={{ width: 400, textAlign: 'center', padding: '40px 30px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, background: 'var(--accent-purple)', opacity: 0.1, borderRadius: '50%', filter: 'blur(40px)' }} />

              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{battleData.winner.winnerId === user?.id ? '🏆' : (battleData.winner.winnerId === null ? '🤝' : '💀')}</div>
                <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: battleData.winner.winnerId === user?.id ? '#eab308' : (battleData.winner.winnerId === null ? '#94a3b8' : '#ef4444') }}>
                  {battleData.winner.winnerId === user?.id ? 'CHIẾN THẮNG!' : (battleData.winner.winnerId === null ? 'HÒA' : 'THẤT BẠI')}
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>
                  {battleData.winner.winnerId === user?.id 
                    ? 'Bạn đã hoàn thành bài tập nhanh hơn đối thủ!' 
                    : battleData.winner.winnerId === null ? 'Trận đấu kết thúc với kết quả hòa.' : `Người thắng cuộc là ${battleData.winner.winnerName}`}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 30 }}>
                  <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Thay đổi Rating</div>
                    <div style={{ 
                      fontWeight: 700, 
                      color: (user?.id === battleData?.player1 ? (battleData.winner.ratingChanges?.p1 >= 0) : (battleData.winner.ratingChanges?.p2 >= 0)) ? '#22c55e' : '#ef4444' 
                    }}>
                      {user?.id === battleData?.player1 
                        ? (battleData.winner.ratingChanges?.p1 > 0 ? '+' : '') + (battleData.winner.ratingChanges?.p1 || 0) 
                        : (battleData.winner.ratingChanges?.p2 > 0 ? '+' : '') + (battleData.winner.ratingChanges?.p2 || 0)
                      } RP
                    </div>
                  </div>
                  <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Thời gian kết thúc</div>
                    <div style={{ fontWeight: 700 }}>{new Date(battleData.winner.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>

                <button className="btn btn-primary w-full" onClick={() => window.location.reload()}>Quay lại Lobby</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
