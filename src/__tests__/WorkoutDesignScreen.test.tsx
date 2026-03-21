import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkoutProvider } from '../context/WorkoutContext';
import WorkoutDesignScreen from '../screens/WorkoutDesignScreen';
import type { RootStackParamList } from '../navigation/AppNavigator';

jest.spyOn(Alert, 'alert');

const Stack = createNativeStackNavigator<RootStackParamList>();

function renderDesignScreen(params: { workoutId?: string } = {}) {
  return render(
    <WorkoutProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="WorkoutDesign"
            component={WorkoutDesignScreen}
            initialParams={params}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </WorkoutProvider>
  );
}

describe('WorkoutDesignScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the workout name input', () => {
    renderDesignScreen();
    expect(screen.getByPlaceholderText('e.g. Upper Body Power')).toBeTruthy();
  });

  it('renders the Workout Name label', () => {
    renderDesignScreen();
    expect(screen.getByText('Workout Name')).toBeTruthy();
  });

  it('renders one blank exercise card by default', () => {
    renderDesignScreen();
    expect(screen.getByPlaceholderText('Exercise name')).toBeTruthy();
  });

  it('renders the Save Workout button', () => {
    renderDesignScreen();
    expect(screen.getByText('Save Workout')).toBeTruthy();
  });

  it('renders the Add Exercise button', () => {
    renderDesignScreen();
    expect(screen.getByText('+ Add Exercise')).toBeTruthy();
  });

  it('renders Sets, Reps, and Duration labels', () => {
    renderDesignScreen();
    expect(screen.getByText('Sets')).toBeTruthy();
    expect(screen.getByText('Reps')).toBeTruthy();
    expect(screen.getByText('Duration (s)')).toBeTruthy();
  });

  it('renders Bodyweight and Per Side toggles', () => {
    renderDesignScreen();
    expect(screen.getByText('Bodyweight')).toBeTruthy();
    expect(screen.getByText('Per Side')).toBeTruthy();
  });

  it('renders Weight label', () => {
    renderDesignScreen();
    expect(screen.getByText('Weight (lbs)')).toBeTruthy();
  });

  it('shows validation alert when saving without a workout name', () => {
    renderDesignScreen();

    // Fill exercise name but leave workout name empty
    fireEvent.changeText(
      screen.getByPlaceholderText('Exercise name'),
      'Deadlift'
    );
    fireEvent.press(screen.getByText('Save Workout'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Validation',
      'Please enter a workout name.'
    );
  });

  it('shows validation alert when no exercises have a name', () => {
    renderDesignScreen();

    // Fill workout name but leave exercise name empty
    fireEvent.changeText(
      screen.getByPlaceholderText('e.g. Upper Body Power'),
      'My Workout'
    );
    fireEvent.press(screen.getByText('Save Workout'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Validation',
      'Add at least one exercise with a name.'
    );
  });

  it('adds a new exercise card when pressing Add Exercise', () => {
    renderDesignScreen();

    // Should start with 1 exercise name input
    expect(screen.getAllByPlaceholderText('Exercise name')).toHaveLength(1);

    fireEvent.press(screen.getByText('+ Add Exercise'));

    expect(screen.getAllByPlaceholderText('Exercise name')).toHaveLength(2);
  });

  it('removes an exercise card when pressing Remove', () => {
    renderDesignScreen();

    // Add a second exercise first
    fireEvent.press(screen.getByText('+ Add Exercise'));
    expect(screen.getAllByPlaceholderText('Exercise name')).toHaveLength(2);

    // Remove the first one
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.press(removeButtons[0]);

    expect(screen.getAllByPlaceholderText('Exercise name')).toHaveLength(1);
  });

  it('allows typing a workout name', () => {
    renderDesignScreen();

    const nameInput = screen.getByPlaceholderText('e.g. Upper Body Power');
    fireEvent.changeText(nameInput, 'Leg Day');

    expect(nameInput.props.value).toBe('Leg Day');
  });

  it('allows typing an exercise name', () => {
    renderDesignScreen();

    const exerciseInput = screen.getByPlaceholderText('Exercise name');
    fireEvent.changeText(exerciseInput, 'Squats');

    expect(exerciseInput.props.value).toBe('Squats');
  });

  it('renders the default sets value of 3', () => {
    renderDesignScreen();
    // The sets field should show "3" as default
    expect(screen.getByDisplayValue('3')).toBeTruthy();
  });

  it('renders the default reps value of 10', () => {
    renderDesignScreen();
    // The reps field should show "10" as default
    expect(screen.getByDisplayValue('10')).toBeTruthy();
  });
});
