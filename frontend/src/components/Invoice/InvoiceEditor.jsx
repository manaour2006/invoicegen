import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, X } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import { getClients, createClient, getItems, createItem } from '../../services/api';

export default function InvoiceEditor({ invoice, onChange }) {
    const [clients, setClients] = useState([]);
    const [items, setItems] = useState([]);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', email: '', address: '' });
    const [newItem, setNewItem] = useState({ name: '', description: '', price: 0, unit: 'hour' });

    useEffect(() => {
        loadClients();
        loadItems();
    }, []);

    const loadClients = async () => {
        try {
            const result = await getClients();
            setClients(result.clients);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const loadItems = async () => {
        try {
            const result = await getItems();
            setItems(result.items);
        } catch (error) {
            console.error('Error loading items:', error);
        }
    };

    const handleCreateClient = async () => {
        try {
            const result = await createClient(newClient);
            setClients([...clients, result.client]);
            updateTo('name', result.client.name);
            updateTo('email', result.client.email);
            updateTo('address', result.client.address);
            setShowClientModal(false);
            setNewClient({ name: '', email: '', address: '' });
        } catch (error) {
            console.error('Error creating client:', error);
        }
    };

    const handleCreateItem = async () => {
        try {
            const result = await createItem(newItem);
            setItems([...items, result.item]);
            addItemFromLibrary(result.item);
            setShowItemModal(false);
            setNewItem({ name: '', description: '', price: 0, unit: 'hour' });
        } catch (error) {
            console.error('Error creating item:', error);
        }
    };

    const updateField = (field, value) => {
        onChange({ ...invoice, [field]: value });
    };

    const updateTo = (field, value) => {
        onChange({ ...invoice, to: { ...invoice.to, [field]: value } });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...invoice.items];
        newItems[index][field] = value;
        onChange({ ...invoice, items: newItems });
    };

    const addItem = () => {
        const newItem = { id: Date.now().toString(), description: '', quantity: 1, price: 0 };
        onChange({ ...invoice, items: [...invoice.items, newItem] });
    };

    const addItemFromLibrary = (libraryItem) => {
        const newItem = {
            id: Date.now().toString(),
            description: libraryItem.name,
            quantity: 1,
            price: libraryItem.price
        };
        onChange({ ...invoice, items: [...invoice.items, newItem] });
    };

    const removeItem = (index) => {
        onChange({ ...invoice, items: invoice.items.filter((_, i) => i !== index) });
    };

    const setInvoiceItems = (newItems) => {
        onChange({ ...invoice, items: newItems });
    };

    const selectClient = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            updateTo('name', client.name);
            updateTo('email', client.email);
            updateTo('address', client.address);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>

            {/* Invoice Details */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-muted)' }}>Invoice Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Invoice No.</label>
                        <input className="input-field" value={invoice.invoiceNumber} onChange={e => updateField('invoiceNumber', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Date</label>
                        <input type="date" className="input-field" value={invoice.date} onChange={e => updateField('date', e.target.value)} />
                    </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                    <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Due Date</label>
                    <input type="date" className="input-field" value={invoice.dueDate} onChange={e => updateField('dueDate', e.target.value)} />
                </div>
            </div>

            {/* Client Details */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-muted)' }}>Bill To</h3>
                    <button
                        onClick={() => setShowClientModal(true)}
                        style={{ fontSize: '12px', color: 'var(--primary)', background: 'transparent', padding: '4px 8px' }}
                    >
                        + New Client
                    </button>
                </div>

                {clients.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                        <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Select Client</label>
                        <select
                            className="input-field"
                            onChange={(e) => selectClient(e.target.value)}
                            defaultValue=""
                        >
                            <option value="">-- Select a client --</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input className="input-field" placeholder="Client Name" value={invoice.to.name} onChange={e => updateTo('name', e.target.value)} />
                    <input className="input-field" placeholder="Client Email" value={invoice.to.email} onChange={e => updateTo('email', e.target.value)} />
                    <textarea className="input-field" rows="3" placeholder="Billing Address" value={invoice.to.address} onChange={e => updateTo('address', e.target.value)} style={{ resize: 'vertical' }} />
                </div>
            </div>

            {/* Items (Draggable) */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-muted)' }}>Items</h3>
                    <button
                        onClick={() => setShowItemModal(true)}
                        style={{ fontSize: '12px', color: 'var(--primary)', background: 'transparent', padding: '4px 8px' }}
                    >
                        + New Item
                    </button>
                </div>

                {items.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                        <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Add from Library</label>
                        <select
                            className="input-field"
                            onChange={(e) => {
                                const item = items.find(i => i.id === e.target.value);
                                if (item) addItemFromLibrary(item);
                                e.target.value = '';
                            }}
                            defaultValue=""
                        >
                            <option value="">-- Select an item --</option>
                            {items.map(item => (
                                <option key={item.id} value={item.id}>{item.name} - ₹{item.price}</option>
                            ))}
                        </select>
                    </div>
                )}

                <Reorder.Group axis="y" values={invoice.items} onReorder={setInvoiceItems}>
                    {invoice.items.map((item, index) => (
                        <Reorder.Item key={item.id} value={item} style={{ marginBottom: '12px' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '24px 3fr 1fr 1fr 32px',
                                gap: '12px',
                                alignItems: 'center',
                                background: 'var(--bg-card-hover)',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <GripVertical size={16} style={{ cursor: 'grab', color: 'var(--text-muted)' }} />
                                <input className="input-field" placeholder="Description" value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} />
                                <input type="number" className="input-field" placeholder="Qty" value={item.quantity} onChange={e => updateItem(index, 'quantity', Number(e.target.value))} />
                                <input type="number" className="input-field" placeholder="Price" value={item.price} onChange={e => updateItem(index, 'price', Number(e.target.value))} />
                                <button onClick={() => removeItem(index)} style={{ color: 'var(--danger)', padding: 4 }}><Trash2 size={16} /></button>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                <button className="btn-primary" onClick={addItem} style={{ width: '100%', marginTop: '12px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--glass-border)' }}>
                    <Plus size={16} style={{ marginRight: 8 }} /> Add Item
                </button>
            </div>

            {/* Totals & Notes */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                    <div>
                        <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Notes / Terms</label>
                        <textarea className="input-field" rows="4" value={invoice.notes} onChange={e => updateField('notes', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Tax (%)</label>
                            <input type="number" className="input-field" value={invoice.tax} onChange={e => updateField('tax', Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Currency</label>
                            <select className="input-field" value={invoice.currency} onChange={e => updateField('currency', e.target.value)}>
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Client Modal */}
            {showClientModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px' }}>Create New Client</h3>
                            <button onClick={() => setShowClientModal(false)} style={{ color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input className="input-field" placeholder="Client Name" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} />
                            <input className="input-field" placeholder="Client Email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} />
                            <textarea className="input-field" rows="3" placeholder="Address" value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })} />
                            <button className="btn-primary" onClick={handleCreateClient}>Create Client</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Item Modal */}
            {showItemModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px' }}>Create New Item</h3>
                            <button onClick={() => setShowItemModal(false)} style={{ color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input className="input-field" placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                            <input className="input-field" placeholder="Description" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
                            <input type="number" className="input-field" placeholder="Price" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} />
                            <select className="input-field" value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })}>
                                <option value="hour">Per Hour</option>
                                <option value="project">Per Project</option>
                                <option value="month">Per Month</option>
                                <option value="item">Per Item</option>
                            </select>
                            <button className="btn-primary" onClick={handleCreateItem}>Create Item</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
