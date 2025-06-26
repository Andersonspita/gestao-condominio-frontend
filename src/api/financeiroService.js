import api from './api';

// --- API DE COBRANÇAS ---

// Busca a lista de todas as cobranças
export const getCobrancas = () => {
    return api.get('/cobrancas');
};

// Cria uma nova cobrança individual
export const createCobranca = (data) => {
    return api.post('/cobrancas', data);
};

// Cancela uma cobrança existente
export const cancelarCobranca = (id) => {
    return api.put(`/cobrancas/${id}/cancelar`);
};

// Gera cobranças em lote para um condomínio
export const gerarCobrancasEmLote = (params) => {
    // Ex: params = { condominioId: 1, dataVencimento: '2025-07-10', tipoCobrancaId: 1 }
    return api.post('/cobrancas/gerar-lote', null, { params });
};


// --- API DE TIPOS DE COBRANÇA ---

// Busca a lista de todos os tipos de cobrança (ativos por padrão)
export const getTiposCobranca = (ativos = true) => {
    return api.get(`/cobrancas/tipos?ativos=${ativos}`);
};

// Cria um novo tipo de cobrança
export const createTipoCobranca = (data) => {
    return api.post('/cobrancas/tipos', data);
};