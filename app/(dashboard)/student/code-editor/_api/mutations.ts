import { useMutation } from '@tanstack/react-query'
import { toast } from '@/components/ui/Toast';
import axios from '@/config/axios'
import { useLanguages } from '@/src/hooks/useLanguages'

export interface SubmitCodeRequest {
    problemVersionId?: string;
    language: string;
    entryFile: string;
    files: {
        filename: string;
        language: string;
        content: string;
    }[];
    answers?: Record<string, string[]>;
}

export const useSubmitCode = () => {
    const { data: languages = [] } = useLanguages();

    return useMutation({
        mutationFn: async (payload: SubmitCodeRequest) => {
            const { language, entryFile, files, problemVersionId } = payload;
            
            // Tìm kiếm ngôn ngữ chính xác hơn
            const langObj = languages.find(l => 
                l.name.toLowerCase() === language.toLowerCase() || 
                l.ext.toLowerCase() === (language.startsWith('.') ? language.toLowerCase() : '.' + language.toLowerCase())
            );

            if (!langObj && languages.length > 0) {
                console.error("Language not found in list:", language, languages);
                throw new Error(`Ngôn ngữ "${language}" không được hỗ trợ. Vui lòng kiểm tra lại.`);
            }

            const ext = langObj?.ext || '.py';
            const languageId = langObj?.id;

            // Mapping files sang cấu trúc backend mong muốn và thêm extension
            const mappedFiles = files.map(f => {
                return {
                    filePath: f.filename,
                    content: f.content
                }
            });

            const submitPayload = {
                problemVersionId,
                language,
                languageId,
                entryFile: entryFile.includes('.') ? entryFile : entryFile + ext,
                files: mappedFiles,
                answers: payload.answers
            };

            const response = await axios.post('/submission', submitPayload);
            return response.data.data;
        },
        onSuccess: (res) => {
            toast({ type: 'success', title: 'Đã nhận bài!', message: res.message || 'Hệ thống đang chấm bài của bạn.' });
        },
        onError: (error: any) => {
            toast({ 
                type: 'error', 
                title: 'Nộp bài thất bại!', 
                message: error.response?.data?.message || error.message 
            });
        },
    });
}

export interface RunCodeRequest extends SubmitCodeRequest {
    input?: string;
}

export const useRunCode = () => {
    const { data: languages = [] } = useLanguages();

    return useMutation({
        mutationFn: async (payload: RunCodeRequest) => {
            const { language, entryFile, files, problemVersionId, input } = payload;
            
            const langObj = languages.find(l => 
                l.name.toLowerCase() === language.toLowerCase() || 
                l.ext.toLowerCase() === (language.startsWith('.') ? language.toLowerCase() : '.' + language.toLowerCase())
            );
            
            if (!langObj && languages.length > 0) {
                console.error("Language not found in list:", language, languages);
                throw new Error(`Ngôn ngữ "${language}" không được hỗ trợ. Vui lòng kiểm tra lại.`);
            }

            const ext = langObj?.ext || '.py';

            const mappedFiles = files.map(f => {
                return {
                    filePath: f.filename,
                    content: f.content
                }
            });

            const runPayload = {
                problemVersionId,
                languageId: langObj?.id,
                entryFile: entryFile.includes('.') ? entryFile : entryFile + ext,
                files: mappedFiles,
                input,
                answers: payload.answers
            };

            const response = await axios.post('/run', runPayload);
            return response.data.data;
        },
        onError: (error: any) => {
            toast({ 
                type: 'error', 
                title: 'Chạy code thất bại!', 
                message: error.response?.data?.message || error.message 
            });
        },
    });
};

export const useGetSubmissionDetails = () => {
    return useMutation({
        mutationFn: async (submissionId: string | number) => {
            const response = await axios.get(`/submission/${submissionId}/result`);
            return response.data.data;
        },
        onSuccess: (res) => {
            toast({ type: 'success', title: 'Lấy thông tin nộp bài thành công!', message: res.message });
        },
        onError: (error: any) => {
            toast({ 
                type: 'error', 
                title: 'Lấy thông tin nộp bài thất bại!', 
                message: error.response?.data?.message || error.message 
            });
        },
    });
}
