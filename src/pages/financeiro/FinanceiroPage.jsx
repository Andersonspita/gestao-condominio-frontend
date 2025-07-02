import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getCobrancas, createCobranca, cancelarCobranca, gerarCobrancasEmLote, getTiposCobranca, createTipoCobranca } from '../../api/financeiroService';
import { formatStatus } from '../../utils/formatters';
import Modal from '../../components/ui/Modal';
import '../Page.css';

const FinanceiroPage = () => {
    const { user } = useAuth(); // Pega o usuário logado para verificar permissões
    const [cobrancas, setCobrancas] = useState([]);
    const [tiposCobranca, setTiposCobranca] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isCobrancaModalOpen, setIsCobrancaModalOpen] = useState(false);
    const [isTipoModalOpen, setIsTipoModalOpen] = useState(false);
    const [isLoteModalOpen, setIsLoteModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({});

    // Verifica se o usuário tem um papel de GESTÃO
    const hasManagementRole = user?.roles.some(role => !role.startsWith('ROLE_MORADOR_'));

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // A API já filtra os dados pelo perfil do usuário, então a chamada é a mesma
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

    // --- FUNÇÕES DE SUBMIT E AÇÕES COMPLETAS ---
    const handleCobrancaSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ficValorTaxa: formData.ficValorTaxa,
            ficDtVencimento: formData.ficDtVencimento,
            unidade: { uniCod: parseInt(formData.uniCod) },
            tipoCobranca: { ticCod: parseInt(formData.ticCod) }
        };
        try {
            await createCobranca(payload);
            alert('Cobrança criada com sucesso!');
            setIsCobrancaModalOpen(false);
            fetchData();
        } catch (error) {
            alert(`Erro: ${error.response?.data?.message || 'Não foi possível criar a cobrança.'}`);
        }
    };

    const handleTipoSubmit = async (e) => {
        e.preventDefault();
        try {
            await createTipoCobranca({ ticDescricao: formData.ticDescricao });
            alert('Tipo de Cobrança criado com sucesso!');
            setIsTipoModalOpen(false);
            fetchData();
        } catch (error) {
            alert(`Erro: ${error.response?.data?.message || 'Não foi possível criar o tipo.'}`);
        }
    };

    const handleLoteSubmit = async (e) => {
        e.preventDefault();
        const params = {
            condominioId: formData.condominioId,
            dataVencimento: formData.dataVencimento,
            tipoCobrancaId: formData.tipoCobrancaId
        };
        try {
            await gerarCobrancasEmLote(params);
            alert('Cobranças em lote geradas com sucesso!');
            setIsLoteModalOpen(false);
            fetchData();
        } catch (error) {
            alert(`Erro: ${error.response?.data?.message || 'Não foi possível gerar as cobranças.'}`);
        }
    };

    const handleCancelarCobranca = async (cobrancaId) => {
        if(window.confirm('Tem certeza que deseja cancelar esta cobrança?')) {
            try {
                await cancelarCobranca(cobrancaId);
                alert('Cobrança cancelada com sucesso!');
                fetchData();
            } catch (error) {
                alert(`Erro: ${error.response?.data?.message || 'Não foi possível cancelar.'}`);
            }
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>{hasManagementRole ? 'Módulo Financeiro' : 'Minhas Cobranças'}</h1>
            </div>

            <div className="content-section">
                <div className="section-header">
                    <h2>{hasManagementRole ? 'Visão Geral das Cobranças' : 'Minhas Faturas'}</h2>
                    {hasManagementRole && (
                        <div>
                            <button onClick={() => setIsLoteModalOpen(true)} className="btn-secondary">Gerar em Lote</button>
                            <button onClick={() => setIsCobrancaModalOpen(true)} style={{marginLeft: '1rem'}}>Adicionar Cobrança</button>
                        </div>
                    )}
                </div>
                {isLoading ? <p>Carregando...</p> : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Unidade</th>
                                    <th>Tipo de Cobrança</th>
                                    <th>Valor (R$)</th>
                                    <th>Vencimento</th>
                                    <th>Status</th>
                                    {hasManagementRole && <th>Ações</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {cobrancas.map(c => (
                                    <tr key={c.ficCod}>
                                        <td>{c.ficCod}</td>
                                        <td>Unid. {c.unidade.uniNumero} / Cond. {c.unidade.condominio.conCod}</td>
                                        <td>{c.tipoCobranca.ticDescricao}</td>
                                        <td>{c.ficValorTaxa.toFixed(2)}</td>
                                        <td>{new Date(c.ficDtVencimento + 'T00:00:00').toLocaleDateString()}</td>
                                        <td>{formatStatus(c.ficStatusPagamento)}</td>
                                        {hasManagementRole && (
                                            <td className="actions-cell">
                                                {c.ficStatusPagamento !== 'PAGA' && c.ficStatusPagamento !== 'CANCELADA' &&
                                                    <button onClick={() => handleCancelarCobranca(c.ficCod)} className="btn-inactive">Cancelar</button>
                                                }
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {hasManagementRole && (
                <div className="content-section">
                    <div className="section-header">
                        <h2>Tipos de Cobrança</h2>
                        <button onClick={() => setIsTipoModalOpen(true)}>Adicionar Tipo</button>
                    </div>
                    {isLoading ? <p>Carregando...</p> : (
                        <div className="table-container">
                            <table>
                                <thead><tr><th>ID</th><th>Descrição</th><th>Status</th></tr></thead>
                                <tbody>
                                    {tiposCobranca.map(t => (
                                        <tr key={t.ticCod}>
                                            <td>{t.ticCod}</td>
                                            <td>{t.ticDescricao}</td>
                                            <td>{t.ticAtiva ? 'Ativo' : 'Inativo'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}


            <Modal isOpen={isCobrancaModalOpen} onClose={() => setIsCobrancaModalOpen(false)} title="Nova Cobrança Individual">
                <form onSubmit={handleCobrancaSubmit} className="modal-form">
                    <div className="form-group"><label>ID da Unidade</label><input name="uniCod" type="number" onChange={handleChange} required /></div>
                    <div className="form-group"><label>Tipo de Cobrança</label><select name="ticCod" onChange={handleChange} required><option value="">Selecione...</option>{tiposCobranca.map(t=><option key={t.ticCod} value={t.ticCod}>{t.ticDescricao}</option>)}</select></div>
                    <div className="form-group"><label>Valor</label><input name="ficValorTaxa" type="number" step="0.01" onChange={handleChange} required /></div>
                    <div className="form-group"><label>Data de Vencimento</label><input name="ficDtVencimento" type="date" onChange={handleChange} required /></div>
                    <div className="form-actions"><button type="submit">Salvar</button></div>
                </form>
            </Modal>

            <Modal isOpen={isTipoModalOpen} onClose={() => setIsTipoModalOpen(false)} title="Novo Tipo de Cobrança">
                <form onSubmit={handleTipoSubmit} className="modal-form">
                    <div className="form-group"><label>Descrição</label><input name="ticDescricao" onChange={handleChange} required /></div>
                    <div className="form-actions"><button type="submit">Salvar</button></div>
                </form>
            </Modal>

            <Modal isOpen={isLoteModalOpen} onClose={() => setIsLoteModalOpen(false)} title="Gerar Cobranças em Lote">
                <form onSubmit={handleLoteSubmit} className="modal-form">
                    <div className="form-group"><label>ID do Condomínio</label><input name="condominioId" type="number" onChange={handleChange} required /></div>
                    <div className="form-group"><label>Tipo de Cobrança</label><select name="tipoCobrancaId" onChange={handleChange} required><option value="">Selecione...</option>{tiposCobranca.map(t=><option key={t.ticCod} value={t.ticCod}>{t.ticDescricao}</option>)}</select></div>
                    <div className="form-group"><label>Data de Vencimento</label><input name="dataVencimento" type="date" onChange={handleChange} required /></div>
                    <div className="form-actions"><button type="submit">Gerar</button></div>
                </form>
            </Modal>
        </div>
    );
};

export default FinanceiroPage;