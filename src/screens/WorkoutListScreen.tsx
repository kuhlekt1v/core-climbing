import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useWorkouts } from '../context/WorkoutContext';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutList'>;

export default function WorkoutListScreen({ navigation }: Props) {
  const { workouts, deleteWorkout } = useWorkouts();

  // Disable back navigation on root screen
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      gestureEnabled: false,
    });
  }, [navigation]);

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Delete Workout', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteWorkout(id) },
    ]);
  };

  const handleStartWorkout = (workoutId: string) => {
    navigation.navigate('WorkoutSession', { workoutId });
  };

  return (
    <View style={styles.container}>
      {workouts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No workouts yet.</Text>
          <Text style={styles.emptySubtext}>
            Tap the button below to create one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() =>
                  navigation.navigate('WorkoutDesign', { workoutId: item.id })
                }
                onLongPress={() => confirmDelete(item.id, item.name)}
              >
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>
                  {item.exercises.length}{' '}
                  {item.exercises.length === 1 ? 'exercise' : 'exercises'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleStartWorkout(item.id)}
              >
                <Text style={styles.startButtonText}>Start Workout</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('WorkoutDesign', {})}
      >
        <Text style={styles.addButtonText}>+ New Workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333' },
  emptySubtext: { fontSize: 14, color: '#888', marginTop: 4 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    padding: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#222' },
  cardSubtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  startButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
  },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  addButton: {
    backgroundColor: '#4a90d9',
    margin: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
