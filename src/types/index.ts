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
