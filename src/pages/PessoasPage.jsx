import React, { useState, useEffect } from 'react';

// Serviços de API
import { getPessoas, createPessoa, updatePessoa, inativarPessoa, ativarPessoa } from '../api/pessoaService';
<<<<<<< Updated upstream
import { createMorador, getMoradores } from '../api/moradorService';
import { createUsuarioCondominio, getAllUsuariosCondominio } from '../api/usuarioCondominioService';
import { getCondominios } from '../api/condominioService';
import { getUnidades } from '../api/unidadeService';

// Componentes de UI
=======
import { createMorador } from '../api/moradorService';
import { createUsuarioCondominio } from '../api/usuarioCondominioService';
import { getCondominios } from '../api/condominioService';
import { getUnidades } from '../api/unidadeService';
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

    // --- ESTADOS DE DADOS ---
    const [editingPessoa, setEditingPessoa] = useState(null);
    const [formData, setFormData] = useState({});
    const [papeisUsuario, setPapeisUsuario] = useState([]);

    // --- ESTADOS PARA DROPDOWNS ---
=======
    const [editingPessoa, setEditingPessoa] = useState(null);
    const [formData, setFormData] = useState({});
>>>>>>> Stashed changes
    const [listaCondominios, setListaCondominios] = useState([]);
    const [listaUnidades, setListaUnidades] = useState([]);
    const [unidadesFiltradas, setUnidadesFiltradas] = useState([]);

<<<<<<< Updated upstream
    // --- FUNÇÕES DE BUSCA DE DADOS ---
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [pessoasRes, condominiosRes, unidadesRes, papeisRes, moradoresRes] = await Promise.all([
=======
    // Definição da função para buscar os dados
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [pessoasRes, condominiosRes, unidadesRes] = await Promise.all([
>>>>>>> Stashed changes
                getPessoas(),
                getCondominios(false), // Buscar todos, ativos e inativos
                getUnidades(false),   // Buscar todas, ativas e inativas
                getAllUsuariosCondominio(),
                getMoradores()
            ]);

            const papeisMap = papeisRes.data.reduce((acc, papel) => {
                const pesCod = papel.pessoa.pesCod;
                if (!acc[pesCod]) acc[pesCod] = [];
                acc[pesCod].push({ tipo: 'papel', ...papel });
                return acc;
            }, {});

            moradoresRes.data.forEach(morador => {
                const pesCod = morador.pessoa.pesCod;
                if (!papeisMap[pesCod]) papeisMap[pesCod] = [];
                papeisMap[pesCod].push({ tipo: 'morador', ...morador });
            });

            const pessoasComPapeis = pessoasRes.data.map(pessoa => {
                const todosOsPapeis = papeisMap[pessoa.pesCod] || [];
                const roleNames = [
                    ...(pessoa.pesIsGlobalAdmin ? ['GLOBAL_ADMIN'] : []),
                    ...todosOsPapeis.map(p => p.tipo === 'morador' ? 'MORADOR' : p.uscPapel)
                ];
                return { ...pessoa, papeis: todosOsPapeis, roleNames: [...new Set(roleNames)] };
            });

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
        const CId = formData.newRoleCondominioId || formData.condominioId;
        if (CId) {
            setUnidadesFiltradas(listaUnidades.filter(u => u.condominio.conCod === parseInt(CId)));
        } else {
            setUnidadesFiltradas([]);
        }
    }, [formData.condominioId, formData.newRoleCondominioId, listaUnidades]);

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

    const handleCloseInfoModal = () => { setIsInfoModalOpen(false); setEditingPessoa(null); };
    const handleOpenPasswordModal = (pessoa) => { setEditingPessoa(pessoa); setIsPasswordModalOpen(true); };
    const handleClosePasswordModal = () => { setIsPasswordModalOpen(false); setEditingPessoa(null); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

<<<<<<< Updated upstream
    // --- HANDLERS DE SUBMISSÃO E AÇÕES ---
    const handleSubmitDadosBasicos = async (e) => {
=======
    const handleSubmit = async (e) => {
>>>>>>> Stashed changes
        e.preventDefault();
        try {
            if (editingPessoa) {
                await updatePessoa(editingPessoa.pesCod, formData);
                alert('Pessoa atualizada com sucesso!');
                handleCloseInfoModal();
                fetchData();
            } else {
<<<<<<< Updated upstream
                const pessoaResponse = await createPessoa(formData);
=======
                const pessoaPayload = {
                    pesNome: formData.pesNome,
                    pesCpfCnpj: formData.pesCpfCnpj,
                    pesEmail: formData.pesEmail,
                    pesSenhaLogin: formData.pesSenhaLogin,
                    pesTipo: formData.pesTipo,
                };
                const pessoaResponse = await createPessoa(pessoaPayload);
>>>>>>> Stashed changes
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
                        roleMessage = ` e atribuído o papel de ${formatStatus(formData.roleType)}.`;
                    }
                }
                alert(`Pessoa criada com sucesso${roleMessage}`);
                handleCloseInfoModal();
                fetchData();
            }
<<<<<<< Updated upstream
=======
            handleCloseInfoModal();
            fetchData(); // Chamada correta para atualizar os dados
>>>>>>> Stashed changes
        } catch (error) {
            alert(`Erro ao salvar: ${error.response?.data?.message || 'Verifique os dados e tente novamente.'}`);
        }
    };

<<<<<<< Updated upstream
    const handleAddRoleSubmit = async (e) => {
        e.preventDefault();
        if (!editingPessoa || !formData.newRoleType || !formData.newRoleCondominioId) {
            alert("Por favor, selecione um papel e as informações correspondentes.");
            return;
        }

        try {
            if (formData.newRoleType === 'MORADOR') {
                if (!formData.newRoleUnidadeId) {
                    alert("Por favor, selecione uma unidade para o morador.");
                    return;
                }
                await createMorador({
                    pessoa: { pesCod: editingPessoa.pesCod },
                    unidade: { uniCod: parseInt(formData.newRoleUnidadeId) },
                    morTipoRelacionamento: formData.newRoleTipoRelacionamento || 'PROPRIETARIO'
                });
            } else {
                await createUsuarioCondominio({
                    pessoa: { pesCod: editingPessoa.pesCod },
                    condominio: { conCod: parseInt(formData.newRoleCondominioId) },
                    uscPapel: formData.newRoleType
                });
            }
            alert("Novo papel atribuído com sucesso!");
            fetchData();
            handleCloseInfoModal();
        } catch (error) {
            alert(`Erro ao atribuir papel: ${error.response?.data?.message}`);
        }
=======
    const handleOpenPasswordModal = (pessoa) => {
        setEditingPessoa(pessoa);
        setIsPasswordModalOpen(true);
    };
    
    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setEditingPessoa(null);
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                fetchData();
=======
                fetchData(); // Chamada correta para atualizar os dados
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
            <Modal isOpen={isInfoModalOpen} onClose={handleCloseInfoModal} title={editingPessoa ? `Editar Pessoa: ${editingPessoa.pesNome}` : 'Nova Pessoa'}>
                <form onSubmit={handleSubmitDadosBasicos} className="modal-form">
                    <div className="form-group"><label>Nome Completo</label><input name="pesNome" value={formData.pesNome || ''} onChange={handleChange} required /></div>
                    <div className="form-group"><label>CPF/CNPJ</label><input name="pesCpfCnpj" value={formData.pesCpfCnpj || ''} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Email</label><input name="pesEmail" type="email" value={formData.pesEmail || ''} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Tipo</label><select name="pesTipo" value={formData.pesTipo || 'F'} onChange={handleChange}><option value="F">Física</option><option value="J">Jurídica</option></select></div>
                    {!editingPessoa && <div className="form-group"><label>Senha</label><input name="pesSenhaLogin" type="password" value={formData.pesSenhaLogin || ''} onChange={handleChange} required /></div>}
                    {!editingPessoa && (
                        <fieldset className="role-fieldset">
                            <legend>Atribuir Papel Inicial (Opcional)</legend>
                            <div className="form-group"><label>Papel</label><select name="roleType" value={formData.roleType || 'NONE'} onChange={handleChange}><option value="NONE">Nenhum</option><option value="MORADOR">Morador</option><option value="SINDICO">Síndico</option><option value="ADMIN">Admin do Condomínio</option></select></div>
                            {formData.roleType === 'MORADOR' && (<><div className="form-group"><label>Selecione o Condomínio</label><select name="condominioId" value={formData.condominioId || ''} onChange={handleChange} required><option value="">Selecione primeiro o condomínio</option>{listaCondominios.map(condo => (<option key={condo.conCod} value={condo.conCod}>{condo.conNome}</option>))}</select></div>{formData.condominioId && (<div className="form-group"><label>Selecione a Unidade</label><select name="unidadeId" value={formData.unidadeId || ''} onChange={handleChange} required><option value="">Selecione a unidade</option>{unidadesFiltradas.map(unidade => (<option key={unidade.uniCod} value={unidade.uniCod}>{unidade.uniNumero}</option>))}</select></div>)}<div className="form-group"><label>Tipo de Relacionamento</label><select name="morTipoRelacionamento" value={formData.morTipoRelacionamento || 'PROPRIETARIO'} onChange={handleChange}><option value="PROPRIETARIO">Proprietário</option><option value="INQUILINO">Inquilino</option></select></div></>)}
                            {(formData.roleType === 'SINDICO' || formData.roleType === 'ADMIN') && (<div className="form-group"><label>Condomínio</label><select name="condominioId" value={formData.condominioId || ''} onChange={handleChange} required><option value="">Selecione um condomínio</option>{listaCondominios.map(condo => (<option key={condo.conCod} value={condo.conCod}>{condo.conNome}</option>))}</select></div>)}
                        </fieldset>
                    )}
                    <div className="form-actions"><button type="button" onClick={handleCloseInfoModal} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Salvar Dados</button></div>
=======
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
>>>>>>> Stashed changes
                </form>

                {editingPessoa && (
                    <>
                        <hr style={{margin: '2rem 0'}} />
                        <div className="section-header" style={{border: 'none', paddingBottom: '0'}}><h3>Gerenciar Papéis</h3></div>
                        <div className="roles-list">
                            {papeisUsuario.length > 0 ? papeisUsuario.map((papel, index) => (
                                <div key={index} className="role-item">
                                    {papel.tipo === 'morador' ? (
                                        <span><strong>Morador</strong> na Unidade: {papel.unidade.uniNumero} (Cond. {papel.unidade.condominio.conNome})</span>
                                    ) : (
                                        <span><strong>{formatStatus(papel.uscPapel)}</strong> no Condomínio: {papel.condominio.conNome}</span>
                                    )}
                                    <button type="button" className="btn-remove-role" title="Remover Papel (A implementar)">&times;</button>
                                </div>
                            )) : <p>Esta pessoa não possui papéis de condomínio atribuídos.</p>}
                        </div>
                        <fieldset className="role-fieldset"><legend>Adicionar Novo Papel</legend>
                            <form onSubmit={handleAddRoleSubmit}>
                                <div className="form-group"><label>Papel</label><select name="newRoleType" onChange={handleChange}><option value="">Selecione...</option><option value="MORADOR">Morador</option><option value="SINDICO">Síndico</option><option value="ADMIN">Admin do Condomínio</option></select></div>
                                {(formData.newRoleType === 'SINDICO' || formData.newRoleType === 'ADMIN') && (<div className="form-group"><label>Condomínio</label><select name="newRoleCondominioId" onChange={handleChange}><option value="">Selecione...</option>{listaCondominios.map(c => <option key={c.conCod} value={c.conCod}>{c.conNome}</option>)}</select></div>)}
                                {formData.newRoleType === 'MORADOR' && (<><div className="form-group"><label>Condomínio</label><select name="newRoleCondominioId" onChange={handleChange}><option value="">Selecione...</option>{listaCondominios.map(c => <option key={c.conCod} value={c.conCod}>{c.conNome}</option>)}</select></div>{formData.newRoleCondominioId && <div className="form-group"><label>Unidade</label><select name="newRoleUnidadeId" onChange={handleChange} required><option value="">Selecione...</option>{unidadesFiltradas.map(u => <option key={u.uniCod} value={u.uniCod}>{u.uniNumero}</option>)}</select></div>}<div className="form-group"><label>Relacionamento</label><select name="newRoleTipoRelacionamento" onChange={handleChange}><option value="PROPRIETARIO">Proprietário</option><option value="INQUILINO">Inquilino</option></select></div></>)}
                                <div className="form-actions"><button type="submit" className="btn-primary">Adicionar Papel</button></div>
                            </form>
                        </fieldset>
                    </>
                )}
            </Modal>
            
<<<<<<< Updated upstream
            <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={handleClosePasswordModal} onSubmit={handlePasswordSubmit} userName={editingPessoa?.pesNome} />
            
=======
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={handleClosePasswordModal}
                onSubmit={handlePasswordSubmit}
                userName={editingPessoa?.pesNome}
            />

>>>>>>> Stashed changes
            {isLoading ? <p>Carregando...</p> : (
                <div className="table-container">
                    <table>
                        <thead><tr><th>Nome</th><th>Email</th><th>CPF/CNPJ</th><th>Status</th><th>Ações</th></tr></thead>
                        <tbody>{pessoas.map(pessoa => (
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
                        ))}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PessoasPage;
