import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkoutProvider, useWorkouts } from '../context/WorkoutContext';
import WorkoutSessionScreen from '../screens/WorkoutSessionScreen';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Workout } from '../types';

jest.spyOn(Alert, 'alert');

jest.useFakeTimers();

const Stack = createNativeStackNavigator<RootStackParamList>();

// Seeds a workout into context then renders WorkoutSessionScreen
function SeedAndRender({ workout }: { workout: Workout }) {
  const { addWorkout } = useWorkouts();
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      addWorkout(workout);
    }
  }, [workout, addWorkout]);
  return null;
}

function renderSessionScreen(workout: Workout) {
  return render(
    <WorkoutProvider>
      <SeedAndRender workout={workout} />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="WorkoutSession">
          <Stack.Screen
            name="WorkoutSession"
            component={WorkoutSessionScreen}
            initialParams={{ workoutId: workout.id }}
          />
          {/* Dummy screens so navigator can go back */}
          <Stack.Screen name="WorkoutList" component={() => null} />
          <Stack.Screen name="WorkoutDesign" component={() => null} />
        </Stack.Navigator>
      </NavigationContainer>
    </WorkoutProvider>
  );
}

const repExercise: Workout = {
  id: 'w1',
  name: 'Push Day',
  exercises: [
    {
      id: 'e1',
      name: 'Push-ups',
      sets: 3,
      reps: 12,
      duration: null,
      weight: null,
      isBodyweight: true,
      isPerSide: false,
    },
    {
      id: 'e2',
      name: 'Dumbbell Curl',
      sets: 2,
      reps: 10,
      duration: null,
      weight: 20,
      isBodyweight: false,
      isPerSide: true,
    },
  ],
};

const durationWorkout: Workout = {
  id: 'w2',
  name: 'Core Day',
  exercises: [
    {
      id: 'e3',
      name: 'Plank',
      sets: 3,
      reps: null,
      duration: 60,
      weight: null,
      isBodyweight: true,
      isPerSide: false,
    },
  ],
};

describe('WorkoutSessionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('shows the workout name and first exercise', () => {
    renderSessionScreen(repExercise);
    expect(screen.getByText('Push Day')).toBeTruthy();
    expect(screen.getByText('Push-ups')).toBeTruthy();
  });

  it('shows elapsed time starting at 00:00', () => {
    renderSessionScreen(repExercise);
    expect(screen.getByText('00:00')).toBeTruthy();
  });

  it('shows exercise progress indicator', () => {
    renderSessionScreen(repExercise);
    expect(screen.getByText(/Exercise 1 of 2/)).toBeTruthy();
  });

  it('shows expected sets, reps, and bodyweight values', () => {
    renderSessionScreen(repExercise);
    // Expected preview values (sets=3 also appears as a set number, so use getAllByText)
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('12')).toBeTruthy(); // reps
    expect(screen.getByText('BW')).toBeTruthy(); // bodyweight
  });

  it('shows Per Side indicator when exercise is per side', () => {
    const workout: Workout = {
      ...repExercise,
      exercises: [repExercise.exercises[1]],
    };
    renderSessionScreen(workout);
    expect(screen.getByText('Per Side')).toBeTruthy();
    expect(screen.getByText('✓')).toBeTruthy();
  });

  it('shows duration label and value for duration-based exercises', () => {
    renderSessionScreen(durationWorkout);
    expect(screen.getByText('Plank')).toBeTruthy();
    expect(screen.getByText('Duration')).toBeTruthy();
    expect(screen.getByText('60s')).toBeTruthy();
  });

  it('renders correct number of set rows', () => {
    renderSessionScreen(repExercise);
    // 3 sets → 3 set number labels shown in the set log section
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
  });

  it('prefills actual reps inputs with expected reps', () => {
    renderSessionScreen(repExercise);
    // 3 sets, each pre-filled with 12 reps
    const inputs = screen.getAllByDisplayValue('12');
    expect(inputs.length).toBeGreaterThanOrEqual(3);
  });

  it('shows "Complete Exercise →" button when not on last exercise', () => {
    renderSessionScreen(repExercise);
    expect(screen.getByText('Complete Exercise →')).toBeTruthy();
  });

  it('shows "Finish Workout ✓" button on last exercise', () => {
    // Single-exercise workout
    const single: Workout = { ...repExercise, exercises: [repExercise.exercises[0]] };
    renderSessionScreen(single);
    expect(screen.getByText('Finish Workout ✓')).toBeTruthy();
  });

  it('shows rest timer with 00:45 after completing an exercise', () => {
    renderSessionScreen(repExercise);
    fireEvent.press(screen.getByText('Complete Exercise →'));
    expect(screen.getByText('00:45')).toBeTruthy();
    expect(screen.getByText('Rest')).toBeTruthy();
  });

  it('shows +5s and −5s rest time adjustment buttons while resting', () => {
    renderSessionScreen(repExercise);
    fireEvent.press(screen.getByText('Complete Exercise →'));
    expect(screen.getByText('+5s')).toBeTruthy();
    expect(screen.getByText('−5s')).toBeTruthy();
    expect(screen.getByText('Adjust Active Rest Time')).toBeTruthy();
  });

  it('+5s button increases rest time', () => {
    renderSessionScreen(repExercise);
    fireEvent.press(screen.getByText('Complete Exercise →'));
    fireEvent.press(screen.getByText('+5s'));
    expect(screen.getByText('00:50')).toBeTruthy();
  });

  it('−5s button decreases rest time', () => {
    renderSessionScreen(repExercise);
    fireEvent.press(screen.getByText('Complete Exercise →'));
    fireEvent.press(screen.getByText('−5s'));
    expect(screen.getByText('00:40')).toBeTruthy();
  });

  it('−5s button does not go below 0', () => {
    renderSessionScreen(repExercise);
    fireEvent.press(screen.getByText('Complete Exercise →'));
    // Press −5s nine times (45 - 45 = 0)
    for (let i = 0; i < 9; i++) {
      fireEvent.press(screen.getByText('−5s'));
    }
    // Rest timer should show 00:00 (adjust buttons should be hidden when restTimeRemaining === 0)
    expect(screen.queryByText('+5s')).toBeNull();
    expect(screen.queryByText('−5s')).toBeNull();
    expect(screen.queryByText('Adjust Active Rest Time')).toBeNull();
  });

  it('skip rest button advances to next exercise', () => {
    renderSessionScreen(repExercise);
    fireEvent.press(screen.getByText('Complete Exercise →'));
    fireEvent.press(screen.getByText('Skip Rest →'));
    expect(screen.getByText(/Exercise 2 of 2/)).toBeTruthy();
    expect(screen.getByText('Dumbbell Curl')).toBeTruthy();
  });

  it('stopwatch increments each second', () => {
    renderSessionScreen(repExercise);
    expect(screen.getByText('00:00')).toBeTruthy();
    act(() => { jest.advanceTimersByTime(3000); });
    expect(screen.getByText('00:03')).toBeTruthy();
  });

  it('rest timer counts down each second', () => {
    renderSessionScreen(repExercise);
    fireEvent.press(screen.getByText('Complete Exercise →'));
    expect(screen.getByText('00:45')).toBeTruthy();
    act(() => { jest.advanceTimersByTime(5000); });
    expect(screen.getByText('00:40')).toBeTruthy();
  });

  it('shows cancel button', () => {
    renderSessionScreen(repExercise);
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('cancel button shows confirmation alert', () => {
    renderSessionScreen(repExercise);
    fireEvent.press(screen.getByText('Cancel'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Cancel Session',
      'Are you sure you want to cancel this workout session?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Keep Going' }),
        expect.objectContaining({ text: 'Cancel Session' }),
      ])
    );
  });

  it('shows "not found" message for unknown workoutId', () => {
    render(
      <WorkoutProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="WorkoutSession">
            <Stack.Screen
              name="WorkoutSession"
              component={WorkoutSessionScreen}
              initialParams={{ workoutId: 'nonexistent' }}
            />
            <Stack.Screen name="WorkoutList" component={() => null} />
            <Stack.Screen name="WorkoutDesign" component={() => null} />
          </Stack.Navigator>
        </NavigationContainer>
      </WorkoutProvider>
    );
    expect(screen.getByText('Workout not found.')).toBeTruthy();
  });
});
