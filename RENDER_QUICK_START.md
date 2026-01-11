# Render Quick Start - Admin Login

## Admin Credentials (After Seeding)

**Email:** `admin@nyestaffing.com`  
**Password:** `password123`

## Quick Setup Steps

### 1. Initialize Database & Seed Data

Go to your **backend service** → **Shell** tab and run:

```bash
# Apply database schema
psql $DATABASE_URL < /app/../database/schema.sql

# Seed with dummy data (includes admin user)
cd /app
npm run seed
```

### 2. Login

Go to your frontend URL: `https://nye-staffing-frontend.onrender.com`

Login with:
- **Email:** `admin@nyestaffing.com`
- **Password:** `password123`

## What Gets Created by Seed Script

- ✅ 1 Admin user (`admin@nyestaffing.com` / `password123`)
- ✅ 8 Staff users (all passwords: `password123`)
- ✅ 10 Events (upcoming, active, completed)
- ✅ 14 Event signups
- ✅ 5 Attendance logs
- ✅ 6 Chat rooms
- ✅ 12 Chat messages
- ✅ 10 Notifications

## Staff User Examples

You can also login as staff:
- `john.smith@example.com` / `password123`
- `sarah.johnson@example.com` / `password123`
- `michael.brown@example.com` / `password123`
- (and 5 more...)

## Troubleshooting

**Can't login?**
- Make sure you ran the seed script
- Check backend is running: `https://nye-staffing-backend.onrender.com/health`
- Verify database is connected (check backend logs)

**Need to create admin manually?**
```bash
curl -X POST https://nye-staffing-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@nyestaffing.com",
    "password": "password123",
    "role": "admin"
  }'
```
