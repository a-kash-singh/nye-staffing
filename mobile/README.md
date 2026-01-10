# NYE Staffing Mobile App

React Native mobile application for staff members.

## Setup

1. Install dependencies:
```bash
npm install
```

2. For iOS:
```bash
cd ios && pod install && cd ..
npm run ios
```

3. For Android:
```bash
npm run android
```

## Features

- View and sign up for available shifts
- Clock in/out with GPS tracking
- Event-specific chat
- Push notifications
- View attendance history
- Profile management

## Project Structure

```
mobile/
├── src/
│   ├── screens/        # Screen components
│   ├── components/     # Reusable components
│   ├── navigation/     # Navigation setup
│   ├── services/       # API services
│   ├── contexts/       # React contexts
│   └── utils/          # Utility functions
├── App.js              # Main app component
└── package.json
```

## Note

This is a placeholder structure. Full React Native implementation would include:
- React Navigation for routing
- React Native Firebase for push notifications
- Location services for GPS tracking
- Socket.IO client for real-time chat
- AsyncStorage for local data persistence
