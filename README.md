# NYE Staffing Platform

A comprehensive event staffing management platform with mobile app, web admin panel, and backend API.

## Quick Start with Docker

The easiest way to run the platform is using Docker Compose:

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your configuration (especially JWT_SECRET and DB_PASSWORD)

# 3. Start all services
docker compose up -d

# 4. Access the application
# Frontend: http://localhost
# Backend API: http://localhost:3000
```

For detailed Docker instructions, see [DOCKER.md](./DOCKER.md)

## Project Structure

```
nye-staffing/
├── backend/          # Node.js/Express API server
├── frontend/         # React.js Admin Panel
├── mobile/           # React Native Mobile App
├── database/         # PostgreSQL schema and migrations
└── docs/             # Documentation
```

## Features

- **Authentication**: Email/Password, Google, Apple Sign-In via Firebase
- **Event Management**: Create, edit, assign events and shifts
- **Shift Sign-Up**: Staff can browse and apply for shifts
- **Attendance Tracking**: GPS-based clock in/out with real-time status
- **Real-Time Chat**: Event-specific chat rooms with Socket.IO
- **Notifications**: Push notifications via Firebase Cloud Messaging
- **Reports & Analytics**: Attendance and staffing reports with export

## Tech Stack

- **Backend**: Node.js, Express.js, PostgreSQL
- **Frontend**: React.js, Material-UI
- **Mobile**: React Native
- **Auth**: Firebase Authentication
- **Real-Time**: Socket.IO
- **Notifications**: Firebase Cloud Messaging
- **Hosting**: Docker, Docker Compose

## Manual Setup (Without Docker)

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
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Documentation

- [Docker Setup Guide](./DOCKER.md) - Complete Docker instructions
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Feature overview
- [Setup Guide](./SETUP.md) - Manual setup instructions

## API Documentation

See `backend/README.md` for complete API endpoint documentation.
