'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { RoomData } from '@/features/room/api';
import { useUpdateRoom } from '@/features/room/mutations';
import { toast } from '@/components/ui/Toast';
import { Loader2 } from 'lucide-react';

interface EditRoomModalProps {
    open: boolean;
    onClose: () => void;
    room: RoomData | null;
}

export default function EditRoomModal({ open, onClose, room }: EditRoomModalProps) {
    const updateRoomMutation = useUpdateRoom();
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'MEETING' | 'CODE'>('CODE');
    const [maxParticipants, setMaxParticipants] = useState(10);

    useEffect(() => {
        if (room) {
            setName(room.name);
            setDescription(room.description || '');
            setType(room.type);
            setMaxParticipants(room.maxParticipants || 10);
        }
    }, [room, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!room) return;

        try {
            await updateRoomMutation.mutateAsync({
                id: room.id,
                data: {
                    name,
                    description,
                    type,
                    maxParticipants
                }
            });
            toast({ type: 'success', title: 'Thành công', message: 'Đã cập nhật thông tin phòng.' });
            onClose();
        } catch (err: any) {
            toast({ type: 'error', title: 'Lỗi', message: err?.response?.data?.message || 'Không thể cập nhật phòng.' });
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="📝 Chỉnh sửa phòng học"
            size="md"
            footer={
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleSubmit}
                        disabled={updateRoomMutation.isPending || !name.trim()}
                    >
                        {updateRoomMutation.isPending ? <Loader2 className="spin" size={16} /> : 'Cập nhật'}
                    </button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                    <label className="form-label">Tên phòng *</label>
                    <input
                        className="input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="VD: Học thuật toán"
                        required
                    />
                </div>
                <div>
                    <label className="form-label">Mô tả</label>
                    <textarea
                        className="input"
                        style={{ height: 80 }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Mô tả về phòng..."
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <label className="form-label">Loại phòng</label>
                        <select
                            className="select"
                            value={type}
                            onChange={(e) => setType(e.target.value as 'MEETING' | 'CODE')}
                            style={{ width: '100%' }}
                        >
                            <option value="CODE">💻 Coding Session</option>
                            <option value="MEETING">🎙️ Meeting</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Số người tối đa</label>
                        <input
                            type="number"
                            className="input"
                            value={maxParticipants}
                            onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                            min={2}
                            max={50}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
}
