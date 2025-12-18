# Database Setup Guide

Follow these steps to connect your invoice application to Supabase.

## Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or use an existing one
3. Wait for the project to finish setting up

## Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `database/schema.sql`
4. Paste into the SQL editor
5. Click **Run** to create all tables, indexes, and policies

## Step 3: Create a Test User (Optional but Recommended)

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add User**
3. Create a test user with email and password
4. Copy the user ID (you'll need this for testing)

## Step 4: Configure Environment Variables

### Backend (.env)

1. In the project root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   PORT=4000
   ```

3. Find your credentials in Supabase:
   - Go to **Settings** → **API**
   - Copy **Project URL** → paste as `SUPABASE_URL`
   - Copy **anon public** key → paste as `SUPABASE_ANON_KEY`

### Frontend (frontend/.env)

1. In the `frontend` folder, copy `.env.example` to `.env`:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `frontend/.env` with the same credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_API_URL=http://localhost:4000/api
   ```

## Step 5: Start the Backend Server

1. Install backend dependencies (if not already done):
   ```bash
   npm install
   ```

2. Start the backend server:
   ```bash
   node index.js
   ```

3. You should see: `Server running on http://localhost:4000`

## Step 6: Test the Connection

The frontend is already running. Now test the features:

1. **Dashboard**: Should load analytics from the database
2. **Create Invoice**: Should save to Supabase
3. **Clients**: Should fetch from database
4. **Items**: Should fetch from database

## Troubleshooting

### "Missing Authorization bearer token"

The backend requires authentication. You have two options:

**Option A: Bypass Auth for Development**
1. Edit `server/middleware/auth.js`
2. Add at the top of the `requireAuth` function:
   ```javascript
   if (process.env.DEV_MODE === 'true') {
     req.user = { id: 'dev-user-id' };
     return next();
   }
   ```
3. Set `DEV_MODE=true` in your `.env`

**Option B: Implement Proper Auth**
1. Use Supabase Auth in the frontend
2. Store the auth token in localStorage
3. Include it in API requests

### "Connection refused" or "Failed to fetch"

- Make sure the backend server is running on port 4000
- Check that `VITE_API_URL` in frontend/.env is correct
- Verify CORS is enabled in the backend (it already is)

### "Row Level Security policy violation"

- Make sure you're logged in with a valid Supabase user
- OR bypass auth as described above
- Check that the user_id in your requests matches a real user

## Current Status

✅ Database schema created  
✅ Environment templates created  
✅ Frontend API service updated to use backend  
✅ Backend routes already configured for Supabase  
⏳ Waiting for you to add Supabase credentials  

## Next Steps

1. Add your Supabase credentials to `.env` files
2. Start the backend server
3. Test all features
4. Everything should work with the real database!

The app will automatically fall back to localStorage if the API is unavailable, so you can still use it while setting up.
