'use client';


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningPathApi } from '@/api/learning-path.api';
import { Loader2, RefreshCw } from 'lucide-react';

type NodeStatus = 'done' | 'active' | 'locked';

interface SkillNode {
  id: string;
  title: string;
  tag: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: NodeStatus;
  progress: number;
  position: { x: number; y: number };
  parentId: string | null;
}

const diffColors: Record<string, string> = { EASY: 'badge-green', MEDIUM: 'badge-yellow', HARD: 'badge-red' };
const statusColors: Record<NodeStatus, string> = { done: '#10b981', active: '#7c3aed', locked: '#374151' };

export default function LearningPathPage() {
  const queryClient = useQueryClient();

  // 1. Fetch Skill Tree Data
  const { data: pathData, isLoading: isPathLoading } = useQuery({
    queryKey: ['learning-path'],
    queryFn: async () => {
      const resp = await learningPathApi.getMyPath();
      return resp.data.data.nodes as SkillNode[];
    },
  });


  // 2. Fetch AI Suggestions
  const { data: suggestionData } = useQuery({
    queryKey: ['ai-suggestions'],
    queryFn: async () => {
      const resp = await learningPathApi.getSuggestions(3);
      return resp.data.data.suggestions;
    },
  });


  // 3. Mutation to Refresh Path
  const refreshMutation = useMutation({
    mutationFn: () => learningPathApi.refreshPath(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-path'] });
    },
  });

  const pathNodes = pathData || [];
  const suggested = suggestionData || [];

  const activeNode = pathNodes.find(n => n.status === 'active');

  return (
    <>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">🗺️ Lộ trình Học tập</h1>
            <p className="page-subtitle">AI gợi ý bài tập dựa trên kỹ năng còn yếu — Lộ trình cá nhân hóa</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
          >
            {refreshMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : '🤖 Cập nhật gợi ý AI'}
          </button>
        </div>

        {isPathLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
               <Loader2 className="animate-spin" size={40} color="var(--accent-purple)" />
            </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
            {/* Skill tree visualization */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🌳 Skill Tree</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 20 }}>
                  <span style={{ color: '#10b981' }}>● Hoàn thành</span>
                  <span style={{ color: '#7c3aed', marginLeft: 12 }}>● Đang học</span>
                  <span style={{ color: '#374151', marginLeft: 12 }}>● Chưa mở khóa</span>
                </div>

                {/* SVG Tree */}
                <div style={{ 
                  position: 'relative', 
                  height: 500, 
                  background: 'var(--bg-primary)', 
                  borderRadius: 10, 
                  border: '1px solid var(--border)', 
                  overflow: 'auto',
                  padding: 20
                }}>
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: 600, height: 600 }}>
                    {/* Connection lines */}
                    {pathNodes.map(node => {
                      if (!node.parentId) return null;
                      const parent = pathNodes.find(n => n.id === node.parentId);
                      if (!parent) return null;
                      
                      return (
                        <line key={`${parent.id}-${node.id}`}
                          x1={parent.position.x} y1={parent.position.y}
                          x2={node.position.x} y2={node.position.y}
                          stroke={parent.status === 'done' ? '#10b981' : '#30363d'}
                          strokeWidth="2" strokeDasharray={node.status === 'locked' ? '5,4' : '0'}
                          opacity="0.6"
                        />
                      );
                    })}
                  </svg>

                  {/* Nodes */}
                  {pathNodes.map(node => (
                    <div key={node.id} style={{
                      position: 'absolute',
                      left: node.position.x, top: node.position.y,
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      cursor: node.status !== 'locked' ? 'pointer' : 'default',
                      zIndex: 2,
                    }}>
                      <div style={{
                        width: node.status === 'active' ? 64 : 52,
                        height: node.status === 'active' ? 64 : 52,
                        borderRadius: '50%',
                        background: node.status === 'done' ? 'rgba(16,185,129,0.2)' : node.status === 'active' ? 'rgba(124,58,237,0.2)' : 'var(--bg-secondary)',
                        border: `3px solid ${statusColors[node.status]}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto',
                        boxShadow: node.status === 'active' ? 'var(--shadow-glow-purple)' : 'none',
                        transition: 'all 0.2s',
                        fontSize: node.status === 'done' ? 20 : node.status === 'locked' ? 16 : 22,
                      }}>
                        {node.status === 'done' ? '✅' : node.status === 'locked' ? '🔒' : node.tag.slice(0, 1).toUpperCase()}
                      </div>
                      <div style={{
                        marginTop: 6, fontSize: 10, fontWeight: 700,
                        color: node.status === 'active' ? 'var(--accent-purple-light)' : node.status === 'done' ? 'var(--accent-green)' : 'var(--text-muted)',
                        maxWidth: 80, lineHeight: 1.3,
                      }}>{node.title}</div>
                      {node.status === 'active' && (
                        <div style={{ marginTop: 4 }}>
                          <div className="progress-bar" style={{ width: 64, margin: '0 auto', height: 4 }}>
                            <div className="progress-fill" style={{ width: `${node.progress}%`, background: 'var(--accent-purple)' }} />
                          </div>
                          <div style={{ fontSize: 9, color: 'var(--accent-purple-light)', marginTop: 2 }}>{node.progress}%</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Current skill detail */}
              <div className="card" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-purple-light)' }}>
                    🎯 Đang học: {activeNode?.title || 'Chưa chọn'}
                  </div>
                  <span className="badge badge-yellow">Active</span>
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Tiến độ</div>
                    <div className="progress-bar" style={{ height: 8 }}>
                      <div className="progress-fill" style={{ width: `${activeNode?.progress || 0}%`, background: 'var(--accent-purple)' }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--accent-purple-light)', fontWeight: 700, marginTop: 3 }}>
                      {activeNode?.progress || 0}% hoàn thành
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Độ khó</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{activeNode?.difficulty || 'N/A'}</div>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>▶ Tiếp tục luyện tập</button>
              </div>
            </div>

            {/* Right: AI suggestions + weak skills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* AI suggested exercises */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>🤖 AI Gợi ý cho bạn</span>
                  <span className="badge badge-purple">Powered by AI</span>
                </div>
                {suggested.length === 0 ? (
                   <div style={{ padding: 16, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                      Đang phân tích kỹ năng của bạn...
                   </div>
                ) : suggested.map((ex: any) => (
                  <div key={ex.problemId} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{ex.title}</div>
                      <span className={`badge ${diffColors[ex.difficulty] || 'badge-gray'}`} style={{ marginLeft: 8, flexShrink: 0 }}>
                        {ex.difficulty}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--accent-cyan)', marginBottom: 8 }}>💡 {ex.aiReason}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 11 }}>Làm ngay →</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall stats placeholder */}
              <div className="card" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.25)' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#34d399', marginBottom: 12 }}>🏅 Tiến trình của bạn</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                   Hãy hoàn thành các bài tập trong lộ trình để AI phân tích chính xác hơn.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

