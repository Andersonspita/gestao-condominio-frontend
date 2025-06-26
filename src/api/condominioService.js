import api from './api';

// Busca a lista de condomínios (ativos por padrão)
export const getCondominios = (ativos = true) => {
    return api.get(`/condominios?ativos=${ativos}`);
};

// Busca um condomínio específico pelo seu ID
export const getCondominioById = (id) => {
    return api.get(`/condominios/${id}`);
};

// Cria um novo condomínio
export const createCondominio = (data) => {
    return api.post('/condominios', data);
};

// Atualiza um condomínio existente
export const updateCondominio = (id, data) => {
    return api.put(`/condominios/${id}`, data);
};

// Inativa um condomínio
export const inativarCondominio = (id) => {
    return api.put(`/condominios/${id}/inativar`);
};

// Ativa um condomínio
export const ativarCondominio = (id) => {
    return api.put(`/condominios/${id}/ativar`);
};