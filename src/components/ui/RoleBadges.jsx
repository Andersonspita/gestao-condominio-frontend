import React from 'react';
import './RoleBadges.css';

const roleMap = {
    GLOBAL_ADMIN: { text: 'ADM Global', className: 'admin' },
    GERENTE_ADMINISTRADORA: { text: 'Gerente', className: 'gerente' },
    SINDICO: { text: 'Síndico', className: 'sindico' },
    ADMIN: { text: 'ADM Condomínio', className: 'admin-condo' },
    MORADOR: { text: 'Morador', className: 'morador' }
};

const RoleBadges = ({ roles }) => {
    if (!roles || roles.length === 0) {
        return null;
    }

    return (
        <span className="badges-container">
            {roles.map(role => {
                const roleInfo = roleMap[role];
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
