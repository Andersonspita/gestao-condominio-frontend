import React, { useState, useEffect } from 'react';
import { getPessoas, createPessoa, updatePessoa, inativarPessoa, ativarPessoa } from '../api/pessoaService';
import { createMorador } from '../api/moradorService';
import { createUsuarioCondominio } from '../api/usuarioCondominioService';
import { getCondominios } from '../api/condominioService';
import { getUnidades } from '../api/unidadeService';
import Modal from '../components/ui/Modal';
import ChangePasswordModal from '../components/ui/ChangePasswordModal';
import RoleBadges from '../components/ui/RoleBadges';
import { maskCpfCnpj } from '../utils/formatters';
import './Page.css';

const PessoasPage = () => {
    const [pessoas, setPessoas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [editingPessoa, setEditingPessoa] = useState(null);
    const [formData, setFormData] = useState({});
    const [listaCondominios, setListaCondominios] = useState([]);
    const [listaUnidades, setListaUnidades] = useState([]);
    const [unidadesFiltradas, setUnidadesFiltradas] = useState([]);

    // Definição da função para buscar os dados
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [pessoasRes, condominiosRes, unidadesRes] = await Promise.all([
                getPessoas(),
                getCondominios(),
                getUnidades()
            ]);
            setPessoas(pessoasRes.data);
            setListaCondominios(condominiosRes.data);
            setListaUnidades(unidadesRes.data);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            alert("Não foi possível carregar os dados da página.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (formData.condominioId) {
            const unidadesDoCondominio = listaUnidades.filter(u => u.condominio.conCod === parseInt(formData.condominioId));
            setUnidadesFiltradas(unidadesDoCondominio);
        } else {
            setUnidadesFiltradas([]);
        }
    }, [formData.condominioId, listaUnidades]);

    const handleAddNew = () => {
        setEditingPessoa(null);
        setFormData({ pesTipo: 'F', roleType: 'NONE' });
        setIsInfoModalOpen(true);
    };

    const handleEdit = (pessoa) => {
        setEditingPessoa(pessoa);
        setFormData({
            pesNome: pessoa.pesNome,
            pesCpfCnpj: pessoa.pesCpfCnpj,
            pesEmail: pessoa.pesEmail,
            pesTipo: pessoa.pesTipo,
        });
        setIsInfoModalOpen(true);
    };

    const handleCloseInfoModal = () => {
        setIsInfoModalOpen(false);
        setEditingPessoa(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPessoa) {
                await updatePessoa(editingPessoa.pesCod, formData);
                alert('Pessoa atualizada com sucesso!');
            } else {
                const pessoaPayload = {
                    pesNome: formData.pesNome,
                    pesCpfCnpj: formData.pesCpfCnpj,
                    pesEmail: formData.pesEmail,
                    pesSenhaLogin: formData.pesSenhaLogin,
                    pesTipo: formData.pesTipo,
                };
                const pessoaResponse = await createPessoa(pessoaPayload);
                const novaPessoa = pessoaResponse.data;
                let roleMessage = '';

                if (formData.roleType && formData.roleType !== 'NONE') {
                    if (formData.roleType === 'MORADOR') {
                        await createMorador({
                            pessoa: { pesCod: novaPessoa.pesCod },
                            unidade: { uniCod: parseInt(formData.unidadeId) },
                            morTipoRelacionamento: formData.morTipoRelacionamento || 'PROPRIETARIO'
                        });
                        roleMessage = ' e associada como morador(a).';
                    } else {
                        await createUsuarioCondominio({
                            pessoa: { pesCod: novaPessoa.pesCod },
                            condominio: { conCod: parseInt(formData.condominioId) },
                            uscPapel: formData.roleType
                        });
                        roleMessage = ` e atribuído o papel de ${formData.roleType}.`;
                    }
                }
                alert(`Pessoa criada com sucesso${roleMessage}`);
            }
            handleCloseInfoModal();
            fetchData(); // Chamada correta para atualizar os dados
        } catch (error) {
            alert(`Erro: ${error.response?.data?.message || 'Não foi possível salvar.'}`);
        }
    };

    const handleOpenPasswordModal = (pessoa) => {
        setEditingPessoa(pessoa);
        setIsPasswordModalOpen(true);
    };
    
    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setEditingPessoa(null);
    };

    const handlePasswordSubmit = async (newPassword) => {
        if (!editingPessoa) return;
        try {
            await updatePessoa(editingPessoa.pesCod, { pesSenhaLogin: newPassword });
            alert(`Senha de ${editingPessoa.pesNome} alterada com sucesso!`);
            handleClosePasswordModal();
        } catch (error) {
            alert(`Erro: ${error.response?.data?.message || 'Não foi possível alterar a senha.'}`);
        }
    };
    
    const handleToggleAtivo = async (pessoa) => {
        const action = pessoa.pesAtivo ? 'inativar' : 'ativar';
        if (window.confirm(`Tem certeza que deseja ${action} esta pessoa?`)) {
            try {
                if (pessoa.pesAtivo) {
                    await inativarPessoa(pessoa.pesCod);
                } else {
                    await ativarPessoa(pessoa.pesCod);
                }
                alert(`Pessoa foi ${action}da com sucesso!`);
                fetchData(); // Chamada correta para atualizar os dados
            } catch (error) {
                alert(`Erro ao ${action} a pessoa: ${error.response?.data?.message || 'Ocorreu um erro.'}`);
            }
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Gestão de Pessoas</h1>
                <button onClick={handleAddNew}>Adicionar Pessoa</button>
            </div>

            <Modal isOpen={isInfoModalOpen} onClose={handleCloseInfoModal} title={editingPessoa ? 'Editar Pessoa' : 'Nova Pessoa'}>
                <form onSubmit={handleSubmit} className="modal-form" key={editingPessoa ? editingPessoa.pesCod : 'new'}>
                    <div className="form-group">
                        <label>Nome Completo</label>
                        <input name="pesNome" value={formData.pesNome || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>CPF/CNPJ</label>
                        <input name="pesCpfCnpj" value={formData.pesCpfCnpj || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input name="pesEmail" type="email" value={formData.pesEmail || ''} onChange={handleChange} required />
                    </div>
                     <div className="form-group">
                        <label>Tipo</label>
                        <select name="pesTipo" value={formData.pesTipo || 'F'} onChange={handleChange}>
                            <option value="F">Física</option>
                            <option value="J">Jurídica</option>
                        </select>
                    </div>
                    {!editingPessoa && (
                        <div className="form-group">
                            <label>Senha</label>
                            <input name="pesSenhaLogin" type="password" value={formData.pesSenhaLogin || ''} onChange={handleChange} required />
                        </div>
                    )}
                    {!editingPessoa && (
                        <fieldset className="role-fieldset">
                            <legend>Atribuir Papel Inicial (Opcional)</legend>
                            <div className="form-group">
                                <label>Papel</label>
                                <select name="roleType" value={formData.roleType || 'NONE'} onChange={handleChange}>
                                    <option value="NONE">Nenhum</option>
                                    <option value="MORADOR">Morador</option>
                                    <option value="SINDICO">Síndico</option>
                                    <option value="ADMIN">Admin do Condomínio</option>
                                </select>
                            </div>
                            {formData.roleType === 'MORADOR' && (
                                <>
                                    <div className="form-group">
                                        <label>Selecione o Condomínio</label>
                                        <select name="condominioId" value={formData.condominioId || ''} onChange={handleChange} required>
                                            <option value="">Selecione primeiro o condomínio</option>
                                            {listaCondominios.map(condo => (
                                                <option key={condo.conCod} value={condo.conCod}>{condo.conNome}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {formData.condominioId && (
                                        <div className="form-group">
                                            <label>Selecione a Unidade</label>
                                            <select name="unidadeId" value={formData.unidadeId || ''} onChange={handleChange} required>
                                                <option value="">Selecione a unidade</option>
                                                {unidadesFiltradas.map(unidade => (
                                                    <option key={unidade.uniCod} value={unidade.uniCod}>{unidade.uniNumero}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Tipo de Relacionamento</label>
                                        <select name="morTipoRelacionamento" value={formData.morTipoRelacionamento || 'PROPRIETARIO'} onChange={handleChange}>
                                            <option value="PROPRIETARIO">Proprietário</option>
                                            <option value="INQUILINO">Inquilino</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            {(formData.roleType === 'SINDICO' || formData.roleType === 'ADMIN') && (
                                <div className="form-group">
                                    <label>Condomínio</label>
                                    <select name="condominioId" value={formData.condominioId || ''} onChange={handleChange} required>
                                        <option value="">Selecione um condomínio</option>
                                        {listaCondominios.map(condo => (
                                            <option key={condo.conCod} value={condo.conCod}>{condo.conNome}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </fieldset>
                    )}
                    <div className="form-actions">
                        <button type="button" onClick={handleCloseInfoModal} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </Modal>
            
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={handleClosePasswordModal}
                onSubmit={handlePasswordSubmit}
                userName={editingPessoa?.pesNome}
            />

            {isLoading ? <p>Carregando...</p> : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>CPF/CNPJ</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pessoas.map(pessoa => (
                                <tr key={pessoa.pesCod}>
                                    <td>
                                        {pessoa.pesNome}
                                        <RoleBadges user={pessoa} />
                                    </td>
                                    <td>{pessoa.pesEmail}</td>
                                    <td>{maskCpfCnpj(pessoa.pesCpfCnpj)}</td>
                                    <td>{pessoa.pesAtivo ? 'Ativo' : 'Inativo'}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleEdit(pessoa)} className="btn-edit">Editar</button>
                                        <button onClick={() => handleOpenPasswordModal(pessoa)} className="btn-password">Alterar Senha</button>
                                        <button onClick={() => handleToggleAtivo(pessoa)} className={pessoa.pesAtivo ? "btn-inactive" : "btn-active"}>
                                            {pessoa.pesAtivo ? 'Inativar' : 'Ativar'}
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

export default PessoasPage;
