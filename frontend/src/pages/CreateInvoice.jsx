import React, { useState, useEffect } from 'react';
import InvoiceEditor from '../components/Invoice/InvoiceEditor';
import InvoicePreview from '../components/Invoice/InvoicePreview';
import { Save, Download, Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { getNextInvoiceNumber, createInvoice, updateInvoiceStatus } from '../services/api';
import { downloadInvoicePDF } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';

const initialInvoice = {
    invoiceNumber: 'INV-001',
    date: new Date().toISOString().slice(0, 10),
    dueDate: '',
    from: { name: '', email: '', address: '', phone: '', logo: null },
    to: { name: '', email: '', address: '' },
    items: [],
    tax: 18,
    currency: 'INR',
    notes: 'Thank you for your business!'
};

import { useMediaQuery } from '../hooks/useMediaQuery';

export default function CreateInvoice() {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { user } = useAuth();
    const [invoice, setInvoice] = useState(initialInvoice);
    const [activeTab, setActiveTab] = useState('editor');
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        loadNextInvoiceNumber();
    }, []);

    // Auto-populate 'from' field with user profile
    useEffect(() => {
        if (user) {
            setInvoice(prev => ({
                ...prev,
                from: {
                    name: user.company || user.name || '',
                    email: user.email || '',
                    address: user.address || '',
                    phone: user.phone || '',
                    logo: user.logo || null
                }
            }));
        }
    }, [user]);

    const loadNextInvoiceNumber = async () => {
        try {
            const result = await getNextInvoiceNumber();
            setInvoice(prev => ({ ...prev, invoiceNumber: result.invoiceNumber }));
        } catch (error) {
            console.error('Error loading invoice number:', error);
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSaveDraft = async () => {
        try {
            setSaving(true);
            const invoiceData = {
                ...invoice,
                status: 'draft',
                subtotal: invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
                total: invoice.items.reduce((sum, item) => sum + (item.quantity * item.price) * (1 + (item.taxRate || 0) / 100), 0)
            };
            await createInvoice(invoiceData);
            showNotification('Invoice saved as draft successfully!');
        } catch (error) {
            console.error('Error saving draft:', error);
            showNotification('Failed to save draft', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSendInvoice = async () => {
        try {
            setSending(true);

            // Calculate totals
            const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            const total = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price) * (1 + (item.taxRate || 0) / 100), 0);

            // Save invoice with 'sent' status
            const invoiceData = {
                ...invoice,
                status: 'sent',
                subtotal,
                total
            };
            const result = await createInvoice(invoiceData);

            // Generate and download PDF
            downloadInvoicePDF(invoice);

            showNotification('Invoice sent successfully! PDF downloaded.');

            // Reset form and get new invoice number
            setTimeout(() => {
                setInvoice(initialInvoice);
                loadNextInvoiceNumber();
            }, 1500);
        } catch (error) {
            console.error('Error sending invoice:', error);
            showNotification('Failed to send invoice', 'error');
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 64px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Notification */}
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 20,
                        right: 20,
                        zIndex: 1000,
                        background: notification.type === 'success' ? 'var(--success)' : 'var(--danger)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    {notification.type === 'success' && <Check size={18} />}
                    {notification.message}
                </motion.div>
            )}

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '20px', gap: isMobile ? 12 : 0 }}>
                <h1 className="text-gradient" style={{ fontSize: '24px', margin: 0 }}>Create Invoice</h1>
                <div style={{ display: 'flex', gap: '12px', width: isMobile ? '100%' : 'auto' }}>

                    <button
                        className="btn-primary"
                        style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', flex: 1 }}
                        onClick={handleSaveDraft}
                        disabled={saving}
                    >
                        <Save size={18} style={{ marginRight: 8 }} />
                        {saving ? 'Saving...' : (isMobile ? 'Save' : 'Save Draft')}
                    </button>
                    <button
                        className="btn-primary"
                        style={{ flex: 1 }}
                        onClick={handleSendInvoice}
                        disabled={sending}
                    >
                        <Share2 size={18} style={{ marginRight: 8 }} />
                        {sending ? 'Sending...' : (isMobile ? 'Send' : 'Send Invoice')}
                    </button>
                </div>
            </div>

            {isMobile && (
                <div style={{ display: 'flex', background: 'var(--bg-card-hover)', padding: 4, borderRadius: 8, marginBottom: 16 }}>
                    <button
                        onClick={() => setActiveTab('editor')}
                        style={{ flex: 1, padding: '8px', borderRadius: 6, background: activeTab === 'editor' ? 'white' : 'transparent', fontWeight: 500, boxShadow: activeTab === 'editor' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
                    >
                        Editor
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        style={{ flex: 1, padding: '8px', borderRadius: 6, background: activeTab === 'preview' ? 'white' : 'transparent', fontWeight: 500, boxShadow: activeTab === 'preview' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
                    >
                        Preview
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '32px', flex: 1, overflow: 'hidden' }}>
                {/* Editor (Scrollable) */}
                <div style={{
                    overflowY: 'auto',
                    paddingRight: '4px',
                    display: isMobile && activeTab !== 'editor' ? 'none' : 'block'
                }}>
                    <InvoiceEditor invoice={invoice} onChange={setInvoice} />
                </div>

                {/* Preview (Sticky/Scrollable) */}
                <div style={{
                    background: '#efebe9',
                    borderRadius: '16px',
                    padding: '16px',
                    height: '100%',
                    overflow: 'hidden',
                    display: isMobile && activeTab !== 'preview' ? 'none' : 'block'
                }}>
                    <div style={{ background: 'white', borderRadius: '4px', height: '100%', overflowY: 'auto', color: 'black', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <InvoicePreview invoice={invoice} />
                    </div>
                </div>
            </div>
        </div>
    );
}
