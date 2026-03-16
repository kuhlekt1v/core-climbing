import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { StorageService } from '../services/storage';
import { Workout, PainLevel } from '../types';

export default function ProgressScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [painLevels, setPainLevels] = useState<PainLevel[]>([]);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    const allWorkouts = await StorageService.getWorkouts();
    const completedWorkouts = allWorkouts.filter(w => w.completed);
    setWorkouts(completedWorkouts);

    const allPainLevels = await StorageService.getPainLevels();
    setPainLevels(allPainLevels);
  };

  const getWorkoutStats = () => {
    const total = workouts.length;
    const thisWeek = workouts.filter(w => {
      const workoutDate = new Date(w.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return workoutDate >= weekAgo;
    }).length;

    const totalDuration = workouts.reduce((sum, w) => sum + (w.totalDuration || 0), 0);
    const avgDuration = total > 0 ? Math.round(totalDuration / total / 60) : 0;

    return { total, thisWeek, avgDuration };
  };

  const getPerformanceStats = () => {
    let totalExpectedSets = 0;
    let totalActualSets = 0;
    let totalExpectedReps = 0;
    let totalActualReps = 0;
    let setsCount = 0;
    let repsCount = 0;

    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.expectedSets && exercise.actualSets) {
          totalExpectedSets += exercise.expectedSets;
          totalActualSets += exercise.actualSets;
          setsCount++;
        }
        if (exercise.expectedReps && exercise.actualReps) {
          totalExpectedReps += exercise.expectedReps;
          totalActualReps += exercise.actualReps;
          repsCount++;
        }
      });
    });

    const setsCompletion = setsCount > 0 
      ? Math.round((totalActualSets / totalExpectedSets) * 100)
      : 0;
    const repsCompletion = repsCount > 0
      ? Math.round((totalActualReps / totalExpectedReps) * 100)
      : 0;

    return {
      setsCompletion,
      repsCompletion,
      totalActualSets,
      totalExpectedSets,
      totalActualReps,
      totalExpectedReps,
    };
  };

  const getPainData = () => {
    // Get last 7 pain readings
    const recentPain = painLevels
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 7)
      .reverse();

    if (recentPain.length === 0) {
      return {
        labels: ['No data'],
        datasets: [{ data: [0] }],
      };
    }

    return {
      labels: recentPain.map((_, i) => `W${i + 1}`),
      datasets: [
        {
          data: recentPain.map(p => p.level),
          color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const getWorkoutFrequencyData = () => {
    // Group workouts by week
    const last6Weeks = [];
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate >= weekStart && workoutDate < weekEnd;
      });

      last6Weeks.push(weekWorkouts.length);
    }

    return {
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
      datasets: [
        {
          data: last6Weeks.length > 0 ? last6Weeks : [0],
        },
      ],
    };
  };

  const stats = getWorkoutStats();
  const performance = getPerformanceStats();
  const painData = getPainData();
  const frequencyData = getWorkoutFrequencyData();
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#007AFF',
    },
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Track your recovery journey</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Workouts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.thisWeek}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.avgDuration}</Text>
          <Text style={styles.statLabel}>Avg Duration (min)</Text>
        </View>
      </View>

      {/* Performance Stats */}
      {performance.setsCompletion > 0 && (
        <View style={styles.performanceContainer}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.performanceCards}>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceLabel}>Sets Completion</Text>
              <Text style={styles.performanceValue}>{performance.setsCompletion}%</Text>
              <Text style={styles.performanceDetail}>
                {performance.totalActualSets} / {performance.totalExpectedSets} sets
              </Text>
            </View>
            {performance.repsCompletion > 0 && (
              <View style={styles.performanceCard}>
                <Text style={styles.performanceLabel}>Reps Completion</Text>
                <Text style={styles.performanceValue}>{performance.repsCompletion}%</Text>
                <Text style={styles.performanceDetail}>
                  {performance.totalActualReps} / {performance.totalExpectedReps} reps
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Workout Frequency (Last 6 Weeks)</Text>
        <LineChart
          data={frequencyData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {painLevels.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Pain Level Tracking</Text>
          <LineChart
            data={painData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
            }}
            bezier
            style={styles.chart}
          />
          <Text style={styles.chartNote}>
            Lower is better - tracking your pain reduction over time
          </Text>
        </View>
      )}

      <View style={styles.recentWorkouts}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {workouts.slice(0, 10).map((workout) => {
          const completedExercises = workout.exercises.filter(e => e.completed).length;
          const totalExercises = workout.exercises.length;
          
          return (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDate}>
                  {new Date(workout.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.workoutExercises}>
                Exercises: {completedExercises} / {totalExercises} completed
              </Text>
              {workout.painBefore && (
                <Text style={styles.painInfo}>
                  Pain: {workout.painBefore.level} → {workout.painAfter?.level || 'N/A'}
                </Text>
              )}
              <Text style={styles.workoutDuration}>
                Duration: {Math.round((workout.totalDuration || 0) / 60)} min
              </Text>
            </View>
          );
        })}
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
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  performanceContainer: {
    margin: 20,
    marginTop: 0,
  },
  performanceCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  performanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  performanceDetail: {
    fontSize: 12,
    color: '#999',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  recentWorkouts: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
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
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  workoutDate: {
    fontSize: 14,
    color: '#666',
  },
  painInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  workoutExercises: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  workoutDuration: {
    fontSize: 14,
    color: '#666',
  },
});
