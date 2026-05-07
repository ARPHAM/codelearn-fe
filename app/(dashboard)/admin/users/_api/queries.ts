import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import axios from '@/config/axios'

export type Lecturer = {
	id: string,
	fullName: string,
	email: string,
	role: string,
	status: string,
	rating: number,
	xp: number,
	createdAt: string,
	updatedAt: string,
}

export type Student = {
	id: string,
	fullName: string,
	email: string,
	mssv: string,
	role: string,
	major: string,
	avatarUrl: string | null,
	status: string,
	rating: number,
	xp: number,
	createdAt: string,
	updatedAt: string,
}

export type UserStats = {
	totalLecturers: number;
	totalStudents: number;
	newUsersThisWeek: number;
	blockedUsers: number;
}

export type ListParams = {
	page: number;
	limit: number;
	search?: string;
	status?: string;
}

export const useListLecturer = (params: ListParams) => {
	return useQuery<{ items: Lecturer[], total: number }>({
		placeholderData: keepPreviousData,
		queryKey: ['useListLecturer', params],
		queryFn: () => {
			return axios
				.get('/admin/users/lecturers', { params })
				.then((res) => res.data.data)
		},
	})
}

export const useListStudent = (params: ListParams) => {
	return useQuery<{ items: Student[], total: number }>({
		placeholderData: keepPreviousData,
		queryKey: ['useListStudent', params],
		queryFn: () => {
			return axios
				.get('/admin/users/students', { params })
				.then((res) => res.data.data)
		},
	})
}

export const useUserStats = () => {
	return useQuery<UserStats>({
		queryKey: ['useUserStats'],
		queryFn: () => {
			return axios
				.get('/admin/users/stats')
				.then((res) => res.data.data)
		},
	})
}

export const useUser = (id: string) => {
	return useQuery<Lecturer & Student>({
		queryKey: ['useUser', id],
		queryFn: () => {
			return axios
				.get(`/admin/users/${id}`)
				.then((res) => res.data.data)
		},
		enabled: !!id,
	})
}

export const useUpdateUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string, data: any }) => {
			return axios.patch(`/admin/users/${id}`, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['useListLecturer'] });
			queryClient.invalidateQueries({ queryKey: ['useListStudent'] });
			queryClient.invalidateQueries({ queryKey: ['useUser'] });
			queryClient.invalidateQueries({ queryKey: ['useUserStats'] });
		}
	})
}