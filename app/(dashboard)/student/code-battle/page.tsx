'use client';


import { io, Socket } from 'socket.io-client';
import { useBattleSocket } from '@/hooks/useBattleSocket';
import { useCurrentUserInfo } from '@/app/components/_api/queries';
import { battlesApi } from '@/api/battles.api';
import { leaderboardApi, LeaderboardItem } from '@/api/leaderboard.api';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Swords, Timer, User, Zap, Globe, Target, Code2, Play, Upload, Star, Trophy, X, ChevronRight, Terminal, Database, Search, ChevronLeft } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { toast } from '@/components/ui/Toast';
import ProblemUiStudent from '../components/problem-ui-student';
import { useStudentProblemDetail } from '@/hooks/useProblems';
import { useLanguages } from '@/hooks/useLanguages';
import { useSubmitCode, useRunCode, getRunResult, getSubmissionResult } from '@/features/problems/mutations';

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
  const [search, setSearch] = useState('');
  const [lobbyPage, setLobbyPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // IDE States
  const [code, setCode] = useState<string>('# Bắt đầu viết code của bạn ở đây\n');
  const [problemSlug, setProblemSlug] = useState<string | null>(null);
  const [status, setStatus] = useState<"IDLE" | "RUNNING" | "QUEUED" | "COMPLETED" | "ERROR">("IDLE");
  const [runResult, setRunResult] = useState<any>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [customInput, setCustomInput] = useState<string>("");
  const [resultTab, setResultTab] = useState<'output' | 'input'>('output');
  const socketRef = useRef<Socket | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: languages = [] } = useLanguages();
  const [language, setLanguage] = useState('python');
  const [selectedLanguageId, setSelectedLanguageId] = useState<number>(1);

  // Sync language name and ID
  useEffect(() => {
    if (languages.length > 0) {
      const langObj = languages.find(l => l.name.toLowerCase() === language.toLowerCase());
      if (langObj && langObj.id !== selectedLanguageId) {
        setSelectedLanguageId(langObj.id);
      }
    }
  }, [language, languages]);

  useEffect(() => {
    if (battleData?.problemSlug) {
      setProblemSlug(battleData.problemSlug);
    }
  }, [battleData]);

  const { data: problemDetail, isLoading: isLoadingProblem } = useStudentProblemDetail(
    problemSlug || '',
    selectedLanguageId,
    undefined,
    !!problemSlug
  );

  // Initialize code from problem template
  useEffect(() => {
    if (problemDetail && isStarted) {
      const template = problemDetail.languageFiles?.find((f: any) => f.languageId === selectedLanguageId && f.type === 'TEMPLATE');
      if (template) {
        setCode(template.content);
      } else {
        // Fallback to system default template
        const langObj = languages.find(l => l.id === selectedLanguageId);
        if (langObj) setCode(langObj.template || '# Bắt đầu viết code của bạn ở đây\n');
      }
    }
  }, [problemDetail, isStarted, selectedLanguageId]);

  const submitMutation = useSubmitCode();
  const runMutation = useRunCode();

  // Socket initialization for battle results
  const initSocket = () => {
    if (socketRef.current?.connected) return socketRef.current;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const s = io(apiUrl, {
        autoConnect: true,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });
    socketRef.current = s;
    return s;
  };

  const listenToResult = async (id: string, type: 'RUN' | 'SUBMIT') => {
    if (!id) return;
    
    console.log(`[Polling] Bắt đầu theo dõi ${type} ID: ${id}`);
    const s = initSocket();
    const eventName = `submission-${id}`;
    let isFinished = false;

    const handler = (data: any) => {
        if (isFinished) return;
        
        const currentStatus = data?.status?.toLowerCase();
        console.log(`[Polling] Nhận dữ liệu trạng thái: ${currentStatus}`);

        // Chỉ kết thúc nếu trạng thái không phải là đang chờ hoặc đang xử lý
        // Danh sách trạng thái đang xử lý chuẩn từ BE: queued, pending, running
        const processingStatuses = ['queued', 'pending', 'running'];
        if (currentStatus && !processingStatuses.includes(currentStatus)) {
            console.log(`[Polling] Đã có kết quả cuối cùng: ${currentStatus}. Kết thúc theo dõi.`);
            isFinished = true;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            
            setStatus("COMPLETED");
            if (type === 'SUBMIT' || data.score !== undefined) {
                setSubmitResult(data);
                setRunResult(null);
                if (data.score !== undefined) {
                    toast({ 
                        type: data.status?.toLowerCase() === 'accepted' ? 'success' : 'info', 
                        title: 'Kết quả nộp bài', 
                        message: `Bạn đạt ${data.score}/${data.maxScore} điểm (${data.testcasesPassed}/${data.testcasesTotal} testcases).` 
                    });
                }
            } else {
                setRunResult(data);
                setSubmitResult(null);
            }
            s.off(eventName);
        }
    };

    s.on(eventName, handler);

    // Polling logic
    const startPolling = async () => {
        while (!isFinished) {
            try {
                console.log(`[Polling] Đang gọi API kiểm tra kết quả...`);
                const data = type === 'RUN' ? await getRunResult(id) : await getSubmissionResult(id);
                if (data) {
                    handler(data);
                }
            } catch (err) {
                console.error("[Polling] Lỗi khi gọi API:", err);
            }
            
            if (!isFinished) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }
    };

    startPolling();

    timeoutRef.current = setTimeout(() => {
        if (!isFinished) {
            isFinished = true;
            setStatus("ERROR");
            toast({ type: 'warning', title: 'Hệ thống bận', message: "Vui lòng đợi thêm hoặc thử lại sau." });
        }
    }, 60000); // Tăng lên 60s cho chắc chắn
  };

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
        // Tham gia vào phòng socket ngay để sẵn sàng nhận sự kiện battle_started
        setActiveBattleId(notif.metadata.battleId);
        toast({ type: 'info', title: 'Thách đấu mới', message: `Bạn nhận được lời mời từ ${notif.metadata.challengerName}` });
      }
    });

    return () => { s.disconnect(); };
  }, []);

  // Poll for statuses when opponents load
  const opponentsQuery = useQuery({
    queryKey: ['opponents-lobby', lobbyPage, debouncedSearch],
    queryFn: () => battlesApi.getLobby({ page: lobbyPage, limit: 10, search: debouncedSearch }),
    refetchInterval: 10000, // Refresh lobby every 10s
  });

  const myRankQuery = useQuery({
    queryKey: ['my-rank'],
    queryFn: () => leaderboardApi.getMyRank(),
    refetchInterval: 60000, // Refresh every minute
  });

  const isPlayer1 = user?.id === battleData?.player1;
  const myProgress = progress[user?.id || ''] || 0;
  const opponentId = isPlayer1 ? battleData?.player2 : battleData?.player1;
  const opponentProgress = progress[opponentId || ''] || 0;

  useEffect(() => {
    if (notificationSocketRef.current) {
      const interval = setInterval(() => {
        notificationSocketRef.current?.emit('heartbeat', { status: 'ONLINE' });
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [notificationSocketRef.current]);
  
  const historyQuery = useQuery({
    queryKey: ['battle-history'],
    queryFn: () => battlesApi.getMyHistory(),
    refetchInterval: 30000, // Refresh history every 30s
  });

  const opponents: any[] = opponentsQuery.data?.items || [];
  const meta = opponentsQuery.data?.meta;

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
      const resp = await battlesApi.challenge(opponentId, 60, 'Random');
      setActiveBattleId(resp.id);
      toast({ type: 'success', title: 'Đã gửi lời mời', message: 'Đang chờ đối thủ chấp nhận...' });
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Không thể thách đấu lúc này';
      toast({ type: 'error', title: 'Lỗi', message: msg });
    } finally {
      setIsFinding(false);
    }
  };

  const handleRun = async () => {
    if (!activeBattleId || !problemDetail?.version?.id) return;

    setStatus("RUNNING");
    setRunResult(null);
    setSubmitResult(null);
    setResultTab('output');

    try {
      const langObj = languages.find(l => l.id === selectedLanguageId);
      const entryFile = problemDetail?.version?.entryFile || (langObj ? `main${langObj.ext}` : 'main.py');

      const resp = await runMutation.mutateAsync({
        languageId: selectedLanguageId,
        entryFile: entryFile,
        files: [{ filePath: entryFile, content: code }],
        input: customInput,
        problemVersionId: problemDetail?.version?.id as string
      });
      setStatus("QUEUED");
      listenToResult(resp.id, 'RUN');
    } catch (e) {
      setStatus("ERROR");
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
      setActiveBattleId(null);
    } catch (e) {
      setIncomingChallenge(null);
      setActiveBattleId(null);
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

    setStatus("RUNNING");
    setRunResult(null);
    setSubmitResult(null);
    setResultTab('output');

    try {
      toast({ type: 'info', title: 'Đang nộp bài', message: 'Hệ thống đang chấm bài của bạn...' });
      const langObj = languages.find(l => l.id === selectedLanguageId);
      const entryFile = problemDetail?.version?.entryFile || (langObj ? `main${langObj.ext}` : 'main.py');

      const resp = await submitMutation.mutateAsync({
        languageId: selectedLanguageId,
        entryFile: entryFile,
        files: [{ filePath: entryFile, content: code }],
        problemVersionId: problemDetail?.version?.id as string,
        battleId: activeBattleId
      });
      setStatus("QUEUED");
      listenToResult(resp.id, 'SUBMIT');
    } catch (e) {
      setStatus("ERROR");
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
                <span style={{ color: 'var(--accent-purple-light)' }}>BẠN: {myProgress}%</span>
                <span style={{ color: '#f59e0b' }}>ĐỐI THỦ: {opponentProgress}%</span>
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${myProgress}%`, background: 'var(--accent-purple)', transition: 'width 0.5s ease' }} />
                <div style={{ flex: 1 }} />
                <div style={{ width: `${opponentProgress}%`, background: '#f59e0b', transition: 'width 0.5s ease' }} />
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

                  <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14, display: 'flex', justifyContent: 'space-between', background: 'var(--bg-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Globe size={16} color="var(--accent-cyan)" /> Lobby Trực Tuyến
                      </span>
                      {opponentsQuery.isLoading && <Loader2 className="animate-spin" size={14} />}
                    </div>

                    {/* Search Bar */}
                    <div style={{ padding: '10px 16px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          placeholder="Tìm kiếm đối thủ..."
                          value={search}
                          onChange={(e) => { setSearch(e.target.value); setLobbyPage(1); }}
                          style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            padding: '6px 12px 6px 32px',
                            fontSize: 12,
                            color: 'var(--text-primary)',
                            outline: 'none'
                          }}
                        />
                      </div>
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
                              <Trophy size={10} color="#eab308" /> {op.score} {op.isRecent && <span style={{ marginLeft: 4, color: 'var(--accent-purple-light)', fontWeight: 700 }}>• Đối thủ gần đây</span>} • <span style={{ color: getStatusColor(status) }}>{getStatusText(status)}</span>
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

                  {/* Pagination */}
                  {meta && meta.totalPages > 1 && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: 10, background: 'var(--bg-secondary)' }}>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: 4, minWidth: 32, height: 32 }}
                        onClick={() => setLobbyPage(p => Math.max(1, p - 1))}
                        disabled={lobbyPage === 1}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                        Trang {lobbyPage} / {meta.totalPages}
                      </div>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: 4, minWidth: 32, height: 32 }}
                        onClick={() => setLobbyPage(p => Math.min(meta.totalPages, p + 1))}
                        disabled={lobbyPage === meta.totalPages}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
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
                    <select 
                      className="badge badge-purple" 
                      style={{ fontSize: 10, border: 'none', background: 'var(--accent-purple)', color: '#fff', cursor: 'pointer', outline: 'none' }}
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {languages.map(l => (
                        <option key={l.id} value={l.name.toLowerCase()} style={{ background: 'var(--bg-secondary)', color: 'var(--text-main)' }}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }} onClick={handleRun} disabled={status === "RUNNING" || status === "QUEUED"}>
                      {status === "RUNNING" || status === "QUEUED" ? <Loader2 className="animate-spin" size={14} /> : <><Play size={14} /> Chạy thử</>}
                    </button>
                    <button className="btn btn-primary" style={{ padding: '4px 16px', fontSize: 12 }} onClick={handleSubmit} disabled={status === "RUNNING" || status === "QUEUED"}>
                      {status === "RUNNING" || status === "QUEUED" ? 'Đang chấm...' : <><Upload size={14} /> Nộp bài</>}
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1, background: '#1e1e1e', minHeight: 0 }}>
                  <Editor
                    height="100%"
                    defaultLanguage="python"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 16, bottom: 16 }
                    }}
                  />
                </div>

                {/* Terminal Section */}
                <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', height: 200, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: 20, padding: '0 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                        <div onClick={() => setResultTab('input')} style={{ padding: '8px 4px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: resultTab === 'input' ? 'var(--accent-purple)' : 'var(--text-muted)', borderBottom: resultTab === 'input' ? '2px solid var(--accent-purple)' : '2px solid transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Terminal size={12} /> Đầu vào
                        </div>
                        <div onClick={() => setResultTab('output')} style={{ padding: '8px 4px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: resultTab === 'output' ? 'var(--accent-purple)' : 'var(--text-muted)', borderBottom: resultTab === 'output' ? '2px solid var(--accent-purple)' : '2px solid transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Database size={12} /> Kết quả
                        </div>
                    </div>

                    <div style={{ flex: 1, padding: 12, overflowY: 'auto', fontSize: 12, fontFamily: 'monospace' }}>
                        {resultTab === 'input' ? (
                            <textarea
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                placeholder="Nhập đầu vào (stdin) tại đây..."
                                style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#a5d6ff', resize: 'none' }}
                            />
                        ) : (
                            <div style={{ height: '100%' }}>
                                {status === "RUNNING" || status === "QUEUED" ? (
                                    <div style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Loader2 className="animate-spin" size={14} />
                                        Đang thực thi mã nguồn...
                                    </div>
                                ) : status === "IDLE" ? (
                                    <div style={{ color: 'var(--text-muted)' }}>Chưa có kết quả. Nhấn "Chạy thử" hoặc "Nộp bài" để xem kết quả.</div>
                                ) : (
                                    <>
                                        {runResult && (
                                            <div>
                                                <div style={{ color: runResult.status?.toLowerCase() === 'accepted' ? '#22c55e' : '#ef4444', fontWeight: 'bold', marginBottom: 4 }}>
                                                    Trạng thái: {runResult.status || 'Hoàn tất'} {runResult.runtime ? `(${runResult.runtime}ms)` : ''}
                                                </div>
                                                {runResult.compileOutput && (
                                                    <pre style={{ background: 'rgba(239,68,68,0.1)', padding: 8, borderRadius: 4, color: '#f87171', whiteSpace: 'pre-wrap' }}>{runResult.compileOutput}</pre>
                                                )}
                                                {runResult.output && (
                                                    <pre style={{ background: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 4, color: '#fff', whiteSpace: 'pre-wrap' }}>{runResult.output}</pre>
                                                )}
                                                {runResult.error && (
                                                    <pre style={{ background: 'rgba(239,68,68,0.1)', padding: 8, borderRadius: 4, color: '#f87171' }}>{runResult.error}</pre>
                                                )}
                                            </div>
                                        )}
                                        {submitResult && (
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--accent-purple)' }}>
                                                        Điểm: {submitResult.score} / {submitResult.maxScore}
                                                    </div>
                                                    <div style={{ color: 'var(--text-muted)' }}>
                                                        Testcases: {submitResult.testcasesPassed} / {submitResult.testcasesTotal}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: 6, marginBottom: 12 }}>
                                                    {submitResult.results?.map((res: any, idx: number) => (
                                                        <div key={idx} style={{
                                                            padding: '4px', borderRadius: 4, textAlign: 'center', fontSize: 10,
                                                            background: res.passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                                            border: `1px solid ${res.passed ? '#22c55e' : '#ef4444'}`,
                                                            color: res.passed ? '#22c55e' : '#ef4444'
                                                        }}>
                                                            TC {idx + 1}
                                                        </div>
                                                    ))}
                                                </div>
                                                {submitResult.errorMessage && (
                                                    <pre style={{ background: 'rgba(239,68,68,0.1)', padding: 8, borderRadius: 4, color: '#f87171', whiteSpace: 'pre-wrap' }}>{submitResult.errorMessage}</pre>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
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
                      <div style={{ fontWeight: 700 }}>{myRankQuery.data?.score || user?.rating || 1500}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Rating của bạn</div>
                    </div>
                    <div style={{ padding: '10px 16px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 12 }}>
                      <div style={{ fontWeight: 700 }}>#{myRankQuery.data?.rank || '---'}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Hạng hiện tại</div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Star size={16} color="#eab308" /> Trận đấu gần đây
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
                    {historyQuery.isLoading ? (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}><Loader2 className="animate-spin" size={20} /></div>
                    ) : !historyQuery.data || historyQuery.data.length === 0 ? (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Chưa có trận đấu nào gần đây.</div>
                    ) : (
                      historyQuery.data.map((h: any) => {
                        const isP1 = h.player1Id === user?.id;
                        const opponent = isP1 ? h.player2 : h.player1;
                        const ratingChange = isP1 ? h.player1RatingChange : h.player2RatingChange;
                        const isWinner = h.winnerId === user?.id;
                        const isDraw = h.winnerId === null && h.status === 'ENDED';
                        const isCancelled = h.status === 'CANCELLED';
                        
                        if (isCancelled) return null;

                        return (
                          <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div className={`badge badge-${isWinner ? 'green' : (isDraw ? 'gray' : 'red')}`} style={{ minWidth: 45, textAlign: 'center' }}>
                                {isWinner ? 'WIN' : (isDraw ? 'DRAW' : 'LOSS')}
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 600 }}>vs {opponent?.fullName || 'Đối thủ'}</div>
                            </div>
                            <div style={{ fontSize: 11, color: ratingChange >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                              {ratingChange >= 0 ? '+' : ''}{ratingChange} RP
                            </div>
                          </div>
                        );
                      })
                    )}
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

                <button className="btn btn-primary w-full" onClick={() => { setActiveBattleId(null); window.location.reload(); }}>Quay lại Lobby</button>
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
