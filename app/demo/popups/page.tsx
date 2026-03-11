'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from '@/components/ui/Toast';

// Lecturer
import SubmissionDetailModal from '@/components/modals/lecturer/SubmissionDetailModal';
import PlagiarismDetailModal from '@/components/modals/lecturer/PlagiarismDetailModal';
import AddEditQuestionModal from '@/components/modals/lecturer/AddEditQuestionModal';
import PreviewExamModal from '@/components/modals/lecturer/PreviewExamModal';
import NotifyClassModal from '@/components/modals/lecturer/NotifyClassModal';
import StudentProfileModal from '@/components/modals/lecturer/StudentProfileModal';

// Student
import SubmitConfirmModal from '@/components/modals/student/SubmitConfirmModal';
import StuckAlert from '@/components/modals/student/StuckAlert';
import InviteMemberModal from '@/components/modals/student/InviteMemberModal';
import ChallengeModal from '@/components/modals/student/ChallengeModal';
import BattleResultModal from '@/components/modals/student/BattleResultModal';
import SkillNodeModal from '@/components/modals/student/SkillNodeModal';
import ProfileCardModal from '@/components/modals/student/ProfileCardModal';

// Admin
import EditResourceLimitModal from '@/components/modals/admin/EditResourceLimitModal';
import AuditDetailModal from '@/components/modals/admin/AuditDetailModal';
import AddLanguageModal from '@/components/modals/admin/AddLanguageModal';
import KillJobConfirm from '@/components/modals/admin/KillJobConfirm';

type ModalKey =
  | 'submission' | 'plagiarism' | 'addQuestion' | 'previewExam' | 'notifyClass' | 'studentProfile'
  | 'submitConfirm' | 'stuck' | 'invite' | 'challenge' | 'battleResult' | 'skillNode' | 'profileCard'
  | 'editLimit' | 'auditDetail' | 'addLang' | 'killJob';

const groups: { label: string; icon: string; color: string; items: { key: ModalKey; label: string; desc: string; icon: string }[] }[] = [
  {
    label: 'Giảng viên', icon: '🎓', color: '#7c3aed',
    items: [
      { key: 'submission', label: 'Submission Detail', desc: 'Tab: Code · Test Cases · Terminal', icon: '📋' },
      { key: 'plagiarism', label: 'Plagiarism Detail', desc: 'Code diff 2 cột + Flag action', icon: '🔍' },
      { key: 'addQuestion', label: 'Thêm/Sửa câu hỏi', desc: 'Tab: Đề · Test Cases · Hints', icon: '➕' },
      { key: 'previewExam', label: 'Preview Đề thi', desc: 'Preview + Shuffle + Export PDF', icon: '👁' },
      { key: 'notifyClass', label: 'Thông báo lớp', desc: 'Target + Channel (email/inapp)', icon: '📣' },
      { key: 'studentProfile', label: 'Hồ sơ Sinh viên', desc: 'Stats + Chart + Bài stuck', icon: '👤' },
    ],
  },
  {
    label: 'Sinh viên', icon: '🎮', color: '#06b6d4',
    items: [
      { key: 'submitConfirm', label: 'Xác nhận Nộp bài', desc: 'Score circle + pass/fail bar', icon: '📤' },
      { key: 'stuck', label: 'AI Stuck Alert', desc: 'Floating card — gợi ý khi stuck', icon: '🤖' },
      { key: 'invite', label: 'Mời Pair member', desc: 'Copy link + search students', icon: '👥' },
      { key: 'challenge', label: 'Thách đấu 1v1', desc: 'VS banner + options + rating preview', icon: '⚔️' },
      { key: 'battleResult', label: 'Kết quả Battle', desc: 'Winner banner + comparison grid', icon: '🏆' },
      { key: 'skillNode', label: 'Chi tiết Skill Node', desc: 'Progress + exercise list', icon: '🎯' },
      { key: 'profileCard', label: 'Profile Card', desc: 'Stats + badges + actions', icon: '🪪' },
    ],
  },
  {
    label: 'Admin', icon: '⚙️', color: '#10b981',
    items: [
      { key: 'editLimit', label: 'Sửa Resource Limit', desc: 'Sliders CPU/RAM/Timeout + Docker flags', icon: '🎚️' },
      { key: 'auditDetail', label: 'Chi tiết Audit Log', desc: 'Before/After + JSON payload', icon: '📋' },
      { key: 'addLang', label: 'Thêm ngôn ngữ mới', desc: 'Docker image + test connection', icon: '🖥️' },
      { key: 'killJob', label: 'Kill Container Job', desc: 'Confirm dialog nguy hiểm', icon: '⛔' },
    ],
  },
];

export default function PopupDemoPage() {
  const [open, setOpen] = useState<Partial<Record<ModalKey, boolean>>>({});
  const [showStuck, setShowStuck] = useState(false);

  const toggle = (key: ModalKey, val: boolean) => setOpen(prev => ({ ...prev, [key]: val }));

  return (
    <DashboardLayout>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">🧩 Popup & Modal Showcase</h1>
            <p className="page-subtitle">Demo tất cả 20 popup components — Click để mở từng modal</p>
          </div>
          <button className="btn btn-ghost" onClick={() => toast({ type: 'info', title: '🎉 Toast hoạt động!', message: 'Thông báo xuất hiện góc dưới phải màn hình.' })}>
            🔔 Test Toast
          </button>
        </div>

        {/* Groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {groups.map(group => (
            <div key={group.label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 3, height: 24, borderRadius: 2, background: group.color }} />
                <span style={{ fontSize: 16, fontWeight: 800 }}>{group.icon} {group.label}</span>
                <span className="badge" style={{ background: `${group.color}20`, border: `1px solid ${group.color}50`, color: group.color, fontSize: 11 }}>
                  {group.items.length} modals
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {group.items.map(item => (
                  <button
                    key={item.key}
                    onClick={() => item.key === 'stuck' ? setShowStuck(true) : toggle(item.key, true)}
                    style={{
                      background: 'var(--bg-card)',
                      border: `1px solid var(--border)`,
                      borderRadius: 12,
                      padding: '16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.18s',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = group.color;
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 1px ${group.color}60, 0 4px 16px rgba(0,0,0,0.3)`;
                      (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                      background: `${group.color}18`, border: `1px solid ${group.color}40`,
                    }}>{item.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: 16, color: 'var(--text-muted)', alignSelf: 'center' }}>›</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Shared component info */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.05))', borderColor: 'rgba(124,58,237,0.2)', marginTop: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🔧 Shared Components</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { name: 'Modal.tsx', desc: 'Wrapper - sizes sm/md/lg/xl · Escape close · backdrop click', color: '#7c3aed' },
              { name: 'ConfirmDialog.tsx', desc: 'Danger/Warning/Info variants · loading state', color: '#ef4444' },
              { name: 'Toast.tsx', desc: 'Global toast — gọi toast() từ bất kỳ đâu', color: '#10b981' },
            ].map(c => (
              <div key={c.name} style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: '12px', border: `1px solid ${c.color}30` }}>
                <code style={{ fontSize: 12, fontFamily: 'monospace', color: c.color, fontWeight: 700, display: 'block', marginBottom: 6 }}>{c.name}</code>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====== ALL MODALS ====== */}

      {/* Lecturer */}
      <SubmissionDetailModal open={!!open.submission} onClose={() => toggle('submission', false)} />
      <PlagiarismDetailModal open={!!open.plagiarism} onClose={() => toggle('plagiarism', false)} />
      <AddEditQuestionModal open={!!open.addQuestion} onClose={() => toggle('addQuestion', false)} />
      <PreviewExamModal open={!!open.previewExam} onClose={() => toggle('previewExam', false)} />
      <NotifyClassModal open={!!open.notifyClass} onClose={() => toggle('notifyClass', false)} />
      <StudentProfileModal open={!!open.studentProfile} onClose={() => toggle('studentProfile', false)} />

      {/* Student */}
      <SubmitConfirmModal open={!!open.submitConfirm} onClose={() => toggle('submitConfirm', false)} />
      <InviteMemberModal open={!!open.invite} onClose={() => toggle('invite', false)} />
      <ChallengeModal open={!!open.challenge} onClose={() => toggle('challenge', false)} />
      <BattleResultModal open={!!open.battleResult} onClose={() => toggle('battleResult', false)} />
      <SkillNodeModal open={!!open.skillNode} onClose={() => toggle('skillNode', false)} />
      <ProfileCardModal open={!!open.profileCard} onClose={() => toggle('profileCard', false)} />

      {/* Admin */}
      <EditResourceLimitModal open={!!open.editLimit} onClose={() => toggle('editLimit', false)} />
      <AuditDetailModal open={!!open.auditDetail} onClose={() => toggle('auditDetail', false)} />
      <AddLanguageModal open={!!open.addLang} onClose={() => toggle('addLang', false)} />
      <KillJobConfirm open={!!open.killJob} onClose={() => toggle('killJob', false)} />

      {/* Floating Stuck Alert */}
      {showStuck && <StuckAlert minutesStuck={32} onAccept={() => setShowStuck(false)} onDismiss={() => setShowStuck(false)} />}
    </DashboardLayout>
  );
}
