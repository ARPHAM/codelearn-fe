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
    language: string;
    entryFile: string;
    files: Array<{ filePath: string; content: string }>;
  }) => {
    const response = await axios.post('/run', data);
    return response.data.data;
  },

  getRunResult: async (id: string) => {
    const response = await axios.get(`/run/${id}`);
    return response.data.data;
  },
};
