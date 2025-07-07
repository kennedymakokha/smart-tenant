import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import db from '../database/db';
import { Picker } from '@react-native-picker/picker';
const TenantScreen = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [houseId, setHouseId] = useState(null);
    const [houses, setHouses] = useState([]);
    const [tenants, setTenants] = useState([]);

    useEffect(() => {
        fetchHouses();
        fetchTenants();
    }, []);

    const fetchHouses = async () => {
        const database = await db;
        database.transaction(tx => {
            tx.executeSql('SELECT * FROM houses', [], (_, results: any) => {
                setHouses(results.rows.raw());
                if (results.rows.length > 0) {
                    setHouseId(results.rows.item(0).id);
                }
            });
        });
    };

    const fetchTenants = async () => {
        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                `SELECT tenants.*, houses.house_number FROM tenants
         LEFT JOIN houses ON tenants.house_id = houses.id`,
                [],
                (_, results: any) => {
                    setTenants(results.rows.raw());
                }
            );
        });
    };

    const assignTenant = async () => {
        if (!name || !houseId) return;
        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                'INSERT INTO tenants (name, phone, house_id) VALUES (?, ?, ?)',
                [name, phone, houseId],
                () => {
                    setName('');
                    setPhone('');
                    fetchTenants();
                }
            );
        });
    };

    return (
        <View style={{ padding: 20 }}>
            <Text>Assign Tenant to House</Text>
            <TextInput
                placeholder="Tenant Name"
                value={name}
                onChangeText={setName}
                style={{ borderWidth: 1, marginVertical: 10, padding: 5 }}
            />
            <TextInput
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
                keyboardType="phone-pad"
            />
            <Text>Select House:</Text>
            <Picker
                selectedValue={houseId}
                onValueChange={(value) => setHouseId(value)}
                style={{ height: 50, marginBottom: 10 }}
            >
                {houses.map((h: any) => (
                    <Picker.Item key={h.id} label={h.house_number} value={h.id} />
                ))}
            </Picker>
            <Button title="Assign Tenant" onPress={assignTenant} />

            <Text style={{ marginTop: 20 }}>Assigned Tenants</Text>
            <FlatList
                data={tenants}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({ item }) => (
                    <Text>{item.name} → {item.house_number}</Text>
                )}
            />
        </View>
    );
};

export default TenantScreen;
