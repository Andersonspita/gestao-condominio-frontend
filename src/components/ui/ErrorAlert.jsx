import React from 'react';
import './ErrorAlert.css';

const ErrorAlert = ({ message, onDismiss }) => {
    // Se não houver mensagem, não renderiza nada
    if (!message) {
        return null;
    }

    return (
        <div className="error-alert">
            <p className="error-alert-message">{message}</p>
            <button type="button" onClick={onDismiss} className="error-alert-button">
                OK
            </button>
        </div>
    );
};

export default ErrorAlert;