'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankApi, QuestionBank } from '@/api/bank.api';
import { getAdminProblems } from '@/api/problems.api';
import { 
  Loader2, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Search, 
  Database,
  ExternalLink,
  Target,
  ArrowRight,
  X,
  User as UserIcon
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import Link from 'next/link';

// --- Modal chọn câu hỏi để thêm vào Ngân hàng (Dùng cho Admin) ---
const AddItemModal = ({ isOpen, onClose, onAdd }: any) => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [problems, setProblems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);

    const loadProblems = async () => {
        setIsLoading(true);
        try {
            // Admin có thể chọn bài tập từ toàn bộ hệ thống
            const res = await getAdminProblems({ search, page, limit: 6 });
            setProblems(res.items);
            setTotal(res.total);
        } catch (error) {
            toast({ type: 'error', title: 'Lỗi', message: 'Không thể tải bài tập.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) loadProblems();
    }, [isOpen, search, page]);

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div className="animate-in" style={{ background: '#1E2330', border: '1px solid var(--border)', borderRadius: 24, width: '100%', maxWidth: 600, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>Thêm bài tập (Hệ thống) vào Ngân hàng</h3>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
                </div>
                <div style={{ padding: 24, overflowY: 'auto' }}>
                    <div style={{ position: 'relative', marginBottom: 16 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        <input className="input" placeholder="Tìm tên bài tập..." style={{ width: '100%', paddingLeft: 36 }} value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {problems.map(p => (
                            <div key={p.id} className="card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.difficulty} • {p.type} • {p.createdBy?.fullName || 'N/A'}</div>
                                </div>
                                <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12, color: 'var(--accent-cyan)' }} onClick={() => onAdd(p.id)}>Thêm</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AdminBankDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 1. Fetch Bank Detail
  const { data: bank, isLoading } = useQuery({
    queryKey: ['admin-question-bank', id],
    queryFn: () => bankApi.getBankDetail(id as string),
  });

  // 2. Add Item Mutation
  const addMutation = useMutation({
    mutationFn: (probId: number) => bankApi.addItem(id as string, probId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-question-bank', id] });
      toast({ type: 'success', title: 'Thành công', message: 'Đã thêm bài tập vào ngân hàng.' });
    },
  });

  // 3. Delete Item Mutation
  const deleteMutation = useMutation({
    mutationFn: (itemId: number) => bankApi.deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-question-bank', id] });
      toast({ type: 'success', title: 'Đã xóa', message: 'Đã xóa bài tập khỏi ngân hàng.' });
    },
  });

  if (isLoading) return <div className="page-container" style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Loader2 className="animate-spin" /></div>;
  if (!bank) return <div className="page-container">Ngân hàng không tồn tại.</div>;

  return (
    <div className="page-container animate-in">
      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-ghost" onClick={() => router.back()} style={{ marginLeft: -12 }}>
          <ChevronLeft size={18} /> Quay lại danh sách
        </button>
      </div>

      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ width: 64, height: 64, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple-light)' }}>
                <Database size={32} />
            </div>
            <div>
                <h1 className="page-title">{bank.name}</h1>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, alignItems: 'center' }}>
                    <span className="badge badge-purple">{bank.type}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>ID: {bank.id} • {bank.items?.length || 0} bài tập</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 13 }}>
                        <UserIcon size={14} /> Chủ sở hữu: {bank.createdBy?.fullName || 'N/A'}
                    </span>
                </div>
            </div>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={18} /> Thêm bài tập vào ngân hàng
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, color: 'var(--text-muted)' }}>BÀI TẬP</th>
                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, color: 'var(--text-muted)' }}>ĐỘ KHÓ</th>
                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, color: 'var(--text-muted)' }}>NGÀY THÊM</th>
                    <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, color: 'var(--text-muted)' }}>THAO TÁC</th>
                </tr>
            </thead>
            <tbody>
                {bank.items?.length === 0 ? (
                    <tr>
                        <td colSpan={4} style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Chưa có bài tập nào trong ngân hàng này.
                        </td>
                    </tr>
                ) : bank.items?.map((item: any) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 24px' }}>
                            <div style={{ fontWeight: 600 }}>{item.problem?.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Loại: {item.problem?.type}</div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                            <span className={`badge ${item.problem?.difficulty === 'EASY' ? 'badge-green' : 'badge-orange'}`}>
                                {item.problem?.difficulty}
                            </span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-secondary)' }}>
                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <Link href={`/admin/problems/${item.problem?.id}`}>
                                    <button className="btn btn-ghost" style={{ padding: 8 }} title="Xem chi tiết">
                                        <ExternalLink size={16} />
                                    </button>
                                </Link>
                                <button className="btn btn-ghost" style={{ padding: 8, color: 'var(--accent-red)' }} onClick={() => deleteMutation.mutate(item.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      <AddItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={(probId: number) => { addMutation.mutate(probId); setIsAddModalOpen(false); }} 
      />
    </div>
  );
}
