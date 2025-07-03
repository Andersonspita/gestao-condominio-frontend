import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth'; // Corrigido

// Serviços de API
import { getComunicados, createComunicado, updateComunicado, deleteComunicado } from '../../api/comunicadoService'; // Corrigido
import { getCondominios } from '../../api/condominioService'; // Corrigido

// Componentes
import Modal from '../../components/ui/Modal'; // Corrigido
import '../Page.css'; // Corrigido (assumindo que Page.css está em /src/pages)

const ComunicadosPage = () => {
    // --- ESTADOS ---
    const { user } = useAuth();
    const [comunicados, setComunicados] = useState([]);
    const [condominios, setCondominios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingComunicado, setEditingComunicado] = useState(null);
    const [formData, setFormData] = useState({});

    // --- VERIFICAÇÃO DE PERMISSÃO ---
    const hasManagementRole = user?.roles.some(role => !role.startsWith('ROLE_MORADOR_'));

    // --- BUSCA DE DADOS ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [comunicadosRes, condominiosRes] = await Promise.all([
                    getComunicados(),
                    hasManagementRole ? getCondominios(true) : Promise.resolve({ data: [] })
                ]);
                setComunicados(comunicadosRes.data);
                setCondominios(condominiosRes.data);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
                alert("Não foi possível carregar os comunicados.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [hasManagementRole]);

    // --- HANDLERS ---
    const handleAddNew = () => {
        setEditingComunicado(null);
        setFormData({});
        setIsModalOpen(true);
    };

    const handleEdit = (comunicado) => {
        setEditingComunicado(comunicado);
        setFormData({
            comAssunto: comunicado.comAssunto,
            comMensagem: comunicado.comMensagem,
            conCod: comunicado.condominio.conCod
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingComunicado(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            comAssunto: formData.comAssunto,
            comMensagem: formData.comMensagem,
            condominio: { conCod: parseInt(formData.conCod) }
        };

        try {
            if (editingComunicado) {
                await updateComunicado(editingComunicado.comCod, payload);
                alert('Comunicado atualizado com sucesso!');
            } else {
                await createComunicado(payload);
                alert('Comunicado publicado com sucesso!');
            }
            handleCloseModal();
            const res = await getComunicados();
            setComunicados(res.data);
        } catch (error) {
            alert(`Erro: ${error.response?.data?.message || 'Não foi possível salvar o comunicado.'}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este comunicado? Esta ação não pode ser desfeita.')) {
            try {
                await deleteComunicado(id);
                alert('Comunicado excluído com sucesso!');
                setComunicados(comunicados.filter(c => c.comCod !== id));
            } catch (error) {
                alert(`Erro: ${error.response?.data?.message || 'Não foi possível excluir o comunicado.'}`);
            }
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Comunicados</h1>
                {hasManagementRole && (
                    <button onClick={handleAddNew}>Novo Comunicado</button>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingComunicado ? 'Editar Comunicado' : 'Novo Comunicado'}>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Condomínio</label>
                        <select name="conCod" value={formData.conCod || ''} onChange={handleChange} required>
                            <option value="">Selecione para qual condomínio</option>
                            {condominios.map(condo => (
                                <option key={condo.conCod} value={condo.conCod}>{condo.conNome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Assunto</label>
                        <input name="comAssunto" value={formData.comAssunto || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Mensagem</label>
                        <textarea name="comMensagem" value={formData.comMensagem || ''} onChange={handleChange} required rows="6"></textarea>
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={handleCloseModal} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </Modal>

            {isLoading ? <p>Carregando...</p> : (
                <div className="comunicados-list">
                    {comunicados.length > 0 ? (
                        comunicados.map(comunicado => (
                            <div className="comunicado-card" key={comunicado.comCod}>
                                <div className="comunicado-header">
                                    <h3>{comunicado.comAssunto}</h3>
                                    <div className="comunicado-meta">
                                        <span>Condomínio: {comunicado.condominio.conNome}</span>
                                        <span>Publicado em: {new Date(comunicado.comDtCadastro).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <p className="comunicado-body">{comunicado.comMensagem}</p>
                                {hasManagementRole && (
                                    <div className="comunicado-actions">
                                        <button onClick={() => handleEdit(comunicado)} className="btn-edit">Editar</button>
                                        <button onClick={() => handleDelete(comunicado.comCod)} className="btn-inactive">Excluir</button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>Nenhum comunicado encontrado.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ComunicadosPage;