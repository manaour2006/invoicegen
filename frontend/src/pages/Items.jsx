import React, { useState, useEffect } from 'react';
import { Package, Plus, X, Trash2, Pencil } from 'lucide-react';
import { getItems, createItem, deleteItem, updateItem } from '../services/api';

export default function Items() {
    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: 0, costPrice: 0, quantity: 0, lowStockThreshold: 5, unit: 'unit', category: 'Others', taxRate: 18 });
    const [loading, setLoading] = useState(true);

    const CATEGORIES = {
        'Electrical Appliances': { gst: 18, units: ['unit', 'piece', 'box', 'set'], color: 'var(--primary)', bg: 'rgba(141, 110, 99, 0.1)' },
        'Vegetables': { gst: 5, units: ['kg', 'gram', 'quintal', 'tonne'], color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        'Fruits': { gst: 12, units: ['kg', 'gram', 'dozen', 'box'], color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        'Others': { gst: 18, units: ['unit', 'kg', 'litre', 'meter', 'hour', 'day', 'month', 'project'], color: 'var(--text-muted)', bg: 'rgba(141, 110, 99, 0.05)' }
    };

    const handleCategoryChange = (category) => {
        const config = CATEGORIES[category];
        setNewItem({
            ...newItem,
            category,
            taxRate: config.gst,
            unit: config.units[0]
        });
    };

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const result = await getItems();
            setItems(result.items);
        } catch (error) {
            console.error('Error loading items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveItem = async () => {
        try {
            if (editingId) {
                const result = await updateItem(editingId, newItem);
                setItems(items.map(item => item.id === editingId ? result.item : item));
            } else {
                const result = await createItem(newItem);
                setItems([...items, result.item]);
            }
            closeModal();
        } catch (error) {
            console.error('Error saving item:', error);
        }
    };

    const openCreateModal = () => {
        setEditingId(null);
        setNewItem({ name: '', description: '', price: 0, costPrice: 0, quantity: 0, lowStockThreshold: 5, unit: 'unit', category: 'Others', taxRate: 18 });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingId(item.id);
        setNewItem({ ...item });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNewItem({ name: '', description: '', price: 0, costPrice: 0, quantity: 0, lowStockThreshold: 5, unit: 'unit', category: 'Others', taxRate: 18 });
    };

    const handleDeleteItem = async () => {
        if (!deleteId) return;
        try {
            await deleteItem(deleteId);
            setItems(items.filter(item => item.id !== deleteId));
            setDeleteId(null);
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const getStockStatus = (item) => {
        const qty = Number(item.quantity) || 0;
        const threshold = Number(item.lowStockThreshold) || 5;
        if (qty <= 0) return { label: 'Out of Stock', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
        if (qty <= threshold) return { label: 'Low Stock', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
        return { label: 'In Stock', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    };

    return (
        <div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 className="text-gradient" style={{ fontSize: '32px', margin: 0 }}>Items</h1>
                <button className="btn-primary" onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Add Item
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {items.map(item => (
                    <div key={item.id} className="glass-panel" style={{
                        padding: '24px',
                        borderRadius: '20px',
                        position: 'relative',
                        transition: 'transform 0.2s',
                        overflow: 'hidden'
                    }}>
                        {/* Header with Category and Delete */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            {item.category && (
                                <div style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    padding: '4px 10px',
                                    borderRadius: '100px',
                                    color: CATEGORIES[item.category]?.color || 'var(--text-muted)',
                                    background: CATEGORIES[item.category]?.bg || 'rgba(0,0,0,0.03)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.8px'
                                }}>
                                    {item.category}
                                </div>
                            )}
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => openEditModal(item)}
                                style={{
                                    padding: '8px',
                                    borderRadius: '10px',
                                    background: 'var(--bg-dark)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Edit / Restock"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={() => setDeleteId(item.id)}
                                style={{
                                    padding: '8px',
                                    borderRadius: '10px',
                                    background: 'var(--bg-dark)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--primary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-dark)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                title="Delete Item"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        {/* Main Content */}
                        < div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'var(--primary-glow)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Package size={24} color="var(--primary)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{item.name}</h3>
                                    {item.productId && (
                                        <span style={{
                                            fontSize: '10px',
                                            background: 'var(--bg-card)',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            color: 'var(--text-muted)',
                                            border: '1px solid var(--glass-border)'
                                        }}>
                                            {item.productId}
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{
                                        fontSize: '10px',
                                        padding: '2px 8px',
                                        borderRadius: '100px',
                                        ...(() => {
                                            const status = getStockStatus(item);
                                            return { color: status.color, background: status.bg };
                                        })(),
                                        fontWeight: 600
                                    }}>
                                        {getStockStatus(item).label} ({item.quantity || 0})
                                    </span>
                                </div>
                                <p className="muted" style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {item.description}
                                </p>
                            </div>
                        </div>

                        {/* Footer with Price and Unit */}
                        <div style={{
                            marginTop: 'auto',
                            paddingTop: '16px',
                            borderTop: '1px solid var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end'
                        }}>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Unit</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Per {item.unit}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)' }}>₹{item.price?.toLocaleString('en-IN')}</div>
                                {item.taxRate > 0 && (
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>+ {item.taxRate}% GST</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Item Modal */}
            {
                showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
                        <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ margin: 0, fontSize: '20px' }}>{editingId ? 'Edit / Restock Item' : 'Create New Item'}</h3>
                                <button onClick={closeModal} style={{ color: 'var(--text-muted)' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Category</label>
                                    <select
                                        className="input-field"
                                        value={newItem.category}
                                        onChange={e => handleCategoryChange(e.target.value)}
                                    >
                                        {Object.keys(CATEGORIES).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <input className="input-field" placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                                <input className="input-field" placeholder="Description" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Selling Price</label>
                                        <input type="number" className="input-field" placeholder="Selling Price" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Cost Price</label>
                                        <input type="number" className="input-field" placeholder="Cost Price" value={newItem.costPrice} onChange={e => setNewItem({ ...newItem, costPrice: Number(e.target.value) })} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                                            {editingId ? 'Current Stock (Update to Restock)' : 'Initial Quantity'}
                                        </label>
                                        <input type="number" className="input-field" placeholder="Quantity" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Low Stock Alert</label>
                                        <input type="number" className="input-field" placeholder="Threshold" value={newItem.lowStockThreshold} onChange={e => setNewItem({ ...newItem, lowStockThreshold: Number(e.target.value) })} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Tax %</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            placeholder="GST Tax %"
                                            value={newItem.taxRate}
                                            onChange={e => setNewItem({ ...newItem, taxRate: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Product ID</label>
                                        <input
                                            className="input-field"
                                            placeholder="Auto-generated"
                                            value={newItem.productId || 'Auto-generated'}
                                            disabled
                                            style={{ background: 'var(--bg-card)', opacity: 0.7 }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Unit</label>
                                    <select className="input-field" value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })}>
                                        {(CATEGORIES[newItem.category]?.units || CATEGORIES['Others'].units).map(unit => (
                                            <option key={unit} value={unit}>Per {unit.charAt(0).toUpperCase() + unit.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    className="btn-primary"
                                    onClick={handleSaveItem}
                                    disabled={!newItem.name}
                                    style={{ opacity: !newItem.name ? 0.5 : 1 }}
                                >
                                    {editingId ? 'Update Item' : 'Create Item'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                deleteId && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Delete Item?</h3>
                            <p style={{ color: 'var(--text-muted)', margin: '0 0 24px 0', fontSize: '14px' }}>
                                Are you sure you want to delete this item? This action cannot be undone.
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
                                    onClick={handleDeleteItem}
                                    style={{
                                        padding: '8px 24px',
                                        borderRadius: '8px',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
