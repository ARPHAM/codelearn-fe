import axios from '@/config/axios';

export interface RunResult {
  status: string;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  runtime?: number;
  memory?: number;
}

export const runApi = {
  executeCode: async (data: {
    languageId: number;
    language?: string;
    entryFile: string;
    files: Array<{ filePath: string; content: string }>;
    input?: string;
    problemVersionId?: string;
    examId?: string;
    answers?: Record<string, string[]>;
  }) => {
    const response = await axios.post('/run', data);
    return response.data.data;
  },

  getRunResult: async (id: string) => {
    const response = await axios.get(`/run/${id}`);
    return response.data.data;
  },

  waitForResult: async (id: string, maxAttempts = 30): Promise<any> => {
    for (let i = 0; i < maxAttempts; i++) {
        const result = await runApi.getRunResult(id);
        
        // Các trạng thái kết thúc theo Backend SubmissionStatus
        const terminalStatuses = ['accepted', 'wrong_answer', 'time_limit', 'memory_limit', 'runtime_error', 'compile_error', 'error'];
        
        if (terminalStatuses.includes(result.status.toLowerCase())) {
            return {
                stdout: result.output || '',
                stderr: result.compileOutput || '',
                status: result.status,
                runtime: result.runtime
            };
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error('Hết thời gian chờ kết quả thực thi code (Timeout).');
  }
};
