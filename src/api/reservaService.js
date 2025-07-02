import api from './api';

// Busca todas as reservas visíveis para o usuário logado
export const getReservas = () => {
    return api.get('/reservas');
};