import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getPessoas } from '../api/pessoaService';
import { getCondominios } from '../api/condominioService';
import { getUnidades } from '../api/unidadeService';
import './Page.css'; // Reutilizando nosso CSS de página

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ pessoas: 0, condominios: 0, unidades: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // Verifica se o usuário tem um papel de gestão
    const isManager = user?.roles.some(role => 
        role.includes('GLOBAL_ADMIN') || role.includes('SINDICO') || role.includes('ADMIN')
    );

    useEffect(() => {
        // Só busca as estatísticas se for um gestor
        if (isManager) {
            const fetchStats = async () => {
                setIsLoading(true);
                try {
                    // As chamadas de API já são filtradas pelo backend de acordo com a permissão do usuário
                    const [pessoasRes, condominiosRes, unidadesRes] = await Promise.all([
                        getPessoas(),
                        getCondominios(false), // false para incluir inativos na contagem
                        getUnidades(false),   // false para incluir inativas na contagem
                    ]);
                    setStats({
                        pessoas: pessoasRes.data.length,
                        condominios: condominiosRes.data.length,
                        unidades: unidadesRes.data.length
                    });
                } catch (error) {
                    console.error("Erro ao carregar estatísticas do dashboard", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchStats();
        } else {
            setIsLoading(false);
        }
    }, [isManager]);

    // Renderiza o dashboard de gestão
    const renderManagerDashboard = () => (
        <>
            <div className="page-header">
                <h1>Dashboard do Gestor</h1>
            </div>
            {isLoading ? <p>Carregando estatísticas...</p> : (
                <div className="stats-container">
                    <div className="stat-card">
                        <h2>{stats.pessoas}</h2>
                        <p>Usuários Cadastrados</p>
                    </div>
                    <div className="stat-card">
                        <h2>{stats.condominios}</h2>
                        <p>Condomínios Gerenciados</p>
                    </div>
                    <div className="stat-card">
                        <h2>{stats.unidades}</h2>
                        <p>Unidades Cadastradas</p>
                    </div>
                </div>
            )}
        </>
    );

    // Renderiza o dashboard do morador
    const renderMoradorDashboard = () => (
         <div className="page-header">
            <h1>Página Inicial</h1>
            <p>Selecione uma opção no menu para começar.</p>
        </div>
    );

    return (
        <div className="page-container">
            {isManager ? renderManagerDashboard() : renderMoradorDashboard()}
        </div>
    );
};

export default DashboardPage;
