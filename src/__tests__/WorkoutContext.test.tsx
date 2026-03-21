import React from 'react';
import { Text, Button } from 'react-native';
import { renderHook, act } from '@testing-library/react-native';
import { WorkoutProvider, useWorkouts } from '../context/WorkoutContext';
import type { Workout } from '../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WorkoutProvider>{children}</WorkoutProvider>
);

const makeWorkout = (overrides: Partial<Workout> = {}): Workout => ({
  id: 'w1',
  name: 'Test Workout',
  exercises: [
    {
      id: 'e1',
      name: 'Push-ups',
      sets: 3,
      reps: 10,
      duration: null,
      weight: null,
      isBodyweight: true,
      isPerSide: false,
    },
  ],
  ...overrides,
});

describe('WorkoutContext', () => {
  it('starts with an empty workouts array', () => {
    const { result } = renderHook(() => useWorkouts(), { wrapper });
    expect(result.current.workouts).toEqual([]);
  });

  it('addWorkout appends a workout', () => {
    const { result } = renderHook(() => useWorkouts(), { wrapper });
    const workout = makeWorkout();

    act(() => {
      result.current.addWorkout(workout);
    });

    expect(result.current.workouts).toHaveLength(1);
    expect(result.current.workouts[0]).toEqual(workout);
  });

  it('addWorkout can add multiple workouts', () => {
    const { result } = renderHook(() => useWorkouts(), { wrapper });

    act(() => {
      result.current.addWorkout(makeWorkout({ id: 'w1', name: 'First' }));
    });
    act(() => {
      result.current.addWorkout(makeWorkout({ id: 'w2', name: 'Second' }));
    });

    expect(result.current.workouts).toHaveLength(2);
    expect(result.current.workouts[0].name).toBe('First');
    expect(result.current.workouts[1].name).toBe('Second');
  });

  it('updateWorkout replaces the workout with matching id', () => {
    const { result } = renderHook(() => useWorkouts(), { wrapper });
    const original = makeWorkout({ id: 'w1', name: 'Original' });

    act(() => {
      result.current.addWorkout(original);
    });

    const updated = { ...original, name: 'Updated' };
    act(() => {
      result.current.updateWorkout(updated);
    });

    expect(result.current.workouts).toHaveLength(1);
    expect(result.current.workouts[0].name).toBe('Updated');
  });

  it('updateWorkout does not affect other workouts', () => {
    const { result } = renderHook(() => useWorkouts(), { wrapper });

    act(() => {
      result.current.addWorkout(makeWorkout({ id: 'w1', name: 'First' }));
    });
    act(() => {
      result.current.addWorkout(makeWorkout({ id: 'w2', name: 'Second' }));
    });

    act(() => {
      result.current.updateWorkout(
        makeWorkout({ id: 'w1', name: 'First Updated' })
      );
    });

    expect(result.current.workouts[0].name).toBe('First Updated');
    expect(result.current.workouts[1].name).toBe('Second');
  });

  it('deleteWorkout removes the workout with matching id', () => {
    const { result } = renderHook(() => useWorkouts(), { wrapper });

    act(() => {
      result.current.addWorkout(makeWorkout({ id: 'w1' }));
    });

    act(() => {
      result.current.deleteWorkout('w1');
    });

    expect(result.current.workouts).toHaveLength(0);
  });

  it('deleteWorkout only removes the targeted workout', () => {
    const { result } = renderHook(() => useWorkouts(), { wrapper });

    act(() => {
      result.current.addWorkout(makeWorkout({ id: 'w1', name: 'Keep' }));
    });
    act(() => {
      result.current.addWorkout(makeWorkout({ id: 'w2', name: 'Remove' }));
    });

    act(() => {
      result.current.deleteWorkout('w2');
    });

    expect(result.current.workouts).toHaveLength(1);
    expect(result.current.workouts[0].name).toBe('Keep');
  });

  it('deleteWorkout is a no-op for non-existent id', () => {
    const { result } = renderHook(() => useWorkouts(), { wrapper });

    act(() => {
      result.current.addWorkout(makeWorkout({ id: 'w1' }));
    });

    act(() => {
      result.current.deleteWorkout('nonexistent');
    });

    expect(result.current.workouts).toHaveLength(1);
  });

  it('useWorkouts throws when used outside WorkoutProvider', () => {
    // Suppress console.error for the expected error
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useWorkouts());
    }).toThrow('useWorkouts must be used within a WorkoutProvider');
    spy.mockRestore();
  });
});
