import axios from 'axios';
export const api=axios.create({ baseURL:import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api' });
api.interceptors.request.use(config=>{ const token=localStorage.getItem('clinicflow_token'); if(token) config.headers.Authorization=`Bearer ${token}`; return config; });
api.interceptors.response.use(r=>r,e=>{ if(e.response?.status===401){ localStorage.removeItem('clinicflow_token'); if(location.pathname!=='/login') location.assign('/login'); } return Promise.reject(e); });
export const getError=(error:unknown)=>axios.isAxiosError(error)?error.response?.data?.message ?? error.message:'Something went wrong';

