import React, { useState, useEffect } from 'react';

// Serviços de API
import { getPessoas, createPessoa, updatePessoa, inativarPessoa, ativarPessoa } from '../api/pessoaService';
import { createMorador } from '../api/moradorService';
import { createUsuarioCondominio, getAllUsuariosCondominio } from '../api/usuarioCondominioService';
import { getCondominios } from '../api/condominioService';
import { getUnidades } from '../api/unidadeService';

// Componentes de UI
import Modal from '../components/ui/Modal';
import ChangePasswordModal from '../components/ui/ChangePasswordModal';
import RoleBadges from '../components/ui/RoleBadges';

// Utilitários
import { maskCpfCnpj, formatStatus } from '../utils/formatters';

// CSS
import './Page.css';

const PessoasPage = () => {
    // --- ESTADOS PRINCIPAIS ---
    const [pessoas, setPessoas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- ESTADOS DOS MODAIS ---
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    // --- ESTADOS DE DADOS ---
    const [editingPessoa, setEditingPessoa] = useState(null);
    const [formData, setFormData] = useState({});
    const [papeisUsuario, setPapeisUsuario] = useState([]);
    
    // --- ESTADOS PARA DROPDOWNS ---
    const [listaCondominios, setListaCondominios] = useState([]);
    const [listaUnidades, setListaUnidades] = useState([]);
    const [unidadesFiltradas, setUnidadesFiltradas] = useState([]);

    // --- FUNÇÕES DE BUSCA DE DADOS ---
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [pessoasRes, condominiosRes, unidadesRes, papeisRes] = await Promise.all([
                getPessoas(),
                getCondominios(),
                getUnidades(),
                getAllUsuariosCondominio()
            ]);

            const papeisMap = papeisRes.data.reduce((acc, papel) => {
                const pesCod = papel.pessoa.pesCod;
                if (!acc[pesCod]) acc[pesCod] = [];
                acc[pesCod].push(papel);
                return acc;
            }, {});

            const pessoasComPapeis = pessoasRes.data.map(pessoa => ({
                ...pessoa,
                papeis: papeisMap[pessoa.pesCod] || [],
                roleNames: [
                    ...(pessoa.pesIsGlobalAdmin ? ['GLOBAL_ADMIN'] : []),
                    ...(papeisMap[pessoa.pesCod] || []).map(p => p.uscPapel)
                ].filter(Boolean) // Remove valores nulos ou vazios
            }));

            setPessoas(pessoasComPapeis);
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

    // --- HANDLERS PARA ABRIR/FECHAR MODAIS ---
    const handleAddNew = () => {
        setEditingPessoa(null);
        setPapeisUsuario([]);
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
        setPapeisUsuario(pessoa.papeis);
        setIsInfoModalOpen(true);
    };

    const handleCloseInfoModal = () => {
        setIsInfoModalOpen(false);
        setEditingPessoa(null);
    };

    const handleOpenPasswordModal = (pessoa) => {
        setEditingPessoa(pessoa);
        setIsPasswordModalOpen(true);
    };

    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setEditingPessoa(null);
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- HANDLERS DE SUBMISSÃO E AÇÕES ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPessoa) {
                // Apenas atualiza os dados básicos da pessoa
                await updatePessoa(editingPessoa.pesCod, {
                    pesNome: formData.pesNome,
                    pesCpfCnpj: formData.pesCpfCnpj,
                    pesEmail: formData.pesEmail,
                    pesTipo: formData.pesTipo,
                });
                alert('Pessoa atualizada com sucesso!');
            } else {
                // Cria a pessoa e, opcionalmente, atribui o primeiro papel
                const pessoaResponse = await createPessoa(formData);
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
                    } else { // SINDICO, ADMIN, etc.
                        await createUsuarioCondominio({
                            pessoa: { pesCod: novaPessoa.pesCod },
                            condominio: { conCod: parseInt(formData.condominioId) },
                            uscPapel: formData.roleType
                        });
                        roleMessage = ` e atribuído o papel de ${formatStatus(formData.roleType)}.`;
                    }
                }
                alert(`Pessoa criada com sucesso${roleMessage}`);
            }
            handleCloseInfoModal();
            fetchData();
        } catch (error) {
            alert(`Erro ao salvar: ${error.response?.data?.message || 'Verifique os dados e tente novamente.'}`);
        }
    };
    
    const handleAddRoleSubmit = async (e) => {
        e.preventDefault();
        if (!editingPessoa || !formData.newRoleType || !formData.newRoleCondominioId) {
            alert("Por favor, selecione um papel e um condomínio.");
            return;
        }

        const roleData = {
            pessoa: { pesCod: editingPessoa.pesCod },
            condominio: { conCod: parseInt(formData.newRoleCondominioId) },
            uscPapel: formData.newRoleType
        };

        try {
            await createUsuarioCondominio(roleData);
            alert("Novo papel atribuído com sucesso!");
            fetchData(); // Rebusca todos os dados para atualizar a lista e os badges
            handleCloseInfoModal(); // Fecha o modal após o sucesso
        } catch (error) {
            alert(`Erro ao atribuir papel: ${error.response?.data?.message}`);
        }
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
                fetchData();
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

            <Modal isOpen={isInfoModalOpen} onClose={handleCloseInfoModal} title={editingPessoa ? `Editar Pessoa: ${editingPessoa.pesNome}` : 'Nova Pessoa'}>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group"><label>Nome Completo</label><input name="pesNome" value={formData.pesNome || ''} onChange={handleChange} required /></div>
                    <div className="form-group"><label>CPF/CNPJ</label><input name="pesCpfCnpj" value={formData.pesCpfCnpj || ''} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Email</label><input name="pesEmail" type="email" value={formData.pesEmail || ''} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Tipo</label><select name="pesTipo" value={formData.pesTipo || 'F'} onChange={handleChange}><option value="F">Física</option><option value="J">Jurídica</option></select></div>
                    {!editingPessoa && <div className="form-group"><label>Senha</label><input name="pesSenhaLogin" type="password" value={formData.pesSenhaLogin || ''} onChange={handleChange} required /></div>}
                    <div className="form-actions"><button type="button" onClick={handleCloseInfoModal} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Salvar Dados Básicos</button></div>
                </form>

                {editingPessoa && (
                    <>
                        <hr style={{margin: '2rem 0'}} />
                        <div className="section-header" style={{border: 'none', paddingBottom: '0'}}><h3>Gerenciar Papéis</h3></div>
                        <div className="roles-list">
                            {papeisUsuario.length > 0 ? papeisUsuario.map(papel => (
                                <div key={`${papel.condominio.conCod}-${papel.uscPapel}`} className="role-item">
                                    <span><strong>{formatStatus(papel.uscPapel)}</strong> no Cond. {papel.condominio.conNome}</span>
                                    <button type="button" className="btn-remove-role" title="Remover Papel (A implementar)">&times;</button>
                                </div>
                            )) : <p>Esta pessoa não possui papéis de condomínio atribuídos.</p>}
                        </div>
                        <fieldset className="role-fieldset"><legend>Adicionar Novo Papel</legend>
                            <form onSubmit={handleAddRoleSubmit}>
                                <div className="form-group"><label>Papel</label><select name="newRoleType" onChange={handleChange} required><option value="">Selecione...</option><option value="SINDICO">Síndico</option><option value="ADMIN">Admin do Condomínio</option></select></div>
                                <div className="form-group"><label>Condomínio</label><select name="newRoleCondominioId" onChange={handleChange} required><option value="">Selecione...</option>{listaCondominios.map(condo => (<option key={condo.conCod} value={condo.conCod}>{condo.conNome}</option>))}</select></div>
                                <div className="form-actions"><button type="submit" className="btn-primary">Adicionar Papel</button></div>
                            </form>
                        </fieldset>
                    </>
                )}

                {!editingPessoa && (
                    <fieldset className="role-fieldset">
                        <legend>Atribuir Papel Inicial (Opcional)</legend>
                        <div className="form-group"><label>Papel</label><select name="roleType" value={formData.roleType || 'NONE'} onChange={handleChange}><option value="NONE">Nenhum</option><option value="MORADOR">Morador</option><option value="SINDICO">Síndico</option><option value="ADMIN">Admin do Condomínio</option></select></div>
                        {formData.roleType === 'MORADOR' && (<><div className="form-group"><label>Selecione o Condomínio</label><select name="condominioId" value={formData.condominioId || ''} onChange={handleChange} required><option value="">Selecione primeiro o condomínio</option>{listaCondominios.map(condo => (<option key={condo.conCod} value={condo.conCod}>{condo.conNome}</option>))}</select></div>{formData.condominioId && (<div className="form-group"><label>Selecione a Unidade</label><select name="unidadeId" value={formData.unidadeId || ''} onChange={handleChange} required><option value="">Selecione a unidade</option>{unidadesFiltradas.map(unidade => (<option key={unidade.uniCod} value={unidade.uniCod}>{unidade.uniNumero}</option>))}</select></div>)}<div className="form-group"><label>Tipo de Relacionamento</label><select name="morTipoRelacionamento" value={formData.morTipoRelacionamento || 'PROPRIETARIO'} onChange={handleChange}><option value="PROPRIETARIO">Proprietário</option><option value="INQUILINO">Inquilino</option></select></div></>)}
                        {(formData.roleType === 'SINDICO' || formData.roleType === 'ADMIN') && (<div className="form-group"><label>Condomínio</label><select name="condominioId" value={formData.condominioId || ''} onChange={handleChange} required><option value="">Selecione um condomínio</option>{listaCondominios.map(condo => (<option key={condo.conCod} value={condo.conCod}>{condo.conNome}</option>))}</select></div>)}
                    </fieldset>
                )}
            </Modal>

            <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={handleClosePasswordModal} onSubmit={handlePasswordSubmit} userName={editingPessoa?.pesNome} />

            {isLoading ? <p>Carregando...</p> : (
                <div className="table-container">
                    <table>
                        <thead><tr><th>Nome</th><th>Email</th><th>CPF/CNPJ</th><th>Status</th><th>Ações</th></tr></thead>
                        <tbody>
                            {pessoas.map(pessoa => (
                                <tr key={pessoa.pesCod}>
                                    <td>{pessoa.pesNome}<RoleBadges roles={pessoa.roleNames} /></td>
                                    <td>{pessoa.pesEmail}</td>
                                    <td>{maskCpfCnpj(pessoa.pesCpfCnpj)}</td>
                                    <td>{pessoa.pesAtivo ? 'Ativo' : 'Inativo'}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleEdit(pessoa)} className="btn-edit">Editar</button>
                                        <button onClick={() => handleOpenPasswordModal(pessoa)} className="btn-password">Alterar Senha</button>
                                        <button onClick={() => handleToggleAtivo(pessoa)} className={pessoa.pesAtivo ? "btn-inactive" : "btn-active"}>{pessoa.pesAtivo ? 'Inativar' : 'Ativar'}</button>
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
