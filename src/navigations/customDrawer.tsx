import React, { use, useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import FA from 'react-native-vector-icons/FontAwesome5'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGetsmsBalanceMutation } from '../services/sms.service';

const CustomDrawer: React.FC<DrawerContentComponentProps> = ({ navigation }) => {
  

    const logoutUser = async () => {
        await AsyncStorage.removeItem('accessToken')
    }

    const Item = ({ url, icon, title }: any) => {
        return (
            <TouchableOpacity
                className="flex-row items-center my-4"
                onPress={() => navigation.navigate(url)}
            >
                {url === "forum" || url === "support" ? <FA name={icon} size={20} color="#fff" /> : <Icon name={icon} size={20} color="#fff" />}
                <Text className="text-white text-xl tracking-widest text-base ml-3">{title}</Text>
            </TouchableOpacity>
        )
    }
    return (
        <View

            className="flex-1 py-16 px-5 bg-slate-800">
            {/* Header */}
            <View className="items-center border-b border-white mb-10">
                <Image
                    source={require('./../../assets/logo.png')}
                    className="w-40 h-40 rounded-full mb-4"
                    resizeMode="contain"
                />
                <Text className="text-white  tracking-widest text-lg">Leah Makokha</Text>
                <Text className="text-white capitalize tracking-widest text-center text-lg">Admin</Text>
            </View>

            {/* Links */}
            <Item title="Home" icon="home" url="Home" />
            <Item title="Houses" icon="home-outline" url="HouseStack" />
            <Item title="Tenants" icon="people-outline" url="tenantsStack" />
            <Item title="Rents" icon="cash-outline" url="RentsScreen" />
            <Item title="Export" icon="download-outline" url="export" />
            <Item title="sms" icon="chat" url="sms" />
            <Item title="Profile" icon="person-outline" url="profile" />
            <Item title="Help & support" icon="hands-helping" url="support" />
            <Item title="Forum" icon="forumbee" url="forum" />

            <View className="mt-auto border-t border-gold-700 pt-5">
                <TouchableOpacity activeOpacity={1} onPress={async () => {
                    logoutUser();
                    await AsyncStorage.clear()
                    navigation.navigate('homescreen')
                }}>
                    <Text className="text-gold-500 uppercase text-center text-base">Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CustomDrawer;
