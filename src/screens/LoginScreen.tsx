// 📁 src/screens/LoginScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../../contexts/toastContext';
import { Button, Input } from '../components/ui/elements';


export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { showToast } = useToast();
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const user = await AsyncStorage.getItem('user');
    if (user) navigation.replace('Dashboard');
  };

  const handleLogin = async () => {
    try {
      if (username === 'admin' && password === '1234') {
        await AsyncStorage.setItem('user', username);
        navigation.replace('Dashboard');
      } else {
        showToast('Invalid Credentials', { type: 'error' });
      }
    } catch (error: any) {
      showToast(error, { type: 'error' });
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      <View className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <Text className="text-xl font-bold mb-4 text-center">Login</Text>
        <Input placeholder="Username" value={username} onChangeText={setUsername} />
        <Input
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Button title="Sign In" onPress={handleLogin} />
      </View>
    </View>
  );
}