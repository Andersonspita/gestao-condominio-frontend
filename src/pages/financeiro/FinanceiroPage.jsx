import React, { useState, useEffect } from 'react';
import { getCobrancas, createCobranca, cancelarCobranca, gerarCobrancasEmLote, getTiposCobranca, createTipoCobranca } from '../../api/financeiroService';
import { formatStatus } from '../../utils/formatters'; // Importar a função de formatação
import Modal from '../../components/ui/Modal';
import '../Page.css';

const FinanceiroPage = () => {
    const [cobrancas, setCobrancas] = useState([]);
    const [tiposCobranca, setTiposCobranca] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isCobrancaModalOpen, setIsCobrancaModalOpen] = useState(false);
    const [isTipoModalOpen, setIsTipoModalOpen] = useState(false);
    const [isLoteModalOpen, setIsLoteModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({});

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [cobrancasRes, tiposRes] = await Promise.all([
                getCobrancas(),
                getTiposCobranca()
            ]);
            setCobrancas(cobrancasRes.data);
            setTiposCobranca(tiposRes.data);
        } catch (error) {
            console.error("Erro ao buscar dados financeiros:", error);
            alert("Não foi possível carregar os dados financeiros.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- (As funções de submit e cancelamento continuam as mesmas) ---
    const handleCobrancaSubmit = async (e) => { /* ...código existente... */ };
    const handleTipoSubmit = async (e) => { /* ...código existente... */ };
    const handleLoteSubmit = async (e) => { /* ...código existente... */ };
    const handleCancelarCobranca = async (cobrancaId) => { /* ...código existente... */ };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Módulo Financeiro</h1>
            </div>

            {/* SEÇÃO DE COBRANÇAS */}
            <div className="content-section">
                <div className="section-header">
                    <h2>Cobranças</h2>
                    <div>
                        <button onClick={() => setIsLoteModalOpen(true)} className="btn-secondary">Gerar em Lote</button>
                        <button onClick={() => setIsCobrancaModalOpen(true)} style={{marginLeft: '1rem'}}>Adicionar Cobrança</button>
                    </div>
                </div>
                {isLoading ? <p>Carregando...</p> : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Unidade</th>
                                    <th>Tipo de Cobrança</th> {/* <-- COLUNA ADICIONADA --> */}
                                    <th>Valor (R$)</th>
                                    <th>Vencimento</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cobrancas.map(c => (
                                    <tr key={c.ficCod}>
                                        <td>{c.ficCod}</td>
                                        <td>Unid. {c.unidade.uniNumero} / Cond. {c.unidade.condominio.conCod}</td>
                                        {/* CÉLULA ADICIONADA COM O DADO */}
                                        <td>{c.tipoCobranca.ticDescricao}</td>
                                        <td>{c.ficValorTaxa.toFixed(2)}</td>
                                        <td>{new Date(c.ficDtVencimento + 'T00:00:00').toLocaleDateString()}</td>
                                        {/* Status formatado */}
                                        <td>{formatStatus(c.ficStatusPagamento)}</td>
                                        <td className="actions-cell">
                                            {c.ficStatusPagamento !== 'PAGA' && c.ficStatusPagamento !== 'CANCELADA' &&
                                                <button onClick={() => handleCancelarCobranca(c.ficCod)} className="btn-inactive">Cancelar</button>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ... (Restante do código, como a seção de Tipos de Cobrança e os Modais, continua o mesmo) ... */}
            
        </div>
    );
};

export default FinanceiroPage;
