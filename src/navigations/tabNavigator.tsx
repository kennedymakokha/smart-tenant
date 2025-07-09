import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from 'react-native-vector-icons/Ionicons';
import { HouseStack } from "./stackNavigators";
import CustomHeader from "./customHeader";

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
            })}
        >
            <Tab.Screen name="occupied" options={{
                header: () => <CustomHeader title="Occupied Houses" />
            }} component={HouseStack} />
            <Tab.Screen
                options={{
                    header: () => <CustomHeader title="Vaccant Houses" />
                }}
                name="vaccant" component={HouseStack} />

        </Tab.Navigator>
    );
}