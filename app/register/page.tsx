'use client';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from '@/app/components/ui/Toast';

const STEPS = ['Thông tin', 'Tài khoản', 'Hoàn tất'];

const MAJORS = ['Khoa học Máy tính', 'Kỹ thuật Phần mềm', 'Hệ thống Thông tin', 'Mạng & Truyền thông', 'Khác'];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<'student' | 'lecturer'>('student');
  const [form, setForm] = useState({
    fullName: '', mssv: '', email: '', major: '',
    password: '', confirmPassword: '', agree: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwStrength, setPwStrength] = useState(0);

  const update = (k: keyof typeof form, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }));

  const calcStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strengthLabels = ['', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#10b981', '#06b6d4'];

  const handleNext = () => {
    if (step === 0) {
      if (!form.fullName.trim() || (!form.mssv.trim() && role === 'student') || !form.email.trim()) {
        toast({ type: 'error', title: 'Vui lòng điền đầy đủ!', message: 'Họ tên, MSSV và email là bắt buộc.' }); return;
      }
    }
    if (step === 1) {
      if (!form.password || form.password !== form.confirmPassword) {
        toast({ type: 'error', title: 'Mật khẩu không khớp!' }); return;
      }
      if (pwStrength < 2) {
        toast({ type: 'warning', title: 'Mật khẩu quá yếu', message: 'Hãy dùng ít nhất 8 ký tự, chữ hoa và số.' }); return;
      }
    }
    setStep(s => Math.min(s + 1, 2));
  };

  const handleRegister = async () => {
    if (!form.agree) { toast({ type: 'error', title: 'Vui lòng đồng ý điều khoản!' }); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);
    setStep(2);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', padding: 24, position: 'relative', overflow: 'hidden' }}>

      {/* Background ambient glows */}
      <div style={{ position: 'fixed', top: -200, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(124,58,237,0.1)', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -150, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(6,182,212,0.07)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/login" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gradient-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: 'var(--shadow-glow-purple)' }}>💻</div>
            <span style={{ fontSize: 22, fontWeight: 900 }}>Code<span style={{ color: 'var(--accent-purple-light)' }}>Learn</span></span>
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Tạo tài khoản mới</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Đã có tài khoản? <Link href="/login" style={{ color: 'var(--accent-purple-light)', fontWeight: 600, textDecoration: 'none' }}>Đăng nhập</Link></p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13,
                  background: i < step ? 'var(--accent-green)' : i === step ? 'var(--gradient-purple)' : 'var(--bg-hover)',
                  color: i <= step ? 'white' : 'var(--text-muted)',
                  boxShadow: i === step ? 'var(--shadow-glow-purple)' : 'none',
                  transition: 'all 0.3s',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 10, color: i === step ? 'var(--accent-purple-light)' : 'var(--text-muted)', marginTop: 4, fontWeight: i === step ? 700 : 400 }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, margin: '0 6px', marginBottom: 16, background: i < step ? 'var(--accent-green)' : 'var(--border)', borderRadius: 1, transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>

          {/* === STEP 0: personal info === */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Role */}
              <div>
                <label className="form-label">Đăng ký với tư cách</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { val: 'student',  icon: '🎓', label: 'Sinh viên',  desc: 'Học viên tham gia khóa học' },
                    { val: 'lecturer', icon: '👨‍🏫', label: 'Giảng viên', desc: 'Tạo & quản lý bài tập' },
                  ].map(r => (
                    <button key={r.val} onClick={() => setRole(r.val as 'student' | 'lecturer')} style={{
                      padding: '12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                      border: `2px solid ${role === r.val ? 'var(--accent-purple)' : 'var(--border)'}`,
                      background: role === r.val ? 'rgba(124,58,237,0.1)' : 'var(--bg-tertiary)',
                      transition: 'all 0.15s', color: 'var(--text-primary)',
                    }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{r.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">Họ và tên</label>
                <input className="input" placeholder="Nguyễn Văn A" value={form.fullName} onChange={e => update('fullName', e.target.value)} />
              </div>

              {role === 'student' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">MSSV</label>
                    <input className="input" placeholder="2151063" value={form.mssv} onChange={e => update('mssv', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Chuyên ngành</label>
                    <select className="select" style={{ width: '100%' }} value={form.major} onChange={e => update('major', e.target.value)}>
                      <option value="">Chọn...</option>
                      {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="form-label">Email trường</label>
                <input className="input" type="email" placeholder={role === 'student' ? 'mssv@student.hcmus.edu.vn' : 'tengiangvien@hcmus.edu.vn'}
                  value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
            </div>
          )}

          {/* === STEP 1: password === */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(124,58,237,0.08)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.2)' }}>
                <div className="avatar" style={{ background: 'var(--gradient-purple)', color: 'white', fontSize: 14 }}>{form.fullName.charAt(0) || 'U'}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{form.fullName || 'Người dùng'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{form.email}</div>
                </div>
              </div>

              <div>
                <label className="form-label">Mật khẩu</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPw ? 'text' : 'password'} placeholder="Tối thiểu 8 ký tự"
                    value={form.password} onChange={e => { update('password', e.target.value); setPwStrength(calcStrength(e.target.value)); }}
                    style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)', padding: 0 }}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>

                {/* Strength meter */}
                {form.password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, transition: 'background 0.3s',
                          background: i <= pwStrength ? strengthColors[pwStrength] : 'var(--bg-hover)' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: strengthColors[pwStrength] }}>
                      {strengthLabels[pwStrength]}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { label: 'Tối thiểu 8 ký tự', ok: form.password.length >= 8 },
                    { label: 'Có chữ hoa (A-Z)', ok: /[A-Z]/.test(form.password) },
                    { label: 'Có chữ số (0-9)', ok: /[0-9]/.test(form.password) },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: form.password ? (r.ok ? 'var(--accent-green)' : 'var(--text-muted)') : 'var(--text-muted)' }}>
                      <span>{form.password && r.ok ? '✅' : '○'}</span> {r.label}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">Xác nhận mật khẩu</label>
                <input className="input" type="password" placeholder="Nhập lại mật khẩu"
                  value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                  style={{ borderColor: form.confirmPassword && form.confirmPassword !== form.password ? 'var(--accent-red)' : '' }} />
                {form.confirmPassword && form.confirmPassword !== form.password && (
                  <div style={{ fontSize: 11, color: 'var(--accent-red)', marginTop: 5 }}>⚠️ Mật khẩu không khớp</div>
                )}
              </div>
            </div>
          )}

          {/* === STEP 2: success === */}
          {step === 2 && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent-green)', marginBottom: 8 }}>Đăng ký thành công!</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                Chào mừng <strong style={{ color: 'var(--text-primary)' }}>{form.fullName}</strong> đến với CodeLearn!<br />
                Email xác nhận đã được gửi đến <strong style={{ color: 'var(--accent-purple-light)' }}>{form.email}</strong>
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <Link href="/login" style={{ flex: 1 }}>
                  <button style={{
                    width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border)',
                    background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  }}>Đăng nhập</button>
                </Link>
                <Link href="/student/code-editor" style={{ flex: 2 }}>
                  <button style={{
                    width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                    background: 'var(--gradient-purple)', color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    boxShadow: 'var(--shadow-glow-purple)',
                  }}>🚀 Bắt đầu học ngay</button>
                </Link>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          {step < 2 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} style={{
                  padding: '12px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}>← Quay lại</button>
              )}
              <button
                onClick={step === 1 ? handleRegister : handleNext}
                disabled={loading}
                style={{
                  flex: 1, padding: '13px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? 'rgba(124,58,237,0.4)' : 'var(--gradient-purple)',
                  color: 'white', fontWeight: 800, fontSize: 14,
                  boxShadow: loading ? 'none' : 'var(--shadow-glow-purple)',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loading
                  ? <><span className="spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> Đang xử lý...</>
                  : step === 1
                    ? <>✅ Hoàn tất đăng ký</>
                    : <>Tiếp theo →</>
                }
              </button>
            </div>
          )}

          {/* Terms */}
          {step === 1 && (
            <label className="checkbox-row" style={{ marginTop: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.agree} onChange={e => update('agree', e.target.checked)} style={{ accentColor: 'var(--accent-purple)', width: 15, height: 15 }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Tôi đồng ý với{' '}
                <Link href="#" style={{ color: 'var(--accent-purple-light)', textDecoration: 'none', fontWeight: 600 }}>Điều khoản sử dụng</Link>{' '}và{' '}
                <Link href="#" style={{ color: 'var(--accent-purple-light)', textDecoration: 'none', fontWeight: 600 }}>Chính sách bảo mật</Link>
              </span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
