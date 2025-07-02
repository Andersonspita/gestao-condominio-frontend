import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

// Serviços de API
import { getPessoas } from '../api/pessoaService';
import { getCondominios } from '../api/condominioService';
import { getUnidades } from '../api/unidadeService';
import { getCobrancas } from '../api/financeiroService';
import { getComunicados } from '../api/comunicadoService';
import { getReservas } from '../api/reservaService';

// Componentes
import FinancialChart from '../components/ui/FinancialChart';

// CSS
import './DashboardPage.css';
import './Page.css';

// CORREÇÃO: Componente StatCard definido diretamente aqui
const StatCard = ({ title, value, icon, isLoading }) => (
    <div className="stat-card">
        <div className="stat-card-icon">{icon}</div>
        <div className="stat-card-info">
            <p>{title}</p>
            <h2>{isLoading ? '...' : value}</h2>
        </div>
    </div>
);

// CORREÇÃO: Componente DashboardWidget definido diretamente aqui
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
    const [stats, setStats] = useState({ pessoas: 0, condominios: 0, unidades: 0, inadimplencia: 'R$ 0,00', situacaoFinanceira: 'Em dia' });
    const [chartData, setChartData] = useState([]);
    const [comunicados, setComunicados] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const hasManagementRole = user?.roles.some(role =>
        role.includes('GLOBAL_ADMIN') || role.includes('SINDICO') || role.includes('ADMIN') || role.includes('GERENTE')
    );

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (hasManagementRole) {
                    const [pessoasRes, condominiosRes, unidadesRes, cobrancasRes] = await Promise.all([
                        getPessoas(), getCondominios(false), getUnidades(false), getCobrancas()
                    ]);
                    setStats({
                        pessoas: pessoasRes.data.length,
                        condominios: condominiosRes.data.length,
                        unidades: unidadesRes.data.length
                    });
                    processFinancialDataForChart(cobrancasRes.data);
                } else {
                    const [cobrancasRes, comunicadosRes, reservasRes] = await Promise.all([
                        getCobrancas(), getComunicados(), getReservas()
                    ]);
                    processFinancialDataForResident(cobrancasRes.data);
                    setComunicados(comunicadosRes.data.slice(0, 3));
                    setReservas(reservasRes.data.filter(r => new Date(r.dataHoraInicio) >= new Date()).slice(0, 1));
                }
            } catch (error) {
                console.error("Erro ao carregar dados do dashboard", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [hasManagementRole]);

    const processFinancialDataForChart = (cobrancas) => {
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

    const processFinancialDataForResident = (cobrancas) => {
        const cobrancasVencidas = cobrancas.filter(c => c.ficStatusPagamento === 'VENCIDA');
        if (cobrancasVencidas.length > 0) {
            const totalDevido = cobrancasVencidas.reduce((acc, c) => acc + c.ficValorTaxa, 0);
            setStats(prev => ({
                ...prev,
                situacaoFinanceira: 'Inadimplente',
                inadimplencia: `R$ ${totalDevido.toFixed(2)}`
            }));
        } else {
            setStats(prev => ({
                ...prev,
                situacaoFinanceira: 'Em dia',
                inadimplencia: 'R$ 0,00'
            }));
        }
    };

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
        <>
            <div className="page-header"><h1>Resumo Financeiro</h1></div>
            <div className="dashboard-grid-main">
                <div className="main-widget">
                    <DashboardWidget title="Resumo Financeiro">
                        <div className="finance-summary">
                            <div><p>Situação financeira da unidade</p><strong className={stats.situacaoFinanceira === 'Em dia' ? 'status-ok' : 'status-danger'}>{stats.situacaoFinanceira}</strong></div>
                            <div><p>Inadimplência</p><strong>{stats.inadimplencia}</strong></div>
                        </div>
                         <p style={{marginTop: '2rem'}}><i>(Gráfico de histórico de pagamentos a implementar)</i></p>
                    </DashboardWidget>
                    <DashboardWidget title="Minhas Reservas">
                        {reservas.length > 0 ? reservas.map(r => (<div key={r.racCod} className="list-item"><span>📅 {r.areaComum.arcNome}</span><span>{new Date(r.dataHoraInicio).toLocaleDateString()}</span></div>)) : <p>Nenhuma reserva futura encontrada.</p>}
                    </DashboardWidget>
                </div>
                <div className="side-widgets">
                    <DashboardWidget title="Comunicados / Avisos">
                         <div className="list-container">
                            {comunicados.length > 0 ? comunicados.map(c => (<div key={c.comCod} className="list-item"><span>📢 {c.comAssunto}</span><span className="text-muted">{new Date(c.comDtCadastro).toLocaleDateString()}</span></div>)) : <p>Nenhum comunicado recente.</p>}
                        </div>
                    </DashboardWidget>
                    <DashboardWidget title="Notificações">
                        <div className="list-container">
                            <div className="list-item"><span>❗ Lembrete de pagamento</span></div>
                            <div className="list-item"><span>📬 Encomenda recebida</span></div>
                            <p><i>(Funcionalidade completa a ser implementada)</i></p>
                        </div>
                    </DashboardWidget>
                </div>
            </div>
        </>
    );

    return (
        <div className="page-container">
            {isLoading ? <p>Carregando...</p> : (hasManagementRole ? renderManagerDashboard() : renderMoradorDashboard())}
        </div>
    );
};

export default DashboardPage;