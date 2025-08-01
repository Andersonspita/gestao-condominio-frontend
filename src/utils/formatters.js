export const maskCpfCnpj = (doc) => {
    // Retorna vazio se o documento não for válido
    if (!doc) return '';

    // Remove todos os caracteres que não são dígitos
    const docStr = String(doc).replace(/\D/g, '');

    // Verifica se é um CPF (11 dígitos)
    if (docStr.length === 11) {
        return docStr.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
        // Exemplo: 123.***.***-01
    }

    // Verifica se é um CNPJ (14 dígitos)
    if (docStr.length === 14) {
        return docStr.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.***.****-$5');
        // Exemplo: 12.345.***/****-01
    }

    // Se não for nem CPF nem CNPJ, retorna o valor original
    return doc;
};

export const formatStatus = (statusString) => {
    if (!statusString) return 'N/A'; // Retorna N/A se o status for nulo

    return statusString
        .replace(/_/g, ' ') // 1. Substitui todos os underscores por espaços
        .toLowerCase()       // 2. Converte todo o texto para minúsculas
        .replace(/^\w/, (c) => c.toUpperCase()); // 3. Capitaliza a primeira letra
};
