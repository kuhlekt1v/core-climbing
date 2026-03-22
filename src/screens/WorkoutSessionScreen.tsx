import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useWorkouts } from '../context/WorkoutContext';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Exercise, SetLog } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutSession'>;

const DEFAULT_REST_SECONDS = 45;
const REST_ADJUST_STEP = 5;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function buildDefaultSetLogs(exercise: Exercise): SetLog[] {
  return Array.from({ length: exercise.sets }, (_, i) => ({
    setNumber: i + 1,
    actualReps: exercise.reps,
    actualDuration: exercise.duration,
    actualWeight: exercise.isBodyweight ? null : exercise.weight,
  }));
}

export default function WorkoutSessionScreen({ navigation, route }: Props) {
  const { workouts } = useWorkouts();
  const workout = workouts.find((w) => w.id === route.params.workoutId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [setLogs, setSetLogs] = useState<SetLog[][]>(
    workout ? workout.exercises.map(buildDefaultSetLogs) : []
  );
  const [isFinished, setIsFinished] = useState(false);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logsInitialized = useRef(workout !== undefined);

  // Disable back navigation during session
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      gestureEnabled: false,
    });
  }, [navigation]);

  // Initialize set logs once the workout is available (handles async context seeding)
  useEffect(() => {
    if (workout && !logsInitialized.current) {
      logsInitialized.current = true;
      setSetLogs(workout.exercises.map(buildDefaultSetLogs));
    }
  }, [workout]);

  // Stopwatch – ticks every second until session is finished
  useEffect(() => {
    if (isFinished) return;
    const id = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(id);
  }, [isFinished]);

  // Rest timer – starts/stops based on isResting flag
  useEffect(() => {
    if (!isResting) {
      if (restTimerRef.current !== null) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
      return;
    }
    restTimerRef.current = setInterval(() => {
      setRestTimeRemaining((prev) => {
        if (prev <= 1) {
          if (restTimerRef.current !== null) {
            clearInterval(restTimerRef.current);
            restTimerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (restTimerRef.current !== null) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
    };
  }, [isResting]);

  if (!workout) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Workout not found.</Text>
      </View>
    );
  }

  const exercises = workout.exercises;
  const currentExercise = exercises[currentIndex];
  const isLastExercise = currentIndex === exercises.length - 1;

  const updateSetLog = (
    exIdx: number,
    setIdx: number,
    updates: Partial<SetLog>
  ) => {
    setSetLogs((prev) =>
      prev.map((logs, i) =>
        i === exIdx
          ? logs.map((log, j) => (j === setIdx ? { ...log, ...updates } : log))
          : logs
      )
    );
  };

  const parseValue = (text: string): number | null => {
    const n = parseFloat(text);
    return isNaN(n) ? null : n;
  };

  const handleCompleteExercise = () => {
    if (isLastExercise) {
      handleFinish();
    } else {
      setIsResting(true);
      setRestTimeRemaining(DEFAULT_REST_SECONDS);
    }
  };

  const advanceToNextExercise = () => {
    setIsResting(false);
    setRestTimeRemaining(0);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleFinish = () => {
    setIsFinished(true);
    Alert.alert(
      'Workout Complete! 🎉',
      `Total time: ${formatTime(elapsed)}`,
      [{ text: 'Done', onPress: () => navigation.goBack() }]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Session',
      'Are you sure you want to cancel this workout session?',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Cancel Session',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Stopwatch bar */}
      <View style={styles.stopwatchBar}>
        <View>
          <Text style={styles.stopwatchLabel}>Elapsed</Text>
          <Text style={styles.stopwatchTime}>{formatTime(elapsed)}</Text>
        </View>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressBar}>
        <Text style={styles.progressText}>
          Exercise {currentIndex + 1} of {exercises.length}
          {'  '}
          <Text style={styles.workoutName}>{workout.name}</Text>
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Exercise card */}
        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>

          {/* Expected values preview */}
          <View style={styles.previewRow}>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Sets</Text>
              <Text style={styles.previewValue}>{currentExercise.sets}</Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>
                {currentExercise.reps !== null ? 'Reps' : 'Duration'}
              </Text>
              <Text style={styles.previewValue}>
                {currentExercise.reps !== null
                  ? String(currentExercise.reps)
                  : `${currentExercise.duration ?? '—'}s`}
              </Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Weight</Text>
              <Text style={styles.previewValue}>
                {currentExercise.isBodyweight
                  ? 'BW'
                  : `${currentExercise.weight ?? '—'} lbs`}
              </Text>
            </View>
            {currentExercise.isPerSide && (
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Per Side</Text>
                <Text style={styles.previewValue}>✓</Text>
              </View>
            )}
          </View>

          {/* Set-by-set logging */}
          <View style={styles.setLogSection}>
            <View style={styles.setLogHeader}>
              <Text style={[styles.setLogHeaderText, styles.setNumCol]}>Set</Text>
              <Text style={[styles.setLogHeaderText, styles.setValCol]}>
                {currentExercise.reps !== null ? 'Actual Reps' : 'Actual Duration (s)'}
              </Text>
              {!currentExercise.isBodyweight && (
                <Text style={[styles.setLogHeaderText, styles.setValCol]}>
                  Actual Weight (lbs)
                </Text>
              )}
            </View>

            {setLogs[currentIndex]?.map((setLog, setIdx) => (
              <View key={setIdx} style={styles.setLogRow}>
                <Text style={[styles.setNumber, styles.setNumCol]}>
                  {setLog.setNumber}
                </Text>
                <TextInput
                  style={[styles.setInput, styles.setValCol]}
                  keyboardType="decimal-pad"
                  value={
                    currentExercise.reps !== null
                      ? setLog.actualReps !== null
                        ? String(setLog.actualReps)
                        : ''
                      : setLog.actualDuration !== null
                      ? String(setLog.actualDuration)
                      : ''
                  }
                  onChangeText={(text) => {
                    const val = parseValue(text);
                    updateSetLog(
                      currentIndex,
                      setIdx,
                      currentExercise.reps !== null
                        ? { actualReps: val }
                        : { actualDuration: val }
                    );
                  }}
                />
                {!currentExercise.isBodyweight && (
                  <TextInput
                    style={[styles.setInput, styles.setValCol]}
                    keyboardType="decimal-pad"
                    value={
                      setLog.actualWeight !== null
                        ? String(setLog.actualWeight)
                        : ''
                    }
                    onChangeText={(text) => {
                      const val = parseValue(text);
                      updateSetLog(currentIndex, setIdx, { actualWeight: val });
                    }}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Rest timer (visible while resting) */}
        {isResting && (
          <View style={styles.restCard}>
            <Text style={styles.restTitle}>Rest</Text>
            <Text style={styles.restTime}>{formatTime(restTimeRemaining)}</Text>

            {restTimeRemaining > 0 && (
              <>
                <Text style={styles.restAdjustLabel}>
                  Adjust Active Rest Time
                </Text>
                <View style={styles.restAdjustRow}>
                  <TouchableOpacity
                    style={styles.adjustBtn}
                    onPress={() =>
                      setRestTimeRemaining((prev) =>
                        Math.max(0, prev - REST_ADJUST_STEP)
                      )
                    }
                  >
                    <Text style={styles.adjustBtnText}>−5s</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.adjustBtn}
                    onPress={() =>
                      setRestTimeRemaining((prev) => prev + REST_ADJUST_STEP)
                    }
                  >
                    <Text style={styles.adjustBtnText}>+5s</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.skipRestBtn}
              onPress={advanceToNextExercise}
            >
              <Text style={styles.skipRestText}>
                {restTimeRemaining > 0 ? 'Skip Rest →' : 'Continue →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Primary action button */}
      {!isResting && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleCompleteExercise}
        >
          <Text style={styles.actionBtnText}>
            {isLastExercise ? 'Finish Workout ✓' : 'Complete Exercise →'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  errorText: { margin: 24, fontSize: 16, color: '#555' },

  // Stopwatch bar
  stopwatchBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  stopwatchLabel: { fontSize: 11, color: '#aaa', textTransform: 'uppercase' },
  stopwatchTime: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cancelText: { color: '#ccc', fontSize: 14 },

  // Progress bar
  progressBar: {
    backgroundColor: '#4a90d9',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressText: { color: '#fff', fontSize: 14 },
  workoutName: { fontWeight: '700' },

  scrollContent: { padding: 16, paddingBottom: 100 },

  // Exercise card
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 12,
  },

  // Expected preview
  previewRow: {
    flexDirection: 'row',
    backgroundColor: '#eef4fc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  previewItem: { flex: 1, alignItems: 'center' },
  previewLabel: { fontSize: 11, color: '#666', marginBottom: 2 },
  previewValue: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },

  // Set logging
  setLogSection: { marginTop: 4 },
  setLogHeader: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  setLogHeaderText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    textAlign: 'center',
  },
  setNumCol: { width: 36 },
  setValCol: { flex: 1, marginHorizontal: 4 },
  setLogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
  },
  setInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },

  // Rest timer card
  restCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  restTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  restTime: {
    fontSize: 48,
    fontWeight: '700',
    color: '#4a90d9',
    fontVariant: ['tabular-nums'],
    marginBottom: 16,
  },
  restAdjustLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
  },
  restAdjustRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  adjustBtn: {
    backgroundColor: '#eef4fc',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#4a90d9',
  },
  adjustBtnText: { color: '#4a90d9', fontSize: 15, fontWeight: '700' },
  skipRestBtn: {
    backgroundColor: '#4a90d9',
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  skipRestText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Bottom action button
  actionBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4a90d9',
    padding: 20,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
