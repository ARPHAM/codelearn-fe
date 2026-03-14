import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/Toast';
import axios from '@/config/axios'

type SubmitCodeRequest = {
	exerciseId: number
	language: string
	mainFile: string
	files: {
		filename: string,
		content: string
	}[]
}

export const useSubmitCode = () => {
	// const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: SubmitCodeRequest) => {
			return axios.post('/submissions', data)
		},
		onSuccess: (res) => {
			toast({ type: 'success', title: 'Nộp bài thành công!', message: res.data?.message });
			// queryClient.invalidateQueries({ queryKey: ['useHomeLeftBarInfo'] })
		},
		onError: (error: any) => {
			toast({ type: 'error', title: 'Nộp bài thất bại!', message: error.response?.data?.message });
			// queryClient.invalidateQueries({ queryKey: ['useHomeLeftBarInfo'] })
		},
	})
}

export const useGetSubmissionDetails = () => {
	return useMutation({
		mutationFn: async (submissionId: string | number) => {
			return axios.get(`/submissions/${submissionId}/result`)
		},
		onSuccess: (res) => {
			toast({ type: 'success', title: 'Lấy thông tin nộp bài thành công!', message: res.data?.message });
		},
		onError: (error: any) => {
			toast({ type: 'error', title: 'Lấy thông tin nộp bài thất bại!', message: error.response?.data?.message });
		},
	})
}