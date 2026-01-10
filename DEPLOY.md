# Deployment Guide - NYE Staffing Platform

This guide covers deploying the NYE Staffing platform to free hosting services.

## Option 1: Render (Recommended - Easiest)

Render offers free PostgreSQL and web services, perfect for demos.

### Prerequisites
- GitHub account (code already pushed)
- Render account (sign up at https://render.com)

### Steps

1. **Connect GitHub to Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub account
   - Select the `nye-staffing` repository

2. **Deploy using Blueprint:**
   - Render will detect `render.yaml`
   - Click "Apply" to create all services
   - Wait for deployment (5-10 minutes)

3. **Configure Environment Variables:**
   After deployment, go to each service and add:
   
   **Backend Service:**
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://nye-staffing-frontend.onrender.com`)
   - `JWT_SECRET`: Generate a strong secret (or use Render's generated one)
   
   **Frontend Service:**
   - Update `nginx.conf` to use the backend URL (or set via environment)

4. **Initialize Database:**
   - Go to your PostgreSQL service
   - Copy connection string
   - Run the schema:
   ```bash
   psql <connection_string> < database/schema.sql
   ```
   Or use Render's database dashboard to run the SQL.

5. **Access Your App:**
   - Frontend: `https://nye-staffing-frontend.onrender.com`
   - Backend: `https://nye-staffing-backend.onrender.com`

### Manual Deployment (Alternative)

If Blueprint doesn't work:

1. **Create PostgreSQL Database:**
   - New → PostgreSQL
   - Name: `nye-staffing-db`
   - Plan: Free
   - Copy connection details

2. **Deploy Backend:**
   - New → Web Service
   - Connect GitHub repo
   - Name: `nye-staffing-backend`
   - Environment: Docker
   - Dockerfile Path: `backend/Dockerfile`
   - Root Directory: `backend`
   - Add environment variables (see below)

3. **Deploy Frontend:**
   - New → Web Service
   - Connect GitHub repo
   - Name: `nye-staffing-frontend`
   - Environment: Docker
   - Dockerfile Path: `frontend/Dockerfile`
   - Root Directory: `frontend`

### Environment Variables for Backend

```
NODE_ENV=production
PORT=10000
DB_HOST=<from database>
DB_PORT=<from database>
DB_NAME=<from database>
DB_USER=<from database>
DB_PASSWORD=<from database>
JWT_SECRET=<generate strong secret>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://nye-staffing-frontend.onrender.com
```

## Option 2: Railway

Railway offers $5 free credit monthly, great for demos.

### Steps

1. **Sign up:** https://railway.app
2. **Create new project** from GitHub repo
3. **Add PostgreSQL:**
   - Click "+ New" → "Database" → "PostgreSQL"
4. **Deploy Backend:**
   - Click "+ New" → "GitHub Repo"
   - Select `backend` folder
   - Add environment variables
5. **Deploy Frontend:**
   - Click "+ New" → "GitHub Repo"
   - Select `frontend` folder

### Railway Environment Variables

Same as Render, but Railway auto-generates database connection variables.

## Option 3: Fly.io

Fly.io offers free tier with 3 shared VMs.

### Steps

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Deploy Database:**
   ```bash
   fly postgres create --name nye-staffing-db
   ```

4. **Deploy Backend:**
   ```bash
   cd backend
   fly launch --name nye-staffing-backend
   ```

5. **Deploy Frontend:**
   ```bash
   cd frontend
   fly launch --name nye-staffing-frontend
   ```

## Option 4: Vercel (Frontend) + Render (Backend)

Best performance option - Vercel for frontend, Render for backend.

### Frontend on Vercel

1. **Sign up:** https://vercel.com
2. **Import GitHub repo**
3. **Configure:**
   - Framework Preset: Other
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `cd frontend && npm install`

4. **Environment Variables:**
   - `VITE_API_URL`: Your Render backend URL

### Backend on Render

Follow Render steps above.

## Post-Deployment Steps

### 1. Create Admin User

After deployment, create an admin user:

```bash
curl -X POST https://your-backend-url.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### 2. Test the Deployment

- Frontend: Should load the login page
- Backend Health: `https://your-backend-url.onrender.com/health`
- API Test: Try registering a user

### 3. Update CORS

Make sure `CORS_ORIGIN` in backend includes your frontend URL.

## Free Tier Limitations

### Render
- Web services sleep after 15 minutes of inactivity
- PostgreSQL: 90 days retention, 1GB storage
- Perfect for demos and testing

### Railway
- $5 free credit monthly
- Services may sleep after inactivity
- Good for active demos

### Fly.io
- 3 shared VMs free
- No sleep (always on)
- Best for always-available demos

## Troubleshooting

### Backend won't start
- Check environment variables
- Verify database connection
- Check logs in Render dashboard

### Frontend can't connect to backend
- Verify `CORS_ORIGIN` includes frontend URL
- Check backend URL in frontend config
- Ensure backend is running

### Database connection issues
- Verify all DB environment variables
- Check database is running
- Test connection from Render shell

## Quick Deploy Script

For Render, you can also use this one-click approach:

1. Fork/clone the repo
2. Go to https://render.com
3. Click "New +" → "Blueprint"
4. Connect GitHub and select repo
5. Click "Apply"

That's it! Render will handle everything.

## Notes

- Free tiers have limitations (sleeping services, limited resources)
- For production, consider paid plans
- Always use strong `JWT_SECRET` in production
- Database backups are important (free tiers have limited retention)
