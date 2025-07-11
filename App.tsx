import React, { useEffect } from 'react';
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
import { requestSmsPermission } from './utils/SmsPermisions';
import SmsAndroid from 'react-native-get-sms-android';
import { readMessages } from './utils/readSms';
import { StatusBar } from 'react-native';
import { backupData, restoreData } from './utils/backupNrestore';

const App = () => {


  useEffect(() => {
    requestSmsPermission()
    readMessages()
    backupData()
    restoreData()
  }, [])
  return (
    <SafeAreaProvider>
      <StatusBar
        animated={true}
        backgroundColor="#1e293b"

      />
      <ToastProvider>
        <NavigationContainer>

          <AuthStack />
        </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
};

export default App;
