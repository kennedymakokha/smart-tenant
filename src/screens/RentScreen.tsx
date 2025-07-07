import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import db from '../database/db';
import { Picker } from '@react-native-picker/picker';
const RentScreen = () => {
    const [tenants, setTenants] = useState([]);
    const [tenantId, setTenantId] = useState(null);
    const [payments, setPayments] = useState([]);

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
            Alert.alert("Payment Closed", "Rent can only be paid between 1st and 8th of the month.");
            return;
        }

        const currentMonth = today.toLocaleString('default', { month: 'long' });
        const currentYear = today.getFullYear();
        const date = today.toISOString();

        const selectedTenant: any = tenants.find((t: any) => t.id === tenantId);
        if (!selectedTenant) return;

        const amount = selectedTenant.rent_amount;

        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM rent_payments WHERE tenant_id = ? AND month = ? AND year = ?`,
                [tenantId, currentMonth, currentYear],
                (_, { rows }) => {
                    if (rows.length > 0) {
                        Alert.alert("Already Paid", `This tenant has already paid for ${currentMonth} ${currentYear}`);
                    } else {
                        tx.executeSql(
                            'INSERT INTO rent_payments (tenant_id, amount, month, year, date_paid) VALUES (?, ?, ?, ?, ?)',
                            [tenantId, amount, currentMonth, currentYear, date],
                            () => {
                                fetchPayments();
                                Alert.alert("Success", "Rent payment recorded.");
                            }
                        );
                    }
                }
            );
        });
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text>Pay Rent</Text>

            <Text>Select Tenant:</Text>
            <Picker
                selectedValue={tenantId}
                onValueChange={setTenantId}
                style={{ height: 50, marginBottom: 10 }}
            >
                {tenants.map((t: any) => (
                    <Picker.Item
                        key={t.id}
                        label={`${t.name} (${t.house_number}) - KES ${t.rent_amount}`}
                        value={t.id}
                    />
                ))}
            </Picker>


            <Button title="Pay Rent for This Month" onPress={addPayment} />

            <Text style={{ marginTop: 20 }}>Payment History</Text>
            <FlatList
                data={payments}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({ item }) => (
                    <Text>
                        {item.name} - {item.month} {item.year} - KES {item.amount}
                    </Text>
                )}
            />
        </View>
    );
};

export default RentScreen;
