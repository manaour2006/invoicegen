import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../server/middleware/auth.js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Get next invoice number
router.get('/next-number', requireAuth, async (req, res) => {
  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextNumber = 1;
    if (invoices && invoices.length > 0) {
      const lastNumber = invoices[0].invoice_number;
      const match = lastNumber.match(/INV-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const invoiceNumber = `INV-${String(nextNumber).padStart(3, '0')}`;
    res.json({ invoiceNumber });
  } catch (error) {
    console.error('Error generating invoice number:', error);
    res.status(500).json({ error: 'Failed to generate invoice number' });
  }
});

// Get all invoices for a user
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ invoices: invoices || [] });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Create a new invoice
router.post('/', requireAuth, async (req, res) => {
  try {
    const invoiceData = {
      ...req.body,
      user_id: req.user.id,
      created_at: new Date().toISOString()
    };

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert([invoiceData])
      .select()
      .single();

    if (error) throw error;

    res.json({ invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Get invoice PDF
router.get('/:id/pdf', requireAuth, async (req, res) => {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Generate PDF URL (you can implement PDF generation here)
    const pdfUrl = `/api/invoices/${req.params.id}/download`;
    res.json({ url: pdfUrl });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Send invoice via WhatsApp
router.post('/:id/send', requireAuth, async (req, res) => {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Update invoice status to 'Sent'
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ status: 'Sent' })
      .eq('id', req.params.id);

    if (updateError) throw updateError;

    res.json({ message: 'Invoice sent successfully' });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({ error: 'Failed to send invoice' });
  }
});

// Update invoice status (for payment confirmations)
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status, paymentReference, paymentDate, paymentAmount } = req.body;

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Update invoice with payment details
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (paymentReference) updateData.payment_reference = paymentReference;
    if (paymentDate) updateData.payment_date = paymentDate;
    if (paymentAmount) updateData.payment_amount = paymentAmount;

    const { error: updateError } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', req.params.id);

    if (updateError) throw updateError;

    res.json({ message: 'Invoice status updated successfully' });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
});

export default router;
