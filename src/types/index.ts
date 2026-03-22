export interface Exercise {
  id: string;
  name: string;
  sets: number;
  /** Number of repetitions. Mutually exclusive with `duration`. */
  reps: number | null;
  /** Duration in seconds. Mutually exclusive with `reps`. */
  duration: number | null;
  weight: number | null;
  isBodyweight: boolean;
  isPerSide: boolean;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
}

/** Logged actuals for a single set of an exercise. */
export interface SetLog {
  setNumber: number;
  actualReps: number | null;
  actualDuration: number | null;
  actualWeight: number | null;
}

/** Logged actuals for one exercise within a session. */
export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
}

/** A completed (or in-progress) workout session. */
export interface WorkoutSession {
  id: string;
  workoutId: string;
  startedAt: string;
  finishedAt: string | null;
  exerciseLogs: ExerciseLog[];
}
