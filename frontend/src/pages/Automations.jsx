import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Mail, RefreshCw, ToggleRight, ToggleLeft } from 'lucide-react';

export default function Automations() {
    const [automations, setAutomations] = useState([
        { id: 1, title: 'Payment Reminders', desc: 'Send automatic reminders 3 days before due date.', active: true, icon: Bell },
        { id: 2, title: 'Recurring Invoices', desc: 'Auto-generate and send monthly retainer invoices.', active: false, icon: RefreshCw },
        { id: 3, title: 'Thank You Emails', desc: 'Send a thank you note immediately after payment.', active: true, icon: Mail },
        { id: 4, title: 'Late Fees', desc: 'Automatically apply 5% late fee for overdue invoices.', active: false, icon: Calendar },
    ]);

    const toggle = (id) => {
        setAutomations(automations.map(a => a.id === id ? { ...a, active: !a.active } : a));
    };

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 className="text-gradient" style={{ fontSize: '32px', margin: 0 }}>Automations</h1>
                <p className="muted" style={{ marginTop: '8px' }}>Put your invoicing on autopilot.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                {automations.map((auto) => (
                    <motion.div
                        key={auto.id}
                        whileHover={{ y: -4 }}
                        className="glass-panel"
                        style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}
                    >
                        <div style={{
                            padding: '12px',
                            background: auto.active ? 'var(--primary-glow)' : 'var(--bg-card-hover)',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)',
                            color: auto.active ? 'var(--primary)' : 'var(--text-muted)'
                        }}>
                            <auto.icon size={24} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>{auto.title}</h3>
                                <button
                                    onClick={() => toggle(auto.id)}
                                    style={{ color: auto.active ? 'var(--primary)' : 'var(--text-muted)' }}
                                >
                                    {auto.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                </button>
                            </div>
                            <p className="muted" style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                                {auto.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="glass-panel" style={{ marginTop: '32px', padding: '32px', borderRadius: '16px', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '16px' }}>Need more power?</h3>
                <p className="muted" style={{ marginBottom: '24px' }}>Connect with Zapier to unlock 5000+ app integrations.</p>
                <button className="btn-primary" style={{ background: '#FF4F00' }}>Connect Zapier</button>
            </div>
        </div>
    );
}
