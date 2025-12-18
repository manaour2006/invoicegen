import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getExpensesData } from '../../services/api';

const COLORS = ['#8d6e63', '#a1887f', '#bcaaa4', '#d7ccc8']; // Brown palette

const RenderLegend = (props) => {
    const { payload } = props;
    return (
        <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0 0', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
            {payload.map((entry, index) => (
                <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <div style={{ width: 8, height: 8, backgroundColor: entry.color, borderRadius: '50%', marginRight: 8 }}></div>
                    {entry.value}
                </li>
            ))}
        </ul>
    );
};

export default function ExpensesPieChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExpensesData();
    }, []);

    const loadExpensesData = async () => {
        try {
            setLoading(true);
            const result = await getExpensesData();
            setData(result.data);
        } catch (error) {
            console.error('Error loading expenses data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', height: '100%' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Expenses</h3>
            {loading ? (
                <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    Loading...
                </div>
            ) : data.length === 0 ? (
                <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    No expenses recorded yet
                </div>
            ) : (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-card)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    color: 'var(--text-main)'
                                }}
                                itemStyle={{ color: 'var(--text-main)' }}
                            />
                            <Legend content={<RenderLegend />} verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
