import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import db from '../database/db';

const RentSummaryScreen = () => {
    const [summaryByMonth, setSummaryByMonth] = useState([]);
    const [summaryByTenant, setSummaryByTenant] = useState([]);

    useEffect(() => {
        fetchSummaryByMonth();
        fetchSummaryByTenant();
    }, []);

    const fetchSummaryByMonth = async () => {
        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                `SELECT month, year, SUM(amount) AS total
         FROM rent_payments
         GROUP BY year, month
         ORDER BY year DESC, month DESC`,
                [],
                (_, results: any) => {
                    setSummaryByMonth(results.rows.raw());
                }
            );
        });
    };

    const fetchSummaryByTenant = async () => {
        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                `SELECT tenants.name, SUM(rent_payments.amount) AS total
         FROM rent_payments
         JOIN tenants ON rent_payments.tenant_id = tenants.id
         GROUP BY tenants.id`,
                [],
                (_, results: any) => {
                    setSummaryByTenant(results.rows.raw());
                }
            );
        });
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>
                📅 Rent Collected Per Month
            </Text>
            <FlatList
                data={summaryByMonth}
                keyExtractor={(item, index) => `month-${index}`}
                renderItem={({ item }: any) => (
                    <Text>{item.month} {item.year}: KES {item.total}</Text>
                )}
            />

            <Text style={{ fontWeight: 'bold', fontSize: 16, marginVertical: 20 }}>
                👤 Rent Paid Per Tenant
            </Text>
            <FlatList
                data={summaryByTenant}
                keyExtractor={(item, index) => `tenant-${index}`}
                renderItem={({ item }: any) => (
                    <Text>{item.name}: KES {item.total}</Text>
                )}
            />
        </View>
    );
};

export default RentSummaryScreen;
