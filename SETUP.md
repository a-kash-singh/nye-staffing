# NYE Staffing Platform - Setup Guide

Complete setup instructions for the NYE Staffing platform.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Quick Start

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb nye_staffing

# Run schema
psql nye_staffing < database/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Start backend server
npm run dev
```

Backend will run on http://localhost:3000

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

Frontend will run on http://localhost:3001

### 4. Mobile App Setup (Optional)

```bash
cd mobile
npm install

# For iOS
cd ios && pod install && cd ..
npm run ios

# For Android
npm run android
```

## Environment Configuration

### Backend (.env)

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=nye_staffing
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

CORS_ORIGIN=http://localhost:3001,http://localhost:5173
```

## Creating First Admin User

You can create an admin user via the registration endpoint:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

## Features Implemented

✅ **Backend API**
- Authentication (JWT + Firebase support)
- Event Management
- Shift Sign-up System
- Attendance Tracking (GPS-based)
- Real-time Chat (Socket.IO)
- Notifications System
- User Management
- Dashboard Analytics

✅ **Frontend Admin Panel**
- Dashboard with statistics
- Event creation and management
- Staff management
- Attendance monitoring
- Reports and analytics
- Real-time chat interface
- Settings and profile

✅ **Database Schema**
- Complete PostgreSQL schema
- All required tables and relationships
- Indexes for performance
- Triggers for updated_at

✅ **Real-time Features**
- Socket.IO for chat
- Real-time notifications
- Live attendance status

## API Documentation

See `backend/README.md` for complete API endpoint documentation.

## Testing

### Test Backend Health
```bash
curl http://localhost:3000/health
```

### Test Authentication
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Build frontend: `cd frontend && npm run build`
3. Serve frontend build with nginx or similar
4. Use PM2 or similar for backend process management
5. Set up PostgreSQL backups
6. Configure Firebase for production
7. Set up SSL certificates

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `psql -l | grep nye_staffing`

### CORS Issues
- Update `CORS_ORIGIN` in backend `.env`
- Include all frontend URLs

### Socket.IO Connection Issues
- Verify backend is running
- Check CORS configuration
- Ensure token is included in Socket.IO auth

## Next Steps

1. Set up Firebase project for authentication and notifications
2. Configure push notifications for mobile app
3. Set up file storage (S3 or similar) for profile photos
4. Implement email notifications
5. Add comprehensive error logging
6. Set up monitoring and analytics
