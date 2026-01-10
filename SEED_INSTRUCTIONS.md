# Database Seeding Instructions

## Quick Start

### Option 1: Using Docker (Easiest)

If you're running the app with Docker Compose:

```bash
# Make sure containers are running
docker compose up -d

# Run seed script inside backend container
docker compose exec backend npm run seed
```

The database connection is already configured in Docker!

### Option 2: Local Development

If running locally without Docker:

1. **Set up environment variables:**

   Create `backend/.env` file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` with your database credentials:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=nye_staffing
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   ```

3. **Make sure PostgreSQL is running and database exists:**
   ```bash
   # Create database if it doesn't exist
   createdb nye_staffing
   
   # Run schema first
   psql -U postgres -d nye_staffing -f ../database/schema.sql
   ```

4. **Install dependencies and run seed:**
   ```bash
   cd backend
   npm install
   npm run seed
   ```

### Option 3: Using SQL Script (No Dependencies Needed)

If you don't want to install Node.js dependencies:

```bash
# Make sure database exists and schema is applied
psql -U postgres -d nye_staffing -f database/schema.sql

# Run seed SQL
psql -U postgres -d nye_staffing -f database/seed.sql
```

## What Gets Created

- ✅ 1 Admin user (`admin@nyestaffing.com` / `password123`)
- ✅ 8 Staff users (all passwords: `password123`)
- ✅ 10 Events (upcoming, active, completed)
- ✅ 14 Event signups (approved & pending)
- ✅ 5 Attendance logs
- ✅ 6 Chat rooms
- ✅ 12 Chat messages
- ✅ 10 Notifications

## Login After Seeding

**Admin:**
- Email: `admin@nyestaffing.com`
- Password: `password123`

**Staff (any):**
- Email: `john.smith@example.com`
- Password: `password123`

## Troubleshooting

**"Cannot find module 'pg'"**
- Make sure you're in the `backend` directory
- Run `npm install` first

**"client password must be a string"**
- Set `DB_PASSWORD` in `backend/.env` file
- Or use Docker where it's auto-configured

**"database does not exist"**
- Create database: `createdb nye_staffing`
- Or run schema.sql first

**"connection refused"**
- Make sure PostgreSQL is running
- Check DB_HOST and DB_PORT in .env
