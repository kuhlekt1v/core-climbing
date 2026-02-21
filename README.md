# Core Climbing 

## Description

A cross-platform mobile workout application focused on sciatica relief and core conditioning for climbers recovering from back injuries. The app emphasizes evidence-based spinal stability, progressive load management, and climbing-specific movement patterns, with routines designed to support return-to-climb rather than generic fitness.

## Features

- **Mobile-First Design**: Built with Expo and React Native for iOS, Android, and Web
- **Workout Tracking**: Track exercises with sets, reps, and duration during each workout
- **Stopwatch Timer**: Built-in timer that can be started, stopped, and adjusted during workouts
- **Progress Tracking**: View graphs and reports of your recovery journey over time
- **Pain Level Recording**: Record pain levels before and after each workout session
- **Data Persistence**: All data stored locally using AsyncStorage
- **Authentication**: Secure login with "stay logged in" option
- **3-Phase Program**:
  - Phase 1: Calm the Nerve & Build Foundation (Weeks 1-2)
  - Phase 2: Add Climbing-Specific Strength (Weeks 3-4)
  - Phase 3: Controlled Return to Real Climbing (Weeks 5-6)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (optional, but recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kuhlekt1v/core-climbing.git
cd core-climbing
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your platform:
```bash
npm run android   # For Android
npm run ios       # For iOS (macOS only)
npm run web       # For Web browser
```

Or scan the QR code with Expo Go app on your mobile device.

## Project Structure

```
core-climbing/
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context for state management
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # App screens
│   ├── services/         # Business logic and data services
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, and other assets
├── App.tsx               # Main app component
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Technology Stack

- **Frontend**: React Native with TypeScript
- **Navigation**: React Navigation
- **Data Storage**: AsyncStorage
- **Charts**: React Native Chart Kit
- **UI**: React Native built-in components

## Usage

1. **Sign Up/Login**: Create an account or login to access your workouts
2. **Select Phase**: Choose your current recovery phase (1, 2, or 3)
3. **Start Workout**: Select a workout routine and begin exercising
4. **Track Progress**: Use the stopwatch and record your sets/reps
5. **Record Pain Levels**: Log pain before and after each session
6. **View Progress**: Check your graphs and workout history

## Development

This app was developed using an agentic approach, following the requirements specified in `prompt.md`.

## Future Enhancements

- Cloud sync with Supabase or similar service
- Custom workout routines
- Video demonstrations for exercises
- Social features and community support
- Export workout data
- Notifications and reminders

## License

Copyright © 2024 Core Climbing. All rights reserved.

## Support

For issues or questions, please open an issue in the GitHub repository.
