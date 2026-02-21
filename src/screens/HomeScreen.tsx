import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storage';
import { Workout } from '../types';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    loadRecentWorkouts();
  }, []);

  const loadRecentWorkouts = async () => {
    const workouts = await StorageService.getWorkouts();
    const sorted = workouts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    setRecentWorkouts(sorted);
  };

  const getPhaseDescription = (phase: number) => {
    switch (phase) {
      case 1:
        return 'Calm the Nerve & Build the Foundation';
      case 2:
        return 'Add Climbing-Specific Strength';
      case 3:
        return 'Controlled Return to Real Climbing';
      default:
        return '';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back, {user?.name}!</Text>
        <Text style={styles.subtitle}>Let's continue your recovery journey</Text>
      </View>

      <View style={styles.phaseCard}>
        <Text style={styles.phaseLabel}>Current Phase</Text>
        <Text style={styles.phaseNumber}>Phase {currentPhase}</Text>
        <Text style={styles.phaseDescription}>
          {getPhaseDescription(currentPhase)}
        </Text>
        
        <View style={styles.phaseButtons}>
          {[1, 2, 3].map((phase) => (
            <TouchableOpacity
              key={phase}
              style={[
                styles.phaseButton,
                currentPhase === phase && styles.phaseButtonActive,
              ]}
              onPress={() => setCurrentPhase(phase as 1 | 2 | 3)}
            >
              <Text
                style={[
                  styles.phaseButtonText,
                  currentPhase === phase && styles.phaseButtonTextActive,
                ]}
              >
                {phase}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('WorkoutList')}
        >
          <Text style={styles.actionButtonText}>Start Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => navigation.navigate('Progress')}
        >
          <Text style={styles.actionButtonTextSecondary}>View Progress</Text>
        </TouchableOpacity>
      </View>

      {recentWorkouts.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {recentWorkouts.map((workout) => (
            <View key={workout.id} style={styles.workoutCard}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutDate}>
                {new Date(workout.date).toLocaleDateString()}
              </Text>
              <Text style={styles.workoutStatus}>
                {workout.completed ? '✓ Completed' : 'In Progress'}
              </Text>
            </View>
          ))}
        </View>
      )}
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  phaseCard: {
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
  phaseLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  phaseNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  phaseDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  phaseButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  phaseButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseButtonActive: {
    backgroundColor: '#007AFF',
  },
  phaseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  phaseButtonTextActive: {
    color: '#fff',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  recentSection: {
    padding: 20,
  },
  workoutCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  workoutDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  workoutStatus: {
    fontSize: 14,
    color: '#4CAF50',
  },
});
