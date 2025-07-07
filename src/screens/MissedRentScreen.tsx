import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import db from '../database/db';

const MissedRentScreen = () => {
    const [unpaidTenants, setUnpaidTenants] = useState([]);

    useEffect(() => {
        fetchUnpaidTenants();
    }, []);

    const fetchUnpaidTenants = async () => {
        const today = new Date();
        const currentMonth = today.toLocaleString('default', { month: 'long' });
        const currentYear = today.getFullYear();
        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                `SELECT tenants.name, houses.house_number, houses.rent_amount
         FROM tenants
         LEFT JOIN houses ON tenants.house_id = houses.id
         WHERE tenants.id NOT IN (
           SELECT tenant_id FROM rent_payments
           WHERE month = ? AND year = ?
         )`,
                [currentMonth, currentYear],
                (_, results: any) => {
                    setUnpaidTenants(results.rows.raw());
                }
            );
        });
    };

    return (
        <View className='flex-1 bg-gray-100 p-4'>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
                Tenants Who Missed Rent (After 8th)
            </Text>
            {unpaidTenants.length === 0 ? (
                <Text> All tenants have paid.</Text>
            ) : (
                <FlatList
                    data={unpaidTenants.filter((x: any) => x.house_number !== null)}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }: any) => (
                        <View className='w-full flex-row'>
                            <View className='w-1/3 h-10 border'>
                                <Text>{item.name} </Text>
                            </View>
                            <View className='w-1/3 h-10 border'>
                                <Text>{item.house_number} </Text>
                            </View>
                            <View className='w-1/3 h-10 border'>
                                <Text>{item.rent_amount} </Text>
                            </View>
                            {/* <Text>{item.name} ({item.house_number}) - Owes KES {item.rent_amount}</Text> */}
                        </View>
                    )}
                />
            )}
        </View>
    );
};

export default MissedRentScreen;
