import React, { useState } from 'react';

const CondominioModal = ({ isOpen, onClose, onSave, isLoading }) => {
    const [nome, setNome] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [tipologia, setTipologia] = useState('RESIDENCIAL');
    const [admCod, setAdmCod] = useState(1); // Exemplo fixo

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const condominioData = {
            conNome: nome,
            conLogradouro: logradouro,
            conNumero: numero,
            conTipologia: tipologia,
            administradora: { admCod: parseInt(admCod) } // Conforme payload da API 
        };
        onSave(condominioData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Novo Condomínio</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome do Condomínio</label>
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Logradouro</label>
                        <input type="text" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} required />
                    </div>
                     <div className="form-group">
                        <label>Número</label>
                        <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Tipologia</label>
                        <select value={tipologia} onChange={(e) => setTipologia(e.target.value)}>
                            <option value="RESIDENCIAL">Residencial</option>
                            <option value="COMERCIAL">Comercial</option>
                            <option value="MISTO">Misto</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Código da Administradora</label>
                        <input type="number" value={admCod} onChange={(e) => setAdmCod(e.target.value)} required />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} disabled={isLoading}>Cancelar</button>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
            <style jsx>{`
              /* Estilos simples para o modal */
              .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
              .modal-content { background: white; padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; }
              .form-group { margin-bottom: 1rem; }
              label { display: block; margin-bottom: .5rem; }
              input, select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
              .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
            `}</style>
        </div>
    );
};

export default CondominioModal;