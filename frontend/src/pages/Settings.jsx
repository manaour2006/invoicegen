import React, { useState, useEffect } from 'react';
import { Save, Upload, Check, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { getAuditLogs } from '../services/api';

export default function Settings() {
    const { user, updateProfile } = useAuth();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        logo: null
    });
    const [notification, setNotification] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);

    useEffect(() => {
        loadAuditLogs();
    }, [user]);

    const loadAuditLogs = async () => {
        if (!user) return;
        try {
            const { logs } = await getAuditLogs(20);
            setAuditLogs(logs);
        } catch (error) {
            console.error('Error loading audit logs:', error);
        }
    };

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                company: user.company || '',
                email: user.email || '',
                phone: user.phone || '',
                logo: user.logo || null
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validations
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setNotification('File is too large. Max 2MB.');
            return;
        }

        try {
            setUploading(true);
            const { storage } = await import('../services/firebase');
            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

            const storageRef = ref(storage, `users/${user.uid}/logo`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            setFormData(prev => ({ ...prev, logo: downloadURL }));
            setNotification('Logo uploaded successfully! Click Save to apply.');
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error('Error uploading image:', error);
            setNotification('Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile(formData);
            setNotification('Profile updated successfully!');
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error(error);
            setNotification('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '32px' }}>Settings</h1>

            {notification && (
                <div style={{
                    marginBottom: '20px',
                    padding: '12px',
                    background: 'var(--success)',
                    color: 'white',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <Check size={18} /> {notification}
                </div>
            )}

            <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Branding</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'var(--bg-card-hover)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px dashed var(--glass-border)',
                        overflow: 'hidden'
                    }}>
                        {formData.logo ? (
                            <img src={formData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: '32px' }}>{formData.name.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <label className="btn-primary" style={{
                            background: 'var(--bg-card-hover)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--glass-border)',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center'
                        }}>
                            <Upload size={14} style={{ marginRight: '8px' }} /> {uploading ? 'Uploading...' : 'Upload Logo'}
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                        </label>
                        <p className="muted" style={{ fontSize: '12px', marginTop: '8px' }}>Recommended: 400x400px PNG</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
                    {/* Color pickers could be added here if needed, keeping simple for now */}
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Business Profile</h2>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                    <div>
                        <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Your Name</label>
                        <input name="name" className="input-field" value={formData.name} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Company Name</label>
                        <input name="company" className="input-field" value={formData.company} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Email</label>
                        <input name="email" className="input-field" value={formData.email} onChange={handleChange} disabled />
                    </div>
                    <div>
                        <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Phone</label>
                        <input name="phone" className="input-field" value={formData.phone} onChange={handleChange} />
                    </div>
                </div>
                <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Audit Logs Section */}
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', marginTop: '32px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={20} /> Activity Logs
                </h2>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {auditLogs.length === 0 ? (
                        <p className="text-muted" style={{ fontSize: '14px', fontStyle: 'italic' }}>No recent activity.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {auditLogs.map(log => (
                                <div key={log.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    background: 'var(--bg-card)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>
                                            {log.action} {log.entityType}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            {log.details}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
                                        {new Date(log.timestamp).toLocaleDateString()}
                                        <br />
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
