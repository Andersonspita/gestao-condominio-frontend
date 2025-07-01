import api from './api';

export const getAdministradoras = (ativos = true) => api.get(`/administradoras?ativas=${ativos}`);
export const createAdministradora = (data) => api.post('/administradoras', data);
export const updateAdministradora = (id, data) => api.put(`/administradoras/${id}`, data);
export const inativarAdministradora = (id) => api.put(`/administradoras/${id}/inativar`);
export const ativarAdministradora = (id) => api.put(`/administradoras/${id}/ativar`);