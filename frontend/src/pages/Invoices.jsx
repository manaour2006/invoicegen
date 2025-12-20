import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Trash2, Edit, Eye, Check, X, Calendar } from 'lucide-react';
import { getInvoices, deleteInvoice, markInvoiceAsPaid } from '../services/api';
import { downloadInvoicePDF } from '../utils/pdfGenerator';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function Invoices() {
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteId, setDeleteId] = useState(null);
    const [paymentModal, setPaymentModal] = useState(null);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));

    useEffect(() => {
        loadInvoices();
    }, []);

    useEffect(() => {
        filterInvoices();
    }, [invoices, searchTerm, statusFilter]);

    const loadInvoices = async () => {
        try {
            const result = await getInvoices();
            setInvoices(result.invoices);
        } catch (error) {
            console.error('Error loading invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterInvoices = () => {
        let filtered = invoices;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(inv =>
                inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.to?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'overdue') {
                filtered = filtered.filter(inv => {
                    if (inv.status === 'paid') return false;
                    if (!inv.dueDate) return false;
                    return new Date(inv.dueDate) < new Date();
                });
            } else {
                filtered = filtered.filter(inv => inv.status === statusFilter);
            }
        }

        setFilteredInvoices(filtered);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteInvoice(deleteId);
            setInvoices(invoices.filter(inv => inv.id !== deleteId));
            setDeleteId(null);
        } catch (error) {
            console.error('Error deleting invoice:', error);
        }
    };

    const handleMarkAsPaid = async () => {
        if (!paymentModal) return;
        try {
            await markInvoiceAsPaid(paymentModal, paymentDate);
            setInvoices(invoices.map(inv =>
                inv.id === paymentModal ? { ...inv, status: 'paid', paymentDate } : inv
            ));
            setPaymentModal(null);
        } catch (error) {
            console.error('Error marking as paid:', error);
        }
    };

    const getStatusBadge = (invoice) => {
        let status = invoice.status || 'draft';
        let color = 'var(--text-muted)';
        let bg = 'rgba(255,255,255,0.05)';

        if (status === 'paid') {
            color = '#10b981';
            bg = 'rgba(16, 185, 129, 0.1)';
        } else if (status === 'sent') {
            color = '#3b82f6';
            bg = 'rgba(59, 130, 246, 0.1)';
        } else if (invoice.dueDate && new Date(invoice.dueDate) < new Date() && status !== 'paid') {
            status = 'overdue';
            color = '#ef4444';
            bg = 'rgba(239, 68, 68, 0.1)';
        } else if (status === 'draft') {
            color = '#f59e0b';
            bg = 'rgba(245, 158, 11, 0.1)';
        }

        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 600,
                color,
                background: bg,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                {status}
            </span>
        );
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <h1 className="text-gradient" style={{ fontSize: isMobile ? '24px' : '32px', margin: 0 }}>Invoices</h1>
                <button className="btn-primary" onClick={() => navigate('/create')}>+ Create Invoice</button>
            </div>

            {/* Search and Filter */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input-field"
                            placeholder="Search by invoice number or client..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                    <select
                        className="input-field"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ minWidth: isMobile ? '100%' : '150px' }}
                    >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                    </select>
                </div>
            </div>

            {/* Invoice List */}
            {loading ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Loading invoices...</p>
                </div>
            ) : filteredInvoices.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                        {searchTerm || statusFilter !== 'all' ? 'No invoices match your filters' : 'No invoices found. Create your first invoice!'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredInvoices.map(invoice => (
                        <div key={invoice.id} className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr auto', gap: '16px', alignItems: 'center' }}>
                                {/* Invoice Info */}
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{invoice.invoiceNumber}</div>
                                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{invoice.to?.name || 'No client'}</div>
                                </div>

                                {/* Amount */}
                                <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Amount</div>
                                    <div style={{ fontWeight: 600, fontSize: '18px' }}>₹{invoice.total?.toLocaleString('en-IN') || '0'}</div>
                                </div>

                                {/* Status & Date */}
                                <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                                    <div style={{ marginBottom: '8px' }}>{getStatusBadge(invoice)}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'No due date'}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
                                    {invoice.status !== 'paid' && (
                                        <button
                                            onClick={() => setPaymentModal(invoice.id)}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                background: 'var(--success)',
                                                color: 'white',
                                                border: 'none',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                            title="Mark as Paid"
                                        >
                                            <Check size={14} /> {isMobile ? '' : 'Paid'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => downloadInvoicePDF(invoice)}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '8px',
                                            background: 'var(--bg-card-hover)',
                                            border: '1px solid var(--glass-border)',
                                            color: 'var(--text-main)',
                                            cursor: 'pointer'
                                        }}
                                        title="Download PDF"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(invoice.id)}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '8px',
                                            background: 'transparent',
                                            border: '1px solid var(--danger)',
                                            color: 'var(--danger)',
                                            cursor: 'pointer'
                                        }}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Payment Modal */}
            {paymentModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Mark Invoice as Paid</h3>
                        <div style={{ marginBottom: '24px' }}>
                            <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Payment Date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={paymentDate}
                                onChange={e => setPaymentDate(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setPaymentModal(null)}
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
                                onClick={handleMarkAsPaid}
                                className="btn-primary"
                                style={{
                                    padding: '8px 24px',
                                    fontSize: '14px'
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Delete Invoice?</h3>
                        <p style={{ color: 'var(--text-muted)', margin: '0 0 24px 0', fontSize: '14px' }}>
                            Are you sure you want to delete this invoice? This action cannot be undone.
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
                                onClick={handleDelete}
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
