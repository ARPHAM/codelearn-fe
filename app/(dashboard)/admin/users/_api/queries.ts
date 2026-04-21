import { keepPreviousData, useQuery } from '@tanstack/react-query'

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

export const useListLecturer = () => {
	return useQuery<Lecturer[]>({
		placeholderData: keepPreviousData,
		queryKey: ['useListLecturer'],
		queryFn: () => {
			return axios
				.get('/admin/users/lecturers')
				.then((res) => res.data.data)
		},
	})
}

export const useListStudent = () => {
	return useQuery<Student[]>({
		placeholderData: keepPreviousData,
		queryKey: ['useListStudent'],
		queryFn: () => {
			return axios
				.get('/admin/users/students')
				.then((res) => res.data.data)
		},
	})
}