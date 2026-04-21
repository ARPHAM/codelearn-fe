import axios from '@/config/axios';

export interface SystemSettings {
  sandbox: {
    maxConcurrent: number;
    defaultTimeout: number; // ms
    defaultMemoryLimit: number; // MB
    cpuLimit: number; // vCPU
    enableNetwork: boolean;
  };
  plagiarism: {
    algorithm: string;
    warningThreshold: number;
    dangerThreshold: number;
    autoFlag: boolean;
  };
}

export interface InfrastructureInfo {
  docker: {
    version: string;
    status: string;
    imageCount: number;
    containerCount: number;
  };
  nodes: {
    id: string;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    status: string;
  }[];
  registry: string;
}

export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await axios.get('/admin/settings');
  return response.data.data;
};

export const updateSystemSettings = async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await axios.patch('/admin/settings', data);
  return response.data.data;
};

export const getInfrastructureInfo = async (): Promise<InfrastructureInfo> => {
  const response = await axios.get('/admin/health/infrastructure');
  return response.data.data;
};
