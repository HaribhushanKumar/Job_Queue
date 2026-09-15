import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Job {
  id: string;
  title: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

export const fetchJobs = async (status?: string, search?: string): Promise<Job[]> => {
  const params: Record<string, string> = {};
  if (status && status !== 'all') params.status = status;
  if (search) params.search = search;
  const response = await api.get('/jobs', { params });
  return response.data;
};

export const fetchJobStats = async (): Promise<JobStats> => {
  const response = await api.get('/jobs/stats');
  return response.data;
};

export const createJob = async (title: string, type: string): Promise<Job> => {
  const response = await api.post('/jobs', { title, type });
  return response.data;
};

export const updateJobStatus = async (
  id: string,
  status: 'pending' | 'running' | 'completed' | 'failed',
  expectedCurrentStatus?: string,
  progress?: number,
  errorMessage?: string,
): Promise<Job> => {
  const response = await api.patch(`/jobs/${id}/status`, {
    status,
    expectedCurrentStatus,
    progress,
    errorMessage,
  });
  return response.data;
};

export const runJobWorker = async (id: string): Promise<Job> => {
  const response = await api.post(`/jobs/${id}/run`);
  return response.data;
};

export const deleteJob = async (id: string): Promise<void> => {
  await api.delete(`/jobs/${id}`);
};
