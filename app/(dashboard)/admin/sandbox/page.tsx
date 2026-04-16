'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sandboxApi, SandboxJob } from '@/api/sandbox.api';
import { useInfrastructureInfo } from '@/hooks/useSettings';
import { Loader2, Zap, Brain, Activity, Trash2, RefreshCw, Ban, Cloud, Settings } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

export default function SandboxPage() {
  const queryClient = useQueryClient();

  const { data: jobsData, isLoading: isJobsLoading } = useQuery({
    queryKey: ['admin-sandbox-jobs'],
    queryFn: async () => {
      const resp = await sandboxApi.getJobs();
      return resp.jobs as SandboxJob[];
    },
    refetchInterval: 5000, // Tự động làm mới mỗi 5 giây
  });

  const { data: infra, isLoading: isInfraLoading } = useInfrastructureInfo();

  const killMutation = useMutation({
    mutationFn: sandboxApi.killJob,
    onSuccess: () => {
      toast({ type: 'success', title: 'Thành công', message: 'Yêu cầu dừng job đã được gửi.' });
      queryClient.invalidateQueries({ queryKey: ['admin-sandbox-jobs'] });
    },
    onError: () => toast({ type: 'error', title: 'Lỗi', message: 'Không thể dừng job này.' }),
  });

  const jobs = jobsData || [];

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'RUNNING': return <span className="badge badge-green">Running</span>;
      case 'PENDING': return <span className="badge badge-yellow">Pending</span>;
      case 'ERROR': return <span className="badge badge-red">Error</span>;
      default: return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Cloud size={28} color="var(--accent-purple)" /> Giám sát Sandbox
          </h1>
          <p className="page-subtitle">Theo dõi trạng thái thực thi code và tài nguyên hệ thống live</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-sandbox-jobs'] })}>
            <RefreshCw size={16} className={isJobsLoading ? 'animate-spin' : ''} /> Làm mới
          </button>
          <button className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ban size={16} /> Dừng toàn bộ
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Jobs đang chạy', value: jobs.length, icon: <Zap size={20} />, color: 'var(--accent-green)' },
          { label: 'CPU Server', value: `${infra?.nodes?.[0]?.cpuUsage || 0}%`, icon: <Activity size={20} />, color: 'var(--accent-yellow)' },
          { label: 'RAM Server', value: `${infra?.nodes?.[0]?.memoryUsage || 0}%`, icon: <Brain size={20} />, color: 'var(--accent-cyan)' },
          { label: 'Docker Images', value: infra?.docker?.imageCount || 0, icon: <Activity size={20} />, color: 'var(--accent-purple)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
              </div>
              <div style={{ color: s.color, opacity: 0.8 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={16} color="var(--accent-purple)" /> Container Jobs thực tế
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="spin" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 10px var(--accent-green)' }} />
            <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>Cập nhật tự động (5s)</span>
          </div>
        </div>

        {isJobsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="animate-spin" size={32} color="var(--accent-purple)" />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Người dùng</th>
                <th>Bài tập</th>
                <th>Ngôn ngữ</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td><code style={{ fontSize: 11, color: 'var(--accent-cyan)' }}>{job.id}</code></td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{job.submission?.user?.fullName || 'Hệ thống'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12 }}>{job.submission?.problemVersion?.problem?.title || 'Đang chấm...'}</div>
                  </td>
                  <td>
                    <span className="badge badge-purple">{job.submission?.language?.name || 'N/A'}</span>
                  </td>
                  <td>{getStatusBadge(job.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: 6, color: 'var(--accent-red)' }}
                      onClick={() => { if (confirm('Dừng job này?')) killMutation.mutate(job.id); }}
                      disabled={killMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    Hiện không có công việc nào đang chạy trong Sandbox.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
