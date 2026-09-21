import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('studymind_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const groqKey = localStorage.getItem('studymind_groq_key') || localStorage.getItem('studymind_llm_key');
    if (groqKey) {
      config.headers['X-Groq-Api-Key'] = groqKey;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('studymind_token');
      localStorage.removeItem('studymind_user');
    }
    return Promise.reject(error);
  }
);

export const formatErrorMessage = (detail: any, fallback: string = 'An error occurred'): string => {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => d.msg || d.detail || (typeof d === 'object' ? JSON.stringify(d) : String(d))).join(', ');
  }
  if (detail && typeof detail === 'object') {
    return detail.msg || detail.detail || JSON.stringify(detail);
  }
  return fallback;
};
