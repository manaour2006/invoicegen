import React, { useState } from 'react';
import { Save, Upload } from 'lucide-react';

export default function Settings() {
    const [profile, setProfile] = useState({
        name: 'Manaour Azam',
        company: 'Azam Designs',
        email: 'contact@azam.design',
        phone: '+91 98765 43210'
    });

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '32px' }}>Settings</h1>

            <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Branding</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--glass-border)' }}>
                        <span style={{ fontSize: '32px' }}>AD</span>
                    </div>
                    <div>
                        <button className="btn-primary" style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', fontSize: '14px' }}>
                            <Upload size={14} style={{ marginRight: '8px' }} /> Upload Logo
                        </button>
                        <p className="muted" style={{ fontSize: '12px', marginTop: '8px' }}>Recommended: 400x400px PNG</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                        <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Brand Color</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366f1', cursor: 'pointer', border: '2px solid white' }}></div>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#10b981', cursor: 'pointer' }}></div>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f59e0b', cursor: 'pointer' }}></div>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ef4444', cursor: 'pointer' }}></div>
                        </div>
                    </div>
                    <div>
                        <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Accent Color</label>
                        <input type="color" className="input-field" style={{ height: '40px', padding: 2 }} />
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Business Profile</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                    <div>
                        <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Your Name</label>
                        <input name="name" className="input-field" value={profile.name} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Company Name</label>
                        <input name="company" className="input-field" value={profile.company} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Email</label>
                        <input name="email" className="input-field" value={profile.email} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Phone</label>
                        <input name="phone" className="input-field" value={profile.phone} onChange={handleChange} />
                    </div>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={18} /> Save Changes
                </button>
            </div>
        </div>
    );
}
