"use client";


import { useState } from "react";
import { useListLecturer, useListStudent } from "./_api/queries";

// Types
type Role = "LECTURER" | "STUDENT";
type Status = "active" | "inactive" | "pending";

interface BaseUser {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  status: Status;
  rating: number;
  xp: number;
  created_at: string;
}

interface Student extends BaseUser {
  role: "STUDENT";
  mssv: string;
  major: string;
}

interface Lecturer extends BaseUser {
  role: "LECTURER";
}

type User = Student | Lecturer;

export default function UsersManagementPage() {
  const [activeTab, setActiveTab] = useState<Role>("LECTURER");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: lecturer = [], isLoading: lecturerLoading } = useListLecturer();
  const { data: student = [], isLoading: studentLoading } = useListStudent();

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case "active":
        return <span className="badge badge-green">🟢 Hoạt động</span>;
      case "inactive":
        return <span className="badge badge-red">🔴 Đã khóa</span>;
      case "pending":
        return <span className="badge badge-yellow">🟡 Chờ duyệt</span>;
    }
  };

  if (lecturerLoading || studentLoading) {
    return <div>Loading...</div>;
  }
  const stats = [
    { label: 'Tổng số LECTURER', value: lecturer?.length, icon: '👨‍🏫', color: '#7c3aed' },
    { label: 'Tổng số STUDENT', value: student?.length, icon: '👨‍🎓', color: '#06b6d4' },
    { label: 'Người dùng mới tuần này', value: 12, icon: '📈', color: '#10b981' },
    { label: 'Đang bị khóa', value: [...lecturer, ...student].filter(u => u.status === 'inactive').length, icon: '🔒', color: '#ef4444' },
  ];
  return (
    <>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">👥 Quản lý Người dùng</h1>
            <p className="page-subtitle">Quản lý tài khoản Giảng viên (Lecturer) và Sinh viên (Student)</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary">➕ Thêm Người dùng</button>
            <button className="btn btn-ghost">📤 Export Excel</button>
          </div>
        </div>

        <div className="grid-4">
          {stats.map(s => (
            <div key={s.label} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, marginTop: 4 }}>{s.value}</div>
                </div>
                <span style={{ fontSize: 26 }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '14px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '6px', padding: 2, marginRight: 'auto' }}>
            <button
              onClick={() => setActiveTab("LECTURER")}
              className={`btn ${activeTab === 'LECTURER' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ minWidth: 120, border: 'none' }}
            >
              👨‍🏫 Giảng viên
            </button>
            <button
              onClick={() => setActiveTab("STUDENT")}
              className={`btn ${activeTab === 'STUDENT' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ minWidth: 120, border: 'none' }}
            >
              👨‍🎓 Sinh viên
            </button>
          </div>

          <input
            className="input"
            placeholder="🔍 Tìm theo tên, email, mssv..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ minWidth: 260 }}
          />
          <select className="select">
            <option>Tất cả trạng thái</option>
            <option>Hoạt động</option>
            <option>Đã khóa</option>
            <option>Chờ duyệt</option>
          </select>
          <button className="btn btn-primary">🔍 Lọc</button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Email</th>
                {activeTab === "STUDENT" && <th>MSSV</th>}
                {activeTab === "STUDENT" && <th>Chuyên ngành</th>}
                <th>XP</th>
                <th>Rating</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === "LECTURER" ? lecturer : student).map((user) => (
                <tr key={user.email}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.fullName}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>

                  {activeTab === "STUDENT" && (
                    <td>
                      <code style={{ fontFamily: 'monospace', fontSize: 13, background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>
                        {user.mssv}
                      </code>
                    </td>
                  )}
                  {activeTab === "STUDENT" && (
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {user.major}
                    </td>
                  )}

                  <td><span style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>{user.xp.toLocaleString()}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#f59e0b' }}>★</span>
                      <span style={{ fontWeight: 500 }}>{user.rating.toFixed(1)}</span>
                    </div>
                  </td>

                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                    {new Date(user.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </td>

                  <td>{getStatusBadge(user.status as Status)}</td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 13 }} title="Chỉnh sửa">✏️</button>
                      <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 13, color: 'var(--accent-red)' }} title="Xóa">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {(activeTab === "LECTURER" ? lecturer : student).length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'STUDENT' ? 9 : 7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                    <p>Không tìm thấy người dùng nào phù hợp</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
            <span>Hiển thị {(activeTab === "LECTURER" ? lecturer : student).length} kết quả</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} disabled>Trước</button>
              <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }}>1</button>
              <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} disabled>Sau</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
