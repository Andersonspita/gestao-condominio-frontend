import React from 'react';
import { NavLink } from 'react-router-dom';
import './Layout.css';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <h1 className="logo">Gestão Cond.</h1>
            <nav>
                <ul>
                    <li><NavLink to="/">Dashboard</NavLink></li>
                    <li><NavLink to="/pessoas">Pessoas</NavLink></li>
                    <li><NavLink to="/condominios">Condomínios</NavLink></li>
                    <li><NavLink to="/unidades">Unidades</NavLink></li>
                    <li><NavLink to="/financeiro">Financeiro</NavLink></li>
                    <li><NavLink to="/comunicados">Comunicados</NavLink></li>
                    <li><NavLink to="/reservas">Reservas</NavLink></li>
                    <li><NavLink to="/manutencao">Manutenção</NavLink></li>
                    <li><NavLink to="/assembleias">Assembleias</NavLink></li>
                    <li><NavLink to="/documentos">Documentos</NavLink></li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;