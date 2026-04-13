import axios from '@/config/axios';

export type Block = {
  id: string;
  content: string;
};

export type TestCase = {
  id?: string;
  input: string;
  expectedOutput: string;
  score: number;
  order: number;
  isHidden: boolean;
};

export type LanguageFile = {
  id?: string;
  languageId: number;
  path: string;
  type: 'TEMPLATE' | 'SOLUTION';
  content: string;
};

export type CreateProblemDto = {
  title: string;
  slug?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  type: 'CODE' | 'SQL';
  visibility: 'PUBLIC' | 'PRIVATE';
  source?: string;
  workspaceConfig?: {
    canCreateFile: boolean;
    canChangeMainFile: boolean;
  };
  description: Block[];
  testcases: TestCase[];
  languageFiles: LanguageFile[];
  problemFiles?: any[];
};

export type ProblemSummary = {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  status: string;
  type: string;
  visibility: string;
  source?: string;
  workspaceConfig?: {
    canCreateFile: boolean;
    canChangeMainFile: boolean;
  };
  problemFiles?: any[];
  stats?: {
      totalSubmissions: number;
      acceptanceRate: number;
  };
};

export type ProblemDetailResponse = {
  canEdit: boolean;
  problem: ProblemSummary;
  versions: any[];
  testcases: TestCase[];
  languageFiles: LanguageFile[];
  problemFiles: any[];
};

export type StudentProblemDetailResponse = {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  type: string;
  stats?: any;
  version?: { id: string; description: any[] };
  testcases: TestCase[];
  languageFiles: LanguageFile[];
  files: any[];
};

export const getLecturerProblems = async (params?: { page?: number; limit?: number; search?: string; filter?: string }): Promise<{items: ProblemSummary[], total: number, page: number, limit: number}> => {
  const response = await axios.get('/problems/lecturer/list', { params });
  return response.data.data;
};

export const getStudentProblems = async (params?: { page?: number; limit?: number; search?: string; filter?: string; difficulty?: string }): Promise<{items: ProblemSummary[], total: number, page: number, limit: number}> => {
  const response = await axios.get('/problems', { params });
  return response.data.data;
};

export const createProblem = async (data: CreateProblemDto): Promise<any> => {
  const response = await axios.post('/problems', data);
  return response.data.data;
};

export const updateProblem = async (params: { id: string, data: CreateProblemDto }): Promise<any> => {
  const response = await axios.put(`/problems/${params.id}`, params.data);
  return response.data.data;
};

export const getProblemDetail = async (id: string): Promise<ProblemDetailResponse> => {
  const response = await axios.get(`/problems/${id}/edit`);
  return response.data.data;
};

export const getStudentProblemDetail = async (slug: string): Promise<StudentProblemDetailResponse> => {
  const response = await axios.get(`/problems/${slug}`);
  return response.data.data;
};
export const getAdminProblems = async (params?: { page?: number; limit?: number; search?: string }): Promise<{items: ProblemSummary[], total: number, page: number, limit: number}> => {
  const response = await axios.get('/problems/admin/list', { params });
  return response.data.data;
};

export const approveProblemVersion = async (versionId: string): Promise<any> => {
  const response = await axios.patch(`/problems/admin/versions/${versionId}/approve`);
  return response.data.data;
};
