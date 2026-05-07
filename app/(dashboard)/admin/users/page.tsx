"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

import { useListLecturer, useListStudent, useUserStats, Student, Lecturer } from "./_api/queries";
import { Users, Plus, Search, Star, Edit2, Trash2, GraduationCap, TrendingUp, Lock, UserRound, User, Circle, Loader2 } from "lucide-react";

type Status = "active" | "inactive" | "pending";
type UserType = Student | Lecturer;

export default function UsersManagementPage() {
  const [activeTab, setActiveTab] = useState<string>("LECTURER");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [lecturerPage, setLecturerPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearchQuery(searchQuery);
        setLecturerPage(1);
        setStudentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const page = activeTab === "LECTURER" ? lecturerPage : studentPage;
  const setPage = activeTab === "LECTURER" ? setLecturerPage : setStudentPage;

  const queryParams = { 
    page, 
    limit, 
    search: debouncedSearchQuery || undefined, 
    status: status === 'all' ? undefined : status 
  };

  const { data: lecturerData, isLoading: lecturerLoading } = useListLecturer(queryParams);
  const { data: studentData, isLoading: studentLoading } = useListStudent(queryParams);
  const { data: statsData, isLoading: statsLoading } = useUserStats();

  const lecturers = lecturerData?.items || [];
  const students = studentData?.items || [];

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case "active":
        return <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Circle size={8} fill="currentColor" /> Hoạt động</span>;
      case "inactive":
        return <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Circle size={8} fill="currentColor" /> Đã khóa</span>;
      case "pending":
        return <span className="badge badge-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Circle size={8} fill="currentColor" /> Chờ duyệt</span>;
    }
  };

  if (lecturerLoading || studentLoading || statsLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Loader2 className="animate-spin" size={40} color="var(--accent-purple)" /></div>;
  }

  const stats = [
    { label: 'Tổng số GIẢNG VIÊN', value: statsData?.totalLecturers || 0, icon: <GraduationCap size={24} />, color: '#7c3aed' },
    { label: 'Tổng số SINH VIÊN', value: statsData?.totalStudents || 0, icon: <User size={24} />, color: '#06b6d4' },
    { label: 'Người dùng mới tuần này', value: statsData?.newUsersThisWeek || 0, icon: <TrendingUp size={24} />, color: '#10b981' },
    { label: 'Đang bị khóa', value: statsData?.blockedUsers || 0, icon: <Lock size={24} />, color: '#ef4444' },
  ];

  const currentList = activeTab === "LECTURER" ? lecturers : students;
  const currentTotal = (activeTab === "LECTURER" ? lecturerData?.total : studentData?.total) || 0;
  const totalPages = Math.ceil(currentTotal / limit);

  // Pagination logic: truncated
  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;
    
    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) {
          if (!pages.includes(i)) pages.push(i);
      }
      
      if (page < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <>
      <div className="page-container animate-in">
        <style jsx>{`
            .pagination-btn {
                height: 32px;
                min-width: 32px;
                padding: 0 8px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid var(--border);
                color: var(--text-secondary);
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }
            .pagination-btn:hover:not(:disabled) {
                background: rgba(255, 255, 255, 0.08);
                color: #fff;
                border-color: var(--accent-purple);
            }
            .pagination-btn.active {
                background: var(--accent-purple);
                color: #fff;
                border-color: var(--accent-purple);
            }
            .pagination-btn:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }
            .pagination-ellipsis {
                color: var(--text-muted);
                padding: 0 4px;
            }
            .jump-input {
                width: 44px;
                height: 32px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid var(--border);
                border-radius: 6px;
                color: #fff;
                text-align: center;
                font-size: 13px;
                outline: none;
                transition: border-color 0.2s;
            }
            .jump-input:focus {
                border-color: var(--accent-purple);
            }
        `}</style>
        <div className="page-header">
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={28} color="var(--accent-purple)" /> Quản lý Người dùng
            </h1>
            <p className="page-subtitle">Quản lý tài khoản Giảng viên và Sinh viên</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} /> Thêm Người dùng
            </button>
            <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Export Excel
            </button>
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
                <span style={{ fontSize: 26, color: s.color }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '14px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '6px', padding: 2, marginRight: 'auto' }}>
            <button
              onClick={() => setActiveTab("LECTURER")}
              className={`btn ${activeTab === 'LECTURER' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ minWidth: 120, border: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <UserRound size={16} /> Giảng viên
            </button>
            <button
              onClick={() => setActiveTab("STUDENT")}
              className={`btn ${activeTab === 'STUDENT' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ minWidth: 120, border: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <User size={16} /> Sinh viên
            </button>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
            <input
              className="input"
              placeholder="Tìm theo tên, email, mssv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ minWidth: 260, paddingLeft: 36 }}
            />
          </div>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Đã khóa</option>
            <option value="pending">Chờ duyệt</option>
          </select>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={16} /> Lọc
          </button>
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
              {currentList.map((user) => (
                <tr key={user.email}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.fullName}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>

                  {activeTab === "STUDENT" && (
                    <td>
                      <code style={{ fontFamily: 'monospace', fontSize: 13, background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>
                       {(user as any).mssv}
                      </code>
                    </td>
                  )}
                  {activeTab === "STUDENT" && (
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {(user as any).major}
                    </td>
                  )}

                  <td><span style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>{user.xp.toLocaleString()}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      <span style={{ fontWeight: 500 }}>{user.rating.toFixed(1)}</span>
                    </div>
                  </td>

                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                    {new Date(user.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </td>

                  <td>{getStatusBadge(user.status as Status)}</td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Link href={`/admin/users/${user.id}`} className="btn btn-ghost" style={{ padding: 8 }} title="Chỉnh sửa">
                        <Edit2 size={16} />
                      </Link>
                      <button className="btn btn-ghost" style={{ padding: 8, color: 'var(--accent-red)' }} title="Xóa"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentList.length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'STUDENT' ? 9 : 7} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ marginBottom: 16 }}><Search size={48} opacity={0.2} style={{ margin: '0 auto' }} /></div>
                    <p style={{ fontWeight: 600 }}>Không tìm thấy người dùng nào phù hợp</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button 
                  className="pagination-btn" 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                >
                  Trước
                </button>
                
                {getPageNumbers().map((n, i) => (
                    n === '...' ? (
                        <span key={`ellipsis-${i}`} className="pagination-ellipsis">...</span>
                    ) : (
                        <button 
                          key={n} 
                          className={`pagination-btn ${page === n ? 'active' : ''}`}
                          onClick={() => setPage(n as number)}
                        >
                            {n}
                        </button>
                    )
                ))}

                <button 
                  className="pagination-btn" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages || totalPages === 0}
                >
                  Sau
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderLeft: '1px solid var(--border)', paddingLeft: 12, marginLeft: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Đến trang:</span>
                <input 
                    type="text" 
                    className="jump-input" 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const val = parseInt((e.target as HTMLInputElement).value);
                            if (val >= 1 && val <= totalPages) {
                                setPage(val);
                                (e.target as HTMLInputElement).value = '';
                            }
                        }
                    }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
