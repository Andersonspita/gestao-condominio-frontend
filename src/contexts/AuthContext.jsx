import React, { createContext, useState, useEffect } from 'react';
import { login as loginService } from '../api/authService';
import { getPessoas } from '../api/pessoaService'; // Importar o serviço de pessoas

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserAndSet = async (email) => {
        try {
            // Busca todos os usuários e encontra o que corresponde ao email do login
            const response = await getPessoas();
            const currentUser = response.data.find(p => p.pesEmail === email);
            if (currentUser) {
                // Decodifica o token para pegar os papéis
                const token = sessionStorage.getItem('authToken');
                const payload = JSON.parse(atob(token.split('.')[1]));
                // Armazena o objeto completo da pessoa com seus papéis
                setUser({ ...currentUser, roles: payload.authorities || [] });
            }
        } catch (error) {
            console.error("Não foi possível buscar os dados do usuário.", error);
            logout(); // Desloga se não conseguir encontrar o usuário
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        if (token) {
            const email = JSON.parse(atob(token.split('.')[1])).sub;
            fetchUserAndSet(email).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, senha) => {
        const response = await loginService(email, senha);
        const { token } = response.data;
        if (token) {
            sessionStorage.setItem('authToken', token);
            await fetchUserAndSet(email); // Busca os dados completos do usuário após o login
        }
    };

    const logout = () => {
        sessionStorage.removeItem('authToken');
        setUser(null);
        window.location.href = '/login';
    };

    const value = { isAuthenticated: !!user, user, login, logout, loading };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
