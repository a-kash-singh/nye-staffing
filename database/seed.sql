-- NYE Staffing Database Seed Data
-- This script populates the database with dummy data for testing and demo

-- Insert Admin User (if not exists)
INSERT INTO users (id, name, email, password_hash, role, status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@nyestaffing.com', '$2a$10$rK8X8X8X8X8X8X8X8X8XeK8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert Staff Users
INSERT INTO users (id, name, email, password_hash, role, status, phone_number)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'John Smith', 'john.smith@example.com', '$2a$10$rK8X8X8X8X8X8X8X8X8XeK8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', 'staff', 'active', '+1-555-0101'),
  ('10000000-0000-0000-0000-000000000002', 'Sarah Johnson', 'sarah.johnson@example.com', '$2a$10$rK8X8X8X8X8X8X8X8X8XeK8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', 'staff', 'active', '+1-555-0102'),
  ('10000000-0000-0000-0000-000000000003', 'Michael Brown', 'michael.brown@example.com', '$2a$10$rK8X8X8X8X8X8X8X8X8XeK8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', 'staff', 'active', '+1-555-0103'),
  ('10000000-0000-0000-0000-000000000004', 'Emily Davis', 'emily.davis@example.com', '$2a$10$rK8X8X8X8X8X8X8X8X8XeK8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', 'staff', 'active', '+1-555-0104'),
  ('10000000-0000-0000-0000-000000000005', 'David Wilson', 'david.wilson@example.com', '$2a$10$rK8X8X8X8X8X8X8X8X8XeK8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', 'staff', 'active', '+1-555-0105'),
  ('10000000-0000-0000-0000-000000000006', 'Jessica Martinez', 'jessica.martinez@example.com', '$2a$10$rK8X8X8X8X8X8X8X8X8XeK8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', 'staff', 'active', '+1-555-0106'),
  ('10000000-0000-0000-0000-000000000007', 'Robert Taylor', 'robert.taylor@example.com', '$2a$10$rK8X8X8X8X8X8X8X8X8XeK8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', 'staff', 'active', '+1-555-0107'),
  ('10000000-0000-0000-0000-000000000008', 'Amanda Anderson', 'amanda.anderson@example.com', '$2a$10$rK8X8X8X8X8X8X8X8X8XeK8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', 'staff', 'active', '+1-555-0108')
ON CONFLICT (email) DO NOTHING;

-- Insert Events
INSERT INTO events (id, title, description, date, start_time, end_time, location, location_coordinates, requirements, max_staff, status, created_by)
VALUES 
  ('20000000-0000-0000-0000-000000000001', 'New Year Eve Gala 2025', 'Exclusive New Year celebration event at the Grand Ballroom. Formal attire required.', '2025-12-31', '20:00:00', '02:00:00', 'Grand Ballroom, Downtown Hotel', '(40.7128,-74.0060)', 'Formal attire, excellent customer service skills', 15, 'upcoming', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', 'Corporate Conference Setup', 'Setup and support for annual corporate conference', '2025-01-15', '08:00:00', '18:00:00', 'Convention Center, Business District', '(40.7589,-73.9851)', 'Physical work, lifting required', 10, 'upcoming', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', 'Music Festival - Day 1', 'Large outdoor music festival, multiple stages', '2025-01-20', '12:00:00', '23:00:00', 'Central Park, Main Stage', '(40.7829,-73.9654)', 'Outdoor work, weather appropriate clothing', 25, 'upcoming', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000004', 'Wedding Reception', 'Elegant wedding reception with 200+ guests', '2025-01-25', '17:00:00', '23:00:00', 'Garden Venue, Riverside', '(40.7489,-73.9680)', 'Professional appearance, serving experience preferred', 12, 'upcoming', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000005', 'Product Launch Event', 'Tech product launch with media and VIP guests', '2025-02-01', '18:00:00', '22:00:00', 'Tech Hub, Innovation Center', '(40.7505,-73.9934)', 'Tech-savvy, professional demeanor', 8, 'upcoming', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000006', 'Charity Fundraiser', 'Annual charity gala and auction', '2025-02-10', '19:00:00', '01:00:00', 'Luxury Hotel, Rooftop', '(40.7614,-73.9776)', 'Formal attire, auction support experience', 20, 'upcoming', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000007', 'Sports Event - VIP Section', 'VIP hospitality for major sports event', '2025-02-15', '14:00:00', '20:00:00', 'Stadium, VIP Lounge', '(40.7505,-73.9934)', 'Sports knowledge helpful, customer service', 15, 'upcoming', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000008', 'Art Gallery Opening', 'Exclusive art gallery opening night', '2025-02-20', '18:00:00', '22:00:00', 'Modern Art Gallery, SoHo', '(40.7231,-74.0026)', 'Art appreciation, elegant presentation', 6, 'upcoming', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000009', 'Holiday Party - Completed', 'Company holiday party', '2024-12-20', '18:00:00', '23:00:00', 'Event Hall, Midtown', '(40.7549,-73.9840)', 'Festive attire, party atmosphere', 10, 'completed', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000010', 'Active Event - In Progress', 'Currently ongoing event', '2025-01-10', '10:00:00', '18:00:00', 'Exhibition Center', '(40.7580,-73.9855)', 'Active support needed', 8, 'active', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Insert Event Signups
INSERT INTO event_signup (id, event_id, user_id, status, applied_at, approved_at, approved_by)
VALUES 
  -- Approved signups for upcoming events
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'approved', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', '00000000-0000-0000-0000-000000000001'),
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'approved', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', '00000000-0000-0000-0000-000000000001'),
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'approved', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', '00000000-0000-0000-0000-000000000001'),
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'approved', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', '00000000-0000-0000-0000-000000000001'),
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'approved', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', '00000000-0000-0000-0000-000000000001'),
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'approved', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', '00000000-0000-0000-0000-000000000001'),
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000006', 'approved', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', '00000000-0000-0000-0000-000000000001'),
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000007', 'approved', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours', '00000000-0000-0000-0000-000000000001'),
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000008', 'approved', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours', '00000000-0000-0000-0000-000000000001'),
  -- Pending signups
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'pending', NOW() - INTERVAL '6 hours', NULL, NULL),
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'pending', NOW() - INTERVAL '4 hours', NULL, NULL),
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004', 'pending', NOW() - INTERVAL '2 hours', NULL, NULL),
  -- Active event signups
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 'approved', NOW() - INTERVAL '1 day', NOW() - INTERVAL '20 hours', '00000000-0000-0000-0000-000000000001'),
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'approved', NOW() - INTERVAL '1 day', NOW() - INTERVAL '20 hours', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Insert Attendance Logs
INSERT INTO attendance_log (id, user_id, event_id, clock_in, clock_out, clock_in_location, clock_out_location, status, is_late, is_early_clockout)
VALUES 
  -- Completed attendance for past event
  (uuid_generate_v4(), '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009', '2024-12-20 17:55:00', '2024-12-20 23:10:00', '(40.7549,-73.9840)', '(40.7549,-73.9840)', 'off_duty', false, false),
  (uuid_generate_v4(), '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000009', '2024-12-20 17:50:00', '2024-12-20 23:00:00', '(40.7549,-73.9840)', '(40.7549,-73.9840)', 'off_duty', false, false),
  (uuid_generate_v4(), '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000009', '2024-12-20 18:05:00', '2024-12-20 23:15:00', '(40.7549,-73.9840)', '(40.7549,-73.9840)', 'off_duty', false, false),
  -- Active attendance for current event
  (uuid_generate_v4(), '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010', '2025-01-10 09:55:00', NULL, '(40.7580,-73.9855)', NULL, 'on_duty', false, NULL),
  (uuid_generate_v4(), '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000010', '2025-01-10 10:02:00', NULL, '(40.7580,-73.9855)', NULL, 'on_duty', false, NULL)
ON CONFLICT DO NOTHING;

-- Insert Chat Rooms for Events
INSERT INTO chat_rooms (id, event_id, name, type)
VALUES 
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000001', 'New Year Eve Gala 2025', 'event'),
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000002', 'Corporate Conference Setup', 'event'),
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000003', 'Music Festival - Day 1', 'event'),
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000004', 'Wedding Reception', 'event'),
  (uuid_generate_v4(), '20000000-0000-0000-0000-000000000010', 'Active Event - In Progress', 'event')
ON CONFLICT DO NOTHING;

-- Insert Chat Messages
DO $$
DECLARE
  room1_id UUID;
  room2_id UUID;
  room3_id UUID;
BEGIN
  -- Get chat room IDs
  SELECT id INTO room1_id FROM chat_rooms WHERE event_id = '20000000-0000-0000-0000-000000000001' LIMIT 1;
  SELECT id INTO room2_id FROM chat_rooms WHERE event_id = '20000000-0000-0000-0000-000000000002' LIMIT 1;
  SELECT id INTO room3_id FROM chat_rooms WHERE event_id = '20000000-0000-0000-0000-000000000010' LIMIT 1;

  -- Messages for New Year Eve Gala
  IF room1_id IS NOT NULL THEN
    INSERT INTO chat_messages (id, chat_room_id, user_id, message, created_at)
    VALUES 
      (uuid_generate_v4(), room1_id, '10000000-0000-0000-0000-000000000001', 'Hey everyone! Looking forward to working with you all at the gala!', NOW() - INTERVAL '3 days'),
      (uuid_generate_v4(), room1_id, '10000000-0000-0000-0000-000000000002', 'Same here! What time should we arrive?', NOW() - INTERVAL '3 days' + INTERVAL '2 hours'),
      (uuid_generate_v4(), room1_id, '00000000-0000-0000-0000-000000000001', 'Please arrive by 7:30 PM for briefing. Dress code is formal.', NOW() - INTERVAL '3 days' + INTERVAL '3 hours'),
      (uuid_generate_v4(), room1_id, '10000000-0000-0000-0000-000000000003', 'Got it! Will parking be available?', NOW() - INTERVAL '2 days'),
      (uuid_generate_v4(), room1_id, '00000000-0000-0000-0000-000000000001', 'Yes, valet parking is provided. Just mention you are staff.', NOW() - INTERVAL '2 days' + INTERVAL '1 hour');
  END IF;

  -- Messages for Corporate Conference
  IF room2_id IS NOT NULL THEN
    INSERT INTO chat_messages (id, chat_room_id, user_id, message, created_at)
    VALUES 
      (uuid_generate_v4(), room2_id, '10000000-0000-0000-0000-000000000004', 'What equipment will we be setting up?', NOW() - INTERVAL '2 days'),
      (uuid_generate_v4(), room2_id, '00000000-0000-0000-0000-000000000001', 'Mainly tables, chairs, AV equipment, and signage. Setup guide will be shared.', NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'),
      (uuid_generate_v4(), room2_id, '10000000-0000-0000-0000-000000000005', 'Sounds good! I have experience with AV setup.', NOW() - INTERVAL '1 day');
  END IF;

  -- Messages for Active Event
  IF room3_id IS NOT NULL THEN
    INSERT INTO chat_messages (id, chat_room_id, user_id, message, created_at)
    VALUES 
      (uuid_generate_v4(), room3_id, '10000000-0000-0000-0000-000000000001', 'Good morning team! Ready for today?', NOW() - INTERVAL '2 hours'),
      (uuid_generate_v4(), room3_id, '10000000-0000-0000-0000-000000000005', 'Morning! Already clocked in and ready to go.', NOW() - INTERVAL '1 hour' + INTERVAL '45 minutes'),
      (uuid_generate_v4(), room3_id, '00000000-0000-0000-0000-000000000001', 'Great! Please check the VIP section first, then move to general areas.', NOW() - INTERVAL '1 hour' + INTERVAL '30 minutes'),
      (uuid_generate_v4(), room3_id, '10000000-0000-0000-0000-000000000001', 'Will do! VIP section looks good so far.', NOW() - INTERVAL '30 minutes');
  END IF;
END $$;

-- Insert Notifications
INSERT INTO notifications (id, user_id, type, title, message, related_event_id, is_read, created_at)
VALUES 
  -- Unread notifications
  (uuid_generate_v4(), '10000000-0000-0000-0000-000000000001', 'shift_approval', 'Shift Approved', 'Your signup for "New Year Eve Gala 2025" has been approved', '20000000-0000-0000-0000-000000000001', false, NOW() - INTERVAL '4 days'),
  (uuid_generate_v4(), '10000000-0000-0000-0000-000000000001', 'event_reminder', 'Event Reminder', 'Reminder: "New Year Eve Gala 2025" is coming up in 3 weeks', '20000000-0000-0000-0000-000000000001', false, NOW() - INTERVAL '1 day'),
  (uuid_generate_v4(), '10000000-0000-0000-0000-000000000002', 'shift_approval', 'Shift Approved', 'Your signup for "New Year Eve Gala 2025" has been approved', '20000000-0000-0000-0000-000000000001', false, NOW() - INTERVAL '4 days'),
  (uuid_generate_v4(), '10000000-0000-0000-0000-000000000003', 'chat_message', 'New Message', 'New message in "New Year Eve Gala 2025" chat', '20000000-0000-0000-0000-000000000001', false, NOW() - INTERVAL '2 days'),
  (uuid_generate_v4(), '10000000-0000-0000-0000-000000000004', 'shift_approval', 'Shift Approved', 'Your signup for "Corporate Conference Setup" has been approved', '20000000-0000-0000-0000-000000000002', false, NOW() - INTERVAL '2 days'),
  -- Read notifications
  (uuid_generate_v4(), '10000000-0000-0000-0000-000000000001', 'shift_update', 'Shift Update', 'New shift available: "Music Festival - Day 1"', '20000000-0000-0000-0000-000000000003', true, NOW() - INTERVAL '3 days'),
  (uuid_generate_v4(), '10000000-0000-0000-0000-000000000005', 'shift_approval', 'Shift Approved', 'Your signup for "Corporate Conference Setup" has been approved', '20000000-0000-0000-0000-000000000002', true, NOW() - INTERVAL '2 days'),
  -- Admin notifications
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'shift_update', 'New Shift Sign-Up', 'Sarah Johnson signed up for event', '20000000-0000-0000-0000-000000000005', false, NOW() - INTERVAL '6 hours'),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'shift_update', 'New Shift Sign-Up', 'Michael Brown signed up for event', '20000000-0000-0000-0000-000000000005', false, NOW() - INTERVAL '4 hours'),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'attendance_alert', 'Late Clock-In', 'John Smith clocked in late for event', '20000000-0000-0000-0000-000000000010', false, NOW() - INTERVAL '1 hour')
ON CONFLICT DO NOTHING;
