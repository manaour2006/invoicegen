import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../server/middleware/auth.js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Get all clients
router.get('/', requireAuth, async (req, res) => {
    try {
        const { data: clients, error } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ clients: clients || [] });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
});

// Create a new client
router.post('/', requireAuth, async (req, res) => {
    try {
        const clientData = {
            ...req.body,
            user_id: req.user.id,
            created_at: new Date().toISOString()
        };

        const { data: client, error } = await supabase
            .from('clients')
            .insert([clientData])
            .select()
            .single();

        if (error) throw error;

        res.json({ client });
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Failed to create client' });
    }
});

// Get single client
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const { data: client, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (error) throw error;
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        res.json({ client });
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ error: 'Failed to fetch client' });
    }
});

export default router;
