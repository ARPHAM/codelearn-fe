'use client';


import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics.api';
import { Loader2, TrendingUp, Users, CheckCircle, AlertTriangle } from 'lucide-react';

function MiniBarChart({ data, days }: { data: number[]; days: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
      {data.map((val, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
          <div style={{
            width: '100%', height: `${(val / max) * 48}px`,
            background: val > 80 ? 'var(--accent-purple)' : 'rgba(124,58,237,0.4)',
            borderRadius: '3px 3px 0 0', minHeight: 4, transition: 'height 0.5s ease',
          }} />
          <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['lecturer-dashboard'],
    queryFn: async () => {
      const resp = await analyticsApi.getLecturerDashboard();
      return resp.data;
    },
  });

  // Mock course ID for now
  const { data: courseData } = useQuery({
    queryKey: ['course-analytics'],
    queryFn: async () => {
      const resp = await analyticsApi.getCourseAnalytics('all');
      return resp.data;
    },
  });

  const stats = [
    { label: 'Sinh viên', value: courseData?.totalStudents || 0, icon: <Users size={20} />, color: '#7c3aed', trend: '+5 tuần này' },
    { label: 'Tỷ lệ hoàn thành', value: `${courseData?.avgCompletion || 0}%`, icon: <CheckCircle size={20} />, color: '#10b981', trend: 'Dựa trên bài tập' },
    { label: 'Đang gặp khó', value: courseData?.stuckStudents || 0, icon: <AlertTriangle size={20} />, color: '#f59e0b', trend: 'Cần chú ý' },
    { label: 'Tổng số bài tập', value: dashboard?.totalProblems || 0, icon: <TrendingUp size={20} />, color: '#ef4444', trend: 'Đang hoạt động' },
  ];

  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const weeklyData = courseData?.weeklySubmissions || [0, 0, 0, 0, 0, 0, 0];

  return (
    <>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">📊 Analytics Dashboard</h1>
            <p className="page-subtitle">Dữ liệu thực tế từ hệ thống — Theo dõi tiến độ lớp học</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select className="select"><option>Tất cả lớp</option></select>
            <button className="btn btn-ghost">📤 Xuất báo cáo</button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <Loader2 className="animate-spin" size={40} color="var(--accent-purple)" />
          </div>
        ) : (
          <>
            {/* Top stats */}
            <div className="grid-4">
              {stats.map(s => (
                <div key={s.label} className="stat-card" style={{ borderTop: `2px solid ${s.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, marginTop: 4 }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{s.trend}</div>
                    </div>
                    <span style={{ color: s.color }}>{s.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
              {/* Exercise progress & Weekly activity */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>📈 Hoạt động nộp bài trong tuần</div>
                  <MiniBarChart data={weeklyData} days={days} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span>Tổng lượt nộp bài theo ngày</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Dữ liệu thời gian thực</span>
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 20 }}>🎯 Kỹ năng sinh viên còn yếu (AI phân tích)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {dashboard?.topWeakSkills?.map((skill: string) => (
                      <span key={skill} className="badge badge-red" style={{ padding: '8px 12px', fontSize: 12 }}>{skill}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Alerts placeholder */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.3)' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#f87171', marginBottom: 12 }}>🚨 Cảnh báo hệ thống</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Hệ thống sẽ tự động cảnh báo khi có nhiều sinh viên bị kẹt ở cùng một bài tập.
                  </div>
                  <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
                    📣 Gửi thông báo nhắc nhở
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

