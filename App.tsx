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

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: true,
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'Houses') iconName = 'home-outline';
              else if (route.name === 'Tenants') iconName = 'people-outline';
              else if (route.name === 'Rent') iconName = 'cash-outline';
              return <Icon name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Houses" component={HouseScreen} />
          <Tab.Screen name="Tenants" component={TenantScreen} />
          <Tab.Screen name="Rent" component={RentScreen} />
          <Tab.Screen
            name="Missed Rent"
            component={MissedRentScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name="alert-circle-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Summary"
            component={RentSummaryScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name="stats-chart-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Export"
            component={ExportScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name="download-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Backup"
            component={BackupRestoreScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name="cloud-upload-outline" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
