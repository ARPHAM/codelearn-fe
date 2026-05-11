'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankApi, QuestionBank } from '@/api/bank.api';
import { 
  Loader2, 
  Plus, 
  Layers, 
  BookOpen, 
  Trash2, 
  ChevronRight,
  Database,
  Archive,
  Dice5,
  Lightbulb,
  User as UserIcon
} from 'lucide-react';
import Link from 'next/link';

export default function AdminQuestionBankPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newBankName, setNewBankName] = useState('');

  // 1. Fetch all banks (Backend handles Admin role to return ALL)
  const { data: banksData, isLoading } = useQuery({
    queryKey: ['admin-question-banks'],
    queryFn: async () => {
      const resp = await bankApi.getBanks();
      return resp as QuestionBank[];
    },
  });

  // 2. Create bank mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; type: string }) => bankApi.createBank(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-question-banks'] });
      setIsCreating(false);
      setNewBankName('');
    },
  });

  const handleCreate = () => {
    if (!newBankName) return;
    createMutation.mutate({ name: newBankName, type: 'COLLECTION' });
  };

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Archive size={28} color="var(--accent-purple-light)" /> Quản lý Ngân hàng Câu hỏi
          </h1>
          <p className="page-subtitle">Giám sát toàn bộ các bộ sưu tập bài tập và ngân hàng dữ liệu trên hệ thống</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => setIsCreating(true)}>
             <Plus size={18} />
             <span>Tạo ngân hàng mới</span>
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="card animate-in" style={{ marginBottom: 24, background: 'rgba(139, 92, 246, 0.05)', border: '1px solid var(--accent-purple-light)44' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input 
              className="input" 
              placeholder="Nhập tên ngân hàng câu hỏi..." 
              value={newBankName}
              onChange={(e) => setNewBankName(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Đang tạo...' : 'Xác nhận tạo'}
            </button>
            <button className="btn btn-ghost" onClick={() => setIsCreating(false)}>Hủy</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left: Banks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <Loader2 className="animate-spin" size={40} color="var(--accent-purple)" />
            </div>
          ) : !banksData || banksData.length === 0 ? (
            <div className="card" style={{ padding: '60px 0', textAlign: 'center', border: '1px dashed var(--border)' }}>
               <Database size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
               <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>Chưa có ngân hàng nào</h3>
               <p style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 300, margin: '0 auto' }}>
                  Hệ thống hiện chưa có ngân hàng câu hỏi nào được tạo.
               </p>
            </div>
          ) : (
            banksData.map((bank: any) => (
              <div key={bank.id} className="card card-hover" style={{ cursor: 'pointer', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ 
                        width: 48, height: 48, 
                        background: 'rgba(139, 92, 246, 0.1)', 
                        borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--accent-purple-light)'
                      }}>
                         <Layers size={24} />
                      </div>
                      <div>
                         <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>{bank.name}</h3>
                         <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                               <BookOpen size={14} />
                               {bank.items?.length || 0} bài tập
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                               <UserIcon size={14} />
                               Tạo bởi: {bank.createdBy?.fullName || 'N/A'}
                            </span>
                            <span>•</span>
                            <span>{bank.type}</span>
                         </div>
                      </div>
                   </div>
                   <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/admin/question-bank/${bank.id}`}>
                         <button className="btn btn-ghost" style={{ padding: '8px 12px' }}>
                            Xem chi tiết <ChevronRight size={16} />
                         </button>
                      </Link>
                      <button className="btn btn-ghost" style={{ padding: '8px', color: 'var(--accent-red)' }}>
                         <Trash2 size={16} />
                      </button>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Panel: Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
           <div className="card" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.25)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-purple-light)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                 <Dice5 size={18} />
                 Vai trò Quản trị viên
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 0 }}>
                 Bạn đang xem tất cả các ngân hàng câu hỏi trên toàn hệ thống. Bạn có quyền can thiệp, xóa hoặc chỉnh sửa bất kỳ ngân hàng nào để đảm bảo chất lượng nội dung.
              </p>
           </div>

           <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                 <Lightbulb size={16} color="var(--accent-yellow)" /> Quy tắc quản lý
              </h3>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                 {[
                   'Giám sát các bộ đề thi có tính bảo mật cao.',
                   'Hỗ trợ giảng viên gom nhóm các bài tập tiêu chuẩn.',
                   'Đảm bảo không có nội dung vi phạm quy định.'
                 ].map((tip, i) => (
                   <li key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--accent-purple-light)', fontWeight: 800 }}>•</span>
                      {tip}
                   </li>
                 ))}
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
