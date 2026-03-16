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
  category: 'core-stability' | 'climbing-booster' | 'active-recovery' | 'power-finger' | 'lower-body-push';
  dayOfWeek?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  phase: 1 | 2 | 3;
  instructions: string[];
  weight?: number; // for weighted exercises
  restSeconds?: number; // rest time between sets
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  expectedSets: number;
  expectedReps?: number;
  expectedDuration?: number;
  actualSets?: number;
  actualReps?: number;
  actualDuration?: number;
  completed: boolean;
  notes?: string;
  weight?: number;
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
