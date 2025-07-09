import BackupRestoreScreen from "../screens/BackupRestoreScreen";
import HouseDetailScreen from "../screens/HouseDetailScreen";
import HouseScreen from "../screens/HouseScreen";
import LoginScreen from "../screens/LoginScreen";
import SplashScreen from "../screens/splashScreen";
import TenantDetailScreen from "../screens/TenantDetailScreen";
import TenantPayment from "../screens/TenantPayment";
import TenantScreen from "../screens/TenantScreen";
import CustomHeader from "./customHeader";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootDrawer } from "./DrawerNavigator";
import LandingScreen from "../screens/LandingScreen";
import { HouseTab } from "./tabNavigator";
import RentScreen from "../screens/RentScreen";
import RentDetailscreen from "../screens/RentDetailscreen";

export function AuthStack() {

    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/*         
            <Stack.Screen name="homescreen" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} /> */}

            <Stack.Screen name="Dashboard" component={RootDrawer} />
        </Stack.Navigator>
    );
}

export function HouseStack() {

    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator screenOptions={{ headerShown: true }}>
            <Stack.Screen name="houses"
                options={{
                    header: () => <CustomHeader title={`Houses`} />
                }}
                component={HouseScreen} />
            <Stack.Screen name="houseDetail"
                options={({ route }: any) => {
                    return {
                        header: () => <CustomHeader back title={`${route.params.house.house_number}`} />,
                    }
                }}
                component={HouseDetailScreen} />

        </Stack.Navigator>
    );
}
export function RentStack() {

    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator screenOptions={{ headerShown: true }}>
            <Stack.Screen name="rentStack"
                options={{
                    header: () => <CustomHeader title={`Rent PaYments for ${new Date().toLocaleString('default', { month: 'long' })} `} />
                }}
                component={RentScreen} />
            <Stack.Screen name="rentDetail"
                options={({ route }: any) => {
                    return {
                        header: () => <CustomHeader back title={`${route.params.rent.name}  Rent History`} />,
                    }
                }}
                component={RentDetailscreen} />

        </Stack.Navigator>
    );
}
export function TenantsStack() {

    const Stack = createNativeStackNavigator(); ``

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>

            <Stack.Screen name="tenants" component={TenantScreen} />
            <Stack.Screen name="tenantDetail" component={TenantDetailScreen} />
            <Stack.Screen name="tenantPayments" component={TenantPayment} />
        </Stack.Navigator>
    );
}

export function RootStack() {

    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: '#fff', // change this to your desired color
            },
            // headerTintColor: '#ff5301', // optional: change back button and title color
            headerTitleStyle: {
                fontWeight: 'semibold',
                // transform: 'uppercase',
                // letterSpacing: 1,

            },
        }}>
            <Stack.Screen name="Landingpage"
                options={{ header: () => <CustomHeader title="Home" /> }}
                component={LandingScreen} />
            <Stack.Screen name="accessPage" options={{ header: () => <CustomHeader title="Home" /> }} component={BackupRestoreScreen} />
        </Stack.Navigator>
    );
}