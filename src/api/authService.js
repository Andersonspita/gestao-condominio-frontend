import api from './api';

export const login = (email, senha) => {
    return api.post('/auth/login', { email, senha });
};