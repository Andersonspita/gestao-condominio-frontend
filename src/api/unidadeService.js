import api from './api';

// Busca a lista de unidades (ativas por padrão)
export const getUnidades = (ativos = true) => {
    return api.get(`/unidades?ativas=${ativos}`);
};

// Busca uma unidade específica pelo seu ID
export const getUnidadeById = (id) => {
    return api.get(`/unidades/${id}`);
};

// Cria uma nova unidade
export const createUnidade = (data) => {
    return api.post('/unidades', data);
};

// Atualiza uma unidade existente
export const updateUnidade = (id, data) => {
    return api.put(`/unidades/${id}`, data);
};

// Inativa uma unidade
export const inativarUnidade = (id) => {
    return api.put(`/unidades/${id}/inativar`);
};

// Ativa uma unidade
export const ativarUnidade = (id) => {
    return api.put(`/unidades/${id}/ativar`);
};