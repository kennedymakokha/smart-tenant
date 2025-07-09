import React, { use, useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import FA from 'react-native-vector-icons/FontAwesome5'
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useDispatch, useSelector } from 'react-redux';




const CustomDrawer: React.FC<DrawerContentComponentProps> = ({ navigation }) => {
    // const { user } = useSelector((state: any) => state.auth)

    const [data, setData] = useState<any>([

    ])



    const logoutUser = async () => {

        await AsyncStorage.removeItem('accessToken')

    }
    return (
        <View

            className="flex-1 py-16 px-5">
            {/* Header */}
            <View className="items-center border-b border-white mb-10">
                {/* <Image
                    source={
                        app?.logo
                            ? { uri: app.logo }
                            : require('./../../assets/logo.png')
                    }
                    className="w-40 h-40 rounded-full mb-4"
                    resizeMode="contain"
                /> */}
                <Text className="text-white tracking-widest text-lg">Ken</Text>
                <Text className="text-white capitalize tracking-widest text-center text-lg">Me</Text>
            </View>

            {/* Links */}
            <TouchableOpacity
                className="flex-row items-center my-4"
                onPress={() => navigation.navigate('Home')}
            >
                <Icon name="home" size={20} color="#fff" />
                <Text className="text-white tracking-widest text-base ml-3">Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="flex-row items-center my-4"
                onPress={() => navigation.navigate('HouseStack')}
            >
                <Icon name="home-outline" size={20} color="#fff" />
                <Text className="text-white tracking-widest text-base ml-3">Houses</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="flex-row items-center my-4"
                onPress={() => navigation.navigate('tenantsStack')}
            >
                <Icon name="people-outline" size={20} color="#fff" />
                <Text className="text-white text-base tracking-widest ml-3">Tenants</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="flex-row items-center my-4"
                onPress={() => navigation.navigate('RentsScreen')}
            >
                <Icon name="people-outline" size={20} color="#fff" />
                <Text className="text-white text-base tracking-widest ml-3">Rents</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="flex-row items-center my-4"
                onPress={() => navigation.navigate('Profile')}
            >
                <Icon name="download-outline" size={20} color="#fff" />
                <Text className="text-white text-base tracking-widest ml-3">Export</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="flex-row items-center my-4"
                onPress={() => navigation.navigate('Profile')}
            >
                <Icon name="person-outline" size={20} color="#fff" />
                <Text className="text-white text-base tracking-widest ml-3">Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="flex-row items-center my-4"
                onPress={() => navigation.navigate('support')}
            >
                <FA name="hands-helping" size={20} color="#fff" />
                <Text className="text-white text-base tracking-widest ml-3">Help & support</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="flex-row items-center my-4"
                onPress={() => navigation.navigate('forum')}
            >
                <FA name="forumbee" size={20} color="#fff" />
                <Text className="text-white text-base tracking-widest ml-3">Forum</Text>
            </TouchableOpacity>
            {/* Footer */}
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
