import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, message: 'Server is running!' }));

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`✅ Supabase URL: ${process.env.SUPABASE_URL}`);
    console.log(`✅ DEV_MODE: ${process.env.DEV_MODE}`);
});
