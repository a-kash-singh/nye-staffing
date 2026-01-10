# Database Seeding

This directory contains scripts to seed the database with dummy data for testing and demo purposes.

## Files

- `schema.sql` - Database schema (tables, indexes, triggers)
- `seed.sql` - SQL script for seeding (alternative method)
- `seed.js` - Node.js script for seeding (recommended)

## Quick Start

### Using Node.js Script (Recommended)

From the backend directory:

```bash
# Make sure dependencies are installed
cd backend
npm install

# Run seed script
npm run seed
```

Or directly:

```bash
cd backend
node database/seed.js
```

### Using SQL Script

```bash
psql -U postgres -d nye_staffing -f seed.sql
```

### Using Docker

```bash
# Run seed script in backend container
docker compose exec backend npm run seed

# Or directly
docker compose exec backend node database/seed.js

# Or using SQL
docker compose exec db psql -U postgres -d nye_staffing -f /docker-entrypoint-initdb.d/seed.sql
```

## What Gets Created

### Users
- **1 Admin User:**
  - Email: `admin@nyestaffing.com`
  - Password: `password123`
  - Role: Admin

- **8 Staff Users:**
  - John Smith, Sarah Johnson, Michael Brown, Emily Davis
  - David Wilson, Jessica Martinez, Robert Taylor, Amanda Anderson
  - All passwords: `password123`
  - All with phone numbers

### Events (10 total)
- **Upcoming Events (8):**
  - New Year Eve Gala 2025
  - Corporate Conference Setup
  - Music Festival - Day 1
  - Wedding Reception
  - Product Launch Event
  - Charity Fundraiser
  - Sports Event - VIP Section
  - Art Gallery Opening

- **Active Event (1):**
  - Active Event - In Progress

- **Completed Event (1):**
  - Holiday Party - Completed

### Event Signups (14 total)
- Approved signups for various events
- Pending signups awaiting approval
- Mix of different staff members

### Attendance Logs (5 total)
- Completed attendance for past event
- Active on-duty status for current event
- Various clock-in/out times

### Chat Rooms (6 total)
- One chat room per event
- Event-specific discussions

### Chat Messages (12 total)
- Realistic conversations in event chat rooms
- Messages from staff and admin
- Various timestamps

### Notifications (10 total)
- Shift approval notifications
- Event reminders
- Chat message notifications
- Attendance alerts
- Mix of read and unread

## Login Credentials

**Admin:**
- Email: `admin@nyestaffing.com`
- Password: `password123`

**Staff (any of the 8):**
- Email: `john.smith@example.com` (or any staff email)
- Password: `password123`

## Resetting Data

To clear and reseed:

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS nye_staffing;"
psql -U postgres -c "CREATE DATABASE nye_staffing;"

# Run schema
psql -U postgres -d nye_staffing -f schema.sql

# Run seed
node seed.js
```

## Notes

- All passwords are hashed using bcrypt
- UUIDs are used for all IDs
- Dates are set relative to current date for realistic demo
- GPS coordinates are set for New York area locations
- Chat messages have realistic timestamps
- Notifications include both read and unread items
