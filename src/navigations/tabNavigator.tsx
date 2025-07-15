import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from 'react-native-vector-icons/Ionicons';
import { HouseStack } from "./stackNavigators";
import CustomHeader from "./customHeader";
import HouseScreen from "../screens/HouseScreen";

export function HouseTab() {

    const Tab = createBottomTabNavigator();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                tabBarIcon: ({ color, size }) => {
                    let iconName = 'home';
                    if (route.name === 'vaccant') iconName = 'home-outline';

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#f87171', // tailwind orange-500
                tabBarInactiveTintColor: '#FF6701', // tailwind blue-700
                tabBarStyle: {
                    paddingTop:10,
                    backgroundColor: "#1e293b", // tailwind green-400
                    borderTopWidth: 0,
                    height: 60,

                },
            })}
        >
            <Tab.Screen name="occupied"
                initialParams={{ state: 'occ' }}
                options={{
                    header: () => <CustomHeader title="Occupied Houses" />
                }} component={HouseScreen} />
            <Tab.Screen
                initialParams={{ state: 'vac' }}
                options={{
                    header: () => <CustomHeader title="Vaccant Houses" />
                }}
                name="vaccant" component={HouseScreen} />

        </Tab.Navigator>
    );
}