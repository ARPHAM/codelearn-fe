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
  Search,
  Dice5
} from 'lucide-react';
import Link from 'next/link';

export default function QuestionBankPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newBankName, setNewBankName] = useState('');

  // 1. Fetch all banks
  const { data: banksData, isLoading } = useQuery({
    queryKey: ['question-banks'],
    queryFn: async () => {
      const resp = await bankApi.getBanks();
      return resp as QuestionBank[];
    },
  });

  // 2. Create bank mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; type: string }) => bankApi.createBank(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-banks'] });
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
          <h1 className="page-title">🗃️ Ngân hàng Câu hỏi</h1>
          <p className="page-subtitle">Quản lý các bộ sưu tập bài tập và tạo đề thi từ ngân hàng dữ liệu</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => setIsCreating(true)}>
             <Plus size={18} />
             <span>Tạo ngân hàng mới</span>
          </button>
          <Link href="/lecturer/problems/create">
            <button className="btn btn-primary">➕ Thêm câu hỏi mới</button>
          </Link>
        </div>
      </div>

      {isCreating && (
        <div className="card animate-in" style={{ marginBottom: 24, background: 'rgba(139, 92, 246, 0.05)', border: '1px solid var(--accent-purple-light)44' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input 
              className="input" 
              placeholder="Nhập tên ngân hàng câu hỏi (VD: Cấu trúc dữ liệu & Giải thuật)..." 
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
                  Bạn có thể gom nhóm các bài tập vào các ngân hàng riêng biệt để dễ dàng quản lý và tạo đề thi.
               </p>
               <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setIsCreating(true)}>
                  Bắt đầu tạo ngay
               </button>
            </div>
          ) : (
            banksData.map((bank) => (
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
                            <span>•</span>
                            <span>{bank.type}</span>
                         </div>
                      </div>
                   </div>
                   <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/lecturer/question-bank/${bank.id}`}>
                         <button className="btn btn-ghost" style={{ padding: '8px 12px' }}>
                            Quản lý <ChevronRight size={16} />
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

        {/* Right Panel: Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
           <div className="card" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.25)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-purple-light)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                 <Dice5 size={18} />
                 Tạo đề thi ngẫu nhiên
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                 Sử dụng thuật toán trộn đề để tạo ra các đề thi có độ khó tương đương từ ngân hàng câu hỏi của bạn.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 <select className="select" style={{ width: '100%', fontSize: 13 }}>
                    <option>-- Chọn ngân hàng nguồn --</option>
                    {banksData?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                 </select>
                 <button className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={!banksData?.length}>
                    Tiến hành tạo đề
                 </button>
              </div>
           </div>

           <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 16px' }}>💡 Mẹo tối ưu</h3>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                 {[
                   'Gắn nhãn (Tag) cho bài tập để lọc nhanh hơn.',
                   'Phân loại độ khó chính xác giúp cân bằng đề thi.',
                   'Thường xuyên cập nhật câu hỏi mới để tránh trùng lặp.'
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
