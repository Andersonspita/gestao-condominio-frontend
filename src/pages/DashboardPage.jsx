import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

// Serviços de API
import { getPessoas } from '../api/pessoaService';
import { getCondominios } from '../api/condominioService';
import { getUnidades } from '../api/unidadeService';
import { getCobrancas } from '../api/financeiroService';

// Componentes
import FinancialChart from '../components/ui/FinancialChart';

// CSS
import './DashboardPage.css';
import './Page.css';

// Componente para os cards de estatísticas
const StatCard = ({ title, value, icon, isLoading }) => (
    <div className="stat-card">
        <div className="stat-card-icon">{icon}</div>
        <div className="stat-card-info">
            <p>{title}</p>
            <h2>{isLoading ? '...' : value}</h2>
        </div>
    </div>
);

// Componente para os widgets
const DashboardWidget = ({ title, children }) => (
    <div className="dashboard-widget">
        <h3>{title}</h3>
        <div className="dashboard-widget-content">
            {children}
        </div>
    </div>
);

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ pessoas: 0, condominios: 0, unidades: 0 });
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const hasManagementRole = user?.roles.some(role => 
        role.includes('GLOBAL_ADMIN') || role.includes('SINDICO') || role.includes('ADMIN') || role.includes('GERENTE')
    );

    useEffect(() => {
        if (hasManagementRole) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const [pessoasRes, condominiosRes, unidadesRes, cobrancasRes] = await Promise.all([
                        getPessoas(), getCondominios(false), getUnidades(false), getCobrancas()
                    ]);
                    
                    setStats({
                        pessoas: pessoasRes.data.length,
                        condominios: condominiosRes.data.length,
                        unidades: unidadesRes.data.length
                    });

                    processFinancialData(cobrancasRes.data);

                } catch (error) {
                    console.error("Erro ao carregar dados do dashboard", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [hasManagementRole]);

    const processFinancialData = (cobrancas) => {
        const monthlyRevenues = {};
        const lastMonths = 6;
        const today = new Date();

        for (let i = lastMonths - 1; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthYear = d.toISOString().substring(0, 7);
            monthlyRevenues[monthYear] = 0;
        }
        
        cobrancas
            .filter(c => c.ficStatusPagamento === 'PAGA' && c.ficDtPagamento)
            .forEach(c => {
                const monthYear = new Date(c.ficDtPagamento).toISOString().substring(0, 7);
                // CORREÇÃO AQUI: Usando Object.prototype.hasOwnProperty.call para segurança
                if (Object.prototype.hasOwnProperty.call(monthlyRevenues, monthYear)) {
                    monthlyRevenues[monthYear] += c.ficValorPago;
                }
            });

        const formattedData = Object.keys(monthlyRevenues).map(monthYear => {
            const [year, month] = monthYear.split('-');
            const monthName = new Date(year, month - 1, 1).toLocaleString('pt-BR', { month: 'short' });
            return {
                name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                Receitas: monthlyRevenues[monthYear]
            };
        });
        setChartData(formattedData);
    };

    // --- RENDERIZAÇÃO DOS DASHBOARDS ---

    const renderManagerDashboard = () => (
        <>
            <div className="page-header"><h1>Dashboard do Gestor</h1></div>
            <div className="stats-container">
                <StatCard title="Inadimplentes" value={stats.inadimplentes || 8} icon="👥" isLoading={isLoading} />
                <StatCard title="Condomínios" value={stats.condominios} icon="🏢" isLoading={isLoading} />
                <StatCard title="Unidades Totais" value={stats.unidades} icon="🚪" isLoading={isLoading} />
            </div>
            <div className="dashboard-grid-main">
                <div className="main-widget">
                    <DashboardWidget title="Resumo Financeiro">
                        {isLoading ? <p>Carregando gráfico...</p> : <FinancialChart data={chartData} />}
                    </DashboardWidget>
                </div>
                <div className="side-widgets">
                    <DashboardWidget title="Reservas">
                        <div className="reservas-item"><span>Salão de festas</span> <span>30/07/2025 &gt;</span></div>
                        <p><i>(Funcionalidade completa a ser implementada)</i></p>
                    </DashboardWidget>
                    <DashboardWidget title="Ocorrências Recentes">
                        <div className="ocorrencias-list">
                            <div className="ocorrencia-item"><span>❗ Vazamento de água</span> <span className="text-muted">Hoje</span></div>
                            <div className="ocorrencia-item"><span>🛠️ Portão com defeito</span> <span className="text-muted">Ontem</span></div>
                        </div>
                        <p><i>(Funcionalidade completa a ser implementada)</i></p>
                    </DashboardWidget>
                </div>
            </div>
        </>
    );

    const renderMoradorDashboard = () => (
         <div className="page-header">
            <h1>Página Inicial</h1>
            <p>Bem-vindo(a)! Selecione uma opção no menu para começar.</p>
        </div>
    );

    return (
        <div className="page-container">
            {isLoading ? <p>Carregando...</p> : (hasManagementRole ? renderManagerDashboard() : renderMoradorDashboard())}
        </div>
    );
};

export default DashboardPage;