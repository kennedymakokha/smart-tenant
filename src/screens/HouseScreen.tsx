import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import db, { initDB } from '../database/db';
import { Button, Input, Section } from '../components/ui/elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomModal from '../components/ui/bottomModal';
import { useToast } from '../../contexts/toastContext';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
const HouseScreen = ({ navigation, route }: any) => {
    const { state } = route.params;
    const [houseNumber, setHouseNumber] = useState('');
    const [houses, setHouses] = useState([]);
    const [vhouses, setVacantHouseData] = useState([]);
    const [rentAmount, setRentAmount] = useState('');
    const [category, setCategory] = useState('');
    const [addNewHouse, setAddNewHouse] = useState(false);
    const { showToast } = useToast()
    useEffect(() => {
        initDB().then(fetchHouses);
    }, []);

    const fetchHouses = async () => {
        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM houses',
                [],
                (_, results) => {
                    const rows: any = results.rows.raw();
                    setHouses(rows);
                }
            );

            tx.executeSql(
                `SELECT h.name,
                        h.category,
                        h.rent_amount
                 FROM houses h
                 LEFT JOIN tenants t ON h.id = t.house_id
                 WHERE t.house_id IS NULL`,
                [],
                (_, result) => {
                    console.log("vacantHouses", result)
                    const vacantHouses: any = result.rows.raw();
                    console.log("vacantHouses")
                    setVacantHouseData(vacantHouses);
                }
            )
        });
    };

    const addHouse = async () => {
        if (!houseNumber.trim()) return;
        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                'INSERT INTO houses (house_number, location, rent_amount,category) VALUES (?, ?, ?,?)',
                [houseNumber, '', parseFloat(rentAmount), category],
                () => {
                    setHouseNumber('');
                    setRentAmount('');
                    fetchHouses();
                    setAddNewHouse(false)
                    showToast(`House added successfully`, { type: 'info', position: "top" });

                }
            );
        });
    };
    const TableHeader = () => (
        <View className="flex-row bg-gray-200 border-b border-gray-400">

            <View className="w-[40%] p-2">
                <Text className="font-bold text-gray-800">House</Text>
            </View>
            <View className="w-[30%] p-2">
                <Text className="font-bold text-gray-800">Category</Text>
            </View>
            <View className="w-[30%] p-2">
                <Text className="font-bold text-gray-800">Rent</Text>
            </View>

        </View>
    );

    const TableRow = ({ item }: any) => (
        <View className="flex-row border-b  border-gray-300 bg-white">
            <View className="w-[40%] p-2  justify-center flex">
                <TouchableOpacity onPress={() => navigation.navigate('houseDetail', { house: item })} className="flex">
                    <Text className="text-gray-700">{item.house_number}</Text>
                </TouchableOpacity>
            </View>
            <View className="w-[30%]  justify-center flex  p-2">
                <Text className="text-gray-700"> {item.category}</Text>
            </View>
            <View className="w-[30%]  justify-center flex  p-2">
                <Text className="text-gray-700"> {item.rent_amount.toFixed(2)}</Text>
            </View>

        </View>
    );
    useFocusEffect(
        useCallback(() => {
            fetchHouses();
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
                    data={state === "occ" ? houses : vhouses}
                    keyExtractor={(item: any) => item.id.toString()}
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

                        <Button title="Add House" onPress={addHouse} />
                    </>
                }
                onCancel={() => {
                    setAddNewHouse(false);
                }}
            />
        </View>
    );
};

export default HouseScreen;
