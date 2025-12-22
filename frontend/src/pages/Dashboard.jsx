import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Clock, FileText, CheckCircle } from 'lucide-react';
import StatCard from '../components/Dashboard/StatCard';
import RevenueChart from '../components/Dashboard/RevenueChart';
import InvoiceStatusChart from '../components/Dashboard/InvoiceStatusChart';
import { getAnalyticsStats, getInvoices } from '../services/api';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, invoicesData] = await Promise.all([
                getAnalyticsStats(),
                getInvoices()
            ]);

            setStats(statsData);
            setRecentInvoices(invoicesData.invoices.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '32px', margin: 0 }}>Dashboard</h1>
                    <p className="muted" style={{ marginTop: '8px' }}>Welcome back, here's what's happening today.</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/create')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} /> New Invoice
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>
                <StatCard
                    title="Total Earnings"
                    value={`₹${stats?.totalEarnings?.toLocaleString('en-IN') ?? 0}`}
                    trend={stats?.trends?.earnings}
                    icon={DollarSign}
                    color="#10b981"
                />
                <StatCard
                    title="Pending"
                    value={`₹${stats?.pendingAmount?.toLocaleString('en-IN') ?? 0}`}
                    trend={stats?.trends?.pending}
                    icon={Clock}
                    color="#f59e0b"
                />
                <StatCard
                    title="Overdue"
                    value={`₹${stats?.overdueAmount?.toLocaleString('en-IN') ?? 0}`}
                    trend={stats?.trends?.overdue}
                    icon={FileText}
                    color="#ef4444"
                />
                <StatCard
                    title="Paid Invoices"
                    value={String(stats?.paidInvoicesCount ?? 0)}
                    trend={stats?.trends?.paidCount}
                    icon={CheckCircle}
                    color="#6366f1"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid-stack-mobile" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px', marginBottom: '32px' }}>
                <RevenueChart />
                <InvoiceStatusChart data={stats?.invoiceDistribution} />
            </div>

            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {recentInvoices.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            No invoices yet. Create your first invoice to get started!
                        </div>
                    ) : (
                        recentInvoices.map((invoice, i) => (
                            <div key={invoice.id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--glass-border)' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500 }}>{invoice.invoiceNumber}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {invoice.to?.name || 'Client'} • {invoice.status}
                                    </div>
                                </div>
                                <div style={{ fontWeight: 600 }}>₹{invoice.total?.toLocaleString('en-IN') || 0}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div >
    );
}
