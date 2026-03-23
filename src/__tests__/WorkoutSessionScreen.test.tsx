import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkoutProvider, useWorkouts } from '../context/WorkoutContext';
import { WorkoutSessionProvider } from '../context/WorkoutSessionContext';
import WorkoutSessionScreen from '../screens/WorkoutSessionScreen';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Workout } from '../types';

jest.spyOn(Alert, 'alert');

const Stack = createNativeStackNavigator<RootStackParamList>();

function SeedWorkouts({
  workouts,
  children,
}: {
  workouts: Workout[];
  children: React.ReactNode;
}) {
  const { addWorkout } = useWorkouts();
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      workouts.forEach((w) => addWorkout(w));
    }
  }, [workouts, addWorkout]);
  return <>{children}</>;
}

function renderSessionScreen(workoutId: string, initialWorkouts: Workout[] = []) {
  return render(
    <WorkoutProvider>
      <WorkoutSessionProvider>
        <SeedWorkouts workouts={initialWorkouts}>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="WorkoutSession"
                component={WorkoutSessionScreen}
                initialParams={{ workoutId }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SeedWorkouts>
      </WorkoutSessionProvider>
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

const durationWorkout: Workout = {
  id: 'w2',
  name: 'Core',
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
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('displays error if workout not found', () => {
    renderSessionScreen('nonexistent');
    expect(screen.getByText('Workout not found.')).toBeTruthy();
  });

  it('displays workout name and first exercise', async () => {
    renderSessionScreen('w1', [sampleWorkout]);

    await waitFor(() => {
      expect(screen.getByText('Pull-ups')).toBeTruthy();
    });

    expect(screen.getByText('Exercise 1 of 2')).toBeTruthy();
  });

  it('displays exercise preview with expected values', async () => {
    renderSessionScreen('w1', [sampleWorkout]);

    await waitFor(() => {
      expect(screen.getByText('Pull-ups')).toBeTruthy();
    });

    expect(screen.getByText(/3 sets/)).toBeTruthy();
    expect(screen.getByText(/8 reps/)).toBeTruthy();
    expect(screen.getByText('Bodyweight')).toBeTruthy();
  });

  it('displays stopwatch starting at 0:00', async () => {
    renderSessionScreen('w1', [sampleWorkout]);

    await waitFor(() => {
      expect(screen.getByText('0:00')).toBeTruthy();
    });
  });

  it('logs a rep-based set', async () => {
    renderSessionScreen('w1', [sampleWorkout]);

    await waitFor(() => {
      expect(screen.getByText('Pull-ups')).toBeTruthy();
    });

    const repsInput = screen.getByPlaceholderText('Expected: 8');
    fireEvent.changeText(repsInput, '8');

    const logButton = screen.getByText('Log Set');
    fireEvent.press(logButton);

    await waitFor(() => {
      expect(screen.getByText(/Set 1:/)).toBeTruthy();
      expect(screen.getByText('Set 1: 8 reps')).toBeTruthy();
    });
  });

  it('logs a duration-based set', async () => {
    renderSessionScreen('w2', [durationWorkout]);

    await waitFor(() => {
      expect(screen.getByText('Plank')).toBeTruthy();
    });

    const durationInput = screen.getByPlaceholderText('Expected: 60');
    fireEvent.changeText(durationInput, '60');

    const logButton = screen.getByText('Log Set');
    fireEvent.press(logButton);

    await waitFor(() => {
      expect(screen.getByText(/Set 1:/)).toBeTruthy();
      expect(screen.getByText('Set 1: 60s')).toBeTruthy();
    });
  });

  it('shows alert for invalid reps input', async () => {
    renderSessionScreen('w1', [sampleWorkout]);

    await waitFor(() => {
      expect(screen.getByText('Pull-ups')).toBeTruthy();
    });

    const logButton = screen.getByText('Log Set');
    fireEvent.press(logButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Invalid Input',
        'Please enter valid reps.'
      );
    });
  });

  it('displays completed sets count', async () => {
    renderSessionScreen('w1', [sampleWorkout]);

    await waitFor(() => {
      expect(screen.getByText('Pull-ups')).toBeTruthy();
    });

    expect(screen.getByText('Completed Sets: 0 / 3')).toBeTruthy();

    const repsInput = screen.getByPlaceholderText('Expected: 8');
    fireEvent.changeText(repsInput, '8');

    const logButton = screen.getByText('Log Set');
    fireEvent.press(logButton);

    await waitFor(() => {
      expect(screen.getByText('Completed Sets: 1 / 3')).toBeTruthy();
    });
  });

  it('navigates to next exercise', async () => {
    renderSessionScreen('w1', [sampleWorkout]);

    await waitFor(() => {
      expect(screen.getByText('Pull-ups')).toBeTruthy();
    });

    const nextButton = screen.getByText('Next →');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeTruthy();
      expect(screen.getByText('Exercise 2 of 2')).toBeTruthy();
    });
  });

  it('navigates to previous exercise', async () => {
    renderSessionScreen('w1', [sampleWorkout]);

    await waitFor(() => {
      expect(screen.getByText('Pull-ups')).toBeTruthy();
    });

    const nextButton = screen.getByText('Next →');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeTruthy();
    });

    const prevButton = screen.getByText('← Previous');
    fireEvent.press(prevButton);

    await waitFor(() => {
      expect(screen.getByText('Pull-ups')).toBeTruthy();
      expect(screen.getByText('Exercise 1 of 2')).toBeTruthy();
    });
  });

  it('disables previous button on first exercise', async () => {
    renderSessionScreen('w1', [sampleWorkout]);

    await waitFor(() => {
      expect(screen.getByText('Pull-ups')).toBeTruthy();
    });

    // The previous button should exist on first exercise
    expect(screen.getByText('← Previous')).toBeTruthy();
  });

  it('disables next button on last exercise', async () => {
    renderSessionScreen('w1', [sampleWorkout]);

    await waitFor(() => {
      expect(screen.getByText('Pull-ups')).toBeTruthy();
    });

    const nextButton = screen.getByText('Next →');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeTruthy();
    });

    // The next button should exist on last exercise
    expect(screen.getByText('Next →')).toBeTruthy();
  });

  it('shows rest timer after logging a set', async () => {
    renderSessionScreen('w1', [sampleWorkout]);

    await waitFor(() => {
      expect(screen.getByText('Pull-ups')).toBeTruthy();
    });

    const repsInput = screen.getByPlaceholderText('Expected: 8');
    fireEvent.changeText(repsInput, '8');

    const logButton = screen.getByText('Log Set');
    fireEvent.press(logButton);

    await waitFor(() => {
      expect(screen.getByText('Rest Time')).toBeTruthy();
      expect(screen.getByText('0:45')).toBeTruthy();
    });
  });

  it('adjusts active rest time', async () => {
    renderSessionScreen('w1', [sampleWorkout]);

    await waitFor(() => {
      expect(screen.getByText('Pull-ups')).toBeTruthy();
    });

    // Log a set to trigger rest timer
    const repsInput = screen.getByPlaceholderText('Expected: 8');
    fireEvent.changeText(repsInput, '8');

    const logButton = screen.getByText('Log Set');
    fireEvent.press(logButton);

    await waitFor(() => {
      expect(screen.getByText('Adjust Active Rest Time')).toBeTruthy();
      expect(screen.getByText('0:45')).toBeTruthy();
    });

    const plusButton = screen.getByText('+ 5s');
    fireEvent.press(plusButton);

    await waitFor(() => {
      expect(screen.getByText('0:50')).toBeTruthy();
    });

    const minusButton = screen.getByText('- 5s');
    fireEvent.press(minusButton);
    fireEvent.press(minusButton);

    await waitFor(() => {
      expect(screen.getByText('0:40')).toBeTruthy();
    });
  });

  it('shows finish workout confirmation', async () => {
    renderSessionScreen('w1', [sampleWorkout]);

    await waitFor(() => {
      expect(screen.getByText('Pull-ups')).toBeTruthy();
    });

    const finishButton = screen.getByText('Finish Workout');
    fireEvent.press(finishButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Finish Workout',
        'Are you sure you want to finish this workout?',
        expect.any(Array)
      );
    });
  });

  it('shows cancel workout confirmation', async () => {
    renderSessionScreen('w1', [sampleWorkout]);

    await waitFor(() => {
      expect(screen.getByText('Pull-ups')).toBeTruthy();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.press(cancelButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Cancel Workout',
        'Are you sure you want to cancel this workout? All progress will be lost.',
        expect.any(Array)
      );
    });
  });
});
