# Quick Deploy to Render - 5 Minutes

The fastest way to get your NYE Staffing platform live for demo.

## Prerequisites ✅
- ✅ Code is on GitHub (already done: https://github.com/a-kash-singh/nye-staffing)
- ✅ Render account (sign up free at https://render.com)

## Deploy in 5 Steps

### 1. Sign up for Render
Go to https://render.com and sign up (free, no credit card needed)

### 2. Create Blueprint
1. Click **"New +"** → **"Blueprint"**
2. Connect your GitHub account
3. Select repository: **`a-kash-singh/nye-staffing`**
4. Render will auto-detect `render.yaml`
5. Click **"Apply"**

### 3. Wait for Deployment
- Render will create 3 services:
  - PostgreSQL database
  - Backend API
  - Frontend web app
- Takes about 5-10 minutes
- You'll see progress in the dashboard

### 4. Initialize Database
Once database is ready:

1. Go to your PostgreSQL service
2. Click "Connect" → "External Connection"
3. Copy the connection string
4. Run the schema:
   ```bash
   psql "your-connection-string" < database/schema.sql
   ```
   
   Or use Render's database dashboard:
   - Go to PostgreSQL service
   - Click "Connect" → "Open in Render Shell"
   - Run: `psql $DATABASE_URL < /path/to/schema.sql`

### 5. Configure & Test

**Set CORS in Backend:**
1. Go to `nye-staffing-backend` service
2. Environment → Add:
   - `CORS_ORIGIN`: `https://nye-staffing-frontend.onrender.com`

**Create Admin User:**
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

After deployment:
- **Frontend:** `https://nye-staffing-frontend.onrender.com`
- **Backend API:** `https://nye-staffing-backend.onrender.com`
- **Health Check:** `https://nye-staffing-backend.onrender.com/health`

## Login Credentials

After creating admin user:
- **Email:** `admin@example.com`
- **Password:** `admin123`

## Important Notes

⚠️ **Free Tier Limitations:**
- Services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- Perfect for demos and testing

💡 **Tips:**
- Keep a browser tab open to prevent sleeping
- Use Render's "Manual Deploy" to wake services
- For always-on, consider Railway or Fly.io

## Troubleshooting

**Backend won't start?**
- Check environment variables are set
- Verify database connection
- Check logs in Render dashboard

**Frontend shows errors?**
- Verify `CORS_ORIGIN` is set correctly
- Check backend URL in frontend config
- Ensure backend service is running

**Database connection failed?**
- Wait for database to fully initialize (2-3 minutes)
- Verify all DB env vars are set
- Check database service status

## Alternative: Manual Deployment

If Blueprint doesn't work, see `DEPLOY.md` for manual step-by-step instructions.

## Next Steps

1. ✅ Deploy to Render
2. ✅ Test the application
3. ✅ Share demo URL
4. 🎉 Done!

---

**Need help?** Check `DEPLOY.md` for detailed instructions and other hosting options.
