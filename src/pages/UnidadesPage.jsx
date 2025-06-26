import React, { useState, useEffect } from 'react';
import { getUnidades, createUnidade, updateUnidade, ativarUnidade, inativarUnidade } from '../api/unidadeService';
import Modal from '../components/ui/Modal';
import { formatStatus } from '../utils/formatters';
import './Page.css';

const UnidadesPage = () => {
    const [unidades, setUnidades] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [editingUnidade, setEditingUnidade] = useState(null);
    const [formData, setFormData] = useState({});

    const fetchUnidades = async () => {
        setIsLoading(true);
        try {
            const response = await getUnidades();
            setUnidades(response.data);
        } catch (error) {
            console.error("Erro ao buscar unidades:", error);
            alert("Não foi possível carregar os dados das unidades.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUnidades();
    }, []);

    const handleAddNew = () => {
        setEditingUnidade(null);
        setFormData({ uniStatusOcupacao: 'DESOCUPADO' });
        setIsModalOpen(true);
    };

    const handleEdit = (unidade) => {
        setEditingUnidade(unidade);
        setFormData({
            uniNumero: unidade.uniNumero,
            uniStatusOcupacao: unidade.uniStatusOcupacao,
            uniValorTaxaCondominio: unidade.uniValorTaxaCondominio,
            conCod: unidade.condominio?.conCod || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUnidade(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            ...formData,
            condominio: { conCod: parseInt(formData.conCod) }
        };

        try {
            if (editingUnidade) {
                await updateUnidade(editingUnidade.uniCod, payload);
                alert('Unidade atualizada com sucesso!');
            } else {
                await createUnidade(payload);
                alert('Unidade criada com sucesso!');
            }
            handleCloseModal();
            fetchUnidades();
        } catch (error) {
            alert(`Erro: ${error.response?.data?.message || 'Não foi possível salvar os dados.'}`);
        }
    };
    
    const handleToggleAtivo = async (unidade) => {
        const action = unidade.uniAtiva ? 'inativar' : 'ativar';
        if (window.confirm(`Tem certeza que deseja ${action} esta unidade?`)) {
            try {
                if (unidade.uniAtiva) {
                    await inativarUnidade(unidade.uniCod);
                } else {
                    await ativarUnidade(unidade.uniCod);
                }
                alert(`Unidade foi ${action}da com sucesso!`);
                fetchUnidades();
            } catch (error) {
                alert(`Erro ao ${action} a unidade: ${error.response?.data?.message || ''}`);
            }
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Gestão de Unidades</h1>
                <button onClick={handleAddNew}>Adicionar Unidade</button>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUnidade ? 'Editar Unidade' : 'Nova Unidade'}>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Número da Unidade</label>
                        <input name="uniNumero" value={formData.uniNumero || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Código do Condomínio</label>
                        <input name="conCod" type="number" value={formData.conCod || ''} onChange={handleChange} required disabled={!!editingUnidade} />
                    </div>
                    <div className="form-group">
                        <label>Valor da Taxa de Condomínio</label>
                        <input name="uniValorTaxaCondominio" type="number" step="0.01" value={formData.uniValorTaxaCondominio || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Status de Ocupação</label>
                        <select name="uniStatusOcupacao" value={formData.uniStatusOcupacao || 'DESOCUPADO'} onChange={handleChange}>
                            <option value="OCUPADO">Ocupado</option>
                            <option value="DESOCUPADO">Desocupado</option>
                            <option value="EM_VENDA">Em Venda</option>
                            <option value="ALUGADO">Alugado</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={handleCloseModal} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </Modal>

            {isLoading ? <p>Carregando...</p> : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Número</th>
                                <th>Condomínio</th>
                                <th>Taxa (R$)</th>
                                <th>Status</th>
                                <th>Ativa</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unidades.map(unidade => (
                                <tr key={unidade.uniCod}>
                                    <td>{unidade.uniCod}</td>
                                    <td>{unidade.uniNumero}</td>
                                    <td>{unidade.condominio.conNome} (ID: {unidade.condominio.conCod})</td>
                                    <td>{unidade.uniValorTaxaCondominio.toFixed(2)}</td>
                                    <td>{formatStatus(unidade.uniStatusOcupacao)}</td>
                                    <td>{unidade.uniAtiva ? 'Sim' : 'Não'}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleEdit(unidade)} className="btn-edit">Editar</button>
                                        <button onClick={() => handleToggleAtivo(unidade)} className={unidade.uniAtiva ? "btn-inactive" : "btn-active"}>
                                            {unidade.uniAtiva ? 'Inativar' : 'Ativar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UnidadesPage;
