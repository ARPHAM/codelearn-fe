import axios from '@/config/axios';

export interface SandboxJob {
  id: string;
  status: string;
  submissionId: string;
  submission?: {
    id: string;
    language?: {
      name: string;
    };
    user?: {
      fullName: string;
    };
    problemVersion?: {
      problem?: {
        title: string;
      };
    };
  };
}

export const sandboxApi = {
  getJobs: async () => {
    const response = await axios.get('/admin/sandbox/jobs');
    return response.data.data;
  },
  killJob: async (jobId: string) => {
    const response = await axios.delete(`/admin/sandbox/jobs/${jobId}`);
    return response.data.data;
  },
};
