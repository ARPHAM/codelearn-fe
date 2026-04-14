'use client';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from '@/components/ui/Toast';
import { useGoogleLogin } from '@react-oauth/google';
import { useLogin } from './_api/mutation';
import { broadcastAuthChange } from "@/config/auth-channel";

const FEATURES = [
  { icon: '🤖', title: 'AI Code Assistant', desc: 'Hỗ trợ gỡ lỗi & gợi ý thông minh' },
  { icon: '⚔️', title: 'Code Battle', desc: '1v1 thách đấu lập trình realtime' },
  { icon: '🗺️', title: 'Learning Path', desc: 'Lộ trình cá nhân hóa theo kỹ năng' },
  { icon: '📊', title: 'Auto-Grader', desc: 'Chấm bài tự động với Docker sandbox' },
];

export default function LoginPage() {
  const [role, setRole] = useState<'student' | 'lecturer' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loginMutation = useLogin()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Vui lòng điền đầy đủ thông tin'); return; }
    setError('');
    await loginMutation.mutateAsync({ email, password, role })
    setLoading(true);
    broadcastAuthChange();
    setTimeout(() => { window.location.href = '/' }, 800);
    setLoading(false);
  };

  const handleLoginGoogle = useGoogleLogin({
    onSuccess: tokenResponse => console.log(tokenResponse),
  });

  const roleConfig = {
    student: { label: 'Sinh viên', icon: '🎓', gradient: 'var(--gradient-purple)', color: 'var(--accent-purple)' },
    lecturer: { label: 'Giảng viên', icon: '👨‍🏫', gradient: 'linear-gradient(135deg, #1d4ed8, #06b6d4)', color: '#3b82f6' },
    admin: { label: 'Admin', icon: '⚙️', gradient: 'linear-gradient(135deg, #065f46, #10b981)', color: '#10b981' },
  };
  const rc = roleConfig[role];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', fontFamily: 'var(--font-body)' }}>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 64px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #0d1117 0%, #0f0a1e 60%, #0a1628 100%)',
      }}>
        <div style={{ position: 'absolute', top: -120, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(124,58,237,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(6,182,212,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ marginBottom: 56, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--gradient-purple)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: 'var(--shadow-glow-purple)',
            }}>💻</div>
            <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px' }}>
              Code<span style={{ color: 'var(--accent-purple-light)' }}>Learn</span>
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 56 }}>Nền tảng học lập trình thông minh</div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, marginBottom: 48 }}>
          <h1 style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.2, marginBottom: 16, letterSpacing: '-1px' }}>
            Học lập trình<br />
            <span style={{ background: 'var(--gradient-purple)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>thông minh hơn</span><br />
            với AI
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 380 }}>
            Nền tảng tích hợp AI Assistant, Auto-Grader, Code Battle và Learning Path cá nhân hóa cho từng sinh viên.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 1 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 1 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 32, marginTop: 48, position: 'relative', zIndex: 1 }}>
          {[['1,200+', 'Sinh viên'], ['48+', 'Giảng viên'], ['3,500+', 'Bài tập']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent-purple-light)' }}>{n}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 52px', background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)',
      }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Đăng nhập</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Chưa có tài khoản?{' '}
            <Link href="/register" style={{ color: 'var(--accent-purple-light)', fontWeight: 600, textDecoration: 'none' }}>Đăng ký ngay</Link>
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
            Đăng nhập với tư cách
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {(Object.entries(roleConfig) as [keyof typeof roleConfig, typeof roleConfig[keyof typeof roleConfig]][]).map(([key, cfg]) => (
              <button key={key} onClick={() => setRole(key)} style={{
                padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
                border: `2px solid ${role === key ? cfg.color : 'var(--border)'}`,
                background: role === key ? `${cfg.color}18` : 'var(--bg-tertiary)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                transition: 'all 0.18s', color: 'var(--text-primary)',
              }}>
                <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                <span style={{ fontSize: 12, fontWeight: role === key ? 700 : 500, color: role === key ? cfg.color : 'var(--text-secondary)' }}>
                  {cfg.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="form-label">Email / MSSV</label>
            <input className="input" type="text" placeholder={role === 'student' ? '12345678@st.neu.edu.vn' : role === 'lecturer' ? '12345678@te.neu.edu.vn' : 'admin@codelearn.vn'}
              value={email} onChange={e => setEmail(e.target.value)} style={{ fontSize: 14 }} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Mật khẩu</label>
              <Link href="#" style={{ fontSize: 12, color: 'var(--accent-purple-light)', textDecoration: 'none', fontWeight: 500 }}>Quên mật khẩu?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} style={{ fontSize: 14, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)', padding: 0,
              }}>{showPassword ? '🙈' : '👁'}</button>
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: '#f87171', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)' }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? 'rgba(124,58,237,0.5)' : rc.gradient,
            color: 'white', fontWeight: 800, fontSize: 15,
            boxShadow: loading ? 'none' : 'var(--shadow-glow-purple)',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {loading
              ? <><span className="spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> Đang đăng nhập...</>
              : <>Đăng nhập</>
            }
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>hoặc tiếp tục với</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { icon: '🔵', label: 'Google', color: '#2563eb', onClick: () => handleLoginGoogle() },
            { icon: '🎓', label: 'HCMUS SSO', color: '#1d4ed8', onClick: () => toast({ type: 'info', title: 'HCMUS SSO...' }) },
            { icon: '🔵', label: 'Microsoft', color: '#2563eb', onClick: () => toast({ type: 'info', title: 'Microsoft SSO...' }) },
          ].map(s => (
            <button key={s.label} onClick={s.onClick} style={{
              flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
              border: '1px solid var(--border)', background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = s.color; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 28, lineHeight: 1.6 }}>
          Bằng cách đăng nhập, bạn đồng ý với{' '}
          <Link href="#" style={{ color: 'var(--accent-purple-light)', textDecoration: 'none' }}>Điều khoản sử dụng</Link>{' '}và{' '}
          <Link href="#" style={{ color: 'var(--accent-purple-light)', textDecoration: 'none' }}>Chính sách bảo mật</Link>
        </p>
      </div>
    </div>
  );
}
