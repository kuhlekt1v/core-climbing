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

/** Represents a single set performed during a workout session */
export interface SetLog {
  /** Actual repetitions completed (for rep-based exercises) */
  reps: number | null;
  /** Actual duration completed in seconds (for duration-based exercises) */
  duration: number | null;
  /** Actual weight used */
  weight: number | null;
  /** Whether this was completed for each side (for unilateral exercises) */
  completedBothSides: boolean;
}

/** Represents the logged performance of an exercise during a workout session */
export interface ExerciseLog {
  /** Reference to the original exercise template */
  exerciseId: string;
  /** Name of the exercise (denormalized for historical reference) */
  name: string;
  /** Expected number of sets from the template */
  expectedSets: number;
  /** Expected reps from the template */
  expectedReps: number | null;
  /** Expected duration from the template */
  expectedDuration: number | null;
  /** Expected weight from the template */
  expectedWeight: number | null;
  /** Whether this is a bodyweight exercise */
  isBodyweight: boolean;
  /** Whether this is a per-side exercise */
  isPerSide: boolean;
  /** Array of completed sets */
  completedSets: SetLog[];
}

/** Represents a completed workout session */
export interface WorkoutSession {
  id: string;
  /** Reference to the original workout template */
  workoutId: string;
  /** Name of the workout (denormalized for historical reference) */
  workoutName: string;
  /** When the session started */
  startTime: Date;
  /** When the session ended (null if in progress) */
  endTime: Date | null;
  /** Total elapsed time in seconds */
  elapsedTime: number;
  /** Logs for each exercise performed */
  exerciseLogs: ExerciseLog[];
}
