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
