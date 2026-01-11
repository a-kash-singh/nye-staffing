# Render Deployment Troubleshooting

## Database Connection Issues

### Issue: "Database is unavailable - sleeping"

This means the backend can't connect to PostgreSQL. Here's how to fix it:

### Solution 1: Link Database (Recommended)

1. Go to your **backend service** (`nye-staffing-backend`)
2. Click **"Environment"** tab
3. Scroll down to **"Linked Databases"** section
4. Click **"Link Database"**
5. Select your PostgreSQL database (`nye-staffing-db`)
6. This automatically sets `DATABASE_URL` with SSL

### Solution 2: Set DATABASE_URL Manually

1. Go to your **PostgreSQL service** (`nye-staffing-db`)
2. Click **"Connect"** → **"Internal Database URL"**
3. Copy the connection string (looks like: `postgresql://user:pass@host:port/dbname`)
4. Go to **backend service** → **"Environment"**
5. Add/Update:
   ```
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   ```

### Solution 3: Set Individual DB Variables

If you prefer individual variables:

1. Go to your **PostgreSQL service**
2. Click **"Connect"** → Parse the connection string
3. Go to **backend service** → **"Environment"**
4. Add:
   ```
   DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
   DB_PORT=5432
   DB_NAME=nye_staffing_w8gd
   DB_USER=nye_staffing_user
   DB_PASSWORD=your_password_here
   ```

### Verify Database Connection

After setting variables, check backend logs. You should see:
- ✅ "Database is ready!" (if health check passes)
- Or the app will start anyway and connect on first request

### Test Connection from Shell

1. Go to **backend service** → **"Shell"**
2. Run:
   ```bash
   # Test with DATABASE_URL
   node -e "const {Pool}=require('pg');const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});p.query('SELECT 1').then(()=>console.log('✅ Connected!')).catch(e=>console.error('❌ Error:',e.message)).finally(()=>p.end())"
   ```

### Common Issues

**"No database configuration found"**
- `DATABASE_URL` or `DB_HOST` is not set
- Link the database or set environment variables

**"Connection timeout"**
- Database might still be starting (wait 1-2 minutes)
- Check database service status is "Available"

**"SSL required"**
- Make sure you're using `DATABASE_URL` (includes SSL)
- Or set `NODE_ENV=production` for automatic SSL

**"Authentication failed"**
- Check `DB_PASSWORD` is correct
- Verify `DB_USER` matches database user

## After Fixing Connection

Once the backend connects successfully:

1. **Initialize database schema:**
   ```bash
   # In backend Shell
   psql $DATABASE_URL < /app/../database/schema.sql
   ```

2. **Seed with dummy data:**
   ```bash
   cd /app
   npm run seed
   ```

3. **Test login:**
   - Go to frontend: `https://nye-staffing-frontend.onrender.com`
   - Login: `admin@nyestaffing.com` / `password123`
