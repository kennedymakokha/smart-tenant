// src/screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/ui/elements';

export default function SplashScreen() {
  const navigation: any = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation?.navigate('Login'); // Replace so splash isn't on back stack
    }, 60000); // 60 seconds

    return () => clearTimeout(timer); // Cleanup
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      {/* <Image
        source={require('../../assets/logo.png')} // Replace with your logo
        className="w-40 h-40 mb-6"
        resizeMode="contain"
      /> */}
      <Button onPress={() => navigation.navigate("Login")} title="Get Started" />
      <Text className="text-3xl font-bold text-blue-600">Welcome to MyApp</Text>
      <Text className="text-lg text-gray-500 mt-2">Loading...</Text>
    </View>
  );
}
