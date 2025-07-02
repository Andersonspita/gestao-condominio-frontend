import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Layout.css';

// A sidebar agora recebe uma prop 'isCollapsed' para saber se está encolhida
const Sidebar = ({ isCollapsed }) => {
    const { user } = useAuth(); 

    // Verifica se o usuário tem um papel de gestão
    const hasManagementRole = user?.roles.some(role => 
        !role.startsWith('ROLE_MORADOR_')
    );
    
    const isGlobalAdmin = user?.roles.includes('ROLE_GLOBAL_ADMIN');

    return (
        // Adiciona a classe 'collapsed' quando estiver encolhida
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {/* Mostra a logo completa ou só um ícone */}
                <h2 className="logo">{isCollapsed ? 'GC' : 'Gestão Cond.'}</h2>
            </div>
            <nav>
                <ul>
                    <li><NavLink to="/"><span className="nav-icon">🏠</span><span className="nav-text">Dashboard</span></NavLink></li>
                    
                    {/* CORREÇÃO: O texto do link agora é dinâmico */}
                    <li><NavLink to="/pessoas"><span className="nav-icon">👤</span><span className="nav-text">{hasManagementRole ? 'Pessoas' : 'Minhas Informações'}</span></NavLink></li>
                    
                    <li><NavLink to="/financeiro"><span className="nav-icon">💰</span><span className="nav-text">Financeiro</span></NavLink></li>

                    {hasManagementRole && (
                        <>
                            <li><NavLink to="/condominios"><span className="nav-icon">🏢</span><span className="nav-text">Condomínios</span></NavLink></li>
                            <li><NavLink to="/unidades"><span className="nav-icon">🚪</span><span className="nav-text">Unidades</span></NavLink></li>
                        </>
                    )}
                    
                    {isGlobalAdmin && (
                        <li><NavLink to="/administradoras"><span className="nav-icon">💼</span><span className="nav-text">Administradoras</span></NavLink></li>
                    )}
                    
                    <li><NavLink to="/comunicados"><span className="nav-icon">📢</span><span className="nav-text">Comunicados</span></NavLink></li>
                    <li><NavLink to="/reservas"><span className="nav-icon">📅</span><span className="nav-text">Reservas</span></NavLink></li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;