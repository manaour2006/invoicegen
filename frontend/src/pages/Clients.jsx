import React from 'react';
import { MoreHorizontal, Mail, Phone } from 'lucide-react';

export default function Clients() {
    const clients = [
        { id: 1, name: 'Google Inc', email: 'billing@google.com', status: 'Active', amount: '₹1,50,000' },
        { id: 2, name: 'Startup Co', email: 'hello@startup.co', status: 'Active', amount: '₹45,000' },
        { id: 3, name: 'Design Studio', email: 'pay@design.studio', status: 'Inactive', amount: '₹0' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 className="text-gradient" style={{ fontSize: '32px', margin: 0 }}>Clients</h1>
                <button className="btn-primary">+ Add Client</button>
            </div>

            <div className="glass-panel" style={{ borderRadius: '16px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ textAlign: 'left', padding: '20px', color: 'var(--text-muted)', fontWeight: 500 }}>Client Name</th>
                            <th style={{ textAlign: 'left', padding: '20px', color: 'var(--text-muted)', fontWeight: 500 }}>Email</th>
                            <th style={{ textAlign: 'left', padding: '20px', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                            <th style={{ textAlign: 'right', padding: '20px', color: 'var(--text-muted)', fontWeight: 500 }}>Total Billed</th>
                            <th style={{ padding: '20px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '20px', fontWeight: 600 }}>{client.name}</td>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Mail size={14} className="text-muted" /> {client.email}
                                    </div>
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        background: client.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card-hover)',
                                        border: '1px solid var(--glass-border)',
                                        color: client.status === 'Active' ? 'var(--success)' : 'var(--text-muted)'
                                    }}>
                                        {client.status}
                                    </span>
                                </td>
                                <td style={{ padding: '20px', textAlign: 'right', fontWeight: 600 }}>{client.amount}</td>
                                <td style={{ padding: '20px', textAlign: 'right' }}>
                                    <button style={{ color: 'var(--text-muted)' }}><MoreHorizontal size={20} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
