import React from 'react';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
    const { user } = useAuth();
    return (
        <div>
            <h1>Dashboard</h1>
            <p>Bem-vindo ao sistema, {user.email}!</p>
            <p>Selecione uma opção no menu lateral para começar.</p>
        </div>
    );
};

export default DashboardPage;