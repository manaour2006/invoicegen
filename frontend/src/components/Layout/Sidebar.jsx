import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FilePlus,
    Users,
    Package,
    Settings,
    Zap,
    Menu,
    ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FilePlus, label: 'Create Invoice', path: '/create' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: Package, label: 'Items', path: '/items' },
    { icon: Zap, label: 'Automations', path: '/automations' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar({ mobileOpen, onClose }) {
    const isMobile = window.innerWidth < 768; // Initial check
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 49,
                            backdropFilter: 'blur(4px)'
                        }}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    width: collapsed && !isMobile ? 80 : 260,
                    x: isMobile && !mobileOpen ? -300 : 0
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="glass-panel"
                style={{
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid var(--glass-border)',
                    overflow: 'hidden',
                    background: 'var(--bg-card)'
                }}
            >
                <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: (collapsed && !isMobile) ? 'center' : 'space-between' }}>
                    <AnimatePresence>
                        {(!collapsed || isMobile) && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ fontWeight: 'bold', fontSize: '20px', letterSpacing: '-0.5px' }}
                            >
                                <span className="text-gradient">INVOICE</span>GEN
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isMobile && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ color: 'var(--text-muted)', padding: 4 }}
                        >
                            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                        </button>
                    )}
                    {isMobile && (
                        <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 4 }}>
                            <ChevronLeft size={20} />
                        </button>
                    )}
                </div>

                <nav style={{ padding: '0 12px', flex: 1 }}>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => isMobile && onClose && onClose()}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                color: isActive ? 'white' : 'var(--text-muted)',
                                background: isActive ? 'var(--primary)' : 'transparent',
                                marginBottom: '8px',
                                transition: 'all 0.2s',
                                justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start'
                            })}
                        >
                            <item.icon size={20} />
                            <AnimatePresence>
                                {(!collapsed || isMobile) && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        style={{ marginLeft: '12px', whiteSpace: 'nowrap' }}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </NavLink>
                    ))}
                </nav>

                <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start', gap: '12px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(45deg, #8d6e63, #5d4037)' }} />
                        {(!collapsed || isMobile) && (
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600 }}>Manaour Azam</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pro Plan</div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
