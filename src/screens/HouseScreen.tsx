import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';
import db, { initDB } from '../database/db';
import { Button, Input } from '../components/ui/elements';

const HouseScreen = () => {
    const [houseNumber, setHouseNumber] = useState('');
    const [houses, setHouses] = useState([]);
    const [rentAmount, setRentAmount] = useState('');
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
        });
    };

    const addHouse = async () => {
        if (!houseNumber.trim()) return;
        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                'INSERT INTO houses (house_number, location, rent_amount) VALUES (?, ?, ?)',
                [houseNumber, '', parseFloat(rentAmount)],
                () => {
                    setHouseNumber('');
                    setRentAmount('');
                    fetchHouses();
                }
            );
        });
    };

    return (
        <View className='flex-1 bg-gray-100 p-4'>

            <Text>Add New House</Text>
            <Input
                placeholder="House Number"
                value={houseNumber}
                onChangeText={setHouseNumber}
                style={{ borderWidth: 1, marginVertical: 10, padding: 5 }}
            />
            <Input
                placeholder="Monthly Rent (e.g. 8000)"
                keyboardType="numeric"
                value={rentAmount}
                onChangeText={setRentAmount}
                style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
            />
            <Button title="Add House" onPress={addHouse} />
            <FlatList
                data={houses}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({ item }) => (<View className='h-10 my-1 flex-row flex p-2 justify-between items-center border-slate-300 border rounded-md'>
                    <Text>{item.house_number}</Text>
                    <Text> Ksh {item.rent_amount.toFixed(2)}</Text>
                </View>
                )}
            />
        </View>
    );
};

export default HouseScreen;
