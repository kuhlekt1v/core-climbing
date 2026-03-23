import React, { createContext, useContext, useState, useCallback } from 'react';
import { WorkoutSession, ExerciseLog, SetLog, Workout } from '../types';

interface WorkoutSessionContextValue {
  /** Currently active workout session (null if none) */
  activeSession: WorkoutSession | null;
  /** Historical workout sessions */
  sessions: WorkoutSession[];
  /** Start a new workout session */
  startSession: (workout: Workout) => void;
  /** Add a completed set to the current exercise */
  logSet: (exerciseIndex: number, setLog: SetLog) => void;
  /** Complete the current workout session */
  finishSession: () => void;
  /** Cancel the current workout session without saving */
  cancelSession: () => void;
  /** Update the elapsed time of the active session */
  updateElapsedTime: (seconds: number) => void;
}

const WorkoutSessionContext = createContext<WorkoutSessionContextValue | undefined>(undefined);

export function WorkoutSessionProvider({ children }: { children: React.ReactNode }) {
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  const startSession = useCallback((workout: Workout) => {
    const exerciseLogs: ExerciseLog[] = workout.exercises.map((exercise) => ({
      exerciseId: exercise.id,
      name: exercise.name,
      expectedSets: exercise.sets,
      expectedReps: exercise.reps,
      expectedDuration: exercise.duration,
      expectedWeight: exercise.weight,
      isBodyweight: exercise.isBodyweight,
      isPerSide: exercise.isPerSide,
      completedSets: [],
    }));

    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      workoutId: workout.id,
      workoutName: workout.name,
      startTime: new Date(),
      endTime: null,
      elapsedTime: 0,
      exerciseLogs,
    };

    setActiveSession(newSession);
  }, []);

  const logSet = useCallback((exerciseIndex: number, setLog: SetLog) => {
    setActiveSession((prev) => {
      if (!prev) return prev;

      const updatedLogs = [...prev.exerciseLogs];
      updatedLogs[exerciseIndex] = {
        ...updatedLogs[exerciseIndex],
        completedSets: [...updatedLogs[exerciseIndex].completedSets, setLog],
      };

      return {
        ...prev,
        exerciseLogs: updatedLogs,
      };
    });
  }, []);

  const updateElapsedTime = useCallback((seconds: number) => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elapsedTime: seconds,
      };
    });
  }, []);

  const finishSession = useCallback(() => {
    setActiveSession((prev) => {
      if (!prev) return prev;

      const completedSession: WorkoutSession = {
        ...prev,
        endTime: new Date(),
      };

      setSessions((prevSessions) => [...prevSessions, completedSession]);
      return null;
    });
  }, []);

  const cancelSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  return (
    <WorkoutSessionContext.Provider
      value={{
        activeSession,
        sessions,
        startSession,
        logSet,
        finishSession,
        cancelSession,
        updateElapsedTime,
      }}
    >
      {children}
    </WorkoutSessionContext.Provider>
  );
}

export function useWorkoutSession() {
  const context = useContext(WorkoutSessionContext);
  if (!context) {
    throw new Error('useWorkoutSession must be used within a WorkoutSessionProvider');
  }
  return context;
}
