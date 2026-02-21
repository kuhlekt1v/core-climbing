import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StorageService } from '../services/storage';
import { Exercise, Workout, WorkoutExercise } from '../types';
import { useAuth } from '../context/AuthContext';

export default function WorkoutListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    loadExercises();
  }, [selectedPhase]);

  const loadExercises = async () => {
    let allExercises = await StorageService.getExercises();
    
    // Initialize default exercises if none exist
    if (allExercises.length === 0) {
      allExercises = getDefaultExercises();
      await StorageService.saveExercises(allExercises);
    }
    
    const filtered = allExercises.filter(e => e.phase === selectedPhase);
    setExercises(filtered);
  };

  const getDefaultExercises = (): Exercise[] => {
    return [
      // Phase 1 - Core Stability
      {
        id: '1',
        name: 'Dead Bug',
        description: 'Core stability exercise for spinal control',
        sets: 3,
        reps: 10,
        category: 'core-stability',
        phase: 1,
        instructions: [
          'Lie on your back with arms extended toward ceiling',
          'Lift knees to 90 degrees',
          'Slowly lower opposite arm and leg',
          'Keep lower back pressed to floor',
        ],
      },
      {
        id: '2',
        name: 'Bird Dog',
        description: 'Anti-rotation core exercise',
        sets: 3,
        reps: 10,
        category: 'core-stability',
        phase: 1,
        instructions: [
          'Start on hands and knees',
          'Extend opposite arm and leg',
          'Keep hips level',
          'Hold for 3 seconds',
        ],
      },
      {
        id: '3',
        name: 'Plank',
        description: 'Isometric core strengthening',
        sets: 3,
        duration: 30,
        category: 'core-stability',
        phase: 1,
        instructions: [
          'Start in forearm plank position',
          'Keep body in straight line',
          'Engage core',
          'Hold position',
        ],
      },
      // Phase 2 - Climbing Booster
      {
        id: '4',
        name: 'Scapular Pull-ups',
        description: 'Shoulder stability for climbing',
        sets: 3,
        reps: 8,
        category: 'climbing-booster',
        phase: 2,
        instructions: [
          'Hang from pull-up bar',
          'Retract shoulder blades',
          'Lower with control',
        ],
      },
      {
        id: '5',
        name: 'Pallof Press',
        description: 'Anti-rotation for climbing movements',
        sets: 3,
        reps: 12,
        category: 'climbing-booster',
        phase: 2,
        instructions: [
          'Stand with resistance band at chest height',
          'Press band away from body',
          'Resist rotation',
        ],
      },
      // Phase 3
      {
        id: '6',
        name: 'Hanging Knee Raises',
        description: 'Advanced core control for overhangs',
        sets: 3,
        reps: 10,
        category: 'climbing-booster',
        phase: 3,
        instructions: [
          'Hang from pull-up bar',
          'Raise knees to chest',
          'Control descent',
        ],
      },
    ];
  };

  const startWorkout = async (category: string) => {
    const categoryExercises = exercises.filter(e => e.category === category);
    
    if (categoryExercises.length === 0) {
      Alert.alert('No Exercises', 'No exercises found for this category');
      return;
    }

    const workoutExercises: WorkoutExercise[] = categoryExercises.map(e => ({
      id: `${Date.now()}-${e.id}`,
      exerciseId: e.id,
      sets: e.sets || 3,
      reps: e.reps,
      duration: e.duration,
      completed: false,
    }));

    const workout: Workout = {
      id: Date.now().toString(),
      userId: user?.id || '',
      name: `${category.replace('-', ' ').toUpperCase()} - Phase ${selectedPhase}`,
      date: new Date(),
      exercises: workoutExercises,
      totalDuration: 0,
      phase: selectedPhase,
      completed: false,
    };

    await StorageService.saveWorkout(workout);
    navigation.navigate('WorkoutSession', { workoutId: workout.id });
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'core-stability':
        return 'Core Stability Routine';
      case 'climbing-booster':
        return 'Climbing Booster';
      case 'active-recovery':
        return 'Active Recovery';
      default:
        return category;
    }
  };

  const getCategories = () => {
    const uniqueCategories = [...new Set(exercises.map(e => e.category))];
    return uniqueCategories;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Programs</Text>
        <Text style={styles.subtitle}>Select your current phase</Text>
      </View>

      <View style={styles.phaseSelector}>
        {[1, 2, 3].map((phase) => (
          <TouchableOpacity
            key={phase}
            style={[
              styles.phaseButton,
              selectedPhase === phase && styles.phaseButtonActive,
            ]}
            onPress={() => setSelectedPhase(phase as 1 | 2 | 3)}
          >
            <Text
              style={[
                styles.phaseButtonText,
                selectedPhase === phase && styles.phaseButtonTextActive,
              ]}
            >
              Phase {phase}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.categoriesContainer}>
        {getCategories().map((category) => (
          <View key={category} style={styles.categoryCard}>
            <Text style={styles.categoryTitle}>{getCategoryName(category)}</Text>
            <Text style={styles.categorySubtitle}>
              {exercises.filter(e => e.category === category).length} exercises
            </Text>
            
            <View style={styles.exercisesList}>
              {exercises
                .filter(e => e.category === category)
                .map((exercise) => (
                  <View key={exercise.id} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDetails}>
                      {exercise.sets} sets
                      {exercise.reps && ` × ${exercise.reps} reps`}
                      {exercise.duration && ` × ${exercise.duration}s`}
                    </Text>
                  </View>
                ))}
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => startWorkout(category)}
            >
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  phaseSelector: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
  },
  phaseButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  phaseButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  phaseButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  phaseButtonTextActive: {
    color: '#fff',
  },
  categoriesContainer: {
    padding: 20,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  exercisesList: {
    marginBottom: 15,
  },
  exerciseItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  startButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
