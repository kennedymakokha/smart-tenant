import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import db from '../database/db';
import { Button, Section } from '../components/ui/elements';
import { useToast } from '../../contexts/toastContext';


export default function RentScreen() {
    const [tenants, setTenants] = useState([]);
    const [tenantId, setTenantId] = useState(null);
    const [payments, setPayments] = useState([]);
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

    const addPayment = async () => {
        const today = new Date();
        const day = today.getDate();
        if (day < 1 || day > 8) {
            showToast(`Rent can only be paid between 1st and 8th`, { type: 'error', position: "top" });

            return;
        }

        const month = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();
        const date = today.toISOString();
        const selected: any = tenants.find((t: any) => t.id === tenantId);
        if (!selected) return;

        const amount = selected.rent_amount;

        const dbConn = await db;
        dbConn.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM rent_payments WHERE tenant_id = ? AND month = ? AND year = ?`,
                [tenantId, month, year],
                (_, { rows }) => {
                    if (rows.length > 0) {
                        Alert.alert(`Already paid for ${month}`);
                    } else {
                        tx.executeSql(
                            'INSERT INTO rent_payments (tenant_id, amount, month, year, date_paid) VALUES (?, ?, ?, ?, ?)',
                            [tenantId, amount, month, year, date],
                            () => {
                                fetchPayments();
                                Alert.alert('Payment recorded');
                            }
                        );
                    }
                }
            );
        });
    };

    return (
        <View className="flex-1 bg-gray-100 p-4">
            <Section title="Pay Monthly Rent">
                <View className="bg-white rounded-lg p-4">
                    <Text className="text-sm mb-1">Select Tenant:</Text>
                    <Picker
                        selectedValue={tenantId}
                        onValueChange={setTenantId}
                        style={{ backgroundColor: '#eee', borderRadius: 8, marginBottom: 16 }}
                    >
                        {tenants.filter((x: any) => x.house_number !== null).map((t: any) => (
                            <Picker.Item
                                key={t.id}
                                label={`${t.name} (${t.house_number}) - KES ${t.rent_amount}`}
                                value={t.id}
                            />
                        ))}
                    </Picker>

                    <Button title="Pay Rent for This Month" onPress={addPayment} />
                </View>
            </Section>

            <Section title="Payment History">
                <FlatList
                    data={payments}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View className="bg-white p-3 rounded mb-2">
                            <Text className="text-sm">
                                {item.name} — {item.month} {item.year}: KES {item.amount}
                            </Text>
                        </View>
                    )}
                />
            </Section>

        </View>
    );
}
