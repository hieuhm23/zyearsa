import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import PosScreen from './src/screens/PosScreen';
import WarehouseScreen from './src/screens/WarehouseScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import DoseScreen from './src/screens/DoseScreen';
import AuditScreen from './src/screens/AuditScreen';
import AIDoctorScreen from './src/screens/AIDoctorScreen';
import TransferScreen from './src/screens/TransferScreen';

import CustomerScreen from './src/screens/CustomerScreen';
import StaffScreen from './src/screens/StaffScreen';
import CashflowScreen from './src/screens/CashflowScreen';
import ReportScreen from './src/screens/ReportScreen';

const Stack = createNativeStackNavigator();

import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
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
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
          <Stack.Screen name="Dose" component={DoseScreen} />
          <Stack.Screen name="AIDoctor" component={AIDoctorScreen} />
          <Stack.Screen name="Cashflow" component={CashflowScreen} />
          <Stack.Screen name="Staff" component={StaffScreen} />
          <Stack.Screen name="Customer" component={CustomerScreen} />
          <Stack.Screen name="Audit" component={AuditScreen} />
          <Stack.Screen name="Transfer" component={TransferScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
