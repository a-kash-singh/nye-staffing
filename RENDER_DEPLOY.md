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
3. Add/Update these variables:

```
DB_HOST=<from your PostgreSQL service - Internal Database URL>
DB_PORT=5432
DB_NAME=nye_staffing
DB_USER=<from your PostgreSQL service>
DB_PASSWORD=<from your PostgreSQL service>
JWT_SECRET=<generate a strong secret>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://nye-staffing-frontend.onrender.com
```

**To get database connection details:**
- Go to your PostgreSQL service
- Click **"Connect"** → **"Internal Database URL"**
- Parse the URL: `postgresql://user:password@host:port/database`

## Step 4: Configure Frontend Environment Variables

1. Go to the **`nye-staffing-frontend`** service
2. Click **"Environment"** tab
3. Add:

```
BACKEND_URL=https://nye-staffing-backend.onrender.com
```

## Step 5: Initialize Database

1. Go to your PostgreSQL service
2. Click **"Connect"** → **"Connect via psql"** (or use Render Shell)
3. Copy the connection command
4. Run the schema:

```bash
# In Render Shell or your terminal
psql <connection-string> < database/schema.sql
```

Or manually:
1. Go to PostgreSQL service → **"Connect"** → **"Render Shell"**
2. Run: `psql $DATABASE_URL`
3. Copy and paste contents of `database/schema.sql`

## Step 6: Create Admin User

Once backend is deployed and database is initialized:

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
- Verify all DB environment variables are set correctly
- Use the **Internal Database URL** from PostgreSQL service
- Check database is running (status should be "Available")

**Frontend shows API errors?**
- Verify `BACKEND_URL` is set correctly
- Check `CORS_ORIGIN` in backend includes frontend URL
- Ensure backend service is running

**Database connection string format:**
```
postgresql://user:password@host:port/database
```

Extract:
- `DB_HOST` = host part
- `DB_PORT` = port (usually 5432)
- `DB_NAME` = database name
- `DB_USER` = user part
- `DB_PASSWORD` = password part
