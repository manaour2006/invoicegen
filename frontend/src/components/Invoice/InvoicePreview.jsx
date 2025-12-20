import React from 'react';

export default function InvoicePreview({ invoice }) {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = (subtotal * invoice.tax) / 100;
    const total = subtotal + taxAmount;

    const formatCurrency = (amount) => {
        try {
            return new Intl.NumberFormat('en-IN', { style: 'currency', currency: invoice.currency }).format(amount);
        } catch {
            return `${invoice.currency} ${amount}`;
        }
    };

    return (
        <div style={{ padding: '40px', color: '#1a1a1a', height: '100%', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '48px' }}>
                <div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#3b82f6', marginBottom: '8px' }}>INVOICE</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>#{invoice.invoiceNumber}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '18px' }}>{invoice.from.name}</div>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '4px', whiteSpace: 'pre-line' }}>{invoice.from.address}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>{invoice.from.email}</div>
                </div>
            </div>

            {/* Bill To */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>Bill To</div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{invoice.to.name || 'Client Name'}</div>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '4px', whiteSpace: 'pre-line' }}>
                        {invoice.to.address || 'Client Address'}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>Date</div>
                    <div style={{ fontWeight: 600 }}>{invoice.date}</div>
                </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                        <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Description</th>
                        <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase', width: '80px' }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase', width: '100px' }}>Price</th>
                        <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase', width: '100px' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '16px 0', fontSize: '14px' }}>{item.description || 'Item Name'}</td>
                            <td style={{ padding: '16px 0', textAlign: 'center', fontSize: '14px' }}>{item.quantity}</td>
                            <td style={{ padding: '16px 0', textAlign: 'right', fontSize: '14px' }}>{formatCurrency(item.price)}</td>
                            <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 600, fontSize: '14px' }}>{formatCurrency(item.quantity * item.price)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                        <span style={{ color: '#666' }}>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                        <span style={{ color: '#666' }}>Tax ({invoice.tax}%)</span>
                        <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f3f4f6', paddingTop: '12px', fontSize: '16px', fontWeight: 700 }}>
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
                <div style={{ marginTop: '40px', background: '#f8fafc', padding: '24px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>Notes</div>
                    <div style={{ fontSize: '13px', color: '#666', whiteSpace: 'pre-wrap' }}>{invoice.notes}</div>
                </div>
            )}
        </div>
    );
}
