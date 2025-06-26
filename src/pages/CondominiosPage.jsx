import React, { useState, useEffect } from 'react';
import { getCondominios, createCondominio, updateCondominio, ativarCondominio, inativarCondominio } from '../api/condominioService';
import Modal from '../components/ui/Modal';
import './Page.css'; // Reutilizando os estilos gerais

const CondominiosPage = () => {
    const [condominios, setCondominios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [editingCondominio, setEditingCondominio] = useState(null);
    const [formData, setFormData] = useState({});

    // Função para buscar os dados da API
    const fetchCondominios = async () => {
        setIsLoading(true);
        try {
            const response = await getCondominios();
            setCondominios(response.data);
        } catch (error) {
            console.error("Erro ao buscar condomínios:", error);
            alert("Não foi possível carregar os dados dos condomínios.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCondominios();
    }, []);

    // Abre o modal para um novo condomínio
    const handleAddNew = () => {
        setEditingCondominio(null);
        setFormData({ conTipologia: 'RESIDENCIAL' }); // Valor padrão
        setIsModalOpen(true);
    };

    // Abre o modal para editar um condomínio existente
    const handleEdit = (condo) => {
        setEditingCondominio(condo);
        // Preenche o formulário com os dados do condomínio, incluindo o admCod
        setFormData({
            conNome: condo.conNome,
            conLogradouro: condo.conLogradouro,
            conNumero: condo.conNumero,
            conTipologia: condo.conTipologia,
            admCod: condo.administradora?.admCod || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCondominio(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Função única para salvar (cria ou atualiza)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Monta o payload conforme a API espera (com o objeto 'administradora')
        const payload = {
            conNome: formData.conNome,
            conLogradouro: formData.conLogradouro,
            conNumero: formData.conNumero,
            conTipologia: formData.conTipologia,
            administradora: { admCod: parseInt(formData.admCod) }
        };

        try {
            if (editingCondominio) {
                // Modo de Edição
                await updateCondominio(editingCondominio.conCod, payload);
                alert('Condomínio atualizado com sucesso!');
            } else {
                // Modo de Criação
                await createCondominio(payload);
                alert('Condomínio criado com sucesso!');
            }
            handleCloseModal();
            fetchCondominios(); // Recarrega a lista
        } catch (error) {
            alert(`Erro: ${error.response?.data?.message || 'Não foi possível salvar os dados.'}`);
        }
    };
    
    // Função para ativar ou inativar
    const handleToggleAtivo = async (condo) => {
        const action = condo.conAtivo ? 'inativar' : 'ativar';
        if (window.confirm(`Tem certeza que deseja ${action} este condomínio?`)) {
            try {
                if (condo.conAtivo) {
                    await inativarCondominio(condo.conCod);
                } else {
                    await ativarCondominio(condo.conCod);
                }
                alert(`Condomínio foi ${action}do com sucesso!`);
                fetchCondominios();
            } catch (error) {
                alert(`Erro ao ${action} o condomínio: ${error.response?.data?.message || ''}`);
            }
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Gestão de Condomínios</h1>
                <button onClick={handleAddNew}>Adicionar Condomínio</button>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCondominio ? 'Editar Condomínio' : 'Novo Condomínio'}>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Nome do Condomínio</label>
                        <input name="conNome" value={formData.conNome || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Logradouro</label>
                        <input name="conLogradouro" value={formData.conLogradouro || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Número</label>
                        <input name="conNumero" value={formData.conNumero || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Código da Administradora</label>
                        <input name="admCod" type="number" value={formData.admCod || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Tipologia</label>
                        <select name="conTipologia" value={formData.conTipologia || 'RESIDENCIAL'} onChange={handleChange}>
                            <option value="RESIDENCIAL">Residencial</option>
                            <option value="COMERCIAL">Comercial</option>
                            <option value="MISTO">Misto</option>
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
                                <th>Nome</th>
                                <th>Endereço</th>
                                <th>Tipologia</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {condominios.map(condo => (
                                <tr key={condo.conCod}>
                                    <td>{condo.conCod}</td>
                                    <td>{condo.conNome}</td>
                                    <td>{`${condo.conLogradouro}, ${condo.conNumero}`}</td>
                                    <td>{condo.conTipologia}</td>
                                    <td>{condo.conAtivo ? 'Ativo' : 'Inativo'}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleEdit(condo)} className="btn-edit">Editar</button>
                                        <button onClick={() => handleToggleAtivo(condo)} className={condo.conAtivo ? "btn-inactive" : "btn-active"}>
                                            {condo.conAtivo ? 'Inativar' : 'Ativar'}
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

export default CondominiosPage;