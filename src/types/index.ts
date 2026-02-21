export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface PainLevel {
  id: string;
  userId: string;
  workoutId: string;
  level: number; // 0-10 scale
  location: string;
  notes: string;
  timestamp: Date;
  type: 'before' | 'after';
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets?: number;
  reps?: number;
  duration?: number; // in seconds
  category: 'core-stability' | 'climbing-booster' | 'active-recovery';
  phase: 1 | 2 | 3;
  instructions: string[];
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: number;
  reps?: number;
  duration?: number;
  completed: boolean;
  notes?: string;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  date: Date;
  exercises: WorkoutExercise[];
  totalDuration: number;
  painBefore?: PainLevel;
  painAfter?: PainLevel;
  phase: 1 | 2 | 3;
  completed: boolean;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  startTime: Date;
  endTime?: Date;
  currentExerciseIndex: number;
  timerSeconds: number;
  isPaused: boolean;
}

export interface ProgressData {
  date: Date;
  painLevel: number;
  workoutsCompleted: number;
  totalDuration: number;
}

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Home: undefined;
  WorkoutList: undefined;
  WorkoutSession: { workoutId: string };
  Progress: undefined;
  Profile: undefined;
};
