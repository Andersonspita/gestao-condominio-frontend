import api from './api';

// Busca TODOS os vínculos de usuários a administradoras
export const getAllAdminUsuarios = (ativos = true) => {
    return api.get(`/administradoras/usuarios?ativos=${ativos}`);
};

// Cria um novo vínculo de usuário a uma administradora
export const createAdminUsuario = (data) => {
    return api.post('/administradoras/usuarios', data);
};