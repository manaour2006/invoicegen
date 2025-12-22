import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Paid (Green), Pending (Yellow), Overdue (Red)

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

export default function InvoiceStatusChart({ data = [] }) {
    // Filter out zero values so they don't take up space or show in legend if unwanted,
    // though showing 0 in legend might be okay. Recharts handles 0 values fine usually.
    // Ensure we map colors correctly to the specific names if order changes, 
    // but here we know the order from api.js is Paid, Pending, Overdue.
    // Better to map by name to be safe.

    // Map colors to names
    const colorMap = {
        'Paid': '#10b981',
        'Pending': '#f59e0b',
        'Overdue': '#ef4444'
    };

    const hasData = data.some(item => item.value > 0);

    return (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', height: '100%' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Revenue Breakdown by Invoice Status</h3>
            {!hasData ? (
                <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    No invoice data available
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
                                    <Cell key={`cell-${index}`} fill={colorMap[entry.name] || '#ccc'} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
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
