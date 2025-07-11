import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import db, { initDB } from '../database/db';
import { Button, Input, Section } from '../components/ui/elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomModal from '../components/ui/bottomModal';
import { useToast } from '../../contexts/toastContext';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { useGetsmsQuery } from '../services/sms.service';
import { getDurationFromNow } from '../../utils/dateFormarter';
const SMSScreen = ({ navigation, route }: any) => {
    const { data, isError, error } = useGetsmsQuery({})

    const [houseNumber, setHouseNumber] = useState('');
    const [houses, setHouses] = useState([]);
    const [vhouses, setVacantHouseData] = useState([]);
    const [rentAmount, setRentAmount] = useState('');
    const [category, setCategory] = useState('');
    const [addNewHouse, setAddNewHouse] = useState(false);
    const { showToast } = useToast()

    console.log(data, error)
    const TableHeader = () => (
        <View className="flex-row bg-gray-200 border-b border-gray-400">

            <View className="w-[40%] p-2">
                <Text className="font-bold text-gray-800">Message</Text>
            </View>
            <View className="w-[30%] p-2">
                <Text className="font-bold text-gray-800">To</Text>
            </View>
            <View className="w-[30%] p-2">
                <Text className="font-bold text-gray-800">Ref</Text>
            </View>
            <View className="w-[30%] p-2">
                <Text className="font-bold text-gray-800">Date</Text>
            </View>


        </View>
    );

    const TableRow = ({ item }: any) => (
        <View className="flex-row border-b  border-gray-300 bg-white">
            <View className="w-[40%] p-2  justify-center flex">

                <Text className="text-gray-700">{item.message}</Text>

            </View>
            <View className="w-[30%]  justify-center flex  p-2">
                <Text className="text-gray-700"> {item.ref}</Text>
            </View>
            <View className="w-[30%]  justify-center flex  p-2">
                <Text className="text-gray-700"> {getDurationFromNow(item.timestamp)}</Text>
            </View>

        </View>
    );
    useFocusEffect(
        useCallback(() => {
            // fetchHouses();
        }, [])
    );
    return (
        <View className='flex-1 bg-gray-100 p-4'>
            <Section title="List"
                button={
                    <TouchableOpacity onPress={() => setAddNewHouse(true)} className='size-6 rounded-sm justify-center items-center border-slate-200  border  flex '>
                        <Icon name="add" className="text-red-500" size={20} color="red" />
                    </TouchableOpacity>
                }
            >
                <TableHeader />
                <FlatList
                    data={data !== undefined ? data.sms : []}
                    keyExtractor={(item: any) => item._id.toString()}
                    renderItem={({ item }) => <TableRow item={item} />}
                />
            </Section>
            <BottomModal
                visible={addNewHouse}
                loading={true}
                title="ADD New House"
                body={
                    <>
                        <Input
                            placeholder="House Number"
                            value={houseNumber}
                            onChangeText={setHouseNumber}
                            style={{ borderWidth: 1, marginVertical: 10, padding: 5 }}
                        />
                        <Picker
                            selectedValue={category}
                            onValueChange={(value) => setCategory(value)}
                            style={{ height: 50, marginBottom: 10 }}
                        >
                            <Picker.Item key="1" label="Single" value="single" />
                            <Picker.Item key="2" label="Double" value="double" />
                            <Picker.Item key="3" label="BedSitter" value="bedSitter" />
                            <Picker.Item key="7" label="Shop" value="shop" />
                            <Picker.Item key="4" label="One Bedroom" value="one-bedroom" />
                            <Picker.Item key="5" label="Two Bedroom" value="two-bedroom" />
                            <Picker.Item key="6" label="Three Bedroom" value="three-bedroom" />

                        </Picker>
                        <Input
                            placeholder="Monthly Rent (e.g. 8000)"
                            keyboardType="numeric"
                            value={rentAmount}
                            onChangeText={setRentAmount}
                            style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
                        />

                        {/* <Button title="Add House" onPress={addHouse} /> */}
                    </>
                }
                onCancel={() => {
                    setAddNewHouse(false);
                }}
            />
        </View>
    );
};

export default SMSScreen;
