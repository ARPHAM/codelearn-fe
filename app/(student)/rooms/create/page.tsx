'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useCreateRoom } from '@/features/room/mutations';
import { Loader2 } from 'lucide-react';

export default function CreateRoomPage() {
    const router = useRouter();
    const createRoomMutation = useCreateRoom();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'MEETING' | 'CODE'>('CODE');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const trimmedName = name.trim();
        if (!trimmedName) {
            setError('Room name is required');
            return;
        }

        if (trimmedName.length > 100) {
            setError('Room name must be less than 100 characters');
            return;
        }

        try {
            const newRoom = await createRoomMutation.mutateAsync({
                name: trimmedName,
                description: description.trim(),
                type
            });
            
            router.push(`/rooms/${newRoom.id}`);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to create room');
        }
    };

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 120px)' }}>
                <div className="card" style={{ width: 420, maxWidth: '100%' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 'var(--radius-md)',
                            background: 'var(--gradient-purple)', boxShadow: 'var(--shadow-glow-purple)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 14px', fontSize: 22,
                        }}>
                            🚀
                        </div>
                        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Tạo Phòng Mới</h1>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Bắt đầu một phiên code cùng nhau.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {error && (
                            <div className="badge badge-red" style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, width: '100%', justifyContent: 'center', textTransform: 'none' }}>
                                ⚠ {error}
                            </div>
                        )}

                        <div>
                            <label className="form-label" htmlFor="name">Tên phòng *</label>
                            <input
                                id="name"
                                className="input"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={createRoomMutation.isPending}
                                maxLength={100}
                                placeholder="VD: Daily Standup hoặc Coding Session"
                            />
                        </div>

                        <div>
                            <label className="form-label" htmlFor="description">Mô tả <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(Tuỳ chọn)</span></label>
                            <textarea
                                id="description"
                                className="textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={createRoomMutation.isPending}
                                rows={3}
                                placeholder="Phòng này dùng để làm gì?"
                            />
                        </div>

                        <div>
                            <label className="form-label" htmlFor="type">Loại phòng</label>
                            <select
                                id="type"
                                className="select"
                                value={type}
                                onChange={(e) => setType(e.target.value as 'MEETING' | 'CODE')}
                                disabled={createRoomMutation.isPending}
                                style={{ width: '100%' }}
                            >
                                <option value="CODE">💻 Coding Session</option>
                                <option value="MEETING">🎙️ Meeting</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={createRoomMutation.isPending || !name.trim()}
                            style={{
                                width: '100%', justifyContent: 'center', padding: '12px 20px',
                                marginTop: 8, opacity: (createRoomMutation.isPending || !name.trim()) ? 0.5 : 1,
                                cursor: (createRoomMutation.isPending || !name.trim()) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {createRoomMutation.isPending ? (
                                <>
                                    <Loader2 size={16} className="spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                '🚀 Tạo Phòng'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
