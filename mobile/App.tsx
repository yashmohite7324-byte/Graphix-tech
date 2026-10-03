import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { StudentHomeScreen } from './src/screens/student/StudentHomeScreen';
import { AdminHomeScreen } from './src/screens/admin/AdminHomeScreen';

const Stack = createStackNavigator();

function NavigationRoot() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user?.role === 'PLACEMENT_ADMIN' || user?.role === 'SUPER_ADMIN' ? (
          <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
        ) : (
          <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <NavigationRoot />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
