'use client';

import { useState, useEffect } from 'react';
import { useCurrentUserInfo } from '../../components/_api/queries';
import { useUpdateProfile } from '../../components/_api/mutations';
import { 
  User, 
  Mail, 
  BadgeCheck, 
  GraduationCap, 
  IdCard, 
  Trophy, 
  Zap, 
  Edit3, 
  Save, 
  X,
  Camera
} from 'lucide-react';
import ChangePasswordModal from '../../components/modals/profile/ChangePasswordModal';

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUserInfo();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    mssv: '',
    major: '',
    avatarUrl: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || '',
        mssv: user.mssv || '',
        major: user.major || '',
        avatarUrl: user.avatar || ''
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#94a3b8' }}>
        Đang tải thông tin...
      </div>
    );
  }

  if (!user) return null;

  const handleSave = () => {
    updateProfile.mutate(formData, {
      onSuccess: () => setIsEditing(false)
    });
  };

  const InfoItem = ({ icon: Icon, label, value, name, editable = false }: any) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 12,
      border: '1px solid rgba(255, 255, 255, 0.05)',
      transition: 'all 0.2s'
    }}>
      <div style={{
        width: 40, height: 40,
        borderRadius: 10,
        background: 'rgba(139, 92, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#a78bfa'
      }}>
        <Icon size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>{label}</div>
        {isEditing && editable ? (
          <input
            type="text"
            value={value}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 6,
              padding: '6px 10px',
              color: 'white',
              fontSize: 14,
              outline: 'none'
            }}
          />
        ) : (
          <div style={{ fontSize: 15, color: '#e2e8f0', fontWeight: 600 }}>{value || 'Chưa cập nhật'}</div>
        )}
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div style={{
      flex: 1,
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 16,
      border: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10
    }}>
      <div style={{
        width: 48, height: 48,
        borderRadius: 14,
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        <Icon size={24} />
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#f8fafc' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );

  return (
    <div style={{
      padding: '40px',
      maxWidth: '1000px',
      margin: '0 auto',
      minHeight: '100vh',
      color: '#f8fafc'
    }}>
      {/* Header Profile */}
      <div style={{
        position: 'relative',
        padding: '40px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
        borderRadius: 24,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        marginBottom: 32,
        overflow: 'hidden'
      }}>
        {/* Decorative Circles */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: '#8b5cf6', filter: 'blur(100px)', opacity: 0.1, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, background: '#3b82f6', filter: 'blur(100px)', opacity: 0.1, pointerEvents: 'none' }} />

        {/* Avatar Section */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 120, height: 120,
            borderRadius: 30,
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            padding: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              width: '100%', height: '100%',
              borderRadius: 26,
              background: '#0d1117',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              fontWeight: 800,
              color: 'white',
              overflow: 'hidden'
            }}>
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </div>
          </div>
          {isEditing && (
            <button style={{
              position: 'absolute',
              bottom: -5,
              right: -5,
              width: 36, height: 36,
              borderRadius: '50%',
              background: '#8b5cf6',
              border: '4px solid #0d1117',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <Camera size={16} />
            </button>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
            {user.name}
          </h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: 20,
              background: 'rgba(139, 92, 246, 0.15)',
              color: '#a78bfa',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              {user.role}
            </span>
            <span style={{ color: '#64748b', fontSize: 14 }}>•</span>
            <span style={{ color: '#64748b', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={14} /> {user.email}
            </span>
          </div>
        </div>

        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                color: 'white',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Edit3 size={18} /> Chỉnh sửa
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: '12px 20px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 12,
                  color: '#f87171',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <X size={18} /> Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  borderRadius: 12,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 10px 20px rgba(139, 92, 246, 0.2)',
                  opacity: updateProfile.isPending ? 0.7 : 1
                }}
              >
                <Save size={18} /> {updateProfile.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32 }}>
        {/* Left Column: Info Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            padding: '24px',
            background: 'rgba(22, 27, 34, 0.4)',
            borderRadius: 24,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <BadgeCheck size={20} color="#8b5cf6" /> Thông tin cơ bản
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <InfoItem icon={User} label="Họ và tên" value={formData.fullName} name="fullName" editable />
              <InfoItem icon={Mail} label="Email hệ thống" value={user.email} />
              <InfoItem icon={IdCard} label="Mã số sinh viên" value={formData.mssv} name="mssv" editable />
              <InfoItem icon={GraduationCap} label="Chuyên ngành" value={formData.major} name="major" editable />
            </div>
          </div>

          <div style={{
            padding: '24px',
            background: 'rgba(22, 27, 34, 0.4)',
            borderRadius: 24,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Zap size={20} color="#fbbf24" /> Hoạt động & Thành tích
            </h3>
            <div style={{ display: 'flex', gap: 16 }}>
              <StatCard icon={Trophy} label="Rating" value={user.rating} color="#fbbf24" />
              <StatCard icon={Zap} label="Kinh nghiệm (XP)" value={user.xp} color="#3b82f6" />
              <StatCard icon={BadgeCheck} label="Thứ hạng" value="#12" color="#10b981" />
            </div>
          </div>
        </div>

        {/* Right Column: Tips/Side Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent)',
            borderRadius: 24,
            border: '1px solid rgba(139, 92, 246, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#a78bfa', marginBottom: 12 }}>Bảo mật tài khoản</h4>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
              Bạn nên thay đổi mật khẩu định kỳ để đảm bảo an toàn cho tài khoản học tập của mình.
            </p>
            <button 
              onClick={() => setIsChangePasswordOpen(true)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: 12,
                color: '#a78bfa',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Đổi mật khẩu
            </button>
          </div>

          <div style={{
            padding: '24px',
            background: 'rgba(22, 27, 34, 0.4)',
            borderRadius: 24,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)'
          }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 12 }}>Thống kê nhanh</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#94a3b8' }}>Bài tập đã giải</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>128 bài</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#94a3b8' }}>Tỉ lệ hoàn thành</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>92%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#94a3b8' }}>Tham gia từ</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Jan 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal 
        open={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />
    </div>
  );
}
