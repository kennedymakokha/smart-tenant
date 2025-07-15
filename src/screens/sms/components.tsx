import { TouchableOpacity } from "react-native";
import { getDurationFromNow } from "../../../utils/dateFormarter";
import { View } from "react-native";
import { Text } from "react-native";
import { FlatList } from "react-native";

export const TableHeader = () => (
    <View className="flex-row bg-gray-200 border-b border-gray-400">

        <View className="w-[35%] p-2">
            <Text className="font-bold text-gray-800">Message</Text>
        </View>
        <View className="w-[25%] p-2">
            <Text className="font-bold text-gray-800">To</Text>
        </View>
        <View className="w-[20%] p-2">
            <Text className="font-bold text-gray-800">Ref</Text>
        </View>
        <View className="w-[20%] p-2">
            <Text className="font-bold text-gray-800">Date</Text>
        </View>


    </View>
);

export const TableRow = ({ item, navigation, data }: any) => {
    return (
        < TouchableOpacity onPress={() => navigation !== undefined && navigation.navigate('smsDetilsDetail', { phone: item.phone, data: data })} className={`flex-row border-b ${item.synced === 0 && "bg-slate-200"}  border-gray-300 bg-white`}>
            <Text className="text-gray-700">{item.house_number}</Text>
            <View className="w-[35%] p-2 border-r   border-gray-300  justify-center flex">
                <Text className="text-gray-700">{item.message}</Text>
            </View>
            <View className="w-[25%] border-r   border-gray-300 justify-center flex  p-2">
                <Text className="text-gray-700"> {item.phone}</Text>
            </View>
            <View className={`w-[20%] border-r   border-gray-300 justify-center flex  p-2`}>
                <Text className="text-gray-700"> {item.ref} </Text>
            </View>
            <View className="w-[20%]  justify-center flex  p-2">
                <Text className="text-gray-700 text-center"> {getDurationFromNow(item.timestamp)}</Text>
            </View>
        </TouchableOpacity >
    )

};

export const loderRow = ({ item }: any) => (
    <View className="flex-row border-b border-gray-300 bg-white animate-pulse">
        <View className="w-[35%] p-2 border-r border-gray-300 justify-center flex">
            <View className="h-4 bg-gray-300 rounded w-3/4" />
        </View>
        <View className="w-[25%] p-2 border-r border-gray-300 justify-center flex">
            <View className="h-4 bg-gray-300 rounded w-2/3" />
        </View>
        <View className="w-[20%] p-2 border-r border-gray-300 justify-center flex">
            <View className="h-4 bg-gray-300 rounded w-1/2" />
        </View>
        <View className="w-[20%] p-2 justify-center flex">
            <View className="h-4 bg-gray-300 rounded w-2/3 mx-auto" />
        </View>
    </View>
);

export const SkeletonList = () => (
    <FlatList
        data={Array.from({ length: 50 })}
        keyExtractor={(_, i) => i.toString()}
        renderItem={loderRow}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 100 }}
    />
);
