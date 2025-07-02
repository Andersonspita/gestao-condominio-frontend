import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importação das Páginas
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import PessoasPage from '../pages/PessoasPage';
import CondominiosPage from '../pages/CondominiosPage';
import UnidadesPage from '../pages/UnidadesPage';
import AdministradorasPage from '../pages/AdministradorasPage'; // Sua nova página
import FinanceiroPage from '../pages/financeiro/FinanceiroPage';
import ComunicadosPage from '../pages/comunicacoes/ComunicadosPage';
import ReservasPage from '../pages/reservas/ReservasPage';
import ManutencaoPage from '../pages/manutencao/ManutencaoPage';
import AssembleiasPage from '../pages/assembleias/AssembleiasPage';
import DocumentosPage from '../pages/DocumentosPage';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* Rota Pública */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* --- TODAS AS ROTAS PROTEGIDAS DEVEM ESTAR AQUI DENTRO --- */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/pessoas" element={<PessoasPage />} />
                    <Route path="/condominios" element={<CondominiosPage />} />
                    <Route path="/unidades" element={<UnidadesPage />} />
                    <Route path="/administradoras" element={<AdministradorasPage />} /> {/* <-- CORREÇÃO AQUI */}
                    <Route path="/financeiro" element={<FinanceiroPage />} />
                    <Route path="/comunicados" element={<ComunicadosPage />} />
                    <Route path="/reservas" element={<ReservasPage />} />
                    <Route path="/manutencao" element={<ManutencaoPage />} />
                    <Route path="/assembleias" element={<AssembleiasPage />} />
                    <Route path="/documentos" element={<DocumentosPage />} />
                    <Route path="/administradoras" element={<AdministradorasPage />} />
                </Route>

                {/* Rota para páginas não encontradas */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;