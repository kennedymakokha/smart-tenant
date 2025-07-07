import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Alert, TouchableOpacity } from 'react-native';
import db from '../database/db';
import { Picker } from '@react-native-picker/picker';
import { Button, Input, Section } from '../components/ui/elements';

import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomModal from '../components/ui/bottomModal';
import { useToast } from '../../contexts/toastContext';
const TenantScreen = () => {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [houseId, setHouseId] = useState(null);
    const [houses, setHouses] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [addNewTenant, setAddNewTenant] = useState(false);
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
                    setAddNewTenant(false)
                    showToast(`Tenant added & assigned a room `, { type: 'success' });
                }
            );
        });
    };
    useEffect(() => {
        fetchHouses()
        fetchTenants()
    }, [])

    return (
        <View className='flex-1 bg-gray-100 p-4'>
            <Section title="Tenants"
                button={
                    <TouchableOpacity onPress={() => setAddNewTenant(true)} className='size-6 rounded-sm justify-center items-center border-slate-200  border  flex '>
                        <Icon name="add" className="text-red-500" size={20} color="red" />
                    </TouchableOpacity>
                }
            >
                <View className="flex w-full flex-row items-center justify-between">
                  

                    <FlatList
                        data={tenants.filter((x: any) => x.house_number !== null)}
                        keyExtractor={(item: any) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View className={`${item.house_number ? "bg-white" : "bg-slate-200"} p-3 rounded mb-1 h-14  flex-row flex p-2 justify-between items-center border-slate-200 border`}>
                                <Text className='strikethrough'>{item.name}</Text>
                                <View className='flex items-center flex-row gap-x-2'>
                                    <Text>Rm/{item.house_number}</Text>
                                    <TouchableOpacity onPress={() => unassignTenant(item.id)} className='flex items-center rounded-sm border-slate-200 justify-center border p-1'>
                                        <Icon name="cancel" size={20} color="red" />
                                    </TouchableOpacity>

                                </View>
                            </View>

                        )}
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
