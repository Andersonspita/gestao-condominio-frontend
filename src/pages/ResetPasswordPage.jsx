import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/passwordService';
import './LoginPage.css'; // Reutilizando estilos

const ResetPasswordPage = () => {
    const { token } = useParams(); // Pega o token da URL (ex: /reset-password/xyz123)
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        try {
            const response = await resetPassword(token, password);
            setMessage(response.data.message + " Você será redirecionado para o login.");
            setTimeout(() => navigate('/login'), 3000); // Redireciona após 3 segundos
        } catch (err) {
            setError(err.response?.data?.message || "Token inválido ou expirado.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Redefinir Senha</h1>
                {!message ? (
                    <form onSubmit={handleSubmit}>
                        <ErrorAlert message={error} onDismiss={() => setError('')} />
                        <div className="form-group">
                            <label>Nova Senha</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Confirmar Nova Senha</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </div>
                        <button type="submit">Salvar Nova Senha</button>
                    </form>
                ) : (
                    <div className="success-message">{message}</div>
                )}
            </div>
        </div>
    );
};

// Use o mesmo componente de alerta que já criamos
const ErrorAlert = ({ message, onDismiss }) => {
    if (!message) return null;
    return (
        <div className="error-message" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span>{message}</span>
            <button type="button" onClick={onDismiss} style={{fontSize: '12px', padding: '5px'}}>OK</button>
        </div>
    );
}

export default ResetPasswordPage;