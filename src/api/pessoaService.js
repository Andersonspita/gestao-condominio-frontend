import api from './api';

export const getPessoas = () => api.get('/pessoas');
export const getPessoaById = (id) => api.get(`/pessoas/${id}`);
export const createPessoa = (data) => api.post('/pessoas', data);
export const updatePessoa = (id, data) => api.patch(`/pessoas/${id}`, data);
export const inativarPessoa = (id) => api.put(`/pessoas/${id}/inativar`);
export const ativarPessoa = (id) => api.put(`/pessoas/${id}/ativar`);


