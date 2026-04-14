'use client';

import { useState, useEffect } from 'react';

import {
  useAdminLanguages,
  useCreateLanguage,
  useUpdateLanguage,
  useDeleteLanguage,
} from '@/hooks/useLanguages';
import {
  useSystemSettings,
  useUpdateSystemSettings,
  useInfrastructureInfo,
} from '@/hooks/useSettings';
import { Language } from '@/api/languages.api';
import { SystemSettings } from '@/api/settings.api';
import { toast } from '@/components/ui/Toast';
import LanguageModal from '../languages/_components/LanguageModal';

type TabType = 'languages' | 'settings' | 'infrastructure';

export default function SystemConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('languages');

  // --- Languages Logic ---
  const { data: languages = [], isLoading: isLangLoading, refetch: refetchLangs } = useAdminLanguages();
  const createLangMutation = useCreateLanguage();
  const updateLangMutation = useUpdateLanguage();
  const deleteLangMutation = useDeleteLanguage();

  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [editingLang, setEditingLang] = useState<Language | null>(null);

  useEffect(() => {
    const hasPulling = languages.some((l) => l.imageStatus === 'PULLING');
    if (hasPulling) {
      const interval = setInterval(() => refetchLangs(), 5000);
      return () => clearInterval(interval);
    }
  }, [languages, refetchLangs]);

  const handleLangSubmit = async (data: Partial<Language>) => {
    try {
      if (editingLang) {
        await updateLangMutation.mutateAsync({ id: editingLang.id, data });
        toast({ type: 'success', title: 'Thành công', message: 'Đã cập nhật ngôn ngữ.' });
      } else {
        await createLangMutation.mutateAsync(data);
        toast({ type: 'success', title: 'Thành công', message: 'Đã thêm ngôn ngữ mới.' });
      }
      setIsLangModalOpen(false);
      setEditingLang(null);
    } catch (err) {
      toast({ type: 'error', title: 'Lỗi', message: 'Không thể thực hiện thao tác.' });
    }
  };

  const handleLangDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ngôn ngữ này?')) return;
    try {
      await deleteLangMutation.mutateAsync(id);
      toast({ type: 'success', title: 'Thành công', message: 'Đã xóa ngôn ngữ.' });
    } catch (err) {
      toast({ type: 'error', title: 'Lỗi', message: 'Không thể xóa ngôn ngữ.' });
    }
  };

  // --- Settings Logic ---
  const { data: settings, isLoading: isSettingsLoading } = useSystemSettings();
  console.log(settings);
  const updateSettingsMutation = useUpdateSystemSettings();
  const [localSettings, setLocalSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSettingChange = (group: keyof SystemSettings, key: string, value: any) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      [group]: {
        ...localSettings[group],
        [key]: value,
      },
    });
  };

  const saveSettings = async () => {
    if (!localSettings) return;
    try {
      await updateSettingsMutation.mutateAsync(localSettings);
      toast({ type: 'success', title: 'Thành công', message: 'Đã cập nhật cấu hình hệ thống.' });
    } catch (err) {
      toast({ type: 'error', title: 'Lỗi', message: 'Không thể lưu cấu hình.' });
    }
  };

  // --- Infrastructure Logic ---
  const { data: infra, isLoading: isInfraLoading } = useInfrastructureInfo();

  const getStatusBadge = (status: Language['imageStatus'], error?: string | null) => {
    switch (status) {
      case 'READY': return <span className="badge badge-green">🟢 Sẵn sàng</span>;
      case 'PULLING': return (
        <span className="badge badge-yellow">
          <span className="spin" style={{ display: 'inline-block', width: 10, height: 10, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', marginRight: 6 }} />
          Đang tải...
        </span>
      );
      case 'ERROR': return <span className="badge badge-red" title={error || ''}>🔴 Lỗi image</span>;
      default: return <span className="badge badge-ghost">{status}</span>;
    }
  };

  return (
    <>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">🔧 Cấu hình Hệ thống</h1>
            <p className="page-subtitle">Quản lý ngôn ngữ, tham số sandbox và hạ tầng thực tế</p>
          </div>
          {activeTab === 'settings' && (
            <button className="btn btn-primary" onClick={saveSettings} disabled={updateSettingsMutation.isPending}>
              {updateSettingsMutation.isPending ? '⏳ Đang lưu...' : '💾 Lưu cấu hình'}
            </button>
          )}
          {activeTab === 'languages' && (
            <button className="btn btn-primary" onClick={() => { setEditingLang(null); setIsLangModalOpen(true); }}>
              ➕ Thêm Ngôn ngữ
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-secondary)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
          {[
            { id: 'languages', label: '🌐 Ngôn ngữ', icon: '🛠️' },
            { id: 'settings', label: '⚙️ Tham số hệ thống', icon: '🔧' },
            { id: 'infrastructure', label: '🐳 Hạ tầng Docker', icon: '☁️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: 'none',
                background: activeTab === tab.id ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-bubble">
          {activeTab === 'languages' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Ngôn ngữ</th>
                    <th>Docker Image</th>
                    <th>Resource Limits (Mặc định)</th>
                    <th>Trạng thái Image</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {isLangLoading ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>Đang tải dữ liệu...</td></tr>
                  ) : languages.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Chưa có ngôn ngữ nào.</td></tr>
                  ) : (
                    languages.map((lang) => (
                      <tr key={lang.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{lang.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>v{lang.version} ({lang.ext})</div>
                        </td>
                        <td><code style={{ fontSize: 12, background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>{lang.dockerImage}</code></td>
                        <td>
                          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                            <span title="RAM"><span style={{ opacity: 0.6 }}>🧠</span> {lang.defaultMemoryLimit}MB</span>
                            <span title="CPU"><span style={{ opacity: 0.6 }}>⚡</span> {lang.defaultCpuLimit} vCPU</span>
                            <span title="Timeout"><span style={{ opacity: 0.6 }}>⏱</span> {lang.defaultTimeout}ms</span>
                          </div>
                        </td>
                        <td>{getStatusBadge(lang.imageStatus, lang.lastError)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => { setEditingLang(lang); setIsLangModalOpen(true); }}>✏️</button>
                            <button className="btn btn-ghost" style={{ padding: '4px 8px', color: 'var(--accent-red)' }} onClick={() => handleLangDelete(lang.id)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {isSettingsLoading ? <p>Đang tải cấu hình...</p> : localSettings && (
                <>
                  <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>🐳 Sandbox Environment</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label className="form-label">Max Concurrent Executions</label>
                        <input type="number" className="input" value={localSettings.sandbox.maxConcurrent} onChange={(e) => handleSettingChange('sandbox', 'maxConcurrent', parseInt(e.target.value))} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div>
                          <label className="form-label">Default Timeout (ms)</label>
                          <input type="number" className="input" value={localSettings.sandbox.defaultTimeout} onChange={(e) => handleSettingChange('sandbox', 'defaultTimeout', parseInt(e.target.value))} />
                        </div>
                        <div>
                          <label className="form-label">Default RAM (MB)</label>
                          <input type="number" className="input" value={localSettings.sandbox.defaultMemoryLimit} onChange={(e) => handleSettingChange('sandbox', 'defaultMemoryLimit', parseInt(e.target.value))} />
                        </div>
                        <div>
                          <label className="form-label">CPU Limit (vCPU)</label>
                          <input type="number" step="0.1" className="input" value={localSettings.sandbox.cpuLimit} onChange={(e) => handleSettingChange('sandbox', 'cpuLimit', parseFloat(e.target.value))} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>Enable Network Access</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Allow containers to access external internet (High Risk)</div>
                        </div>
                        <div
                          style={{
                            width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                            background: localSettings.sandbox.enableNetwork ? 'var(--accent-red)' : 'var(--bg-hover)',
                            position: 'relative', transition: 'all 0.2s'
                          }}
                          onClick={() => handleSettingChange('sandbox', 'enableNetwork', !localSettings.sandbox.enableNetwork)}
                        >
                          <div style={{ position: 'absolute', top: 3, left: localSettings.sandbox.enableNetwork ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>🔍 Plagiarism Detection</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label className="form-label">Detection Algorithm</label>
                        <select className="input" value={localSettings.plagiarism.algorithm} onChange={(e) => handleSettingChange('plagiarism', 'algorithm', e.target.value)}>
                          <option>AST + Token</option>
                          <option>MOSS</option>
                          <option>Sim (JPL)</option>
                        </select>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label className="form-label">Warning Threshold (%)</label>
                          <input type="number" className="input" value={localSettings.plagiarism.warningThreshold} onChange={(e) => handleSettingChange('plagiarism', 'warningThreshold', parseInt(e.target.value))} />
                        </div>
                        <div>
                          <label className="form-label">Danger Threshold (%)</label>
                          <input type="number" className="input" value={localSettings.plagiarism.dangerThreshold} onChange={(e) => handleSettingChange('plagiarism', 'dangerThreshold', parseInt(e.target.value))} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>Auto-flag Submissions</div>
                        <div
                          style={{
                            width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                            background: localSettings.plagiarism.autoFlag ? 'var(--accent-green)' : 'var(--bg-hover)',
                            position: 'relative', transition: 'all 0.2s'
                          }}
                          onClick={() => handleSettingChange('plagiarism', 'autoFlag', !localSettings.plagiarism.autoFlag)}
                        >
                          <div style={{ position: 'absolute', top: 3, left: localSettings.plagiarism.autoFlag ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'infrastructure' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: 16, borderBottom: '1px solid var(--border)', fontWeight: 700 }}>🖥️ Sandbox Cluster Nodes</div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Node ID / Name</th>
                      <th>CPU</th>
                      <th>Memory</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isInfraLoading ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20 }}>Đang kiểm tra hạ tầng...</td></tr>
                    ) : infra?.nodes.map(node => (
                      <tr key={node.id}>
                        <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{node.id}</td>
                        <td>
                          <div style={{ width: '100%', height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                            <div style={{ width: `${node.cpuUsage}%`, height: '100%', background: node.cpuUsage > 80 ? 'var(--accent-red)' : 'var(--accent-green)' }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{node.cpuUsage}%</span>
                        </td>
                        <td>
                          <div style={{ width: '100%', height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                            <div style={{ width: `${node.memoryUsage}%`, height: '100%', background: node.memoryUsage > 80 ? 'var(--accent-red)' : 'var(--accent-green)' }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{node.memoryUsage}%</span>
                        </td>
                        <td><span className={`badge badge-${node.status === 'healthy' ? 'green' : 'red'}`}>{node.status.toUpperCase()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-cyan)' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: 'var(--accent-cyan)' }}>🐳 Docker Runtime</div>
                  {isInfraLoading ? <p>...</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Docker Version</span>
                        <span style={{ fontWeight: 700 }}>v{infra?.docker.version}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Image count</span>
                        <span style={{ fontWeight: 700 }}>{infra?.docker.imageCount}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Running containers</span>
                        <span style={{ fontWeight: 700 }}>{infra?.docker.containerCount}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Registry</span>
                        <code style={{ fontSize: 11 }}>{infra?.registry}</code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <LanguageModal
        open={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        title={editingLang ? 'Chỉnh sửa ngôn ngữ' : 'Thêm ngôn ngữ mới'}
        initialData={editingLang}
        onSubmit={handleLangSubmit}
      />
    </>
  );
}
