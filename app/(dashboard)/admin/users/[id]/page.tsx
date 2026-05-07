"use client";
import { useUser, useUpdateUser } from "../_api/queries";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, User as UserIcon, Mail, Shield, Calendar, Star, Award, CheckCircle, XCircle, Clock, Loader2, BookOpen, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/Toast";

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: user, isLoading } = useUser(id as string);
  const updateUserMutation = useUpdateUser();

  const [formData, setFormData] = useState({
    fullName: "",
    status: "",
    role: "",
    mssv: "",
    major: ""
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        status: user.status || "",
        role: user.role || "",
        mssv: (user as any).mssv || "",
        major: (user as any).major || ""
      });
      setHasChanges(false);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      setHasChanges(true);
  };

  const handleBack = () => {
    if (hasChanges) {
        if (confirm("Bạn có các thay đổi chưa lưu. Bạn có chắc chắn muốn quay lại?")) {
            router.back();
        }
    } else {
        router.back();
    }
  };

  const handleCancel = () => {
      if (user) {
        setFormData({
            fullName: user.fullName || "",
            status: user.status || "",
            role: user.role || "",
            mssv: (user as any).mssv || "",
            major: (user as any).major || ""
        });
        setHasChanges(false);
        toast.info("Đã khôi phục dữ liệu ban đầu");
      }
  };

  if (isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><Loader2 className="animate-spin" size={48} color="var(--accent-purple)" /></div>;
  }

  if (!user) {
    return <div className="page-container">Không tìm thấy người dùng</div>;
  }

  const handleSave = () => {
    updateUserMutation.mutate({
        id: id as string,
        data: formData
    }, {
        onSuccess: () => {
            toast.success("Cập nhật người dùng thành công");
            setHasChanges(false);
        },
        onError: () => {
            toast.error("Có lỗi xảy ra khi cập nhật");
        }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle size={20} color="#10b981" />;
      case "inactive": return <XCircle size={20} color="#ef4444" />;
      case "pending": return <Clock size={20} color="#f59e0b" />;
      default: return null;
    }
  };

  const roleLabels: Record<string, string> = {
    student: "Sinh viên",
    lecturer: "Giảng viên",
    admin: "Quản trị viên"
  };

  return (
    <div className="page-container animate-in">
      <style jsx>{`
        .form-group label {
          margin-bottom: 8px;
          display: block;
          font-weight: 600;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .input, .select {
            width: 100%;
            display: block;
        }
        .select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            padding-right: 40px;
        }
      `}</style>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost" onClick={handleBack} style={{ padding: 8 }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Chi tiết Người dùng</h1>
            <p className="page-subtitle">Quản lý và chỉnh sửa thông tin tài khoản</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {hasChanges && (
            <button 
                className="btn btn-ghost" 
                onClick={handleCancel}
                disabled={updateUserMutation.isPending}
            >
                Hủy
            </button>
          )}
          <button 
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={handleSave}
                disabled={updateUserMutation.isPending || !hasChanges}
          >
            {updateUserMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Lưu thay đổi
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Side: Profile Card */}
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 24px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
             {user.avatarUrl ? (
                 <img src={user.avatarUrl} alt={user.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
             ) : (
                 <UserIcon size={56} color="var(--text-muted)" />
             )}
             <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'var(--bg-primary)', padding: 8, borderRadius: '50%', border: '2px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                {getStatusIcon(user.status)}
             </div>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>{user.fullName}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, fontFamily: 'monospace' }}>{user.email}</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '20px 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-purple)' }}>{user.xp.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Kinh nghiệm</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'var(--border)', margin: 'auto 0' }} />
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                    <Star size={18} fill="#f59e0b" /> {user.rating.toFixed(1)}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Đánh giá</div>
            </div>
          </div>

          <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={14} /> Ngày gia nhập
            </div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
                {new Date(user.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Right Side: Edit Form */}
        <div style={{ display: 'grid', gap: 24 }}>
          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-primary)' }}>
              <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: 8, borderRadius: 8 }}><UserIcon size={20} color="var(--accent-purple)" /></div>
              Thông tin cơ bản
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="form-group">
                <label className="label">Họ và tên</label>
                <input 
                  className="input" 
                  name="fullName"
                  value={formData.fullName} 
                  onChange={handleChange}
                  placeholder="Nhập họ và tên..."
                />
              </div>
              <div className="form-group">
                <label className="label">Email hệ thống</label>
                <input className="input" value={user.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
              <div className="form-group">
                <label className="label">Trạng thái tài khoản</label>
                <select 
                  className="select" 
                  name="status"
                  value={formData.status} 
                  onChange={handleChange}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Đã khóa</option>
                  <option value="pending">Chờ duyệt</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Vai trò hệ thống</label>
                <select 
                  className="select" 
                  name="role"
                  value={formData.role} 
                  onChange={handleChange}
                >
                  <option value="student">Sinh viên</option>
                  <option value="lecturer">Giảng viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
            </div>
          </div>

          {(formData.role === 'student' || user.role === 'student') && (
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-primary)' }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: 8, borderRadius: 8 }}><GraduationCap size={20} color="#06b6d4" /></div>
                Thông tin Sinh viên
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="form-group">
                  <label className="label">Mã số sinh viên (MSSV)</label>
                  <input 
                    className="input" 
                    name="mssv"
                    value={formData.mssv} 
                    onChange={handleChange}
                    placeholder="VD: SV001..."
                  />
                </div>
                <div className="form-group">
                  <label className="label">Chuyên ngành</label>
                  <input 
                    className="input" 
                    name="major"
                    value={formData.major} 
                    onChange={handleChange}
                    placeholder="VD: Khoa học máy tính..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
