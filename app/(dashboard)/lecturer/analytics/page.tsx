'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics.api';
import {
  Loader2,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Target,
  BarChart3,
  Calendar,
  Bell
} from 'lucide-react';

function MiniBarChart({ data, days }: { data: number[]; days: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100, padding: '10px 0' }}>
      {data.map((val, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{
            width: '100%',
            height: `${(val / max) * 80}px`,
            background: 'linear-gradient(to top, var(--accent-purple), var(--accent-purple-light))',
            borderRadius: '6px 6px 2px 2px',
            minHeight: 4,
            transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
          }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: dashboard, isLoading: loadingDash } = useQuery({
    queryKey: ['lecturer-dashboard'],
    queryFn: async () => {
      const resp = await analyticsApi.getLecturerDashboard();
      return resp;
    },
  });

  const { data: courseData, isLoading: loadingCourse } = useQuery({
    queryKey: ['course-analytics', 'all'],
    queryFn: async () => {
      const resp = await analyticsApi.getCourseAnalytics('all');
      return resp;
    },
  });

  const isLoading = loadingDash || loadingCourse;

  const stats = [
    { 
      label: 'Tổng sinh viên', 
      value: courseData?.totalStudents || 0, 
      icon: Users, 
      color: '#8b5cf6', 
      trend: `${courseData?.trends?.students >= 0 ? '+' : ''}${courseData?.trends?.students || 0}% tháng này` 
    },
    { 
      label: 'Tỷ lệ hoàn thành', 
      value: `${courseData?.avgCompletion || 0}%`, 
      icon: CheckCircle, 
      color: '#10b981', 
      trend: `${(courseData?.trends?.completion || 0) >= 0 ? 'Tăng' : 'Giảm'} ${Math.abs(courseData?.trends?.completion || 0)}% so với kỳ trước` 
    },
    { 
      label: 'Sinh viên gặp khó', 
      value: courseData?.stuckStudents || 0, 
      icon: AlertTriangle, 
      color: '#f59e0b', 
      trend: (courseData?.stuckStudents || 0) > 0 ? 'Cần hỗ trợ sớm' : 'Đang ổn định' 
    },
    { 
      label: 'Tổng bài tập', 
      value: dashboard?.totalProblems || 0, 
      icon: Target, 
      color: '#3b82f6', 
      trend: 'Đang hoạt động' 
    },
  ];

  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
  const weeklyData = courseData?.weeklySubmissions || [0, 0, 0, 0, 0, 0, 0];
  const maxSubmissions = Math.max(...weeklyData, 0);
  const maxDayIndex = weeklyData.lastIndexOf(maxSubmissions);
  const avgSubmissions = (weeklyData.reduce((a: number, b: number) => a + b, 0) / 7).toFixed(1);

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BarChart3 size={28} color="var(--accent-purple-light)" /> Báo cáo & Thống kê
          </h1>
          <p className="page-subtitle">Theo dõi hiệu suất học tập và mức độ tương tác của sinh viên</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, height: 44, borderRadius: 12 }}>
            <Calendar size={16} color="var(--text-muted)" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Học kỳ Hiện tại</span>
          </div>
          <button className="btn btn-primary" style={{ height: 44 }}>
            Xuất báo cáo PDF
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Loader2 className="animate-spin" size={40} color="var(--accent-purple)" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top stats */}
          <div className="grid-4">
            {stats.map((s, i) => (
              <div key={i} className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: -10, right: -10,
                  width: 80, height: 80,
                  background: `${s.color}08`,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <s.icon size={40} color={s.color} style={{ opacity: 0.1 }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 36, height: 36,
                    background: `${s.color}15`,
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: s.color
                  }}>
                    <s.icon size={18} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <h2 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>{s.value}</h2>
                  <span style={{ fontSize: 11, color: s.color === '#ef4444' || s.color === '#f59e0b' ? s.color : 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <ArrowUpRight size={12} /> {s.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
            {/* Chart Section */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 4, height: 18, background: 'var(--accent-purple)', borderRadius: 2 }} />
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Tương tác hàng tuần</h3>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>Tuần này</button>
                  <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px', opacity: 0.5 }}>Tuần trước</button>
                </div>
              </div>

              <MiniBarChart data={weeklyData} days={days} />

              <div style={{
                marginTop: 24, padding: '16px', background: 'var(--bg-secondary)',
                borderRadius: 12, display: 'flex', justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase' }}>Ngày cao điểm</p>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{days[maxDayIndex]} ({maxSubmissions} bài nộp)</p>
                  </div>
                  <div style={{ width: 1, background: 'var(--border)', height: 32 }} />
                  <div>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase' }}>Trung bình/ngày</p>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{avgSubmissions} bài</p>
                  </div>
                </div>
                <BarChart3 size={24} color="var(--accent-purple)" style={{ opacity: 0.4 }} />
              </div>
            </div>

            {/* Sidebar info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={18} color="#f59e0b" />
                  Kỹ năng học viên còn yếu
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {dashboard?.topWeakSkills?.map((skill: string, i: number) => (
                    <div key={i} className="badge" style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {skill}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.5 }}>
                  * Dữ liệu được phân tích dựa trên các lỗi logic lặp lại và thời gian giải bài quá trung bình.
                </p>
              </div>

              <div className="card" style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                borderColor: 'rgba(139, 92, 246, 0.2)',
                padding: 24
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Bell size={20} color="var(--accent-purple-light)" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Gửi thông báo nhanh</h3>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                  Bạn có muốn gửi lời nhắn khích lệ hoặc tài liệu bổ trợ cho các sinh viên đang gặp khó khăn không?
                </p>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Gửi Broadcast ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}