import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useWorkouts } from '../context/WorkoutContext';
import { useWorkoutSession } from '../context/WorkoutSessionContext';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { SetLog } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutSession'>;

export default function WorkoutSessionScreen({ route, navigation }: Props) {
  const { workoutId } = route.params;
  const { workouts } = useWorkouts();
  const { activeSession, startSession, logSet, finishSession, cancelSession, updateElapsedTime } = useWorkoutSession();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetInputs, setCurrentSetInputs] = useState<{
    reps: string;
    duration: string;
    weight: string;
  }>({ reps: '', duration: '', weight: '' });
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [defaultRestTime, setDefaultRestTime] = useState(45);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const workout = workouts.find((w) => w.id === workoutId);

  useEffect(() => {
    if (workout && !activeSession) {
      startSession(workout);
    }
  }, [workout, activeSession, startSession]);

  // Stopwatch timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const newTime = prev + 1;
        updateElapsedTime(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [updateElapsedTime]);

  // Rest timer
  useEffect(() => {
    if (restTimeRemaining > 0) {
      const interval = setInterval(() => {
        setRestTimeRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [restTimeRemaining]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogSet = useCallback(() => {
    if (!activeSession) return;

    const currentExercise = activeSession.exerciseLogs[currentExerciseIndex];
    const isDurationBased = currentExercise.expectedDuration !== null;
    const isRepBased = currentExercise.expectedReps !== null;

    let setLog: SetLog;

    if (isDurationBased) {
      const duration = parseInt(currentSetInputs.duration, 10);
      if (isNaN(duration) || duration <= 0) {
        Alert.alert('Invalid Input', 'Please enter a valid duration.');
        return;
      }
      setLog = {
        reps: null,
        duration,
        weight: currentExercise.isBodyweight ? null : parseFloat(currentSetInputs.weight) || null,
        completedBothSides: currentExercise.isPerSide,
      };
    } else if (isRepBased) {
      const reps = parseInt(currentSetInputs.reps, 10);
      if (isNaN(reps) || reps <= 0) {
        Alert.alert('Invalid Input', 'Please enter valid reps.');
        return;
      }
      setLog = {
        reps,
        duration: null,
        weight: currentExercise.isBodyweight ? null : parseFloat(currentSetInputs.weight) || null,
        completedBothSides: currentExercise.isPerSide,
      };
    } else {
      Alert.alert('Error', 'Exercise must have either reps or duration.');
      return;
    }

    logSet(currentExerciseIndex, setLog);
    setCurrentSetInputs({ reps: '', duration: '', weight: '' });

    // Start rest timer
    setRestTimeRemaining(defaultRestTime);
  }, [activeSession, currentExerciseIndex, currentSetInputs, logSet, defaultRestTime]);

  const handleNextExercise = useCallback(() => {
    if (!activeSession) return;

    if (currentExerciseIndex < activeSession.exerciseLogs.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetInputs({ reps: '', duration: '', weight: '' });
      setRestTimeRemaining(0);
    }
  }, [activeSession, currentExerciseIndex]);

  const handlePreviousExercise = useCallback(() => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setCurrentSetInputs({ reps: '', duration: '', weight: '' });
      setRestTimeRemaining(0);
    }
  }, [currentExerciseIndex]);

  const handleFinishWorkout = useCallback(() => {
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: () => {
            finishSession();
            navigation.navigate('WorkoutList');
          },
        },
      ]
    );
  }, [finishSession, navigation]);

  const handleCancelWorkout = useCallback(() => {
    Alert.alert(
      'Cancel Workout',
      'Are you sure you want to cancel this workout? All progress will be lost.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            cancelSession();
            navigation.navigate('WorkoutList');
          },
        },
      ]
    );
  }, [cancelSession, navigation]);

  const adjustRestTime = (delta: number) => {
    setDefaultRestTime((prev) => Math.max(5, prev + delta));
  };

  if (!workout || !activeSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Workout not found.</Text>
      </View>
    );
  }

  const currentExercise = activeSession.exerciseLogs[currentExerciseIndex];
  const completedSets = currentExercise.completedSets.length;
  const totalSets = currentExercise.expectedSets;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Stopwatch */}
        <View style={styles.stopwatchContainer}>
          <Text style={styles.stopwatchLabel}>Elapsed Time</Text>
          <Text style={styles.stopwatchTime}>{formatTime(elapsedSeconds)}</Text>
        </View>

        {/* Exercise Info */}
        <View style={styles.exerciseCard}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            <Text style={styles.exerciseProgress}>
              Exercise {currentExerciseIndex + 1} of {activeSession.exerciseLogs.length}
            </Text>
          </View>

          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Expected:</Text>
            <Text style={styles.previewText}>
              {totalSets} sets
              {currentExercise.expectedReps !== null && ` × ${currentExercise.expectedReps} reps`}
              {currentExercise.expectedDuration !== null && ` × ${currentExercise.expectedDuration}s`}
              {currentExercise.isPerSide && ' (each side)'}
            </Text>
            {!currentExercise.isBodyweight && currentExercise.expectedWeight !== null && (
              <Text style={styles.previewText}>Weight: {currentExercise.expectedWeight} lbs</Text>
            )}
            {currentExercise.isBodyweight && (
              <Text style={styles.previewText}>Bodyweight</Text>
            )}
          </View>

          <View style={styles.completedSetsContainer}>
            <Text style={styles.completedSetsLabel}>
              Completed Sets: {completedSets} / {totalSets}
            </Text>
            {currentExercise.completedSets.map((set, idx) => (
              <Text key={idx} style={styles.completedSetText}>
                Set {idx + 1}:
                {set.reps !== null && ` ${set.reps} reps`}
                {set.duration !== null && ` ${set.duration}s`}
                {set.weight !== null && ` @ ${set.weight} lbs`}
                {currentExercise.isPerSide && set.completedBothSides && ' (both sides)'}
              </Text>
            ))}
          </View>
        </View>

        {/* Log Set Inputs */}
        <View style={styles.inputCard}>
          <Text style={styles.inputCardTitle}>Log Set {completedSets + 1}</Text>

          {currentExercise.expectedReps !== null && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reps</Text>
              <TextInput
                style={styles.input}
                value={currentSetInputs.reps}
                onChangeText={(text) => setCurrentSetInputs((prev) => ({ ...prev, reps: text }))}
                keyboardType="numeric"
                placeholder={`Expected: ${currentExercise.expectedReps}`}
              />
            </View>
          )}

          {currentExercise.expectedDuration !== null && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duration (seconds)</Text>
              <TextInput
                style={styles.input}
                value={currentSetInputs.duration}
                onChangeText={(text) => setCurrentSetInputs((prev) => ({ ...prev, duration: text }))}
                keyboardType="numeric"
                placeholder={`Expected: ${currentExercise.expectedDuration}`}
              />
            </View>
          )}

          {!currentExercise.isBodyweight && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                value={currentSetInputs.weight}
                onChangeText={(text) => setCurrentSetInputs((prev) => ({ ...prev, weight: text }))}
                keyboardType="decimal-pad"
                placeholder={currentExercise.expectedWeight !== null ? `Expected: ${currentExercise.expectedWeight}` : 'Optional'}
              />
            </View>
          )}

          <TouchableOpacity style={styles.logButton} onPress={handleLogSet}>
            <Text style={styles.logButtonText}>Log Set</Text>
          </TouchableOpacity>
        </View>

        {/* Rest Timer */}
        {restTimeRemaining > 0 && (
          <View style={styles.restTimerContainer}>
            <Text style={styles.restTimerLabel}>Rest Time</Text>
            <Text style={styles.restTimerTime}>{formatTime(restTimeRemaining)}</Text>
          </View>
        )}

        {/* Rest Time Controls */}
        <View style={styles.restControlsContainer}>
          <Text style={styles.restControlsLabel}>Default Rest Time: {defaultRestTime}s</Text>
          <View style={styles.restControlsButtons}>
            <TouchableOpacity
              style={styles.restControlButton}
              onPress={() => adjustRestTime(-5)}
            >
              <Text style={styles.restControlButtonText}>- 5s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.restControlButton}
              onPress={() => adjustRestTime(5)}
            >
              <Text style={styles.restControlButtonText}>+ 5s</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentExerciseIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePreviousExercise}
            disabled={currentExerciseIndex === 0}
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentExerciseIndex === activeSession.exerciseLogs.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={handleNextExercise}
            disabled={currentExerciseIndex === activeSession.exerciseLogs.length - 1}
          >
            <Text style={styles.navButtonText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelWorkout}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}>
          <Text style={styles.finishButtonText}>Finish Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollView: { flex: 1 },
  errorText: { fontSize: 18, color: '#999', textAlign: 'center', marginTop: 50 },
  stopwatchContainer: {
    backgroundColor: '#4a90d9',
    padding: 16,
    alignItems: 'center',
  },
  stopwatchLabel: { fontSize: 14, color: '#fff', fontWeight: '600' },
  stopwatchTime: { fontSize: 36, color: '#fff', fontWeight: '700', marginTop: 4 },
  exerciseCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  exerciseHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  exerciseName: { fontSize: 20, fontWeight: '700', color: '#222' },
  exerciseProgress: { fontSize: 14, color: '#888', marginTop: 4 },
  previewContainer: { marginBottom: 12 },
  previewLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 4 },
  previewText: { fontSize: 14, color: '#666', marginTop: 2 },
  completedSetsContainer: { marginTop: 12 },
  completedSetsLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 4 },
  completedSetText: { fontSize: 13, color: '#666', marginTop: 2 },
  inputCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputCardTitle: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 12 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  logButton: {
    backgroundColor: '#4a90d9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  logButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  restTimerContainer: {
    backgroundColor: '#ff9800',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  restTimerLabel: { fontSize: 14, color: '#fff', fontWeight: '600' },
  restTimerTime: { fontSize: 28, color: '#fff', fontWeight: '700', marginTop: 4 },
  restControlsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  restControlsLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, textAlign: 'center' },
  restControlsButtons: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  restControlButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  restControlButtonText: { fontSize: 16, fontWeight: '600', color: '#333' },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a90d9',
  },
  navButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  navButtonText: { fontSize: 16, fontWeight: '600', color: '#4a90d9' },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  finishButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  finishButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
