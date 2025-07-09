import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import db from '../database/db';
import { Button, Section } from '../components/ui/elements';
import { useToast } from '../../contexts/toastContext';
import { FormatDate } from '../../utils/dateFormarter';
import Icon from 'react-native-vector-icons/FontAwesome'
import { useFocusEffect } from '@react-navigation/native';

export default function RentScreen({ navigation }: any) {
    const [tenants, setTenants] = useState([]);
    const [tenantId, setTenantId] = useState(null);
    const [payments, setPayments] = useState([]);
    const [month, setMonth] = useState('');
    const { showToast } = useToast()
    useEffect(() => {
        fetchTenants();
        fetchPayments();
    }, []);
    useFocusEffect(
        useCallback(() => {
            fetchTenants();
            fetchPayments();
        }, [])
    );
   
    const fetchTenants = async () => {
        const today = new Date();
        const month = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();

        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                `SELECT tenants.id, tenants.name, houses.house_number, houses.rent_amount
                 FROM tenants
                 LEFT JOIN houses ON tenants.house_id = houses.id
                 WHERE tenants.id NOT IN (
                     SELECT tenant_id FROM rent_payments WHERE month = ? AND year = ?
                 ) AND houses.house_number IS NOT NULL`,
                [month, year],
                (_, results) => {
                    const rows: any = results.rows.raw();
                    setTenants(rows);
                    if (rows.length > 0) setTenantId(rows[0].id);
                }
            );
        });
    };

    const fetchPayments = async () => {
        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                `SELECT rent_payments.*, tenants.name FROM rent_payments
         LEFT JOIN tenants ON rent_payments.tenant_id = tenants.id
         ORDER BY date_paid DESC`,
                [],
                (_, results: any) => {
                    setPayments(results.rows.raw());
                }
            );
        });
    };

    const addPayment = async (tenantId: any) => {
        const today = new Date();
        const day = today.getDate();
        if (day < 1 || day > 20) {
            showToast(`Rent can only be paid between 1st and 8th`, { type: 'error', position: "top" });

            return;
        }

        const month = today.toLocaleString('default', { month: 'long' });
        setMonth(month)
        const year = today.getFullYear();
        const date = today.toISOString();
        const selected: any = tenants.find((t: any) => t.id === tenantId);
        if (!selected) return;

        const amount = selected.rent_amount;

        const dbConn = await db;
        dbConn.transaction(tx => {
            tx.executeSql(
                `SELECT rp.*, t.name AS tenant_name 
                 FROM rent_payments rp 
                 JOIN tenants t ON rp.tenant_id = t.id 
                 WHERE rp.tenant_id = ? AND rp.month = ? AND rp.year = ?`,
                [tenantId, month, year],
                (_, { rows }) => {
                    if (rows.length > 0) {
                        const tenantName = rows.item(0).tenant_name;
                        showToast(`Already paid for ${month} by ${tenantName}`, { type: 'info', position: "bottom" });
                    } else {
                        tx.executeSql(
                            'INSERT INTO rent_payments (tenant_id, amount, month, year, date_paid) VALUES (?, ?, ?, ?, ?)',
                            [tenantId, amount, month, year, date],
                            () => {
                                fetchPayments();
                                fetchTenants()

                                // Fetch tenant name again after insert, optional
                                tx.executeSql(
                                    'SELECT name FROM tenants WHERE id = ?',
                                    [tenantId],
                                    (_, { rows }) => {
                                        const tenantName = rows.item(0).name;
                                        Alert.alert('Payment recorded', `Payment recorded for ${tenantName}`);
                                    }
                                );
                            }
                        );
                    }
                }
            );
        });

    };
    const TableHeader = () => (
        <View className="flex-row bg-gray-200 border-b border-gray-400">


            <View className="w-[40%] p-2">
                <Text className="font-bold text-gray-800">Tenant</Text>
            </View>
            <View className="w-[30%] p-2">
                <Text className="font-bold text-gray-800">amount</Text>
            </View>
            <View className="w-[30%] p-2">
                <Text className="font-bold text-gray-800">Acknowledge</Text>
            </View>
        </View>
    );

    const TableRow = ({ item }: any) => (
        <View className="flex-row border-b  border-gray-300 bg-white">
            <View className="w-[40%] p-2  justify-center flex">
                <TouchableOpacity onPress={() => navigation.navigate('rentDetail', { rent: item })} className="flex">
                    <Text className="text-gray-700">{item.name}</Text>
                </TouchableOpacity>
            </View>
            <View className="w-[30%]  justify-center flex  p-2">
                <Text className="text-gray-700"> {item.rent_amount.toFixed(2)}</Text>
            </View>
            <View className="w-[30%] p-2 flex-row  gap-x-2">
                <TouchableOpacity onPress={() => navigation.navigate('rentDetail', { rent: item })} className=" border rounded-sm  px-2 border-slate-300  items-center justify-center flex">
                    <Icon name="eye" size={20} color="gray" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => addPayment(item.id)} className=" border rounded-sm  px-2 border-slate-300  items-center justify-center flex">
                    <Icon name="check" size={20} color="gray" />
                </TouchableOpacity>
            </View>
        </View>
    );
    return (
        <View className="flex-1 bg-gray-100 p-4">
            <TableHeader />
            <FlatList
                data={tenants.filter((x: any) => x.house_number !== null)}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({ item }) => <TableRow item={item} />}

            />
        </View>
    );
}
