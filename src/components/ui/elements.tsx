// 📁 src/components/ui/Button.js
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export function Button({ title, onPress, outline }: any) {
    return (
        <TouchableOpacity onPress={onPress} className={`${outline ? "border-blue-600 border text-blue-600" : "bg-blue-600"} h-14 flex items-center justify-center p-3 rounded-md mb-3`}>
            <Text className="text-white  uppercase font-semibold">{title}</Text>
        </TouchableOpacity>
    );
}

// 📁 src/components/ui/Input.js


export function Input(props: any) {
    return (
        <TextInput
            className="border border-gray-300 p-2 h-14 rounded-md bg-white mb-3"
            placeholderTextColor="#999"
            {...props}
        />
    );
}

// 📁 src/components/ui/Section.js


export function Section({ title, children, button }: any) {
    return (
        <View className="mb-6">
            <View className={`border border-slate-100 mb-2 px-2 rounded-md h-10  flex items-center ${button && "justify-between"} flex-row`}>
                {/* <View className="flex border px-2  text-center py-1 rounded-md border-blue-300"> */}
                    <Text className="text-lg font-semibold text-blue-300 text-center ">{title}</Text>
                {/* </View> */}
                {button && button}
            </View>

            {children}
        </View>
    );
}

// 📁 src/screens/RentScreen.js
