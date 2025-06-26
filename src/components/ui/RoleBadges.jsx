import React from 'react';
import './RoleBadges.css';

// Mapeia os nomes dos papéis para estilos CSS e textos amigáveis
const roleMap = {
    GLOBAL_ADMIN: { text: 'ADM Global', className: 'admin' },
    GERENTE_ADMINISTRADORA: { text: 'Gerente', className: 'gerente' },
    SINDICO: { text: 'Síndico', className: 'sindico' },
    ADMIN: { text: 'ADM Condomínio', className: 'admin-condo' },
    MORADOR: { text: 'Morador', className: 'morador' }
};

// Função para extrair o papel base de uma role completa (ex: "ROLE_SINDICO_1" -> "SINDICO")
const getBaseRole = (roleString) => {
    if (roleString.startsWith('ROLE_')) {
        const parts = roleString.substring(5).split('_');
        // Trata papéis compostos como GERENTE_ADMINISTRADORA
        if(parts.includes('GERENTE') && parts.includes('ADMINISTRADORA')) return 'GERENTE_ADMINISTRADORA';
        return parts[0];
    }
    return null;
};


const RoleBadges = ({ user }) => {
    // Para o ADM Global, que vem de um campo booleano na entidade Pessoa
    const isGlobalAdmin = user.pesIsGlobalAdmin;

    // Para os outros papéis, que vêm das associações (ainda não temos esses dados na listagem)
    // No futuro, a API de listagem de pessoas precisaria retornar os papéis.
    // Por enquanto, vamos simular com base no que temos.
    
    // Simulação: se o nome incluir a palavra, adicionamos o badge.
    // O ideal é que a API retorne os papéis de cada pessoa.
    const roles = [];
    if(isGlobalAdmin) roles.push('GLOBAL_ADMIN');
    if(user.pesNome.toLowerCase().includes('sindico')) roles.push('SINDICO');
    if(user.pesNome.toLowerCase().includes('morador')) roles.push('MORADOR');
    if(user.pesNome.toLowerCase().includes('gerente')) roles.push('GERENTE_ADMINISTRADORA');


    if (roles.length === 0) {
        return null; // Não renderiza nada se não houver papéis
    }

    return (
        <span className="badges-container">
            {roles.map(baseRole => {
                const roleInfo = roleMap[baseRole];
                if (!roleInfo) return null;

                return (
                    <span key={roleInfo.className} className={`badge ${roleInfo.className}`}>
                        {roleInfo.text}
                    </span>
                );
            })}
        </span>
    );
};

export default RoleBadges;