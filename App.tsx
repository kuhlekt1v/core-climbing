import { StatusBar } from 'expo-status-bar';
import { WorkoutProvider } from './src/context/WorkoutContext';
import { WorkoutSessionProvider } from './src/context/WorkoutSessionContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <WorkoutProvider>
      <WorkoutSessionProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </WorkoutSessionProvider>
    </WorkoutProvider>
  );
}
