import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import './Layout.css';

const Header = () => {
    const { user, logout } = useAuth();
    return (
        <header className="header">
            <div className="user-info">
                <span>Bem-vindo, {user?.email}</span>
                <button onClick={logout} className="logout-button">Sair</button>
            </div>
        </header>
    );
};

export default Header;