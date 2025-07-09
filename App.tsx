import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HouseScreen from './src/screens/HouseScreen';
import TenantScreen from './src/screens/TenantScreen';
import RentScreen from './src/screens/RentScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MissedRentScreen from './src/screens/MissedRentScreen';
import RentSummaryScreen from './src/screens/RentSummaryScreen';
import ExportScreen from './src/screens/ExportScreen';
import BackupRestoreScreen from './src/screens/BackupRestoreScreen';
import "./global.css"
import { ToastProvider } from './contexts/toastContext';
import { AuthStack } from './src/navigations/stackNavigators';


const App = () => {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <NavigationContainer>
         
          <AuthStack />
        </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
};

export default App;
