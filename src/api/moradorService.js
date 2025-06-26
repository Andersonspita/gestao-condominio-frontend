import api from './api';

// Associa uma pessoa a uma unidade como morador
export const createMorador = (data) => {
    // Exemplo de data: { pessoa: { pesCod: 1 }, unidade: { uniCod: 101 }, morTipoRelacionamento: 'PROPRIETARIO' }
    return api.post('/moradores', data);
};