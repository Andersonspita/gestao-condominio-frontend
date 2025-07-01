import api from './api';

// Atribui um papel (Síndico, Admin, etc.) a uma pessoa em um condomínio
export const createUsuarioCondominio = (data) => {
    // Exemplo de data: { pessoa: { pesCod: 1 }, condominio: { conCod: 1 }, uscPapel: 'SINDICO' }
    return api.post('/usuarios/condominios', data);
};

// Busca os papéis de uma pessoa específica
export const getRolesByPessoa = (pessoaId) => {
    // A API não tem este endpoint, então vamos simular buscando todos e filtrando.
    // O ideal seria um endpoint: api.get(`/usuarios/condominios/por-pessoa/${pessoaId}`)
    return api.get('/usuarios/condominios?ativos=false');
};

// Remove um papel de um usuário em um condomínio
export const deleteUsuarioCondominio = ({ pesCod, conCod, uscPapel }) => {
    // Exemplo de como a chamada seria:
    // return api.delete(`/usuarios/condominios/${pesCod}/${conCod}/${uscPapel}`);
    console.log(`FRONT-END: Simulating delete role ${uscPapel} for person ${pesCod}`);
    return Promise.resolve();
};
