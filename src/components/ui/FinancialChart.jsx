import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialChart = ({ data }) => {
    // Formata o valor para a moeda local (BRL)
    const formatCurrency = (value) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        // O ResponsiveContainer faz o gráfico se adaptar ao tamanho do card
        <ResponsiveContainer width="100%" height={300}>
            <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="Receitas" stroke="#007bff" strokeWidth={2} activeDot={{ r: 8 }} />
                {/* No futuro, uma linha de despesas poderia ser adicionada aqui */}
                {/* <Line type="monotone" dataKey="Despesas" stroke="#e74c3c" /> */}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default FinancialChart;