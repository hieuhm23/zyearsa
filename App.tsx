import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import PosScreen from './src/screens/PosScreen';
import WarehouseScreen from './src/screens/WarehouseScreen';

const Stack = createNativeStackNavigator();

import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#F5F7FA' }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Pos" component={PosScreen} />
        <Stack.Screen name="Warehouse" component={WarehouseScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
