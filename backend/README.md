# NYE Staffing Backend API

Node.js/Express backend server for NYE Staffing platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database:
```bash
# Create database
createdb nye_staffing

# Run schema
psql nye_staffing < ../database/schema.sql
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-firebase` - Verify Firebase token
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (Admin)
- `PUT /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)

### Shifts
- `GET /api/shifts/available` - Get available shifts (Staff)
- `GET /api/shifts/my-shifts` - Get my shifts (Staff)
- `POST /api/shifts/:eventId/signup` - Sign up for shift (Staff)
- `POST /api/shifts/:eventId/withdraw` - Withdraw from shift (Staff)
- `POST /api/shifts/:eventId/approve/:userId` - Approve/reject signup (Admin)

### Attendance
- `POST /api/attendance/clock-in` - Clock in (Staff)
- `POST /api/attendance/clock-out` - Clock out (Staff)
- `GET /api/attendance/status/:eventId` - Get attendance status (Staff)
- `GET /api/attendance/my-logs` - Get my attendance logs (Staff)
- `GET /api/attendance/logs` - Get all attendance logs (Admin)
- `GET /api/attendance/report` - Get attendance report (Admin)

### Chat
- `GET /api/chat/my-rooms` - Get my chat rooms
- `GET /api/chat/rooms/event/:eventId` - Get or create event chat room
- `GET /api/chat/rooms/:roomId/messages` - Get messages
- `POST /api/chat/rooms/:roomId/messages` - Send message
- `POST /api/chat/messages/:messageId/flag` - Flag message (Admin)

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count
- `POST /api/notifications` - Create notification (Admin)

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id/status` - Update user status (Admin)
- `GET /api/users/:id/stats` - Get user statistics (Admin)

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard stats
- `GET /api/dashboard/staff` - Staff dashboard stats

## Socket.IO Events

### Client → Server
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a chat message

### Server → Client
- `new_message` - New message in room
- `new_notification` - New notification

## Environment Variables

See `.env.example` for required environment variables.
