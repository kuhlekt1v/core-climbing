import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Switch,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useWorkouts } from '../context/WorkoutContext';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Exercise } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutDesign'>;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function createBlankExercise(): Exercise {
  return {
    id: generateId(),
    name: '',
    sets: 3,
    reps: 10,
    duration: null,
    weight: null,
    isBodyweight: true,
    isPerSide: false,
  };
}

export default function WorkoutDesignScreen({ navigation, route }: Props) {
  const { workouts, addWorkout, updateWorkout } = useWorkouts();
  const editingId = route.params?.workoutId;
  const existing = editingId
    ? workouts.find((w) => w.id === editingId)
    : undefined;

  const [workoutName, setWorkoutName] = useState(existing?.name ?? '');
  const [exercises, setExercises] = useState<Exercise[]>(
    existing?.exercises ?? [createBlankExercise()]
  );

  useEffect(() => {
    navigation.setOptions({
      title: existing ? 'Edit Workout' : 'New Workout',
    });
  }, [existing, navigation]);

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex))
    );
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const handleSave = () => {
    const trimmedName = workoutName.trim();
    if (!trimmedName) {
      Alert.alert('Validation', 'Please enter a workout name.');
      return;
    }

    const validExercises = exercises.filter((ex) => ex.name.trim().length > 0);
    if (validExercises.length === 0) {
      Alert.alert('Validation', 'Add at least one exercise with a name.');
      return;
    }

    const workout = {
      id: existing?.id ?? generateId(),
      name: trimmedName,
      exercises: validExercises,
    };

    if (existing) {
      updateWorkout(workout);
    } else {
      addWorkout(workout);
    }

    navigation.goBack();
  };

  const parseIntOrNull = (text: string): number | null => {
    const n = parseInt(text, 10);
    return isNaN(n) ? null : n;
  };

  const parseFloatOrNull = (text: string): number | null => {
    const n = parseFloat(text);
    return isNaN(n) ? null : n;
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseLabel}>Exercise</Text>
        <TouchableOpacity onPress={() => removeExercise(item.id)}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Exercise name"
        placeholderTextColor="#aaa"
        value={item.name}
        onChangeText={(text) => updateExercise(item.id, { name: text })}
      />

      <View style={styles.row}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Sets</Text>
          <TextInput
            style={styles.smallInput}
            keyboardType="number-pad"
            value={item.sets > 0 ? String(item.sets) : ''}
            onChangeText={(text) =>
              updateExercise(item.id, { sets: parseIntOrNull(text) ?? 0 })
            }
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Reps</Text>
          <TextInput
            style={[
              styles.smallInput,
              item.duration !== null && styles.inputDisabled,
            ]}
            keyboardType="number-pad"
            placeholder="—"
            placeholderTextColor="#ccc"
            value={item.reps !== null ? String(item.reps) : ''}
            editable={item.duration === null}
            onChangeText={(text) => {
              const val = parseIntOrNull(text);
              updateExercise(item.id, {
                reps: val,
                duration: val !== null ? null : item.duration,
              });
            }}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Duration (s)</Text>
          <TextInput
            style={[
              styles.smallInput,
              item.reps !== null && styles.inputDisabled,
            ]}
            keyboardType="number-pad"
            placeholder="—"
            placeholderTextColor="#ccc"
            value={item.duration !== null ? String(item.duration) : ''}
            editable={item.reps === null}
            onChangeText={(text) => {
              const val = parseIntOrNull(text);
              updateExercise(item.id, {
                duration: val,
                reps: val !== null ? null : item.reps,
              });
            }}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Weight (lbs)</Text>
          <TextInput
            style={[
              styles.smallInput,
              item.isBodyweight && styles.inputDisabled,
            ]}
            keyboardType="decimal-pad"
            placeholder="—"
            placeholderTextColor="#ccc"
            value={
              !item.isBodyweight && item.weight !== null
                ? String(item.weight)
                : ''
            }
            editable={!item.isBodyweight}
            onChangeText={(text) =>
              updateExercise(item.id, { weight: parseFloatOrNull(text) })
            }
          />
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.fieldLabel}>Bodyweight</Text>
          <Switch
            value={item.isBodyweight}
            onValueChange={(val) =>
              updateExercise(item.id, {
                isBodyweight: val,
                weight: val ? null : item.weight,
              })
            }
          />
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.fieldLabel}>Per Side</Text>
          <Switch
            value={item.isPerSide}
            onValueChange={(val) =>
              updateExercise(item.id, { isPerSide: val })
            }
          />
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.label}>Workout Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Upper Body Power"
              placeholderTextColor="#aaa"
              value={workoutName}
              onChangeText={setWorkoutName}
            />
          </View>
        }
        renderItem={renderExercise}
        ListFooterComponent={
          <View style={styles.footerSection}>
            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={() =>
                setExercises((prev) => [...prev, createBlankExercise()])
              }
            >
              <Text style={styles.addExerciseText}>+ Add Exercise</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Workout</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { padding: 16 },
  headerSection: { marginBottom: 12 },
  footerSection: { marginTop: 8, paddingBottom: 32 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseLabel: { fontSize: 14, fontWeight: '700', color: '#555' },
  removeText: { fontSize: 14, color: '#d9534f', fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  fieldGroup: { flex: 1 },
  switchGroup: { flex: 1, alignItems: 'center' },
  fieldLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  smallInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 8,
    fontSize: 15,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputDisabled: {
    backgroundColor: '#eee',
    color: '#bbb',
  },
  addExerciseButton: {
    borderWidth: 1,
    borderColor: '#4a90d9',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  addExerciseText: { color: '#4a90d9', fontSize: 15, fontWeight: '600' },
  saveButton: {
    backgroundColor: '#4a90d9',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
