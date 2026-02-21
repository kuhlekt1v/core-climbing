# Core Climbing - Architecture Documentation

## Overview

Core Climbing is a React Native mobile application built with Expo, designed to help climbers recover from sciatica and back injuries through structured workout programs.

## Technology Stack

### Core Technologies
- **React Native 0.81.5**: Mobile app framework
- **Expo ~54.0**: Development platform and toolchain
- **TypeScript 5.9**: Type-safe JavaScript
- **React 19.1.0**: UI library

### Navigation & State Management
- **React Navigation 7.x**: App navigation
  - Stack Navigator: For screen transitions
  - Bottom Tabs Navigator: For main app sections
- **React Context API**: Global state management
  - AuthContext: User authentication state

### Data & Storage
- **AsyncStorage**: Local data persistence
  - User data
  - Workout history
  - Exercise definitions
  - Pain level records

### UI & Visualization
- **React Native Chart Kit**: Data visualization
- **React Native SVG**: Chart rendering
- **React Native Screens**: Native screen optimization
- **Safe Area Context**: Handle device notches/insets

## Architecture Patterns

### Folder Structure

```
src/
├── components/        # Reusable UI components (future)
├── context/          # React Context providers
│   └── AuthContext.tsx
├── navigation/       # Navigation configuration
│   └── AppNavigator.tsx
├── screens/          # Screen components
│   ├── HomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── ProgressScreen.tsx
│   ├── WorkoutListScreen.tsx
│   └── WorkoutSessionScreen.tsx
├── services/         # Business logic
│   └── storage.ts
├── types/            # TypeScript definitions
│   └── index.ts
└── utils/            # Helper functions (future)
```

### Data Flow

1. **Authentication Flow**
   ```
   User Input → AuthContext → StorageService → AsyncStorage
   ```

2. **Workout Creation Flow**
   ```
   WorkoutListScreen → Create Workout → StorageService → AsyncStorage
   ```

3. **Workout Session Flow**
   ```
   WorkoutSessionScreen → Timer/Exercise Tracking → Update Workout → StorageService
   ```

4. **Progress Tracking Flow**
   ```
   AsyncStorage → StorageService → ProgressScreen → Charts
   ```

## Key Components

### AuthContext
- Manages user authentication state
- Provides login, signup, and logout functions
- Handles "stay logged in" functionality
- Persists user data across app restarts

### StorageService
- Centralized data access layer
- CRUD operations for all data types
- Abstracts AsyncStorage implementation
- Provides type-safe data access

### AppNavigator
- Main navigation structure
- Conditional rendering based on auth state
- Stack and Tab navigation integration
- Type-safe navigation props

## Data Models

### User
```typescript
{
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
```

### Workout
```typescript
{
  id: string;
  userId: string;
  name: string;
  date: Date;
  exercises: WorkoutExercise[];
  totalDuration: number;
  painBefore?: PainLevel;
  painAfter?: PainLevel;
  phase: 1 | 2 | 3;
  completed: boolean;
}
```

### Exercise
```typescript
{
  id: string;
  name: string;
  description: string;
  sets?: number;
  reps?: number;
  duration?: number;
  category: 'core-stability' | 'climbing-booster' | 'active-recovery';
  phase: 1 | 2 | 3;
  instructions: string[];
}
```

### PainLevel
```typescript
{
  id: string;
  userId: string;
  workoutId: string;
  level: number; // 0-10
  location: string;
  notes: string;
  timestamp: Date;
  type: 'before' | 'after';
}
```

## Screen Responsibilities

### LoginScreen
- User authentication (login/signup)
- "Stay logged in" toggle
- Input validation

### HomeScreen
- Dashboard view
- Phase selection
- Quick actions
- Recent workout summary

### WorkoutListScreen
- Display workouts by phase
- Exercise preview
- Workout initiation

### WorkoutSessionScreen
- Exercise tracking
- Timer functionality
- Pain level recording
- Set/rep completion

### ProgressScreen
- Workout statistics
- Data visualization
- Workout history

### ProfileScreen
- User information
- App information
- Data management
- Logout

## State Management

### Local State (useState)
- Component-specific UI state
- Form inputs
- Timer values
- Loading states

### Context State (useContext)
- User authentication
- Global app state
- User preferences

### Persistent State (AsyncStorage)
- User data
- Workout history
- Exercise data
- Pain records

## Security Considerations

### Current Implementation
- Simple local authentication
- Local data storage only
- No network communication
- Data encrypted by device OS

### Future Enhancements
- Backend API integration
- Secure token authentication
- Cloud data sync
- End-to-end encryption

## Performance Optimizations

### Current
- Lazy loading with React Navigation
- Efficient re-renders with React Context
- Optimized list rendering

### Future Improvements
- React.memo for expensive components
- Virtual lists for long workout histories
- Image optimization
- Code splitting

## Testing Strategy

### Manual Testing
- Platform-specific testing (iOS, Android, Web)
- User flow testing
- Data persistence verification

### Future Testing
- Unit tests (Jest)
- Component tests (React Native Testing Library)
- E2E tests (Detox)
- Accessibility tests

## Deployment

### Development
```bash
npm start           # Start development server
npm run ios        # Run on iOS
npm run android    # Run on Android
npm run web        # Run on web
```

### Production Build
```bash
expo build:ios     # Build iOS app
expo build:android # Build Android app
```

### Distribution
- App Store (iOS)
- Google Play Store (Android)
- Web hosting (Vercel, Netlify)

## Future Enhancements

### Planned Features
1. Cloud sync (Supabase/Firebase)
2. User-defined custom workouts
3. Video exercise demonstrations
4. Social features
5. Push notifications
6. Export data functionality
7. Offline-first architecture improvements

### Technical Debt
1. Add unit tests
2. Implement error boundaries
3. Add analytics
4. Improve accessibility
5. Add internationalization
6. Optimize bundle size

## Contributing

See the main README.md for contribution guidelines.

## License

Copyright © 2024 Core Climbing. All rights reserved.
