import React, { useState } from 'react';
import './Modal.css'; // Reutilizaremos o estilo do modal genérico

const ChangePasswordModal = ({ isOpen, onClose, onSubmit, userName }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            return;
        }
        onSubmit(password);
        // Limpa os campos após o envio
        setPassword('');
        setConfirmPassword('');
        setError('');
    };
    
    const handleClose = () => {
        setPassword('');
        setConfirmPassword('');
        setError('');
        onClose();
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Alterar Senha</h2>
                    <button onClick={handleClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    <p>Alterando a senha para: <strong>{userName}</strong></p>
                    <form onSubmit={handleSubmit} className="modal-form">
                        {error && <p style={{color: 'red'}}>{error}</p>}
                        <div className="form-group">
                            <label>Nova Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirmar Nova Senha</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-actions">
                            <button type="button" onClick={handleClose} className="btn-secondary">Cancelar</button>
                            <button type="submit" className="btn-primary">Salvar Nova Senha</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;