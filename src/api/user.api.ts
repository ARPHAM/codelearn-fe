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

export const getLecturers = () => {
    return axios.get<any>('/user/lecturers').then(res => res.data.data);
};

export const getStudents = () => {
    return axios.get<any>('/user/students').then(res => res.data.data);
};

export const getStudentStats = () => {
    return axios.get<any>('/user/stats').then(res => res.data.data);
};
