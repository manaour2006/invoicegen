import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Mail, Phone, X, Check, Trash2 } from 'lucide-react';
import { getClients, createClient, deleteClient } from '../services/api';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function Clients() {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [clients, setClients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', email: '', address: '', notes: '' });
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const result = await getClients();
            setClients(result.clients);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClient = async () => {
        try {
            const result = await createClient(newClient);
            setClients([...clients, result.client]);
            setShowModal(false);
            setNewClient({ name: '', email: '', address: '', notes: '' });
        } catch (error) {
            console.error('Error creating client:', error);
        }
    };

    const handleDeleteClient = async () => {
        if (!deleteId) return;
        try {
            await deleteClient(deleteId);
            setClients(clients.filter(c => c.id !== deleteId));
            setDeleteId(null);
            setActiveMenu(null);
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <h1 className="text-gradient" style={{ fontSize: isMobile ? '24px' : '32px', margin: 0 }}>Clients</h1>
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Client</button>
            </div>

            {/* Mobile: Card View */}
            {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {clients.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No clients found. Add your first client!</p>
                        </div>
                    ) : (
                        clients.map(client => (
                            <div key={client.id} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{client.name}</h3>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenu(activeMenu === client.id ? null : client.id);
                                        }}
                                        style={{ color: 'var(--text-muted)', padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>

                                    {activeMenu === client.id && (
                                        <>
                                            <div style={{
                                                position: 'absolute',
                                                right: 20,
                                                top: 50,
                                                background: 'white',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                zIndex: 100,
                                                minWidth: '120px'
                                            }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteId(client.id);
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        width: '100%',
                                                        padding: '10px 16px',
                                                        color: '#ef4444',
                                                        fontSize: '14px',
                                                        textAlign: 'left',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Trash2 size={16} /> Delete
                                                </button>
                                            </div>
                                            <div
                                                style={{ position: 'fixed', inset: 0, zIndex: 90, cursor: 'default' }}
                                                onClick={() => setActiveMenu(null)}
                                            />
                                        </>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-main)' }}>
                                    <Mail size={14} className="text-muted" />
                                    <span style={{ fontSize: '14px' }}>{client.email}</span>
                                </div>
                                {client.address && (
                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>{client.address}</p>
                                )}
                                {client.notes && (
                                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        Note: {client.notes}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            ) : (
                /* Desktop: Table View */
                <div className="glass-panel" style={{ borderRadius: '16px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ textAlign: 'left', padding: '20px', color: 'var(--text-muted)', fontWeight: 500 }}>Client Name</th>
                                <th style={{ textAlign: 'left', padding: '20px', color: 'var(--text-muted)', fontWeight: 500 }}>Email</th>
                                <th style={{ textAlign: 'left', padding: '20px', color: 'var(--text-muted)', fontWeight: 500 }}>Address</th>
                                <th style={{ padding: '20px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No clients found. Add your first client!
                                    </td>
                                </tr>
                            ) : (
                                clients.map(client => (
                                    <tr key={client.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '20px', fontWeight: 600 }}>{client.name}</td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Mail size={14} className="text-muted" /> {client.email}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', color: 'var(--text-muted)' }}>{client.address || '-'}</td>
                                        <td style={{ padding: '20px', textAlign: 'right', position: 'relative' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenu(activeMenu === client.id ? null : client.id);
                                                }}
                                                style={{ color: 'var(--text-muted)', padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
                                            >
                                                <MoreHorizontal size={20} />
                                            </button>

                                            {activeMenu === client.id && (
                                                <div style={{
                                                    position: 'absolute',
                                                    right: 20,
                                                    top: 45,
                                                    background: 'white',
                                                    border: '1px solid var(--glass-border)',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    zIndex: 100,
                                                    minWidth: '120px'
                                                }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteId(client.id);
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            width: '100%',
                                                            padding: '10px 16px',
                                                            color: '#ef4444',
                                                            fontSize: '14px',
                                                            textAlign: 'left',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Trash2 size={16} /> Delete
                                                    </button>
                                                </div>
                                            )}

                                            {activeMenu === client.id && (
                                                <div
                                                    style={{ position: 'fixed', inset: 0, zIndex: 90, cursor: 'default' }}
                                                    onClick={() => setActiveMenu(null)}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Client Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
                    <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px' }}>Add New Client</h3>
                            <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input className="input-field" placeholder="Client Name" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} />
                            <input className="input-field" placeholder="Client Email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} />
                            <textarea className="input-field" rows="3" placeholder="Address" value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })} />
                            <textarea className="input-field" rows="2" placeholder="Notes (optional)" value={newClient.notes} onChange={e => setNewClient({ ...newClient, notes: e.target.value })} />
                            <button
                                className="btn-primary"
                                onClick={handleCreateClient}
                                disabled={!newClient.name || !newClient.email}
                                style={{ opacity: (!newClient.name || !newClient.email) ? 0.5 : 1 }}
                            >
                                Create Client
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Delete Client?</h3>
                        <p style={{ color: 'var(--text-muted)', margin: '0 0 24px 0', fontSize: '14px' }}>
                            Are you sure you want to delete this client? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setDeleteId(null)}
                                style={{
                                    padding: '8px 24px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'transparent',
                                    color: 'var(--text-main)',
                                    fontSize: '14px',
                                    fontWeight: 500
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteClient}
                                style={{
                                    padding: '8px 24px',
                                    borderRadius: '8px',
                                    background: 'var(--danger)',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '14px',
                                    fontWeight: 500
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
