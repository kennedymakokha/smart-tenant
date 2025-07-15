import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "./global.css"
import { ToastProvider } from './contexts/toastContext';
import { AuthStack } from './src/navigations/stackNavigators';
import { requestSmsPermission } from './utils/SmsPermisions';
import { StatusBar } from 'react-native';
import { backupData, restoreData } from './utils/backupNrestore';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './store';

const App = () => {
  
  useEffect(() => {
    
    requestSmsPermission()
   
    // backupData()
    // restoreData()

  }, [])

  return (
    <SafeAreaProvider>
      <StatusBar
        animated={true}
        backgroundColor="#1e293b"
      />
      <ToastProvider>
        <NavigationContainer>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <AuthStack />
            </PersistGate>
          </Provider>
        </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
};

export default App;
