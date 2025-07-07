import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import db, { initDB } from '../database/db';

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
        <View style={{ padding: 20 }}>
            <Text>Add New House</Text>
            <TextInput
                placeholder="House Number"
                value={houseNumber}
                onChangeText={setHouseNumber}
                style={{ borderWidth: 1, marginVertical: 10, padding: 5 }}
            />
            <TextInput
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
                renderItem={({ item }) => (
                    <Text>{item.house_number}</Text>
                )}
            />
        </View>
    );
};

export default HouseScreen;
