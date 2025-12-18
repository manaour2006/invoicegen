import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../server/middleware/auth.js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Get dashboard statistics
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all invoices for the user
        const { data: invoices, error: invoicesError } = await supabase
            .from('invoices')
            .select('*')
            .eq('user_id', userId);

        if (invoicesError) throw invoicesError;

        // Calculate statistics
        const totalEarnings = invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + (inv.total || 0), 0);

        const pendingAmount = invoices
            .filter(inv => inv.status === 'sent')
            .reduce((sum, inv) => sum + (inv.total || 0), 0);

        const overdueAmount = invoices
            .filter(inv => {
                if (inv.status === 'overdue') return true;
                if (inv.status === 'sent' && inv.due_date) {
                    return new Date(inv.due_date) < new Date();
                }
                return false;
            })
            .reduce((sum, inv) => sum + (inv.total || 0), 0);

        const paidInvoicesCount = invoices.filter(inv => inv.status === 'paid').length;

        res.json({
            totalEarnings,
            pendingAmount,
            overdueAmount,
            paidInvoicesCount,
            totalInvoices: invoices.length
        });
    } catch (error) {
        console.error('Error fetching analytics stats:', error);
        res.status(500).json({ error: 'Failed to fetch analytics stats' });
    }
});

// Get revenue data for charts
router.get('/revenue', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const period = req.query.period || 'weekly'; // 'weekly' or 'monthly'

        const { data: invoices, error } = await supabase
            .from('invoices')
            .select('date, total, status')
            .eq('user_id', userId)
            .in('status', ['paid', 'sent']);

        if (error) throw error;

        // Process data based on period
        let chartData = [];

        if (period === 'weekly') {
            // Last 7 days
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const today = new Date();

            chartData = Array.from({ length: 7 }, (_, i) => {
                const date = new Date(today);
                date.setDate(date.getDate() - (6 - i));
                const dayName = days[date.getDay()];

                const revenue = invoices
                    .filter(inv => {
                        const invDate = new Date(inv.date);
                        return invDate.toDateString() === date.toDateString();
                    })
                    .reduce((sum, inv) => sum + (inv.total || 0), 0);

                return { name: dayName, revenue };
            });
        } else {
            // Last 12 months
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const today = new Date();

            chartData = Array.from({ length: 12 }, (_, i) => {
                const date = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
                const monthName = months[date.getMonth()];

                const revenue = invoices
                    .filter(inv => {
                        const invDate = new Date(inv.date);
                        return invDate.getMonth() === date.getMonth() &&
                            invDate.getFullYear() === date.getFullYear();
                    })
                    .reduce((sum, inv) => sum + (inv.total || 0), 0);

                return { name: monthName, revenue };
            });
        }

        res.json({ data: chartData, period });
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        res.status(500).json({ error: 'Failed to fetch revenue data' });
    }
});

// Get expenses data for pie chart
router.get('/expenses', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: expenses, error } = await supabase
            .from('expenses')
            .select('category, amount')
            .eq('user_id', userId);

        if (error) throw error;

        // Group by category
        const categoryMap = {};
        expenses.forEach(expense => {
            const category = expense.category || 'Other';
            categoryMap[category] = (categoryMap[category] || 0) + expense.amount;
        });

        const chartData = Object.entries(categoryMap).map(([name, value]) => ({
            name,
            value
        }));

        res.json({ data: chartData });
    } catch (error) {
        console.error('Error fetching expenses data:', error);
        res.status(500).json({ error: 'Failed to fetch expenses data' });
    }
});

export default router;
