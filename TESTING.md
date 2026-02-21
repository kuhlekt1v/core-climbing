# Core Climbing - Testing Guide

## Manual Testing Checklist

### Authentication Flow
- [ ] Launch app and see login screen
- [ ] Create a new account with email and password
- [ ] Verify "stay logged in" toggle works
- [ ] Log out and log back in
- [ ] Test login persistence (app should remember logged-in user)

### Home Screen
- [ ] View welcome message with user name
- [ ] See current phase selector (1, 2, 3)
- [ ] Switch between phases
- [ ] Click "Start Workout" button
- [ ] Click "View Progress" button
- [ ] View recent workouts (after completing some)

### Workout List Screen
- [ ] View available workout categories for current phase
- [ ] See exercise details (sets, reps, duration)
- [ ] Start a workout session

### Workout Session Screen
- [ ] Record pain level before workout (0-10 scale)
- [ ] Add optional notes about pain
- [ ] See current exercise details
- [ ] Start/pause/reset stopwatch timer
- [ ] Adjust timer (+/-30s, +/-1m)
- [ ] View exercise instructions
- [ ] Complete exercise and move to next
- [ ] Record pain level after workout
- [ ] Complete full workout session

### Progress Screen
- [ ] View workout statistics (total, this week, avg duration)
- [ ] See workout frequency chart
- [ ] View pain level tracking chart
- [ ] Browse recent workout history

### Profile Screen
- [ ] View user information
- [ ] Read about the app and 3-phase program
- [ ] Clear all data (with confirmation)
- [ ] Log out (with confirmation)

## Platform Testing

### iOS
```bash
npm run ios
```
Test on iOS Simulator or physical iPhone device.

### Android
```bash
npm run android
```
Test on Android Emulator or physical Android device.

### Web
```bash
npm run web
```
Test in web browser (Chrome, Safari, Firefox).

## Known Issues

1. **Version Warnings**: Some packages may show version compatibility warnings with Expo, but they are functional.
2. **Offline Mode**: The app currently works entirely offline. No cloud sync yet.
3. **Charts**: Charts require at least 2 data points to display properly.

## Testing with Expo Go

1. Install Expo Go app on your mobile device:
   - iOS: https://apps.apple.com/app/apple-store/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Start the development server:
   ```bash
   npm start
   ```

3. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

## Performance Testing

- Test with multiple workouts (10+)
- Test with pain level data (20+ entries)
- Test timer accuracy during long workouts (30+ minutes)
- Test data persistence after app restart
- Test on low-end devices

## Data Validation

- Ensure all workout data persists correctly
- Verify pain level recordings are saved
- Check that workout history shows accurately
- Confirm charts update with new data
- Test data clearing functionality

## Future Testing Needs

- Unit tests for services and utilities
- Integration tests for navigation flow
- E2E tests for complete workout sessions
- Accessibility testing
- Performance profiling
