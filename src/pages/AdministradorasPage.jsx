import React, { useState, useEffect } from 'react';

// Serviços de API
import { 
    getAdministradoras, 
    createAdministradora, 
    updateAdministradora,
    ativarAdministradora,
    inativarAdministradora
} from '../api/administradoraService';
import { getPessoas } from '../api/pessoaService';

// Componentes de UI
import Modal from '../components/ui/Modal';
import { maskCpfCnpj } from '../utils/formatters';

// CSS
import './Page.css';

const AdministradorasPage = () => {
    const [administradoras, setAdministradoras] = useState([]);
    const [pessoas, setPessoas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData] = useState({});

    // Busca os dados iniciais
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [adminRes, pessoasRes] = await Promise.all([
                getAdministradoras(false), // Pega ativas e inativas
                getPessoas()
            ]);
            setAdministradoras(adminRes.data);
            setPessoas(pessoasRes.data);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            alert("Não foi possível carregar os dados da página.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- Lógica para CRUD de Administradoras ---
    const handleAddNew = () => {
        setEditingAdmin(null);
        setFormData({});
        setIsModalOpen(true);
    };

    const handleEdit = (admin) => {
        setEditingAdmin(admin);
        setFormData({
            dadosEmpresaCod: admin.dadosEmpresa.pesCod,
            responsavelCod: admin.responsavel.pesCod,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAdmin(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            dadosEmpresa: { pesCod: parseInt(formData.dadosEmpresaCod) },
            responsavel: { pesCod: parseInt(formData.responsavelCod) }
        };
        try {
            if (editingAdmin) {
                await updateAdministradora(editingAdmin.admCod, payload);
                alert("Administradora atualizada com sucesso!");
            } else {
                await createAdministradora(payload);
                alert("Administradora criada com sucesso!");
            }
            handleCloseModal();
            fetchData();
        } catch (error) {
            alert(`Erro: ${error.response?.data?.message || 'Não foi possível salvar.'}`);
        }
    };

    const handleToggleAtivo = async (admin) => {
        const action = admin.admAtivo ? 'inativar' : 'ativar';
        if (window.confirm(`Tem certeza que deseja ${action} esta administradora?`)) {
            try {
                if (admin.admAtivo) {
                    await inativarAdministradora(admin.admCod);
                } else {
                    await ativarAdministradora(admin.admCod);
                }
                alert(`Administradora foi ${action}da com sucesso!`);
                fetchData();
            } catch (error) {
                alert(`Erro ao ${action} a administradora: ${error.response?.data?.message || ''}`);
            }
        }
    };

    // Filtra as pessoas para os dropdowns
    const pessoasJuridicas = pessoas.filter(p => p.pesTipo === 'J');
    const pessoasFisicas = pessoas.filter(p => p.pesTipo === 'F');

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Gestão de Administradoras</h1>
                <button onClick={handleAddNew}>Adicionar Administradora</button>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingAdmin ? 'Editar Administradora' : 'Nova Administradora'}>
                <form onSubmit={handleSubmit} className="modal-form" key={editingAdmin ? editingAdmin.admCod : 'new-admin'}>
                    <div className="form-group">
                        <label>Empresa (Pessoa Jurídica)</label>
                        <select name="dadosEmpresaCod" value={formData.dadosEmpresaCod || ''} onChange={handleChange} required>
                            <option value="">Selecione a empresa</option>
                            {pessoasJuridicas.map(p => <option key={p.pesCod} value={p.pesCod}>{p.pesNome} - {maskCpfCnpj(p.pesCpfCnpj)}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Responsável (Pessoa Física)</label>
                        <select name="responsavelCod" value={formData.responsavelCod || ''} onChange={handleChange} required>
                            <option value="">Selecione o responsável</option>
                            {pessoasFisicas.map(p => <option key={p.pesCod} value={p.pesCod}>{p.pesNome}</option>)}
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
                                <th>Empresa (Razão Social)</th>
                                <th>CNPJ</th>
                                <th>Responsável</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {administradoras.map(admin => (
                                <tr key={admin.admCod}>
                                    <td>{admin.dadosEmpresa.pesNome}</td>
                                    <td>{maskCpfCnpj(admin.dadosEmpresa.pesCpfCnpj)}</td>
                                    <td>{admin.responsavel.pesNome}</td>
                                    <td>{admin.admAtivo ? 'Ativo' : 'Inativo'}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleEdit(admin)} className="btn-edit">Editar</button>
                                        <button onClick={() => handleToggleAtivo(admin)} className={admin.admAtivo ? "btn-inactive" : "btn-active"}>
                                            {admin.admAtivo ? 'Inativar' : 'Ativar'}
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

export default AdministradorasPage;