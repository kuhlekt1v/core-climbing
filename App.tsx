import { StatusBar } from 'expo-status-bar';
import { WorkoutProvider } from './src/context/WorkoutContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <WorkoutProvider>
      <AppNavigator />
      <StatusBar style="light" />
    </WorkoutProvider>
  );
}
