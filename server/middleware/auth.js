import { createClient } from '@supabase/supabase-js';

const supabaseAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function requireAuth(req, res, next) {
  try {
    // Development mode bypass
    if (process.env.DEV_MODE === 'true') {
      req.user = { id: 'dev-user-00000000-0000-0000-0000-000000000000' };
      return next();
    }

    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing Authorization bearer token' });
    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' });
    req.user = data.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}






