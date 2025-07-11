
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
import { HouseStack, RentStack, RootStack, TenantsStack } from './stackNavigators';
import CustomHeader from './customHeader';
import { HouseTab } from './tabNavigator';
import RentScreen from '../screens/RentScreen';
import ExportScreen from '../screens/ExportScreen';
import SMSScreen from '../screens/smsScreen';







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
                component={RentStack} />
            <Drawer.Screen name="support"
                options={{
                    header: () => <CustomHeader title="Help & support" />,
                }}
                component={HouseStack} />
            <Drawer.Screen name="sms"
                options={{
                    header: () => <CustomHeader title="Short Messages Service" />,
                }}
                component={SMSScreen} />
            <Drawer.Screen name="export"
                options={{
                    header: () => <CustomHeader title="Export Data" />,
                }}
                component={ExportScreen} />
            {/* <Drawer.Screen name="forum" options={{
                headerShown: false
                // header: () => <CustomHeader title="JOSAM TALKS" />,
            }} component={ForumStack} /> */}
        </Drawer.Navigator>
    );
}