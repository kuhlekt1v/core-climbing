import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkoutListScreen from '../screens/WorkoutListScreen';
import WorkoutDesignScreen from '../screens/WorkoutDesignScreen';

export type RootStackParamList = {
  WorkoutList: undefined;
  WorkoutDesign: { workoutId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="WorkoutList"
        screenOptions={{
          headerStyle: { backgroundColor: '#4a90d9' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen
          name="WorkoutList"
          component={WorkoutListScreen}
          options={{ title: 'My Workouts' }}
        />
        <Stack.Screen
          name="WorkoutDesign"
          component={WorkoutDesignScreen}
          options={{ title: 'Design Workout' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
