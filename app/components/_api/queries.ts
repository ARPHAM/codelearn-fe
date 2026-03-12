import { keepPreviousData, useQuery } from '@tanstack/react-query'

import axios from '@/config/axios'

type User = {
    id: string,
    name: string,
    role: string,
    email: string,
    avatar?: string,
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