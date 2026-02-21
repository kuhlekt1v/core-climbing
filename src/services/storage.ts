import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Workout, Exercise, PainLevel } from '../types';

const KEYS = {
  USER: '@core_climbing:user',
  WORKOUTS: '@core_climbing:workouts',
  EXERCISES: '@core_climbing:exercises',
  PAIN_LEVELS: '@core_climbing:pain_levels',
  STAY_LOGGED_IN: '@core_climbing:stay_logged_in',
};

export const StorageService = {
  // User methods
  async saveUser(user: User): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async getUser(): Promise<User | null> {
    const data = await AsyncStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER);
  },

  async setStayLoggedIn(value: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.STAY_LOGGED_IN, JSON.stringify(value));
  },

  async getStayLoggedIn(): Promise<boolean> {
    const data = await AsyncStorage.getItem(KEYS.STAY_LOGGED_IN);
    if (data === null || data === undefined) {
      return false;
    }
    // Ensure proper boolean conversion
    try {
      const parsed = JSON.parse(data);
      return parsed === true;
    } catch {
      // Handle string values directly
      return data === 'true';
    }
  },

  // Workout methods
  async saveWorkout(workout: Workout): Promise<void> {
    const workouts = await this.getWorkouts();
    const index = workouts.findIndex(w => w.id === workout.id);
    
    if (index >= 0) {
      workouts[index] = workout;
    } else {
      workouts.push(workout);
    }
    
    await AsyncStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
  },

  async getWorkouts(): Promise<Workout[]> {
    const data = await AsyncStorage.getItem(KEYS.WORKOUTS);
    return data ? JSON.parse(data) : [];
  },

  async getWorkoutById(id: string): Promise<Workout | null> {
    const workouts = await this.getWorkouts();
    return workouts.find(w => w.id === id) || null;
  },

  async deleteWorkout(id: string): Promise<void> {
    const workouts = await this.getWorkouts();
    const filtered = workouts.filter(w => w.id !== id);
    await AsyncStorage.setItem(KEYS.WORKOUTS, JSON.stringify(filtered));
  },

  // Exercise methods
  async saveExercises(exercises: Exercise[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.EXERCISES, JSON.stringify(exercises));
  },

  async getExercises(): Promise<Exercise[]> {
    const data = await AsyncStorage.getItem(KEYS.EXERCISES);
    return data ? JSON.parse(data) : [];
  },

  async getExercisesByPhase(phase: 1 | 2 | 3): Promise<Exercise[]> {
    const exercises = await this.getExercises();
    return exercises.filter(e => e.phase === phase);
  },

  // Pain level methods
  async savePainLevel(painLevel: PainLevel): Promise<void> {
    const painLevels = await this.getPainLevels();
    painLevels.push(painLevel);
    await AsyncStorage.setItem(KEYS.PAIN_LEVELS, JSON.stringify(painLevels));
  },

  async getPainLevels(): Promise<PainLevel[]> {
    const data = await AsyncStorage.getItem(KEYS.PAIN_LEVELS);
    return data ? JSON.parse(data) : [];
  },

  async getPainLevelsByWorkout(workoutId: string): Promise<PainLevel[]> {
    const painLevels = await this.getPainLevels();
    return painLevels.filter(p => p.workoutId === workoutId);
  },

  // Clear all data
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      KEYS.USER,
      KEYS.WORKOUTS,
      KEYS.EXERCISES,
      KEYS.PAIN_LEVELS,
      KEYS.STAY_LOGGED_IN,
    ]);
  },
};
