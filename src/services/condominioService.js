import api from '../api/api';

// Lista todos os condomínios (supondo um endpoint GET /api/condominios)
export const getCondominios = () => {
    return api.get('/condominios');
};

// Cadastra um novo condomínio 
export const createCondominio = (condominioData) => {
    return api.post('/condominios', condominioData);
};