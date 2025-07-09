
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useNavigation } from "@react-navigation/native";

import { useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
// import LoginScreen from "../screens/auth/login";
// import { AdminStack, ClientStack, SalesStack, SuperAdminStack } from "./rootStack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { TouchableOpacity } from "react-native";
import CustomDrawer from './customDrawer';
import { HouseStack, RootStack, TenantsStack } from './stackNavigators';
import CustomHeader from './customHeader';
import { HouseTab } from './tabNavigator';
import RentScreen from '../screens/RentScreen';







export function RootDrawer() {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    // const { user } = useSelector((state: any) => state.auth); // ✅ OK
    const Drawer = createDrawerNavigator();
    // ✅ Safely memoize stack component
    const StackComponent = useMemo(() => {

        // if (!token) return LoginScreen;
        // if (user?.role === 'client') return ClientStack;
        // if (user?.role === 'superAdmin' || user?.role === 'sale') return SuperAdminStack;
        // if (user?.role === 'admin') return AdminStack;
        // if (user?.role === 'sales') return SalesStack;
        // return LoginScreen;
    }, []);

    // useEffect(() => {
    //     if (!user) {
    //         navigation.replace("login");
    //     }
    // }, [token]);


    return (
        <Drawer.Navigator
            drawerContent={(props: any) => <CustomDrawer {...props} />}
            screenOptions={{
                // headerShown: false,
                drawerLabelStyle: { color: 'gold', fontSize: 16 },
                drawerActiveTintColor: 'white',
                drawerInactiveTintColor: 'gray',
                drawerActiveBackgroundColor: '#FF6600',
                drawerStyle: {
                    backgroundColor: '#1a1a1a',
                    width: 240,
                },
                drawerType: 'front',
            }}
        >
            <Drawer.Screen
                name="Home"
                component={RootStack}
                options={({ navigation }: any) => ({
                    headerShown: false
                })}
            />
            <Drawer.Screen name="tenantsStack" options={{
                headerShown: false
            }} component={TenantsStack} />
            <Drawer.Screen name="HouseStack"
                options={{
                    headerShown: false
                }}
                component={HouseStack} />
            <Drawer.Screen name="RentsScreen"
                options={{
                    headerShown: false
                }}
                component={RentScreen} />
            <Drawer.Screen name="support"
                options={{
                    header: () => <CustomHeader title="Help & support" />,
                }}
                component={HouseStack} />
            {/* <Drawer.Screen name="forum" options={{
                headerShown: false
                // header: () => <CustomHeader title="JOSAM TALKS" />,
            }} component={ForumStack} /> */}
        </Drawer.Navigator>
    );
}