import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/Toast';
import axios from '@/config/axios'
import { broadcastAuthChange } from '@/config/auth-channel';

export const useLogout = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async () => {
			return axios.post('/auth/logout')
		},
		onSuccess: (res) => {
			toast({ type: 'success', title: 'Đăng xuất thành công!', message: res.data?.message });
			queryClient.invalidateQueries({ queryKey: ['useCurrentUserInfo'] })
			broadcastAuthChange()
		},
		onError: (error: any) => {
			toast({ type: 'error', title: 'Đăng xuất thất bại!', message: error.response?.data?.message });
		},
	})
}
export const useUpdateProfile = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: { fullName?: string, mssv?: string, major?: string, avatarUrl?: string }) => {
			return axios.patch('/user/profile', data)
		},
		onSuccess: () => {
			toast({ type: 'success', title: 'Cập nhật thành công!', message: 'Thông tin cá nhân đã được cập nhật.' });
			queryClient.invalidateQueries({ queryKey: ['useCurrentUserInfo'] })
		},
		onError: (error: any) => {
			toast({ type: 'error', title: 'Cập nhật thất bại!', message: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.' });
		},
	})
}

export const useChangePassword = () => {
	return useMutation({
		mutationFn: async (data: { currentPassword: string, newPassword: string }) => {
			return axios.patch('/user/change-password', data)
		},
		onSuccess: () => {
			toast({ type: 'success', title: 'Thành công!', message: 'Mật khẩu đã được thay đổi.' });
		},
		onError: (error: any) => {
			toast({ type: 'error', title: 'Lỗi!', message: error.response?.data?.message || 'Không thể đổi mật khẩu.' });
		},
	})
}
