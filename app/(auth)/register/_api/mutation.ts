import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/Toast';
import axios from '@/config/axios'

type RegisterRequest = {
  fullName: string,
  mssv: string,
  email: string,
  password: string,
  role: string,
  major: string
}

export const useRegister = () => {

	return useMutation({
		mutationFn: async (data: RegisterRequest) => {
			return axios.post('/auth/register', data)
		},
		onSuccess: (res) => {
			toast({ type: 'success', title: 'Đăng ký thành công!', message: res.data?.message });
		},
		onError: (error: any) => {
			toast({ type: 'error', title: 'Đăng ký thất bại!', message: error.response?.data?.message });
		},
	})
}
