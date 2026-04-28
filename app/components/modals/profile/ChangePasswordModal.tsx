'use client';

import { useState } from 'react';
import Modal from '../../ui/Modal';
import { useChangePassword } from '../../_api/mutations';
import { KeyRound, Lock, Eye, EyeOff } from 'lucide-react';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const changePassword = useChangePassword();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    changePassword.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    }, {
      onSuccess: () => {
        onClose();
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    });
  };

  const InputField = ({ label, name, value, show, setShow, placeholder }: any) => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 8, fontWeight: 500 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
          placeholder={placeholder}
          required
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 10,
            padding: '12px 40px 12px 16px',
            color: 'white',
            fontSize: 14,
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <KeyRound size={18} />
          </div>
          Đổi mật khẩu
        </div>
      }
      subtitle="Nhập mật khẩu cũ và mới để cập nhật bảo mật tài khoản."
      size="sm"
      footer={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', width: '100%' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              color: '#94a3b8',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={changePassword.isPending}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              opacity: changePassword.isPending ? 0.7 : 1
            }}
          >
            {changePassword.isPending ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ padding: '10px 0' }}>
        <InputField 
          label="Mật khẩu hiện tại" 
          name="currentPassword" 
          value={formData.currentPassword} 
          show={showOld} 
          setShow={setShowOld} 
          placeholder="Nhập mật khẩu đang dùng"
        />
        
        <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.05)', margin: '24px 0' }} />
        
        <InputField 
          label="Mật khẩu mới" 
          name="newPassword" 
          value={formData.newPassword} 
          show={showNew} 
          setShow={setShowNew} 
          placeholder="Tối thiểu 8 ký tự"
        />
        
        <InputField 
          label="Xác nhận mật khẩu mới" 
          name="confirmPassword" 
          value={formData.confirmPassword} 
          show={showNew} 
          setShow={setShowNew} 
          placeholder="Nhập lại mật khẩu mới"
        />
      </form>
    </Modal>
  );
}
