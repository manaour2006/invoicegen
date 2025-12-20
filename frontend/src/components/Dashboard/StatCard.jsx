import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, trend, icon: Icon, color = 'var(--primary)' }) {
    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}
            className="glass-panel"
            style={{ padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}
        >
            {/* <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1, color: color }}>
                <Icon size={100} />
            </div> */}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {/* <div style={{ padding: '10px', background: 'var(--primary-glow)', borderRadius: '10px', color: color }}>
                    <Icon size={24} />
                </div> */}
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>{title}</div>
            </div>

            <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
                {value}
            </div>

            {trend && (
                <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: trend > 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>from last month</span>
                </div>
            )}
        </motion.div>
    );
}
