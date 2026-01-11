const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Support DATABASE_URL (Render provides this) or individual variables
let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
} else {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'nye_staffing',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' && process.env.DB_HOST && !process.env.DB_HOST.includes('localhost')
      ? { rejectUnauthorized: false }
      : false,
  });
}

const ADMIN_ID = '00000000-0000-0000-0000-000000000001';
const STAFF_IDS = [
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000008',
];

const STAFF_USERS = [
  { id: STAFF_IDS[0], name: 'John Smith', email: 'john.smith@example.com', phone: '+1-555-0101' },
  { id: STAFF_IDS[1], name: 'Sarah Johnson', email: 'sarah.johnson@example.com', phone: '+1-555-0102' },
  { id: STAFF_IDS[2], name: 'Michael Brown', email: 'michael.brown@example.com', phone: '+1-555-0103' },
  { id: STAFF_IDS[3], name: 'Emily Davis', email: 'emily.davis@example.com', phone: '+1-555-0104' },
  { id: STAFF_IDS[4], name: 'David Wilson', email: 'david.wilson@example.com', phone: '+1-555-0105' },
  { id: STAFF_IDS[5], name: 'Jessica Martinez', email: 'jessica.martinez@example.com', phone: '+1-555-0106' },
  { id: STAFF_IDS[6], name: 'Robert Taylor', email: 'robert.taylor@example.com', phone: '+1-555-0107' },
  { id: STAFF_IDS[7], name: 'Amanda Anderson', email: 'amanda.anderson@example.com', phone: '+1-555-0108' },
];

const EVENTS = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    title: 'New Year Eve Gala 2025',
    description: 'Exclusive New Year celebration event at the Grand Ballroom. Formal attire required.',
    date: '2025-12-31',
    start_time: '20:00:00',
    end_time: '02:00:00',
    location: 'Grand Ballroom, Downtown Hotel',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    requirements: 'Formal attire, excellent customer service skills',
    max_staff: 15,
    status: 'upcoming',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    title: 'Corporate Conference Setup',
    description: 'Setup and support for annual corporate conference',
    date: '2025-01-15',
    start_time: '08:00:00',
    end_time: '18:00:00',
    location: 'Convention Center, Business District',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    requirements: 'Physical work, lifting required',
    max_staff: 10,
    status: 'upcoming',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    title: 'Music Festival - Day 1',
    description: 'Large outdoor music festival, multiple stages',
    date: '2025-01-20',
    start_time: '12:00:00',
    end_time: '23:00:00',
    location: 'Central Park, Main Stage',
    coordinates: { lat: 40.7829, lng: -73.9654 },
    requirements: 'Outdoor work, weather appropriate clothing',
    max_staff: 25,
    status: 'upcoming',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    title: 'Wedding Reception',
    description: 'Elegant wedding reception with 200+ guests',
    date: '2025-01-25',
    start_time: '17:00:00',
    end_time: '23:00:00',
    location: 'Garden Venue, Riverside',
    coordinates: { lat: 40.7489, lng: -73.9680 },
    requirements: 'Professional appearance, serving experience preferred',
    max_staff: 12,
    status: 'upcoming',
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    title: 'Product Launch Event',
    description: 'Tech product launch with media and VIP guests',
    date: '2025-02-01',
    start_time: '18:00:00',
    end_time: '22:00:00',
    location: 'Tech Hub, Innovation Center',
    coordinates: { lat: 40.7505, lng: -73.9934 },
    requirements: 'Tech-savvy, professional demeanor',
    max_staff: 8,
    status: 'upcoming',
  },
  {
    id: '20000000-0000-0000-0000-000000000006',
    title: 'Charity Fundraiser',
    description: 'Annual charity gala and auction',
    date: '2025-02-10',
    start_time: '19:00:00',
    end_time: '01:00:00',
    location: 'Luxury Hotel, Rooftop',
    coordinates: { lat: 40.7614, lng: -73.9776 },
    requirements: 'Formal attire, auction support experience',
    max_staff: 20,
    status: 'upcoming',
  },
  {
    id: '20000000-0000-0000-0000-000000000007',
    title: 'Sports Event - VIP Section',
    description: 'VIP hospitality for major sports event',
    date: '2025-02-15',
    start_time: '14:00:00',
    end_time: '20:00:00',
    location: 'Stadium, VIP Lounge',
    coordinates: { lat: 40.7505, lng: -73.9934 },
    requirements: 'Sports knowledge helpful, customer service',
    max_staff: 15,
    status: 'upcoming',
  },
  {
    id: '20000000-0000-0000-0000-000000000008',
    title: 'Art Gallery Opening',
    description: 'Exclusive art gallery opening night',
    date: '2025-02-20',
    start_time: '18:00:00',
    end_time: '22:00:00',
    location: 'Modern Art Gallery, SoHo',
    coordinates: { lat: 40.7231, lng: -74.0026 },
    requirements: 'Art appreciation, elegant presentation',
    max_staff: 6,
    status: 'upcoming',
  },
  {
    id: '20000000-0000-0000-0000-000000000009',
    title: 'Holiday Party - Completed',
    description: 'Company holiday party',
    date: '2024-12-20',
    start_time: '18:00:00',
    end_time: '23:00:00',
    location: 'Event Hall, Midtown',
    coordinates: { lat: 40.7549, lng: -73.9840 },
    requirements: 'Festive attire, party atmosphere',
    max_staff: 10,
    status: 'completed',
  },
  {
    id: '20000000-0000-0000-0000-000000000010',
    title: 'Active Event - In Progress',
    description: 'Currently ongoing event',
    date: '2025-01-10',
    start_time: '10:00:00',
    end_time: '18:00:00',
    location: 'Exhibition Center',
    coordinates: { lat: 40.7580, lng: -73.9855 },
    requirements: 'Active support needed',
    max_staff: 8,
    status: 'active',
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Hash password for all users
    const passwordHash = await bcrypt.hash('password123', 10);

    // Insert Admin User
    console.log('👤 Creating admin user...');
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [ADMIN_ID, 'Admin User', 'admin@nyestaffing.com', passwordHash, 'admin', 'active']
    );

    // Insert Staff Users
    console.log('👥 Creating staff users...');
    for (const staff of STAFF_USERS) {
      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, role, status, phone_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO NOTHING`,
        [staff.id, staff.name, staff.email, passwordHash, 'staff', 'active', staff.phone]
      );
    }

    // Insert Events
    console.log('📅 Creating events...');
    for (const event of EVENTS) {
      const coordStr = event.coordinates
        ? `(${event.coordinates.lat},${event.coordinates.lng})`
        : null;

      await pool.query(
        `INSERT INTO events (id, title, description, date, start_time, end_time, location, location_coordinates, requirements, max_staff, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT DO NOTHING`,
        [
          event.id,
          event.title,
          event.description,
          event.date,
          event.start_time,
          event.end_time,
          event.location,
          coordStr,
          event.requirements,
          event.max_staff,
          event.status,
          ADMIN_ID,
        ]
      );
    }

    // Insert Event Signups
    console.log('✍️  Creating event signups...');
    const signups = [
      { eventId: EVENTS[0].id, userId: STAFF_IDS[0], status: 'approved', daysAgo: 5 },
      { eventId: EVENTS[0].id, userId: STAFF_IDS[1], status: 'approved', daysAgo: 5 },
      { eventId: EVENTS[0].id, userId: STAFF_IDS[2], status: 'approved', daysAgo: 4 },
      { eventId: EVENTS[1].id, userId: STAFF_IDS[3], status: 'approved', daysAgo: 3 },
      { eventId: EVENTS[1].id, userId: STAFF_IDS[4], status: 'approved', daysAgo: 3 },
      { eventId: EVENTS[2].id, userId: STAFF_IDS[0], status: 'approved', daysAgo: 2 },
      { eventId: EVENTS[2].id, userId: STAFF_IDS[5], status: 'approved', daysAgo: 2 },
      { eventId: EVENTS[3].id, userId: STAFF_IDS[6], status: 'approved', daysAgo: 1 },
      { eventId: EVENTS[3].id, userId: STAFF_IDS[7], status: 'approved', daysAgo: 1 },
      { eventId: EVENTS[4].id, userId: STAFF_IDS[1], status: 'pending', daysAgo: 0 },
      { eventId: EVENTS[4].id, userId: STAFF_IDS[2], status: 'pending', daysAgo: 0 },
      { eventId: EVENTS[5].id, userId: STAFF_IDS[3], status: 'pending', daysAgo: 0 },
      { eventId: EVENTS[9].id, userId: STAFF_IDS[0], status: 'approved', daysAgo: 1 },
      { eventId: EVENTS[9].id, userId: STAFF_IDS[4], status: 'approved', daysAgo: 1 },
    ];

    for (const signup of signups) {
      const appliedAt = new Date();
      appliedAt.setDate(appliedAt.getDate() - signup.daysAgo);
      appliedAt.setHours(10, 0, 0, 0);

      let approvedAt = null;
      let approvedBy = null;
      if (signup.status === 'approved') {
        approvedAt = new Date(appliedAt);
        approvedAt.setDate(approvedAt.getDate() + 1);
        approvedBy = ADMIN_ID;
      }

      await pool.query(
        `INSERT INTO event_signup (id, event_id, user_id, status, applied_at, approved_at, approved_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [uuidv4(), signup.eventId, signup.userId, signup.status, appliedAt, approvedAt, approvedBy]
      );
    }

    // Insert Attendance Logs
    console.log('⏰ Creating attendance logs...');
    const attendanceLogs = [
      {
        userId: STAFF_IDS[0],
        eventId: EVENTS[8].id,
        clockIn: '2024-12-20 17:55:00',
        clockOut: '2024-12-20 23:10:00',
        status: 'off_duty',
        isLate: false,
        isEarly: false,
      },
      {
        userId: STAFF_IDS[1],
        eventId: EVENTS[8].id,
        clockIn: '2024-12-20 17:50:00',
        clockOut: '2024-12-20 23:00:00',
        status: 'off_duty',
        isLate: false,
        isEarly: false,
      },
      {
        userId: STAFF_IDS[2],
        eventId: EVENTS[8].id,
        clockIn: '2024-12-20 18:05:00',
        clockOut: '2024-12-20 23:15:00',
        status: 'off_duty',
        isLate: false,
        isEarly: false,
      },
      {
        userId: STAFF_IDS[0],
        eventId: EVENTS[9].id,
        clockIn: '2025-01-10 09:55:00',
        clockOut: null,
        status: 'on_duty',
        isLate: false,
        isEarly: null,
      },
      {
        userId: STAFF_IDS[4],
        eventId: EVENTS[9].id,
        clockIn: '2025-01-10 10:02:00',
        clockOut: null,
        status: 'on_duty',
        isLate: false,
        isEarly: null,
      },
    ];

    for (const log of attendanceLogs) {
      const clockInLoc = log.eventId === EVENTS[8].id
        ? '(40.7549,-73.9840)'
        : '(40.7580,-73.9855)';
      const clockOutLoc = log.clockOut ? clockInLoc : null;

      await pool.query(
        `INSERT INTO attendance_log (id, user_id, event_id, clock_in, clock_out, clock_in_location, clock_out_location, status, is_late, is_early_clockout)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT DO NOTHING`,
        [
          uuidv4(),
          log.userId,
          log.eventId,
          log.clockIn,
          log.clockOut,
          clockInLoc,
          clockOutLoc,
          log.status,
          log.isLate,
          log.isEarly,
        ]
      );
    }

    // Insert Chat Rooms
    console.log('💬 Creating chat rooms...');
    const chatRooms = [];
    for (const event of EVENTS.slice(0, 5).concat([EVENTS[9]])) {
      const result = await pool.query(
        `INSERT INTO chat_rooms (id, event_id, name, type)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [uuidv4(), event.id, event.title, 'event']
      );
      if (result.rows.length > 0) {
        chatRooms.push({ roomId: result.rows[0].id, eventId: event.id });
      }
    }

    // Insert Chat Messages
    console.log('📨 Creating chat messages...');
    const messages = [
      {
        roomEventId: EVENTS[0].id,
        userId: STAFF_IDS[0],
        message: 'Hey everyone! Looking forward to working with you all at the gala!',
        hoursAgo: 72,
      },
      {
        roomEventId: EVENTS[0].id,
        userId: STAFF_IDS[1],
        message: 'Same here! What time should we arrive?',
        hoursAgo: 70,
      },
      {
        roomEventId: EVENTS[0].id,
        userId: ADMIN_ID,
        message: 'Please arrive by 7:30 PM for briefing. Dress code is formal.',
        hoursAgo: 69,
      },
      {
        roomEventId: EVENTS[0].id,
        userId: STAFF_IDS[2],
        message: 'Got it! Will parking be available?',
        hoursAgo: 48,
      },
      {
        roomEventId: EVENTS[0].id,
        userId: ADMIN_ID,
        message: 'Yes, valet parking is provided. Just mention you are staff.',
        hoursAgo: 47,
      },
      {
        roomEventId: EVENTS[1].id,
        userId: STAFF_IDS[3],
        message: 'What equipment will we be setting up?',
        hoursAgo: 48,
      },
      {
        roomEventId: EVENTS[1].id,
        userId: ADMIN_ID,
        message: 'Mainly tables, chairs, AV equipment, and signage. Setup guide will be shared.',
        hoursAgo: 47.5,
      },
      {
        roomEventId: EVENTS[1].id,
        userId: STAFF_IDS[4],
        message: 'Sounds good! I have experience with AV setup.',
        hoursAgo: 24,
      },
      {
        roomEventId: EVENTS[9].id,
        userId: STAFF_IDS[0],
        message: 'Good morning team! Ready for today?',
        hoursAgo: 2,
      },
      {
        roomEventId: EVENTS[9].id,
        userId: STAFF_IDS[4],
        message: 'Morning! Already clocked in and ready to go.',
        hoursAgo: 1.25,
      },
      {
        roomEventId: EVENTS[9].id,
        userId: ADMIN_ID,
        message: 'Great! Please check the VIP section first, then move to general areas.',
        hoursAgo: 1.5,
      },
      {
        roomEventId: EVENTS[9].id,
        userId: STAFF_IDS[0],
        message: 'Will do! VIP section looks good so far.',
        hoursAgo: 0.5,
      },
    ];

    for (const msg of messages) {
      const room = chatRooms.find((r) => r.eventId === msg.roomEventId);
      if (room) {
        const createdAt = new Date();
        createdAt.setHours(createdAt.getHours() - msg.hoursAgo);

        await pool.query(
          `INSERT INTO chat_messages (id, chat_room_id, user_id, message, created_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [uuidv4(), room.roomId, msg.userId, msg.message, createdAt]
        );
      }
    }

    // Insert Notifications
    console.log('🔔 Creating notifications...');
    const notifications = [
      {
        userId: STAFF_IDS[0],
        type: 'shift_approval',
        title: 'Shift Approved',
        message: 'Your signup for "New Year Eve Gala 2025" has been approved',
        eventId: EVENTS[0].id,
        isRead: false,
        daysAgo: 4,
      },
      {
        userId: STAFF_IDS[0],
        type: 'event_reminder',
        title: 'Event Reminder',
        message: 'Reminder: "New Year Eve Gala 2025" is coming up in 3 weeks',
        eventId: EVENTS[0].id,
        isRead: false,
        daysAgo: 1,
      },
      {
        userId: STAFF_IDS[1],
        type: 'shift_approval',
        title: 'Shift Approved',
        message: 'Your signup for "New Year Eve Gala 2025" has been approved',
        eventId: EVENTS[0].id,
        isRead: false,
        daysAgo: 4,
      },
      {
        userId: STAFF_IDS[2],
        type: 'chat_message',
        title: 'New Message',
        message: 'New message in "New Year Eve Gala 2025" chat',
        eventId: EVENTS[0].id,
        isRead: false,
        daysAgo: 2,
      },
      {
        userId: STAFF_IDS[3],
        type: 'shift_approval',
        title: 'Shift Approved',
        message: 'Your signup for "Corporate Conference Setup" has been approved',
        eventId: EVENTS[1].id,
        isRead: false,
        daysAgo: 2,
      },
      {
        userId: STAFF_IDS[0],
        type: 'shift_update',
        title: 'Shift Update',
        message: 'New shift available: "Music Festival - Day 1"',
        eventId: EVENTS[2].id,
        isRead: true,
        daysAgo: 3,
      },
      {
        userId: STAFF_IDS[4],
        type: 'shift_approval',
        title: 'Shift Approved',
        message: 'Your signup for "Corporate Conference Setup" has been approved',
        eventId: EVENTS[1].id,
        isRead: true,
        daysAgo: 2,
      },
      {
        userId: ADMIN_ID,
        type: 'shift_update',
        title: 'New Shift Sign-Up',
        message: 'Sarah Johnson signed up for event',
        eventId: EVENTS[4].id,
        isRead: false,
        hoursAgo: 6,
      },
      {
        userId: ADMIN_ID,
        type: 'shift_update',
        title: 'New Shift Sign-Up',
        message: 'Michael Brown signed up for event',
        eventId: EVENTS[4].id,
        isRead: false,
        hoursAgo: 4,
      },
      {
        userId: ADMIN_ID,
        type: 'attendance_alert',
        title: 'Late Clock-In',
        message: 'John Smith clocked in late for event',
        eventId: EVENTS[9].id,
        isRead: false,
        hoursAgo: 1,
      },
    ];

    for (const notif of notifications) {
      const createdAt = notif.hoursAgo
        ? new Date(Date.now() - notif.hoursAgo * 60 * 60 * 1000)
        : new Date();
      if (notif.daysAgo) {
        createdAt.setDate(createdAt.getDate() - notif.daysAgo);
      }

      await pool.query(
        `INSERT INTO notifications (id, user_id, type, title, message, related_event_id, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [
          uuidv4(),
          notif.userId,
          notif.type,
          notif.title,
          notif.message,
          notif.eventId,
          notif.isRead,
          createdAt,
        ]
      );
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  - 1 Admin user (admin@nyestaffing.com / password123)');
    console.log('  - 8 Staff users (password: password123)');
    console.log('  - 10 Events (upcoming, active, completed)');
    console.log('  - 14 Event signups (approved & pending)');
    console.log('  - 5 Attendance logs');
    console.log('  - 6 Chat rooms');
    console.log('  - 12 Chat messages');
    console.log('  - 10 Notifications');
    console.log('\n🎉 Ready for demo!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
