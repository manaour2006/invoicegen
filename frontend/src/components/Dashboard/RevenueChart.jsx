import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getRevenueData } from '../../services/api';

export default function RevenueChart() {
    const [period, setPeriod] = useState('weekly');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRevenueData();
    }, [period]);

    const loadRevenueData = async () => {
        try {
            setLoading(true);
            const result = await getRevenueData(period);
            setData(result.data);
        } catch (error) {
            console.error('Error loading revenue data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Revenue Overview</h3>
                <select
                    className="input-field"
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                >
                    <option value="weekly">This Week</option>
                    <option value="month">This Month</option>
                    <option value="monthly">This Year</option>
                </select>
            </div>

            {loading ? (
                <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    Loading...
                </div>
            ) : (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="var(--glass-border)" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-card)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    color: 'var(--text-main)'
                                }}
                                itemStyle={{ color: 'var(--primary)', fontWeight: 600 }}
                                formatter={(value) => [`₹${value}`, 'Revenue']}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="var(--primary)"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
