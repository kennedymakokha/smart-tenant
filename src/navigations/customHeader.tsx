import { DrawerActions, NavigationProp, useNavigation } from "@react-navigation/native";
import { Text } from "react-native";
import { TouchableOpacity, View } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { RootStackParamList } from "../../types";


// import { authStackParamList } from "../../models";
// import SearchBar from "./searchBar";

function CustomHeader({ title, icon, icon_off, add, back }: { icon_off?: string, icon?: string, back?: boolean, title: string, add?: boolean }) {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    return (
        <View

            className="flex-row items-center justify-between p-4 bg-slate-800 shadow-md">
            <View className={` flex-row items-center justify-between  w-full `}>

                <View className="flex-row items-center ">
                    {!back ? <TouchableOpacity
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                        className="mr-4"
                    >
                        <Ionicons name="menu" size={24} color={`white`} />
                    </TouchableOpacity> :
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="mr-4"
                        >
                            <Icon name="arrow-left" size={20} color="#fff" />
                        </TouchableOpacity>}
                    <View className="flex-row items-center  justify-between  ">
                        <Text className="text-2xl uppercase text-[#fff] font-semibold  tracking-widest">{title}</Text>
                    </View>
                </View>

                {/* {add && <TouchableOpacity
                    onPress={toggleModal}
                    // onPress={() => navigation.navigate('Createbusiness')}
                    style={{ marginRight: 12 }}
                >
                    <Icon name={`${!isModalVisible ? icon ? icon : "plus" : icon_off ? icon_off : "window-close"}`} size={18} color="#044ee3" />
                </TouchableOpacity>} */}
            </View>

        </View>
    );
}


export function CustomHeaderWithSearch({ title, noSearch }: { title: string, noSearch?: boolean }) {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();


    return (
        <View className="flex-row justify-between items-center gap-x-2 p-4 w-full shadow-2xl bg-secondary-900 shadow-md">

            <View className="flex-row  items-center">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className=" "
                >

                    <Ionicons name="chevron-back-sharp" size={24} color="#d4af37" />
                </TouchableOpacity>
                <View className="flex-row items-center  justify-between  ">
                    <Text className="text-lg uppercase text-white font-bold  tracking-widest">{title}</Text>
                </View>
                {!noSearch && <View className="flex-row items-center   justify-between w-1/2  ">
                    {/* <SearchBar placeholder="search" /> */}
                </View>}
            </View>
            <TouchableOpacity
                // onPress={() => navigation.navigate("sales")}
                className="mr-4"
            >
                <Ionicons name="cart-sharp" size={24} color="#d4af37" />
            </TouchableOpacity>
        </View>
    );
}


export default CustomHeader
