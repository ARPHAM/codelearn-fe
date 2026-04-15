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
  getJobs: () => axios.get('/admin/sandbox/jobs'),
  killJob: (jobId: string) => axios.delete(`/admin/sandbox/jobs/${jobId}`),
};
