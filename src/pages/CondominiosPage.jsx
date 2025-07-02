import React, { useState, useEffect } from 'react';
import { getCondominios, createCondominio, updateCondominio, ativarCondominio, inativarCondominio } from '../api/condominioService';
import { getAdministradoras } from '../api/administradoraService'; // Importar para o dropdown
import Modal from '../components/ui/Modal';
import './Page.css';

const CondominiosPage = () => {
    const [condominios, setCondominios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [editingCondominio, setEditingCondominio] = useState(null);
    const [formData, setFormData] = useState({});
    
    // Novo estado para a lista de administradoras
    const [listaAdmin, setListaAdmin] = useState([]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [condominiosRes, adminRes] = await Promise.all([
                getCondominios(false), // Pega ativos e inativos
                getAdministradoras(true) // Pega apenas administradoras ativas para o dropdown
            ]);
            setCondominios(condominiosRes.data);
            setListaAdmin(adminRes.data);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            alert("Não foi possível carregar os dados da página.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAddNew = () => {
        setEditingCondominio(null);
        setFormData({ conTipologia: 'RESIDENCIAL' });
        setIsModalOpen(true);
    };

    const handleEdit = (condo) => {
        setEditingCondominio(condo);
        setFormData({
            conNome: condo.conNome,
            conLogradouro: condo.conLogradouro,
            conNumero: condo.conNumero,
            conTipologia: condo.conTipologia,
            admCod: condo.administradora?.admCod || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => { setIsModalOpen(false); setEditingCondominio(null); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            conNome: formData.conNome,
            conLogradouro: formData.conLogradouro,
            conNumero: formData.conNumero,
            conTipologia: formData.conTipologia,
            administradora: { admCod: parseInt(formData.admCod) }
        };
        try {
            if (editingCondominio) {
                await updateCondominio(editingCondominio.conCod, payload);
                alert('Condomínio atualizado com sucesso!');
            } else {
                await createCondominio(payload);
                alert('Condomínio criado com sucesso!');
            }
            handleCloseModal();
            fetchData();
        } catch (error) {
            alert(`Erro: ${error.response?.data?.message || 'Não foi possível salvar.'}`);
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
                <form onSubmit={handleSubmit} className="modal-form" key={editingCondominio ? editingCondominio.conCod : 'new-condo'}>
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
                        <label>Administradora</label>
                        {/* Campo de código da adm foi trocado por um dropdown */}
                        <select name="admCod" value={formData.admCod || ''} onChange={handleChange} required>
                            <option value="">Selecione uma administradora</option>
                            {listaAdmin.map(admin => (
                                <option key={admin.admCod} value={admin.admCod}>{admin.dadosEmpresa.pesNome}</option>
                            ))}
                        </select>
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
                                {/* CORREÇÃO: COLUNA DE ID REMOVIDA */}
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
                                    {/* CORREÇÃO: CÉLULA DE ID REMOVIDA */}
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