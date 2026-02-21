import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { StorageService } from '../services/storage';
import { Workout, PainLevel, Exercise } from '../types';

export default function WorkoutSessionScreen({ route, navigation }: any) {
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [painBefore, setPainBefore] = useState<number>(0);
  const [painAfter, setPainAfter] = useState<number>(0);
  const [painNotes, setPainNotes] = useState('');
  const [showPainInput, setShowPainInput] = useState<'before' | 'after' | null>('before');

  useEffect(() => {
    loadWorkout();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const loadWorkout = async () => {
    const loadedWorkout = await StorageService.getWorkoutById(workoutId);
    if (loadedWorkout) {
      setWorkout(loadedWorkout);
      const allExercises = await StorageService.getExercises();
      const workoutExercises = loadedWorkout.exercises.map(we => 
        allExercises.find(e => e.id === we.exerciseId)
      ).filter(Boolean) as Exercise[];
      setExercises(workoutExercises);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const addTime = (seconds: number) => {
    setTimerSeconds(prev => Math.max(0, prev + seconds));
  };

  const resetTimer = () => {
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  const recordPainBefore = async () => {
    if (!workout) return;

    const painLevel: PainLevel = {
      id: Date.now().toString(),
      userId: workout.userId,
      workoutId: workout.id,
      level: painBefore,
      location: '',
      notes: painNotes,
      timestamp: new Date(),
      type: 'before',
    };

    await StorageService.savePainLevel(painLevel);
    
    const updatedWorkout = {
      ...workout,
      painBefore: painLevel,
    };
    await StorageService.saveWorkout(updatedWorkout);
    setWorkout(updatedWorkout);
    setShowPainInput(null);
    setPainNotes('');
  };

  const completeExercise = async () => {
    if (!workout) return;

    const updatedExercises = [...workout.exercises];
    updatedExercises[currentExerciseIndex].completed = true;

    const updatedWorkout = {
      ...workout,
      exercises: updatedExercises,
    };

    await StorageService.saveWorkout(updatedWorkout);
    setWorkout(updatedWorkout);

    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      setShowPainInput('after');
    }
  };

  const finishWorkout = async () => {
    if (!workout) return;

    if (painAfter > 0) {
      const painLevel: PainLevel = {
        id: Date.now().toString(),
        userId: workout.userId,
        workoutId: workout.id,
        level: painAfter,
        location: '',
        notes: painNotes,
        timestamp: new Date(),
        type: 'after',
      };

      await StorageService.savePainLevel(painLevel);

      const updatedWorkout = {
        ...workout,
        painAfter: painLevel,
        completed: true,
        totalDuration: timerSeconds,
      };

      await StorageService.saveWorkout(updatedWorkout);
    }

    Alert.alert(
      'Workout Complete!',
      'Great job! Your progress has been saved.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const currentExercise = exercises[currentExerciseIndex];
  const currentWorkoutExercise = workout?.exercises[currentExerciseIndex];

  if (!workout || !currentExercise) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (showPainInput === 'before') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.painInputContainer}>
          <Text style={styles.painTitle}>Pain Level Before Workout</Text>
          <Text style={styles.painSubtitle}>Rate your current pain level (0-10)</Text>
          
          <View style={styles.painScale}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.painButton,
                  painBefore === level && styles.painButtonActive,
                ]}
                onPress={() => setPainBefore(level)}
              >
                <Text
                  style={[
                    styles.painButtonText,
                    painBefore === level && styles.painButtonTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.notesInput}
            placeholder="Add notes about your pain (optional)"
            value={painNotes}
            onChangeText={setPainNotes}
            multiline
          />

          <TouchableOpacity style={styles.continueButton} onPress={recordPainBefore}>
            <Text style={styles.continueButtonText}>Continue to Workout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (showPainInput === 'after') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.painInputContainer}>
          <Text style={styles.painTitle}>Pain Level After Workout</Text>
          <Text style={styles.painSubtitle}>Rate your pain level now (0-10)</Text>
          
          <View style={styles.painScale}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.painButton,
                  painAfter === level && styles.painButtonActive,
                ]}
                onPress={() => setPainAfter(level)}
              >
                <Text
                  style={[
                    styles.painButtonText,
                    painAfter === level && styles.painButtonTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.notesInput}
            placeholder="Add notes about your pain (optional)"
            value={painNotes}
            onChangeText={setPainNotes}
            multiline
          />

          <TouchableOpacity style={styles.continueButton} onPress={finishWorkout}>
            <Text style={styles.continueButtonText}>Finish Workout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.workoutName}>{workout.name}</Text>
        <Text style={styles.progress}>
          Exercise {currentExerciseIndex + 1} of {exercises.length}
        </Text>
      </View>

      <View style={styles.timerCard}>
        <Text style={styles.timerLabel}>Session Time</Text>
        <Text style={styles.timerDisplay}>{formatTime(timerSeconds)}</Text>
        
        <View style={styles.timerControls}>
          <TouchableOpacity style={styles.timerButton} onPress={toggleTimer}>
            <Text style={styles.timerButtonText}>
              {isTimerRunning ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.timerButton} onPress={resetTimer}>
            <Text style={styles.timerButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeAdjust}>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => addTime(-30)}
          >
            <Text style={styles.adjustButtonText}>-30s</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => addTime(-60)}
          >
            <Text style={styles.adjustButtonText}>-1m</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => addTime(30)}
          >
            <Text style={styles.adjustButtonText}>+30s</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => addTime(60)}
          >
            <Text style={styles.adjustButtonText}>+1m</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.exerciseCard}>
        <Text style={styles.exerciseName}>{currentExercise.name}</Text>
        <Text style={styles.exerciseDescription}>
          {currentExercise.description}
        </Text>

        <View style={styles.exerciseDetails}>
          <Text style={styles.detailsText}>
            Sets: {currentWorkoutExercise?.sets || 0}
          </Text>
          {currentWorkoutExercise?.reps && (
            <Text style={styles.detailsText}>
              Reps: {currentWorkoutExercise.reps}
            </Text>
          )}
          {currentWorkoutExercise?.duration && (
            <Text style={styles.detailsText}>
              Duration: {currentWorkoutExercise.duration}s
            </Text>
          )}
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          {currentExercise.instructions.map((instruction, index) => (
            <Text key={index} style={styles.instructionItem}>
              {index + 1}. {instruction}
            </Text>
          ))}
        </View>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={completeExercise}
        >
          <Text style={styles.completeButtonText}>
            {currentExerciseIndex < exercises.length - 1
              ? 'Complete & Next Exercise'
              : 'Complete Workout'}
          </Text>
        </TouchableOpacity>
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
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  progress: {
    fontSize: 16,
    color: '#666',
  },
  timerCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerLabel: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  timerButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  timerButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  timeAdjust: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  adjustButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  adjustButtonText: {
    fontSize: 14,
    color: '#666',
  },
  exerciseCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  detailsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  instructionsContainer: {
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionItem: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    lineHeight: 22,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
  },
  completeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  painInputContainer: {
    padding: 20,
  },
  painTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  painSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  painScale: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  painButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  painButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  painButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  painButtonTextActive: {
    color: '#fff',
  },
  notesInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});
