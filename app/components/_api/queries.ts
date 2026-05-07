import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getStudentStats } from '@/src/api/user.api'
import axios from '@/config/axios'

type User = {
    id: string,
    name: string,
    role: string,
    email: string,
    avatar?: string,
    mssv?: string,
    major?: string,
    rating?: number,
    xp?: number,
}

export const useCurrentUserInfo = () => {
	return useQuery<User>({
		placeholderData: keepPreviousData,
		queryKey: ['useCurrentUserInfo'],
		queryFn: () => {
			return axios
				.get('/auth/me')
				.then((res) => res.data.data)
		},
	})
}

export const useUserStats = () => {
    return useQuery({
        queryKey: ['user-stats'],
        queryFn: getStudentStats,
    });
};