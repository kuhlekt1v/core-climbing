import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkoutProvider, useWorkouts } from '../context/WorkoutContext';
import WorkoutListScreen from '../screens/WorkoutListScreen';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Workout } from '../types';

jest.spyOn(Alert, 'alert');

const Stack = createNativeStackNavigator<RootStackParamList>();

// A helper component that pre-seeds workouts into context before rendering
function SeedWorkouts({
  workouts,
  children,
}: {
  workouts: Workout[];
  children: React.ReactNode;
}) {
  const { addWorkout } = useWorkouts();
  React.useEffect(() => {
    workouts.forEach((w) => addWorkout(w));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <>{children}</>;
}

// Placeholder screen for navigation target
function DummyDesignScreen() {
  return null;
}

function renderListScreen(initialWorkouts: Workout[] = []) {
  return render(
    <WorkoutProvider>
      <SeedWorkouts workouts={initialWorkouts}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="WorkoutList" component={WorkoutListScreen} />
            <Stack.Screen
              name="WorkoutDesign"
              component={DummyDesignScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SeedWorkouts>
    </WorkoutProvider>
  );
}

const sampleWorkout: Workout = {
  id: 'w1',
  name: 'Upper Body',
  exercises: [
    {
      id: 'e1',
      name: 'Pull-ups',
      sets: 3,
      reps: 8,
      duration: null,
      weight: null,
      isBodyweight: true,
      isPerSide: false,
    },
    {
      id: 'e2',
      name: 'Bench Press',
      sets: 4,
      reps: 6,
      duration: null,
      weight: 135,
      isBodyweight: false,
      isPerSide: false,
    },
  ],
};

describe('WorkoutListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state when there are no workouts', () => {
    renderListScreen();
    expect(screen.getByText('No workouts yet.')).toBeTruthy();
    expect(
      screen.getByText('Tap the button below to create one.')
    ).toBeTruthy();
  });

  it('renders the New Workout button', () => {
    renderListScreen();
    expect(screen.getByText('+ New Workout')).toBeTruthy();
  });

  it('displays a workout card with name and exercise count', () => {
    renderListScreen([sampleWorkout]);
    expect(screen.getByText('Upper Body')).toBeTruthy();
    expect(screen.getByText('2 exercises')).toBeTruthy();
  });

  it('uses singular "exercise" for single-exercise workouts', () => {
    const singleExercise: Workout = {
      ...sampleWorkout,
      exercises: [sampleWorkout.exercises[0]],
    };
    renderListScreen([singleExercise]);
    expect(screen.getByText('1 exercise')).toBeTruthy();
  });

  it('displays multiple workout cards', () => {
    const workouts: Workout[] = [
      sampleWorkout,
      { ...sampleWorkout, id: 'w2', name: 'Leg Day', exercises: [] },
    ];
    renderListScreen(workouts);
    expect(screen.getByText('Upper Body')).toBeTruthy();
    expect(screen.getByText('Leg Day')).toBeTruthy();
  });

  it('shows delete confirmation on long press', () => {
    renderListScreen([sampleWorkout]);

    fireEvent(screen.getByText('Upper Body'), 'longPress');

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Workout',
      'Delete "Upper Body"?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Delete' }),
      ])
    );
  });
});
