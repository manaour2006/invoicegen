

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export default function Layout() {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: isMobile ? 'column' : 'row' }}>
            <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            {/* Mobile Header */}
            {isMobile && (
                <div className="glass-panel" style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                    borderRadius: 0,
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderTop: 'none'
                }}>
                    <div style={{ fontWeight: 'bold', fontSize: '20px' }}><span className="text-gradient">INVOICE</span>GEN</div>
                    <button onClick={() => setMobileOpen(true)} style={{ color: 'var(--text-main)' }}>
                        <Menu size={24} />
                    </button>
                </div>
            )}

            <motion.main
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                    flex: 1,
                    marginLeft: isMobile ? 0 : '260px',
                    padding: isMobile ? '20px' : '32px',
                    width: isMobile ? '100%' : 'calc(100% - 260px)',
                    overflowX: 'hidden'
                }}
            >
                <Outlet />
            </motion.main>
        </div>
    );
}
