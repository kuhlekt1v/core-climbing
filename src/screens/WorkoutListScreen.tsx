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
      // Monday – Power & Finger Strength
      {
        id: 'mon-1',
        name: 'Climbing Warm Up / Light Climbing',
        description: 'Easy climbing to warm up muscles and joints',
        sets: 1,
        duration: 600, // 10 minutes
        category: 'power-finger',
        dayOfWeek: 'monday',
        phase: 1,
        instructions: [
          'Start with easy routes',
          'Focus on movement quality',
          'Gradually increase difficulty',
          'Listen to your body',
        ],
      },
      {
        id: 'mon-2a',
        name: 'Repeaters',
        description: 'Hangboard Circuit - Repeaters',
        sets: 5,
        reps: 6,
        duration: 7,
        restSeconds: 3,
        category: 'power-finger',
        dayOfWeek: 'monday',
        phase: 1,
        instructions: [
          '7 seconds on, 3 seconds off',
          '6 reps per set',
          '3-5 sets total',
          'Rest 2-3 minutes between sets',
        ],
      },
      {
        id: 'mon-2b',
        name: 'Weighted Hang',
        description: 'Hangboard Circuit - Weighted Hang',
        sets: 5,
        duration: 10,
        restSeconds: 120,
        category: 'power-finger',
        dayOfWeek: 'monday',
        phase: 1,
        instructions: [
          '10 second hang',
          '2 minute rest between sets',
          '5 sets total',
          'Add weight as appropriate',
        ],
        weight: 0,
      },
      {
        id: 'mon-2c',
        name: 'Power Endurance Sequence',
        description: 'Hangboard Circuit - Power Endurance',
        sets: 6,
        duration: 8,
        restSeconds: 15,
        category: 'power-finger',
        dayOfWeek: 'monday',
        phase: 1,
        instructions: [
          '8 seconds each: medium crimp, sloper, pinch',
          '15 second rest between grips',
          '5-6 sets total',
          'Maintain good form',
        ],
      },
      {
        id: 'mon-3',
        name: 'Limit Bouldering Attempts',
        description: 'Work on maximum difficulty boulders',
        sets: 1,
        reps: 5,
        category: 'power-finger',
        dayOfWeek: 'monday',
        phase: 1,
        instructions: [
          'Choose problems at or near your limit',
          'Focus on quality attempts',
          'Rest fully between attempts',
          'Stop before fatigue',
        ],
      },
      // Tuesday – Core Stability & Strength A
      {
        id: 'tue-1',
        name: 'Core Stability',
        description: 'General core stability work',
        sets: 3,
        reps: 10,
        category: 'core-stability',
        dayOfWeek: 'tuesday',
        phase: 1,
        instructions: [
          'Focus on controlled movements',
          'Maintain neutral spine',
          'Breathe throughout',
        ],
      },
      {
        id: 'tue-2a',
        name: 'Goblet Squat',
        description: 'Lower body strength',
        sets: 4,
        reps: 8,
        category: 'strength-training',
        dayOfWeek: 'tuesday',
        phase: 1,
        instructions: [
          'Hold weight at chest',
          'Squat to parallel or below',
          'Keep chest up',
          'Drive through heels',
        ],
        weight: 0,
      },
      {
        id: 'tue-2b',
        name: 'Bench Press / Ring Pushups',
        description: 'Antagonist push exercise',
        sets: 4,
        reps: 10,
        category: 'strength-training',
        dayOfWeek: 'tuesday',
        phase: 1,
        instructions: [
          'Lower with control',
          'Full range of motion',
          'Maintain tension throughout',
          'Choose appropriate variation',
        ],
      },
      {
        id: 'tue-2c',
        name: 'Bulgarian Split Squat',
        description: 'Single leg strength',
        sets: 3,
        reps: 8,
        category: 'strength-training',
        dayOfWeek: 'tuesday',
        phase: 1,
        instructions: [
          'Rear foot elevated',
          '8 reps each leg',
          'Keep torso upright',
          'Control the descent',
        ],
      },
      {
        id: 'tue-2d',
        name: 'Ring Rows',
        description: 'Horizontal pulling strength',
        sets: 3,
        reps: 12,
        category: 'strength-training',
        dayOfWeek: 'tuesday',
        phase: 1,
        instructions: [
          'Body straight from head to heels',
          'Pull chest to rings',
          'Control the return',
          'Adjust angle for difficulty',
        ],
      },
      {
        id: 'tue-2e',
        name: 'Farmer Carry',
        description: 'Grip and core endurance',
        sets: 3,
        duration: 40,
        category: 'strength-training',
        dayOfWeek: 'tuesday',
        phase: 1,
        instructions: [
          'Hold heavy weights at sides',
          'Walk for 30-40 seconds',
          'Keep shoulders back',
          'Maintain upright posture',
        ],
        weight: 0,
      },
      // Keep some legacy exercises for other phases/days
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

  const startWorkout = async (category: string, dayOfWeek?: string) => {
    let categoryExercises = exercises.filter(e => e.category === category);
    
    // If dayOfWeek is specified, filter by that as well
    if (dayOfWeek) {
      categoryExercises = categoryExercises.filter(e => e.dayOfWeek === dayOfWeek);
    }
    
    if (categoryExercises.length === 0) {
      Alert.alert('No Exercises', 'No exercises found for this category');
      return;
    }

    const workoutExercises: WorkoutExercise[] = categoryExercises.map(e => ({
      id: `${Date.now()}-${e.id}`,
      exerciseId: e.id,
      expectedSets: e.sets || 3,
      expectedReps: e.reps,
      expectedDuration: e.duration,
      actualSets: undefined,
      actualReps: undefined,
      actualDuration: undefined,
      completed: false,
      weight: e.weight,
    }));

    const workout: Workout = {
      id: Date.now().toString(),
      userId: user?.id || '',
      name: dayOfWeek 
        ? `${dayOfWeek.toUpperCase()} - ${category.replace('-', ' ').toUpperCase()}`
        : `${category.replace('-', ' ').toUpperCase()} - Phase ${selectedPhase}`,
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
        return 'Core Stability';
      case 'climbing-booster':
        return 'Climbing Booster';
      case 'active-recovery':
        return 'Active Recovery';
      case 'power-finger':
        return 'Power & Finger Strength';
      case 'strength-training':
        return 'Strength Training';
      default:
        return category;
    }
  };

  const getCategories = () => {
    const uniqueCategories = [...new Set(exercises.map(e => e.category))];
    return uniqueCategories;
  };

  const getDayWorkouts = () => {
    const dayWorkouts: { [key: string]: Exercise[] } = {};
    
    exercises.forEach(exercise => {
      if (exercise.dayOfWeek) {
        if (!dayWorkouts[exercise.dayOfWeek]) {
          dayWorkouts[exercise.dayOfWeek] = [];
        }
        dayWorkouts[exercise.dayOfWeek].push(exercise);
      }
    });
    
    return dayWorkouts;
  };

  const getDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const startDayWorkout = async (day: string) => {
    const dayExercises = exercises.filter(e => e.dayOfWeek === day);
    
    if (dayExercises.length === 0) {
      Alert.alert('No Exercises', 'No exercises found for this day');
      return;
    }

    const workoutExercises: WorkoutExercise[] = dayExercises.map(e => ({
      id: `${Date.now()}-${e.id}`,
      exerciseId: e.id,
      expectedSets: e.sets || 3,
      expectedReps: e.reps,
      expectedDuration: e.duration,
      actualSets: undefined,
      actualReps: undefined,
      actualDuration: undefined,
      completed: false,
      weight: e.weight,
    }));

    const workout: Workout = {
      id: Date.now().toString(),
      userId: user?.id || '',
      name: `${getDayName(day)} Workout`,
      date: new Date(),
      exercises: workoutExercises,
      totalDuration: 0,
      phase: selectedPhase,
      completed: false,
    };

    await StorageService.saveWorkout(workout);
    navigation.navigate('WorkoutSession', { workoutId: workout.id });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Programs</Text>
        <Text style={styles.subtitle}>Choose a workout day or browse by category</Text>
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

      {/* Weekly Schedule */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Weekly Schedule</Text>
      </View>
      {Object.entries(getDayWorkouts()).map(([day, dayExercises]) => (
        <View key={day} style={styles.categoryCard}>
          <Text style={styles.categoryTitle}>{getDayName(day)}</Text>
          <Text style={styles.categorySubtitle}>
            {dayExercises.length} exercises
          </Text>
          
          <View style={styles.exercisesList}>
            {dayExercises.map((exercise) => (
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
            onPress={() => startDayWorkout(day)}
          >
            <Text style={styles.startButtonText}>Start {getDayName(day)} Workout</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Category-based workouts */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Browse by Category</Text>
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
                .slice(0, 3) // Show first 3 exercises
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
    paddingTop: 0,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
