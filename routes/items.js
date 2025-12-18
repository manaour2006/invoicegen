import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../server/middleware/auth.js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Get all items
router.get('/', requireAuth, async (req, res) => {
    try {
        const { data: items, error } = await supabase
            .from('items')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ items: items || [] });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// Create a new item
router.post('/', requireAuth, async (req, res) => {
    try {
        const itemData = {
            ...req.body,
            user_id: req.user.id,
            created_at: new Date().toISOString()
        };

        const { data: item, error } = await supabase
            .from('items')
            .insert([itemData])
            .select()
            .single();

        if (error) throw error;

        res.json({ item });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: 'Failed to create item' });
    }
});

// Get single item
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const { data: item, error } = await supabase
            .from('items')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (error) throw error;
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({ item });
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});

export default router;
