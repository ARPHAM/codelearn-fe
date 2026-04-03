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
}

// Temporary fallback since Backend /languages API is not ready
const FALLBACK_LANGUAGES: Language[] = [
  {
    id: 1,
    name: 'Python',
    version: '3.10',
    dockerImage: 'python:3.10-slim',
    ext: '.py',
    template: 'print("Hello, World!")',
    imageStatus: 'READY',
    runCmd: 'python3 {file}',
  },
  {
    id: 2,
    name: 'C++',
    version: '17',
    dockerImage: 'gcc:latest',
    ext: '.cpp',
    template: '#include <iostream>\nint main() { std::cout << "Hello"; return 0; }',
    imageStatus: 'READY',
    compileCmd: 'g++ {file} -o {bin}',
    runCmd: './{bin}',
  },
];

export const getLanguages = async (): Promise<Language[]> => {
  try {
    const response = await axios.get('/languages');
    return response.data || FALLBACK_LANGUAGES;
  } catch (error) {
    console.warn('Backend /languages API is missing, using fallback data.');
    return FALLBACK_LANGUAGES;
  }
};

export const getLanguage = async (id: number): Promise<Language> => {
  const response = await axios.get(`/languages/${id}`);
  return response.data;
};

// Admin APIs
export const getAdminLanguages = async (): Promise<Language[]> => {
  const response = await axios.get('/admin/languages');
  return response.data.data;
};

export const createLanguage = async (data: Partial<Language>): Promise<Language> => {
  const response = await axios.post('/admin/languages', data);
  return response.data;
};

export const updateLanguage = async (id: number, data: Partial<Language>): Promise<Language> => {
  const response = await axios.patch(`/admin/languages/${id}`, data);
  return response.data;
};

export const deleteLanguage = async (id: number): Promise<void> => {
  await axios.delete(`/admin/languages/${id}`);
};
