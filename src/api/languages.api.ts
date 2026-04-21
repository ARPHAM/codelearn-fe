import axios from '@/config/axios';

export interface Language {
  id: number;
  name: string;
  version: string;
  dockerImage: string;
  ext: string;
  template: string;
  imageStatus: 'READY' | 'PULLING' | 'ERROR';
  lastError?: string | null;
  compileCmd?: string | null;
  runCmd: string;
  defaultMemoryLimit: number; // MB
  defaultCpuLimit: number;    // vCPU
  defaultTimeout: number;     // ms
}

export const getLanguages = async (): Promise<Language[]> => {
  const response = await axios.get('/languages');
  return response.data.data;
};

export const getLanguage = async (id: number): Promise<Language> => {
  const response = await axios.get(`/languages/${id}`);
  return response.data.data;
};

export const getAdminLanguages = async (): Promise<Language[]> => {
  const response = await axios.get('/admin/languages');
  return response.data.data;
};

export const createLanguage = async (data: Partial<Language>): Promise<Language> => {
  const response = await axios.post('/admin/languages', data);
  return response.data.data;
};

export const updateLanguage = async (data: { id: number; data: Partial<Language> }): Promise<Language> => {
  const response = await axios.patch(`/admin/languages/${data.id}`, data.data);
  return response.data.data;
};

export const deleteLanguage = async (id: number): Promise<void> => {
  await axios.delete(`/admin/languages/${id}`);
};
