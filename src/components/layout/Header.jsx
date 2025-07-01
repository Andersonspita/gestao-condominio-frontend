import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import './Layout.css';

const Header = () => {
    const { user, logout } = useAuth();
    return (
        <header className="header">
            <div className="user-info">
                {/* Altera de user.email para user.pesNome */}
                <span>Bem-vindo, {user?.pesNome}</span>
                <button onClick={logout} className="logout-button">Sair</button>
            </div>
        </header>
    );
};

export default Header;
