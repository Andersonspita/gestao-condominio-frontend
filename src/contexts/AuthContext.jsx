import React, { createContext, useState, useEffect, useCallback } from 'react'; // Adicione useCallback
import { login as loginService } from '../api/authService';
import { getPessoas } from '../api/pessoaService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Envolva fetchUserAndSet com useCallback
    const fetchUserAndSet = useCallback(async (email) => {
        try {
            const response = await getPessoas();
            const currentUser = response.data.find(p => p.pesEmail === email);
            if (currentUser) {
                const token = sessionStorage.getItem('authToken');
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ ...currentUser, roles: payload.authorities || [] });
            }
        } catch (error) {
            console.error("Não foi possível buscar os dados do usuário.", error);
            // Certifique-se de que `logout` também esteja no escopo ou seja memoizado se for uma dependência forte
            // Para simplificar, se logout é uma função estável, não precisa adicionar aqui.
            // Se o logout puder mudar, ele também precisaria ser uma dependência do useCallback.
            // No entanto, para evitar loop, vamos assumir que logout é estável ou que o erro não vem de sua ausência aqui.
            // Se o problema persistir, logout também pode precisar de useCallback.
            // Mas o foco agora é fetchUserAndSet.
            logout(); 
        } finally {
            setLoading(false); // Garante que o loading seja false após a tentativa de buscar o usuário
        }
    }, [/* Nenhuma dependência aqui se 'logout' é estável e não afeta o comportamento de fetchUserAndSet */]); // Dependências do useCallback

    useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        if (token) {
            const email = JSON.parse(atob(token.split('.')[1])).sub;
            fetchUserAndSet(email); // Removido .finally() pois setLoading já está no finally de fetchUserAndSet
        } else {
            setLoading(false);
        }
    }, [fetchUserAndSet]); // Adicione fetchUserAndSet como dependência

    const login = async (email, senha) => {
        const response = await loginService(email, senha);
        const { token } = response.data;
        if (token) {
            sessionStorage.setItem('authToken', token);
            await fetchUserAndSet(email);
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