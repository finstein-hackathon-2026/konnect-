import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ceremony-savior-security.ngrok-free.dev/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getJobs = async () => {
  const response = await api.get('/jobs');
  return response.data;
};

export const getJob = async (id: string) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const createJob = async (data: any) => {
  const response = await api.post('/jobs', data);
  return response.data;
};

export const updateJob = async (id: string, data: any) => {
  const response = await api.patch(`/jobs/${id}`, data);
  return response.data;
};

export default api;
