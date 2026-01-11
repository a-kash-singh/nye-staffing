# Deploy to Render - Step by Step Guide

Render doesn't support PostgreSQL databases in Blueprints automatically. Follow these steps:

## Step 1: Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `nye-staffing-db`
   - **Database:** `nye_staffing`
   - **User:** `nye_staffing_user` (or leave default)
   - **Plan:** Free
4. Click **"Create Database"**
5. **Copy the connection details** (you'll need them in Step 2)

## Step 2: Deploy Backend

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account
4. Select repository: **`a-kash-singh/nye-staffing`**
5. Render will detect `render.yaml`
6. Click **"Apply"** to create services

## Step 3: Configure Backend Environment Variables

After the backend service is created:

1. Go to the **`nye-staffing-backend`** service
2. Click **"Environment"** tab
3. **Link the PostgreSQL database** (Recommended):
   - Click **"Link Database"** or **"Add Database"**
   - Select your `nye-staffing-db` PostgreSQL service
   - This automatically sets `DATABASE_URL` (SSL-enabled connection)

4. **Add other required variables:**

```
JWT_SECRET=<generate a strong secret or use auto-generated>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://nye-staffing-frontend.onrender.com
FIREBASE_PROJECT_ID=<your-firebase-project-id> (optional)
FIREBASE_PRIVATE_KEY=<your-firebase-private-key> (optional)
FIREBASE_CLIENT_EMAIL=<your-firebase-client-email> (optional)
```

**Alternative: Manual Database Configuration**
If you prefer to set individual DB variables instead of `DATABASE_URL`:

```
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=nye_staffing
DB_USER=nye_staffing_user
DB_PASSWORD=your_password_here
```

**To get database connection details:**
- Go to your PostgreSQL service
- Click **"Connect"** → **"Internal Database URL"** (for `DATABASE_URL`)
- Or use **"Connection Pooling"** URL for better performance
- For individual variables, parse the URL: `postgresql://user:password@host:port/database`

## Step 4: Configure Frontend Environment Variables

1. Go to the **`nye-staffing-frontend`** service
2. Click **"Environment"** tab
3. Add (if not auto-set by Blueprint):

```
BACKEND_URL=https://nye-staffing-backend.onrender.com
```

**Note:** If using Blueprint, this should be automatically set. If not, use the full backend URL (e.g., `https://nye-staffing-backend.onrender.com`).

## Step 5: Initialize Database

### Option A: Using Render Shell (Recommended)

1. Go to your **PostgreSQL service** (`nye-staffing-db`)
2. Click **"Connect"** → **"Render Shell"**
3. Run the schema:

```bash
# Connect to database
psql $DATABASE_URL

# Then run schema (copy contents of database/schema.sql)
\i /path/to/schema.sql
```

Or paste the schema SQL directly in the psql prompt.

### Option B: Using Backend Container

1. Go to your **backend service** (`nye-staffing-backend`)
2. Click **"Shell"** tab
3. Run:

```bash
# Run schema
psql $DATABASE_URL < /app/../database/schema.sql

# Or connect and paste schema
psql $DATABASE_URL
# Then paste contents of database/schema.sql
```

### Option C: Using Seed Script (Includes Schema + Data)

1. Go to your **backend service** (`nye-staffing-backend`)
2. Click **"Shell"** tab
3. Run:

```bash
# First ensure schema is applied (if not already done)
psql $DATABASE_URL < /app/../database/schema.sql

# Then run seed script
cd /app
npm run seed
```

This will create:
- ✅ Database schema (tables, indexes)
- ✅ 1 Admin user (`admin@nyestaffing.com` / `password123`)
- ✅ 8 Staff users (password: `password123`)
- ✅ 10 Events
- ✅ 14 Event signups
- ✅ 5 Attendance logs
- ✅ 6 Chat rooms
- ✅ 12 Chat messages
- ✅ 10 Notifications

## Step 6: Verify Deployment

1. **Check backend health:**
   ```bash
   curl https://nye-staffing-backend.onrender.com/health
   ```

2. **Test login with seeded admin:**
   ```bash
   curl -X POST https://nye-staffing-backend.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@nyestaffing.com",
       "password": "password123"
     }'
   ```

3. **Or create a new admin user:**
   ```bash
   curl -X POST https://nye-staffing-backend.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Admin User",
       "email": "admin@example.com",
       "password": "admin123",
       "role": "admin"
     }'
   ```

## Your Live URLs

- **Frontend:** `https://nye-staffing-frontend.onrender.com`
- **Backend:** `https://nye-staffing-backend.onrender.com`
- **Health Check:** `https://nye-staffing-backend.onrender.com/health`

## Alternative: Manual Service Creation

If Blueprint doesn't work, create services manually:

### Backend (Manual)
1. **New +** → **Web Service**
2. Connect GitHub → Select `nye-staffing` repo
3. Configure:
   - **Name:** `nye-staffing-backend`
   - **Environment:** Docker
   - **Dockerfile Path:** `backend/Dockerfile`
   - **Root Directory:** `backend`
4. Add environment variables (same as Step 3)

### Frontend (Manual)
1. **New +** → **Web Service**
2. Connect GitHub → Select `nye-staffing` repo
3. Configure:
   - **Name:** `nye-staffing-frontend`
   - **Environment:** Docker
   - **Dockerfile Path:** `frontend/Dockerfile`
   - **Root Directory:** `frontend`
4. Add environment variables (same as Step 4)

## Troubleshooting

**Backend can't connect to database?**
- ✅ **Use `DATABASE_URL`** (recommended) - Link the database in Render dashboard
- ✅ Verify database is running (status should be "Available")
- ✅ Check backend logs for connection errors
- ✅ Ensure SSL is enabled (handled automatically with `DATABASE_URL`)
- ✅ If using individual variables, verify all are set correctly:
  - `DB_HOST` = host part (e.g., `dpg-xxxxx-a.oregon-postgres.render.com`)
  - `DB_PORT` = 5432
  - `DB_NAME` = database name
  - `DB_USER` = user part
  - `DB_PASSWORD` = password part

**SSL Connection Errors?**
- The code automatically handles SSL for production environments
- If you see SSL errors, ensure `DATABASE_URL` is set (includes SSL by default)
- Or verify `NODE_ENV=production` is set

**Frontend shows API errors?**
- Verify `BACKEND_URL` is set correctly (should be `https://nye-staffing-backend.onrender.com`)
- Check `CORS_ORIGIN` in backend includes frontend URL (`https://nye-staffing-frontend.onrender.com`)
- Ensure backend service is running and healthy
- Check browser console for CORS errors

**Seed script fails?**
- Ensure database schema is applied first: `psql $DATABASE_URL < database/schema.sql`
- Check that `DATABASE_URL` or DB variables are set correctly
- Verify you're running from the backend container shell: `cd /app && npm run seed`

**Database connection string format:**
```
postgresql://user:password@host:port/database?sslmode=require
```

**Render PostgreSQL Notes:**
- Render PostgreSQL requires SSL connections
- Use `DATABASE_URL` for automatic SSL configuration
- Internal connections are faster than external
- Connection pooling is recommended for production
