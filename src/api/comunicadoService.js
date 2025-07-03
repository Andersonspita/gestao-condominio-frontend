import api from './api';

// Busca todos os comunicados (a API já filtra pelo perfil do usuário)
export const getComunicados = () => api.get('/comunicacoes');

// Busca um comunicado específico pelo ID
export const getComunicadoById = (id) => api.get(`/comunicacoes/${id}`);

// Cria um novo comunicado
export const createComunicado = (data) => api.post('/comunicacoes', data);

// Atualiza um comunicado existente
export const updateComunicado = (id, data) => api.put(`/comunicacoes/${id}`, data);

// Exclui um comunicado
export const deleteComunicado = (id) => api.delete(`/comunicacoes/${id}`);