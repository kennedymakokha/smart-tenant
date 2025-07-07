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
const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: true,
              tabBarIcon: ({ color, size }) => {
                let iconName = 'home-outline';
                if (route.name === 'Tenants') iconName = 'people-outline';
                else if (route.name === 'Rent') iconName = 'cash-outline';
                else if (route.name === 'Missed Rent') iconName = 'alert-circle-outline';
                else if (route.name === 'Summary') iconName = 'stats-chart-outline';
                else if (route.name === 'Export') iconName = 'download-outline';
                else if (route.name === 'Backup') iconName = 'cloud-upload-outline';
                return <Icon name={iconName} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen name="Houses" component={HouseScreen} />
            <Tab.Screen name="Tenants" component={TenantScreen} />
            <Tab.Screen name="Rent" component={RentScreen} />
            <Tab.Screen name="Missed Rent" component={MissedRentScreen} />
            <Tab.Screen name="Summary" component={RentSummaryScreen} />
            <Tab.Screen name="Export" component={ExportScreen} />
            <Tab.Screen name="Backup" component={BackupRestoreScreen} />

          </Tab.Navigator>
        </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
};

export default App;
