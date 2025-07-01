import api from './api';

// Associa uma pessoa a uma unidade como morador
export const createMorador = (data) => {
    // Exemplo de data: { pessoa: { pesCod: 1 }, unidade: { uniCod: 101 }, morTipoRelacionamento: 'PROPRIETARIO' }
    return api.post('/moradores', data);
};

// No futuro, uma função para remover o vínculo de morador
export const deleteMorador = (id) => {
    // Exemplo de como a chamada seria:
    // return api.delete(`/moradores/${id}`);
    console.log(`FRONT-END: Simulating delete morador for id ${id}`);
    return Promise.resolve();
};
