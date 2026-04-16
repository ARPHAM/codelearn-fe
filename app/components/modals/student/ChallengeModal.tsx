import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { Swords, Timer, Dices } from 'lucide-react';

interface ChallengeModalProps {
  open: boolean;
  onClose: () => void;
  opponent?: { name: string; rank: string; rating: number; win: number; avatar: string };
}

export default function ChallengeModal({ open, onClose, opponent }: ChallengeModalProps) {
  const [duration, setDuration] = useState('15');
  const [topic, setTopic] = useState('random');
  const [loading, setLoading] = useState(false);

  const op = opponent ?? { name: 'Phạm Thu Hà', rank: '#1', rating: 1850, win: 42, avatar: '#f59e0b' };

  const handleStart = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); toast({ type: 'success', title: 'Trận đấu bắt đầu!', message: `vs ${op.name} · ${duration} phút · ${topic === 'random' ? 'Chủ đề ngẫu nhiên' : topic}` }); onClose(); }, 1200);
  };

  return (
    <Modal open={open} onClose={onClose} title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Swords size={20} /> Thách đấu</div>} subtitle="Code Battle 1vs1" size="sm"
      footer={
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Hủy</button>
          <button className="btn btn-primary" onClick={handleStart} disabled={loading} style={{ flex: 2, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}>
            {loading ? <span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> : <><Swords size={18} /> Bắt đầu trận đấu!</>}
          </button>
        </div>
      }
    >
      {/* VS banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', marginBottom: 20 }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="avatar" style={{ background: '#7c3aed', color: 'white', width: 52, height: 52, fontSize: 18, margin: '0 auto 8px' }}>B</div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Bạn</div>
          <div style={{ fontSize: 11, color: 'var(--accent-purple-light)' }}>Rating 1680</div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent-red)', padding: '0 16px' }}>VS</div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="avatar" style={{ background: op.avatar, color: 'white', width: 52, height: 52, fontSize: 18, margin: '0 auto 8px' }}>
            {op.name.charAt(0)}
          </div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{op.name}</div>
          <div style={{ fontSize: 11, color: '#f59e0b' }}>{op.rank} · Rating {op.rating}</div>
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="form-label">Thời gian trận</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {['15', '30', '45'].map(d => (
              <button key={d} onClick={() => setDuration(d)} style={{
                padding: '8px', borderRadius: 8, border: `1px solid ${duration === d ? 'var(--accent-purple)' : 'var(--border)'}`,
                background: duration === d ? 'rgba(124,58,237,0.15)' : 'var(--bg-tertiary)',
                color: duration === d ? 'var(--accent-purple-light)' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center'
              }}><Timer size={14} /> {d} phút</button>
            ))}
          </div>
        </div>
        <div>
          <label className="form-label">Chủ đề bài</label>
          <select className="select" style={{ width: '100%' }} value={topic} onChange={e => setTopic(e.target.value)}>
            <option value="random">Ngẫu nhiên</option>
            <option value="Graph">Graph</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
            <option value="Sorting">Sorting</option>
            <option value="Binary Search">Binary Search</option>
          </select>
        </div>

        {/* Rating preview */}
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rating thay đổi nếu</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--accent-green)', fontWeight: 800, fontSize: 16 }}>+24</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Nếu thắng</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--accent-red)', fontWeight: 800, fontSize: 16 }}>-18</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Nếu thua</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
