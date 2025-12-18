import React from 'react';
import { Package, Plus } from 'lucide-react';

export default function Items() {
    const items = [
        { id: 1, name: 'Web Development', desc: 'Hourly development rate', price: '₹2,500', unit: 'hour' },
        { id: 2, name: 'UI/UX Design', desc: 'Full project design package', price: '₹45,000', unit: 'project' },
        { id: 3, name: 'Server Maintenance', desc: 'Monthly server upkeep', price: '₹5,000', unit: 'month' },
        { id: 4, name: 'SEO Optimization', desc: 'Basic SEO audit and fix', price: '₹15,000', unit: 'project' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 className="text-gradient" style={{ fontSize: '32px', margin: 0 }}>Items</h1>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Add Item
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {items.map(item => (
                    <div key={item.id} className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ padding: '10px', background: 'var(--primary-glow)', borderRadius: '10px' }}>
                                <Package size={24} color="var(--primary)" />
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '18px' }}>{item.price}</div>
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{item.name}</h3>
                        <p className="muted" style={{ margin: 0, fontSize: '14px' }}>{item.desc}</p>
                        <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)', display: 'inline-block', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            Per {item.unit}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
