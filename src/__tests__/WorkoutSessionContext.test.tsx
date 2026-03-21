import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { WorkoutSessionProvider, useWorkoutSession } from '../context/WorkoutSessionContext';
import type { Workout } from '../types';

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

describe('WorkoutSessionContext', () => {
  it('throws error when used outside provider', () => {
    expect(() => renderHook(() => useWorkoutSession())).toThrow(
      'useWorkoutSession must be used within a WorkoutSessionProvider'
    );
  });

  it('starts with no active session and empty session history', () => {
    const { result } = renderHook(() => useWorkoutSession(), {
      wrapper: WorkoutSessionProvider,
    });

    expect(result.current.activeSession).toBeNull();
    expect(result.current.sessions).toEqual([]);
  });

  it('starts a new workout session', () => {
    const { result } = renderHook(() => useWorkoutSession(), {
      wrapper: WorkoutSessionProvider,
    });

    act(() => {
      result.current.startSession(sampleWorkout);
    });

    expect(result.current.activeSession).not.toBeNull();
    expect(result.current.activeSession?.workoutId).toBe('w1');
    expect(result.current.activeSession?.workoutName).toBe('Upper Body');
    expect(result.current.activeSession?.exerciseLogs).toHaveLength(2);
    expect(result.current.activeSession?.elapsedTime).toBe(0);
    expect(result.current.activeSession?.endTime).toBeNull();
  });

  it('initializes exercise logs correctly', () => {
    const { result } = renderHook(() => useWorkoutSession(), {
      wrapper: WorkoutSessionProvider,
    });

    act(() => {
      result.current.startSession(sampleWorkout);
    });

    const exerciseLogs = result.current.activeSession!.exerciseLogs;

    expect(exerciseLogs[0].exerciseId).toBe('e1');
    expect(exerciseLogs[0].name).toBe('Pull-ups');
    expect(exerciseLogs[0].expectedSets).toBe(3);
    expect(exerciseLogs[0].expectedReps).toBe(8);
    expect(exerciseLogs[0].expectedDuration).toBeNull();
    expect(exerciseLogs[0].completedSets).toEqual([]);

    expect(exerciseLogs[1].exerciseId).toBe('e2');
    expect(exerciseLogs[1].name).toBe('Plank');
    expect(exerciseLogs[1].expectedSets).toBe(3);
    expect(exerciseLogs[1].expectedReps).toBeNull();
    expect(exerciseLogs[1].expectedDuration).toBe(60);
    expect(exerciseLogs[1].completedSets).toEqual([]);
  });

  it('logs a set to an exercise', () => {
    const { result } = renderHook(() => useWorkoutSession(), {
      wrapper: WorkoutSessionProvider,
    });

    act(() => {
      result.current.startSession(sampleWorkout);
    });

    act(() => {
      result.current.logSet(0, {
        reps: 8,
        duration: null,
        weight: null,
        completedBothSides: false,
      });
    });

    const exerciseLogs = result.current.activeSession!.exerciseLogs;
    expect(exerciseLogs[0].completedSets).toHaveLength(1);
    expect(exerciseLogs[0].completedSets[0].reps).toBe(8);
    expect(exerciseLogs[0].completedSets[0].weight).toBeNull();
  });

  it('logs multiple sets to an exercise', () => {
    const { result } = renderHook(() => useWorkoutSession(), {
      wrapper: WorkoutSessionProvider,
    });

    act(() => {
      result.current.startSession(sampleWorkout);
    });

    act(() => {
      result.current.logSet(0, {
        reps: 8,
        duration: null,
        weight: null,
        completedBothSides: false,
      });
    });

    act(() => {
      result.current.logSet(0, {
        reps: 7,
        duration: null,
        weight: null,
        completedBothSides: false,
      });
    });

    const exerciseLogs = result.current.activeSession!.exerciseLogs;
    expect(exerciseLogs[0].completedSets).toHaveLength(2);
    expect(exerciseLogs[0].completedSets[0].reps).toBe(8);
    expect(exerciseLogs[0].completedSets[1].reps).toBe(7);
  });

  it('logs duration-based exercises', () => {
    const { result } = renderHook(() => useWorkoutSession(), {
      wrapper: WorkoutSessionProvider,
    });

    act(() => {
      result.current.startSession(sampleWorkout);
    });

    act(() => {
      result.current.logSet(1, {
        reps: null,
        duration: 60,
        weight: null,
        completedBothSides: false,
      });
    });

    const exerciseLogs = result.current.activeSession!.exerciseLogs;
    expect(exerciseLogs[1].completedSets).toHaveLength(1);
    expect(exerciseLogs[1].completedSets[0].duration).toBe(60);
    expect(exerciseLogs[1].completedSets[0].reps).toBeNull();
  });

  it('updates elapsed time', () => {
    const { result } = renderHook(() => useWorkoutSession(), {
      wrapper: WorkoutSessionProvider,
    });

    act(() => {
      result.current.startSession(sampleWorkout);
    });

    act(() => {
      result.current.updateElapsedTime(120);
    });

    expect(result.current.activeSession?.elapsedTime).toBe(120);
  });

  it('finishes a session and saves it to history', () => {
    const { result } = renderHook(() => useWorkoutSession(), {
      wrapper: WorkoutSessionProvider,
    });

    act(() => {
      result.current.startSession(sampleWorkout);
    });

    act(() => {
      result.current.logSet(0, {
        reps: 8,
        duration: null,
        weight: null,
        completedBothSides: false,
      });
    });

    act(() => {
      result.current.finishSession();
    });

    expect(result.current.activeSession).toBeNull();
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].workoutName).toBe('Upper Body');
    expect(result.current.sessions[0].endTime).not.toBeNull();
  });

  it('cancels a session without saving', () => {
    const { result } = renderHook(() => useWorkoutSession(), {
      wrapper: WorkoutSessionProvider,
    });

    act(() => {
      result.current.startSession(sampleWorkout);
    });

    act(() => {
      result.current.logSet(0, {
        reps: 8,
        duration: null,
        weight: null,
        completedBothSides: false,
      });
    });

    act(() => {
      result.current.cancelSession();
    });

    expect(result.current.activeSession).toBeNull();
    expect(result.current.sessions).toHaveLength(0);
  });
});
