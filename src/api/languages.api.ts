import axios from '@/config/axios';

export interface Language {
  id: number;
  name: string;
  extension: string;
  sourceFileExt?: string;
}

export const getLanguages = async (): Promise<Language[]> => {
  const response = await axios.get('/languages');
  return response.data;
};
