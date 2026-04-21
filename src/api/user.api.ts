import axios from '@/config/axios';

export interface UserSummary {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
}

export const getProblemAuthors = () => {
    return axios.get<any>('/problem/authors').then(res => res.data.data);
};
