import api from './api';

// Busca todos os comunicados visíveis para o usuário logado
export const getComunicados = () => {
    return api.get('/comunicacoes');
};