import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/Toast';
import axios from '@/config/axios'

type LoginRequest = {
	email: string
	password: string
	role: string
}

export const useLogin = () => {

	return useMutation({
		mutationFn: async (data: LoginRequest) => {
			return axios.post('/auth/login', data)
		},
		onSuccess: (res) => {
			toast({ type: 'success', title: 'Đăng nhập thành công!', message: res.data?.message });
		},
		onError: (error: any) => {
			toast({ type: 'error', title: 'Đăng nhập thất bại!', message: error.response?.data?.message });
		},
	})
}
