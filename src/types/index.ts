export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number | null;
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
