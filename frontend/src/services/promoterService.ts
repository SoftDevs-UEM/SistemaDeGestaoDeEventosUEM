import api from './api';

export const promoterService = {
  list: async () => {
    const res = await api.get('/promoters');
    return res.data;
  },

  create: async (data: any) => {
    const res = await api.post('/promoters', data);
    return res.data;
  },

  get: async (id: number) => {
    const res = await api.get(`/promoters/${id}`);
    return res.data;
  },

  update: async (id: number, data: any) => {
    const res = await api.put(`/promoters/${id}`, data);
    return res.data;
  },

  delete: async (id: number) => {
    const res = await api.delete(`/promoters/${id}`);
    return res.data;
  },
};
