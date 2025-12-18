# 🚀 Quick Start Guide - Database Connection

Your invoice app is now ready to connect to Supabase! Here's what's been set up:

## ✅ What's Already Done

1. **Database Schema** - `database/schema.sql` ready to run in Supabase
2. **Backend Routes** - All API endpoints created for invoices, clients, items, expenses, analytics
3. **Frontend API Service** - Updated to connect to backend with localStorage fallback
4. **Environment Files** - Frontend `.env` created with your Supabase credentials

## 🔧 Final Steps

### Step 1: Create Backend .env File

The backend needs a `.env` file. Create it manually:

1. In the project root (`c:\Users\Manaour Azam\OneDrive\Desktop\palluinvoice`), create a file named `.env`
2. Add these lines:

```
SUPABASE_URL=https://ysbovrchxezbmchvrgal.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYm92cmNoeGV6Ym1jaHZyZ2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODY4ODMsImV4cCI6MjA4MDg2Mjg4M30.b-oLihPNF1oNtIi1OapTjatRrj2-9eUt2Eg7dOPf_Pw
PORT=4000
DEV_MODE=true
```

### Step 2: Run Database Schema in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/ysbovrchxezbmchvrgal
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `database/schema.sql` and copy ALL the content
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Step 3: Start the Backend Server

```bash
cd c:\Users\Manaour Azam\OneDrive\Desktop\palluinvoice
npm run dev
```

You should see:
```
✅ Server running on http://localhost:4000
```

### Step 4: Restart Frontend (if needed)

The frontend is already running. If you created the frontend `.env` file after it started, restart it:

1. Stop the current dev server (Ctrl+C in the terminal)
2. Start it again:
```bash
cd frontend
npm run dev
```

## 🎉 Test It Out!

1. Open http://localhost:5173 in your browser
2. Go to **Dashboard** - should show analytics
3. Go to **Create Invoice** - create a test invoice
4. Click **Send Invoice** - generates PDF and saves to database
5. Check your Supabase dashboard → **Table Editor** → **invoices** to see the saved data!

## 🔍 Troubleshooting

**Backend won't start?**
- Make sure `.env` file exists in the root directory
- Check that all environment variables are on separate lines
- No spaces around the `=` sign

**Frontend shows "Using localStorage as fallback"?**
- Backend server must be running on port 4000
- Check `frontend/.env` has `VITE_API_URL=http://localhost:4000/api`
- Restart frontend after creating `.env`

**"Row Level Security policy violation"?**
- Make sure `DEV_MODE=true` in backend `.env`
- This bypasses authentication for testing

## 📊 What Happens Now

- **Dashboard** fetches real data from Supabase
- **Create Invoice** saves to database (not just localStorage)
- **Clients & Items** persist in database
- **PDF Generation** still works client-side
- **localStorage fallback** ensures app works even if backend is down

## 🎯 Current Status

✅ Database schema ready  
✅ Backend code complete  
✅ Frontend connected  
✅ Environment configured  
⏳ Waiting for you to:
  1. Create backend `.env` file manually
  2. Run SQL schema in Supabase
  3. Start backend server

Everything is ready - just follow the 4 steps above!
