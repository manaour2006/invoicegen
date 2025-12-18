import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import invoicesRouter from './routes/invoices.js';
import analyticsRouter from './routes/analytics.js';
import clientsRouter from './routes/clients.js';
import itemsRouter from './routes/items.js';
import expensesRouter from './routes/expenses.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/invoices', invoicesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/items', itemsRouter);
app.use('/api/expenses', expensesRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});





