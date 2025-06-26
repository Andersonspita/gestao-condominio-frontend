import React, { createContext, useState, useEffect } from 'react';
import { login as loginService } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ email: payload.sub, roles: payload.authorities || [] });
            } catch (e) {
                sessionStorage.removeItem('authToken');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, senha) => {
        const response = await loginService(email, senha);
        const { token } = response.data;
        if (token) {
            sessionStorage.setItem('authToken', token);
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ email: payload.sub, roles: payload.authorities || [] });
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

export default AuthContext;