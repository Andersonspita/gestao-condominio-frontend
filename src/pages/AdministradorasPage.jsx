import React, { useState, useEffect } from 'react';

// Serviços de API
import { getAdministradoras, createAdministradora, updateAdministradora } from '../api/administradoraService';
import { getAllAdminUsuarios, createAdminUsuario } from '../api/administradoraUsuarioService';
import { getPessoas } from '../api/pessoaService';

// Componentes e Utilitários
import Modal from '../components/ui/Modal';
import { formatStatus, maskCpfCnpj } from '../utils/formatters';
import './Page.css';

const AdministradorasPage = () => {
    const [administradoras, setAdministradoras] = useState([]);
    const [pessoas, setPessoas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Estados dos Modais
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isFuncModalOpen, setIsFuncModalOpen] = useState(false);
    
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [selectedAdmin, setSelectedAdmin] = useState(null); // Para saber de quem são os funcionários
    const [formData, setFormData] = useState({});

    // Busca os dados iniciais
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [adminRes, pessoasRes, funcionariosRes] = await Promise.all([
                getAdministradoras(false),
                getPessoas(),
                getAllAdminUsuarios(false)
            ]);
            
            const adminComFuncionarios = adminRes.data.map(admin => ({
                ...admin,
                funcionarios: funcionariosRes.data.filter(func => func.administradora.admCod === admin.admCod)
            }));

            setAdministradoras(adminComFuncionarios);
            setPessoas(pessoasRes.data);
        } catch (error) {
            alert("Erro ao carregar dados das administradoras.");
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
    const handleAddNewAdmin = () => {
        setEditingAdmin(null);
        setFormData({});
        setIsInfoModalOpen(true);
    };

    const handleEditAdmin = (admin) => {
        setEditingAdmin(admin);
        setFormData({
            dadosEmpresaCod: admin.dadosEmpresa.pesCod,
            responsavelCod: admin.responsavel.pesCod,
        });
        setIsInfoModalOpen(true);
    };

    const handleAdminSubmit = async (e) => {
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
            setIsInfoModalOpen(false);
            fetchData();
        } catch (error) {
            alert(`Erro: ${error.response?.data?.message || 'Não foi possível salvar.'}`);
        }
    };

    // --- Lógica para Modal de Funcionários ---
    const handleViewFuncionarios = (admin) => {
        setSelectedAdmin(admin);
        setFormData({});
        setIsFuncModalOpen(true);
    };

    const handleAddFuncionarioSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            administradora: { admCod: selectedAdmin.admCod },
            pessoa: { pesCod: parseInt(formData.pesCod) },
            aduPapel: formData.aduPapel
        };
        try {
            await createAdminUsuario(payload);
            alert("Funcionário vinculado com sucesso!");
            setIsFuncModalOpen(false);
            fetchData(); // Rebusca tudo para atualizar a contagem de funcionários na tabela
        } catch (error) {
            alert(`Erro: ${error.response?.data?.message || 'Não foi possível vincular funcionário.'}`);
        }
    };

    const pessoasJuridicas = pessoas.filter(p => p.pesTipo === 'J');
    const pessoasFisicas = pessoas.filter(p => p.pesTipo === 'F');

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Gestão de Administradoras</h1>
                <button onClick={handleAddNewAdmin}>Adicionar Administradora</button>
            </div>

            {/* Tabela Principal */}
            {isLoading ? <p>Carregando...</p> : (
                <div className="table-container">
                    <table>
                        <thead><tr><th>Empresa (Razão Social)</th><th>CNPJ</th><th>Responsável</th><th>Status</th><th>Ações</th></tr></thead>
                        <tbody>
                            {administradoras.map(admin => (
                                <tr key={admin.admCod}>
                                    <td>{admin.dadosEmpresa.pesNome}</td>
                                    <td>{maskCpfCnpj(admin.dadosEmpresa.pesCpfCnpj)}</td>
                                    <td>{admin.responsavel.pesNome}</td>
                                    <td>{admin.admAtivo ? 'Ativo' : 'Inativo'}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleViewFuncionarios(admin)} className="btn-secondary">Funcionários ({admin.funcionarios.length})</button>
                                        <button onClick={() => handleEditAdmin(admin)} className="btn-edit">Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal para Criar/Editar Administradora */}
            <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title={editingAdmin ? 'Editar Administradora' : 'Nova Administradora'}>
                <form onSubmit={handleAdminSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Empresa (Pessoa Jurídica)</label>
                        <select name="dadosEmpresaCod" value={formData.dadosEmpresaCod || ''} onChange={handleChange} required>
                            <option value="">Selecione a empresa</option>
                            {pessoasJuridicas.map(p => <option key={p.pesCod} value={p.pesCod}>{p.pesNome}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Responsável (Pessoa Física)</label>
                        <select name="responsavelCod" value={formData.responsavelCod || ''} onChange={handleChange} required>
                            <option value="">Selecione o responsável</option>
                            {pessoasFisicas.map(p => <option key={p.pesCod} value={p.pesCod}>{p.pesNome}</option>)}
                        </select>
                    </div>
                    <div className="form-actions"><button type="submit" className="btn-primary">Salvar</button><button type="button" onClick={() => setIsInfoModalOpen(false)} className="btn-secondary">Cancelar</button></div>
                </form>
            </Modal>

            {/* Modal para Ver/Adicionar Funcionários */}
            <Modal isOpen={isFuncModalOpen} onClose={() => setIsFuncModalOpen(false)} title={`Funcionários de: ${selectedAdmin?.dadosEmpresa.pesNome}`}>
                <div className="roles-list" style={{marginBottom: '2rem'}}>
                    {selectedAdmin?.funcionarios.length > 0 ? selectedAdmin.funcionarios.map(func => (
                        <div key={func.aduCod} className="role-item">
                            <span><strong>{formatStatus(func.aduPapel)}</strong>: {func.pessoa.pesNome}</span>
                            <span>{func.aduAtivo ? 'Ativo' : 'Inativo'}</span>
                        </div>
                    )) : <p>Nenhum funcionário vinculado.</p>}
                </div>
                <fieldset className="role-fieldset"><legend>Vincular Novo Funcionário</legend>
                    <form onSubmit={handleAddFuncionarioSubmit}>
                        <div className="form-group"><label>Pessoa (Funcionário)</label><select name="pesCod" onChange={handleChange} required><option value="">Selecione...</option>{pessoasFisicas.map(p => <option key={p.pesCod} value={p.pesCod}>{p.pesNome}</option>)}</select></div>
                        <div className="form-group"><label>Papel na Administradora</label><select name="aduPapel" onChange={handleChange} required><option value="">Selecione...</option><option value="GERENTE">Gerente</option><option value="FINANCEIRO">Financeiro</option><option value="OPERACIONAL">Operacional</option><option value="SUPORTE">Suporte</option></select></div>
                        <div className="form-actions"><button type="submit" className="btn-primary">Vincular Funcionário</button></div>
                    </form>
                </fieldset>
            </Modal>
        </div>
    );
};

export default AdministradorasPage;