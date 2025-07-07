import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import db from '../database/db';
import { Button, Section } from '../components/ui/elements';
import { useToast } from '../../contexts/toastContext';


export default function RentScreen() {
    const [tenants, setTenants] = useState([]);
    const [tenantId, setTenantId] = useState(null);
    const [payments, setPayments] = useState([]);
    const [month, setMonth] = useState('');
    const { showToast } = useToast()
    useEffect(() => {
        fetchTenants();
        fetchPayments();
    }, []);

    const fetchTenants = async () => {
        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                `SELECT tenants.id, tenants.name, houses.house_number, houses.rent_amount
         FROM tenants LEFT JOIN houses ON tenants.house_id = houses.id`,
                [],
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
        if (day < 1 || day > 8) {
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

        // dbConn.transaction(tx => {
        //     tx.executeSql(
        //         `SELECT * FROM rent_payments WHERE tenant_id = ? AND month = ? AND year = ?`,
        //         [tenantId, month, year],
        //         (_, { rows }) => {
        //             if (rows.length > 0) {
        //                 showToast(`Already paid for ${month}`, { type: 'info', position: "bottom" });

        //             } else {
        //                 tx.executeSql(
        //                     'INSERT INTO rent_payments (tenant_id, amount, month, year, date_paid) VALUES (?, ?, ?, ?, ?)',
        //                     [tenantId, amount, month, year, date],
        //                     () => {
        //                         fetchPayments();
        //                         Alert.alert('Payment recorded');
        //                     }
        //                 );
        //             }
        //         }
        //     );
        // });
    };

    return (
        <View className="flex-1 bg-gray-100 p-4">
            <Section title={`Payment For ${new Date().toLocaleString('default', { month: 'long' })}`}>
                <FlatList
                    data={tenants.filter((x: any) => x.house_number !== null)}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => addPayment(item.id)} className="bg-white p-3 flex flex-row items-center justify-between rounded mb-2">
                            <Text className="text-sm">
                                {item.name}
                            </Text>
                            <Text className="text-sm">
                                KES {item.rent_amount.toFixed(2)}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </Section>

        </View>
    );
}
