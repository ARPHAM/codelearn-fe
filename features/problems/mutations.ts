import { useMutation } from '@tanstack/react-query';
import axios from '@/config/axios';
import { toast } from '@/components/ui/Toast';

export interface RunCodeRequest {
    problemVersionId?: string;
    languageId: number;
    entryFile: string;
    files: {
        filePath: string;
        content: string;
    }[];
    input?: string;
}

export interface RunCodeResponse {
    id: string;
    status: string;
}

export interface SubmitCodeRequest {
    problemVersionId?: string;
    language: string;
    entryFile: string;
    files: {
        filePath: string;
        content: string;
    }[];
}

export interface SubmitCodeResponse {
    submissionId: string;
    status: string;
    message: string;
}

export const useRunCode = () => {
    return useMutation({
        mutationFn: async (payload: RunCodeRequest) => {
            const { data } = await axios.post<RunCodeResponse>('/runs', payload);
            return data;
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Chạy code thất bại!', message: error.response?.data?.message || error.message });
        },
    });
};

export const getRunResult = async (id: string) => {
    console.log("getRunResult", id);
    const { data } = await axios.get(`/runs/${id}`);
    return data;
}

export const useSubmitCode = () => {
    return useMutation({
        mutationFn: async (payload: SubmitCodeRequest) => {
            const { data } = await axios.post<SubmitCodeResponse>('/submissions', payload);
            return data;
        },
        onSuccess: (res) => {
            toast({ type: 'success', title: 'Đã nhận bài!', message: res.message });
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Nộp bài thất bại!', message: error.response?.data?.message || error.message });
        },
    });
};

export const getSubmissionResult = async (id: string) => {
    const { data } = await axios.get(`/submissions/${id}/result`);
    return data;
}
