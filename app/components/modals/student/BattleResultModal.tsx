'use client';
import { useState } from 'react';
import Modal from '@/app/components/ui/Modal';
import { toast } from '@/app/components/ui/Toast';

interface BattleResultModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BattleResultModal({ open, onClose }: BattleResultModalProps) {
  const [viewCode, setViewCode] = useState(false);
  const winner = 'Phạm Thu Hà';
  const isWinner = false; // simulate: current user lost

  return (
    <Modal open={open} onClose={onClose} title="" size="md" noPadding
      footer={
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { toast({ type: 'info', title: '🔍 Mở code đối thủ...' }); setViewCode(true); }}>
            👁 Xem code đối thủ
          </button>
          <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>🏠 Về lobby</button>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { toast({ type: 'info', title: '⚔️ Tìm trận mới...' }); onClose(); }}>
            🔄 Chơi lại
          </button>
        </div>
      }
    >
      {/* Winner banner */}
      <div style={{
        background: isWinner
          ? 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(16,185,129,0.1))'
          : 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(124,58,237,0.08))',
        padding: '32px 24px', textAlign: 'center',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>{isWinner ? '🏆' : '😤'}</div>
        <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 4, color: isWinner ? '#f59e0b' : '#f87171' }}>
          {isWinner ? 'CHIẾN THẮNG!' : 'THUA RỒI!'}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {isWinner ? 'Xuất sắc! Bạn đã giải nhanh hơn đối thủ.' : `${winner} đã giải quyết bài toán trước bạn.`}
        </div>

        {/* Rating change */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: '6px 18px' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Rating:</span>
          <span style={{ fontWeight: 800, fontSize: 16, color: isWinner ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {isWinner ? '+24' : '-18'}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>→ {isWinner ? 1704 : 1662}</span>
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ padding: '20px 22px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📊 So sánh kết quả</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, alignItems: 'center' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', padding: '8px', color: isWinner ? '#f59e0b' : 'var(--text-secondary)', fontWeight: 700, fontSize: 13 }}>Bạn</div>
          <div />
          <div style={{ textAlign: 'center', padding: '8px', color: isWinner ? 'var(--text-secondary)' : '#f59e0b', fontWeight: 700, fontSize: 13 }}>{winner}</div>

          {/* Stats */}
          {[
            { label: 'Test cases', mine: '13/20', theirs: '16/20', mineWin: false },
            { label: 'Thời gian', mine: '11:26', theirs: '9:43', mineWin: false },
            { label: 'Số dòng code', mine: '18', theirs: '14', mineWin: true },
            { label: 'Memory', mine: '4.2 MB', theirs: '3.8 MB', mineWin: false },
          ].map(row => (
            <>
              <div key={`${row.label}-mine`} style={{
                textAlign: 'center', padding: '10px 14px', borderRadius: '8px 0 0 8px',
                background: row.mineWin ? 'rgba(16,185,129,0.08)' : 'var(--bg-tertiary)',
                border: `1px solid ${row.mineWin ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                margin: '3px 0', fontWeight: 700, fontSize: 14,
                color: row.mineWin ? 'var(--accent-green)' : 'var(--text-primary)',
              }}>{row.mine}</div>
              <div style={{ textAlign: 'center', padding: '0 10px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</div>
              <div style={{
                textAlign: 'center', padding: '10px 14px', borderRadius: '0 8px 8px 0',
                background: !row.mineWin ? 'rgba(245,158,11,0.08)' : 'var(--bg-tertiary)',
                border: `1px solid ${!row.mineWin ? 'rgba(245,158,11,0.2)' : 'var(--border)'}`,
                margin: '3px 0', fontWeight: 700, fontSize: 14,
                color: !row.mineWin ? '#f59e0b' : 'var(--text-primary)',
              }}>{row.theirs}</div>
            </>
          ))}
        </div>
      </div>
    </Modal>
  );
}
