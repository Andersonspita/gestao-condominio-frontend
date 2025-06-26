import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import PessoasPage from '../pages/PessoasPage';
import CondominiosPage from '../pages/CondominiosPage';
import UnidadesPage from '../pages/UnidadesPage';
import FinanceiroPage from '../pages/financeiro/FinanceiroPage';
import ComunicadosPage from '../pages/comunicacoes/ComunicadosPage';
import ReservasPage from '../pages/reservas/ReservasPage';
import ManutencaoPage from '../pages/manutencao/ManutencaoPage';
import AssembleiasPage from '../pages/assembleias/AssembleiasPage';
import DocumentosPage from '../pages/DocumentosPage';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from '../pages/NotFoundPage';
import ResetPasswordPage from '../pages/ResetPasswordPage'; // Importe a nova página

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/pessoas" element={<PessoasPage />} />
                    <Route path="/condominios" element={<CondominiosPage />} />
                    <Route path="/unidades" element={<UnidadesPage />} />
                    <Route path="/financeiro" element={<FinanceiroPage />} />
                    <Route path="/comunicados" element={<ComunicadosPage />} />
                    <Route path="/reservas" element={<ReservasPage />} />
                    <Route path="/manutencao" element={<ManutencaoPage />} />
                    <Route path="/assembleias" element={<AssembleiasPage />} />
                    <Route path="/documentos" element={<DocumentosPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;