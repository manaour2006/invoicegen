import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../server/middleware/auth.js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Get all expenses
router.get('/', requireAuth, async (req, res) => {
    try {
        const { data: expenses, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', req.user.id)
            .order('date', { ascending: false });

        if (error) throw error;

        res.json({ expenses: expenses || [] });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Create a new expense
router.post('/', requireAuth, async (req, res) => {
    try {
        const expenseData = {
            ...req.body,
            user_id: req.user.id,
            created_at: new Date().toISOString()
        };

        const { data: expense, error } = await supabase
            .from('expenses')
            .insert([expenseData])
            .select()
            .single();

        if (error) throw error;

        res.json({ expense });
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

export default router;
