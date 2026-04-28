'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { Users, SendHorizontal, Check, Copy } from 'lucide-react';

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
}

const students = [
  { id: 'SV001', name: 'Nguyễn M. Khoa', avatar: '#7c3aed', online: true },
  { id: 'SV005', name: 'Đỗ Quang Vinh', avatar: '#10b981', online: true },
  { id: 'SV008', name: 'Trần Thị Lan', avatar: '#f59e0b', online: false },
  { id: 'SV012', name: 'Phạm Minh Tuấn', avatar: '#06b6d4', online: true },
];

export default function InviteMemberModal({ open, onClose }: InviteMemberModalProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search));
  const roomLink = 'https://codelearn.vn/pair/room/A3F2-XK91';

  const handleCopy = () => {
    setCopied(true);
    toast({ type: 'success', title: 'Đã copy link phòng!', message: roomLink });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (selected.length === 0) return;
    toast({ type: 'success', title: `Đã gửi lời mời đến ${selected.length} sinh viên!` });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={20} /> Mời thành viên</div>} subtitle="Phòng Pair Programming #A3F2-XK91" size="sm"
      footer={
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSend} disabled={selected.length === 0} style={{ flex: 2, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}>
            <SendHorizontal size={18} /> Gửi lời mời {selected.length > 0 && `(${selected.length})`}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Room link copy */}
        <div>
          <label className="form-label">Link phòng</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {roomLink}
            </div>
            <button className="btn btn-ghost" onClick={handleCopy} style={{ flexShrink: 0, padding: '8px 12px' }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Search students */}
        <div>
          <label className="form-label">Tìm sinh viên trong lớp</label>
          <input className="input" placeholder="Tìm theo tên hoặc MSSV..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Student list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
          {filtered.map(sv => {
            const isSelected = selected.includes(sv.id);
            return (
              <div key={sv.id} onClick={() => setSelected(prev => isSelected ? prev.filter(id => id !== sv.id) : [...prev, sv.id])}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  background: isSelected ? 'rgba(124,58,237,0.1)' : 'var(--bg-tertiary)',
                  border: `1px solid ${isSelected ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}>
                <div style={{ position: 'relative' }}>
                  <div className="avatar" style={{ background: sv.avatar, color: 'white', width: 32, height: 32, fontSize: 13 }}>{sv.name.charAt(0)}</div>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: '50%', background: sv.online ? 'var(--accent-green)' : 'var(--text-muted)', border: '1.5px solid var(--bg-secondary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{sv.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{sv.id} · {sv.online ? 'Online' : 'Offline'}</div>
                </div>
                {isSelected && <Check size={18} color="var(--accent-purple)" />}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
