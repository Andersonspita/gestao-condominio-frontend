import api from './api';

// Atribui um papel (Síndico, Admin, etc.) a uma pessoa em um condomínio
export const createUsuarioCondominio = (data) => {
    // Exemplo de data: { pessoa: { pesCod: 1 }, condominio: { conCod: 1 }, uscPapel: 'SINDICO' }
    return api.post('/usuarios/condominios', data);
};