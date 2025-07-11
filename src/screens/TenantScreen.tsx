import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Alert, TouchableOpacity } from 'react-native';
import db from '../database/db';
import { Picker } from '@react-native-picker/picker';
import { Button, Input, Section } from '../components/ui/elements';

import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomModal from '../components/ui/bottomModal';
import { useToast } from '../../contexts/toastContext';
import { useFocusEffect } from '@react-navigation/native';
const TenantScreen = ({ navigation }: any) => {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [id, setId] = useState('');
    const [houseId, setHouseId] = useState(null);
    const [houses, setHouses] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [addNewTenant, setAddNewTenant] = useState(false);


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
    const unassignTenant = async (tenantId: any) => {
        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                'UPDATE tenants SET house_id = NULL WHERE id = ?',
                [tenantId],
                () => {
                    showToast('Tenant unassigned from house', { type: 'success' });
                    fetchTenants();

                }
            );
        });
    };
    const assignTenant = async () => {
        if (!name || !houseId) {
            Alert.alert("house not selected")
            return
        };

        const database = await db;

        // Check if the house is already assigned
        database.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM tenants WHERE house_id = ?',
                [houseId],
                (_, { rows }) => {
                    if (rows.length > 0) {
                        showToast('This house is already assigned to another tenant.', { type: 'info', position: 'top' });
                    } else {
                        // Proceed to assign tenant
                        tx.executeSql(
                            'INSERT INTO tenants (name, phone, house_id,national_id) VALUES (?, ?, ?, ?)',
                            [name, phone, houseId, id],
                            () => {
                                setName('');
                                setPhone('');
                                fetchTenants();
                                setAddNewTenant(false);
                                showToast(`Tenant added & assigned a room`, { type: 'success' });
                            }
                        );
                    }
                }
            );
        });
    };


    useFocusEffect(
        useCallback(() => {
            fetchHouses()
            fetchTenants()
        }, [])
    );
    const TableHeader = () => (
        <View className="flex-row bg-gray-200 border-b border-gray-400">

            <View className="w-[40%] p-2">
                <Text className="font-bold text-gray-800">Name</Text>
            </View>
            <View className="w-[20%] p-2">
                <Text className="font-bold text-gray-800">ID</Text>
            </View>
            <View className="w-[20%] p-2">
                <Text className="font-bold text-gray-800">House</Text>
            </View>
            <View className="w-[20%] p-2">
                <Text className="font-bold text-gray-800">action</Text>
            </View>

        </View>
    );

    const TableRow = ({ item }: any) => (
        <View className="flex-row border-b  border-gray-300 bg-white">
            <View className="w-[40%] p-2  justify-center flex">
                <TouchableOpacity onPress={() => navigation.navigate('tenantDetail', { tenant: item, data: houses })} className="flex">
                    <Text className="text-gray-700">{item.name}</Text>
                </TouchableOpacity>
            </View>
            <View className="w-[20%]  justify-center flex  p-2">
                <Text className="text-gray-700"> {item.national_id}</Text>
            </View>
            <View className="w-[20%]  justify-center flex  p-2">
                <Text className="text-gray-700"> {item.house_number}</Text>
            </View>
            <View className="w-[20%]  justify-center flex  p-2">
                <TouchableOpacity onPress={() => unassignTenant(item.id)} className=" border rounded-sm  px-2 border-slate-300  items-center justify-center flex">
                    <Icon name="cancel" size={20} color="gray" />
                </TouchableOpacity>
            </View>

        </View>
    );
    return (
        <View className='flex-1 bg-gray-100 p-4'>
            <Section title="Tenants"
                button={
                    <TouchableOpacity onPress={() => setAddNewTenant(true)} className='size-6 rounded-sm justify-center items-center border-slate-200  border  flex '>
                        <Icon name="add" className="text-red-500" size={20} color="red" />
                    </TouchableOpacity>
                }
            >
                <View className="flex ">
                    <TableHeader />
                    <FlatList
                        data={tenants.filter((x: any) => x.house_number !== null)}
                        keyExtractor={(item: any) => item.id.toString()}
                        renderItem={({ item }) => <TableRow item={item} />}

                    />
                </View>

            </Section>
            <BottomModal
                visible={addNewTenant}
                loading={true}
                title="ADD New Tenant"
                body={
                    <>
                        <Input
                            placeholder="Tenant Name"
                            value={name}
                            onChangeText={setName}
                            style={{ borderWidth: 1, marginVertical: 10, padding: 5 }}
                        />
                        <Input
                            placeholder="Phone Number"
                            value={phone}
                            onChangeText={setPhone}
                            style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
                            keyboardType="phone-pad"
                        />
                        <Input
                            placeholder="ID Number"
                            value={id}
                            onChangeText={setId}
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
                    </>
                }

                onCancel={() => {

                    setAddNewTenant(false);
                }}
            />
        </View>
    );
};

export default TenantScreen;
