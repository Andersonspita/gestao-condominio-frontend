import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ErrorAlert from '../components/ui/ErrorAlert';
import Modal from '../components/ui/Modal'; // Importar o Modal
import { requestPasswordReset } from '../api/passwordService'; // Importar o novo serviço
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

     const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotPhone, setForgotPhone] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');

    const handleErrorDismiss = () => setError('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // A linha setError('') foi REMOVIDA daqui.
        // O erro só será limpo manualmente pelo botão "OK" ou por um login bem-sucedido.

        try {
            await login(email, senha);
            navigate('/');
        } catch (err) {
            // Define a mensagem de erro vinda da API ou uma mensagem padrão
            const errorMessage = err.response?.data?.message || 'Falha no login. Verifique seu e-mail e senha.';
            setError(errorMessage);
        } finally {
            // Para o carregamento, independentemente do resultado
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotMessage('');
        try {
            const response = await requestPasswordReset(forgotEmail, forgotPhone);
            // Mostra a mensagem de sucesso da API (simulada)
            setForgotMessage(response.data.message);
        } catch (err) {
            setForgotMessage(err.response?.data?.message || "Ocorreu um erro.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-logo">🏢</div>
                <h1>Login</h1>
                <p>Sistema de Gestão de Condomínios</p>
                <form onSubmit={handleSubmit}>
                    <ErrorAlert message={error} onDismiss={handleErrorDismiss} />

                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Senha</label>
                        <input 
                            type="password" 
                            value={senha} 
                            onChange={e => setSenha(e.target.value)} 
                            required 
                            disabled={isLoading}
                        />
                        <div className="forgot-password-link">
                            <span onClick={() => setIsForgotModalOpen(true)} className="link-style">
                                Esqueci minha senha
                            </span>
                        </div>
                    </div>
                    
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>                
            </div>
            <Modal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} title="Recuperar Senha">
                {!forgotMessage ? (
                    <form onSubmit={handleForgotPassword} className="modal-form">
                        <p>Para iniciar a recuperação, por favor, confirme seu e-mail e telefone cadastrados.</p>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Telefone / Celular</label>
                            <input type="tel" value={forgotPhone} onChange={e => setForgotPhone(e.target.value)} required />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">Enviar Link de Recuperação</button>
                        </div>
                    </form>
                ) : (
                    <div className="success-message">
                        <p>{forgotMessage}</p>
                        <button onClick={() => setIsForgotModalOpen(false)}>Fechar</button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LoginPage;