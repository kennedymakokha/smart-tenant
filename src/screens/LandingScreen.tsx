import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import db from '../database/db';
import { Section } from '../components/ui/elements';
import { useFocusEffect } from '@react-navigation/native';

export default function DashboardScreen() {
    const [occupancyData, setOccupancyData] = useState([]);
    const [rentData, setRentData] = useState([]);
    const [rentTarget, setRentTarget] = useState(0);

    // useEffect(() => {
    //     fetchStats();
    // }, []);

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [])
    );
   
    const fetchStats = async () => {
        const database = await db;
        database.transaction(tx => {
            // Occupancy based on rent value
            tx.executeSql(
                `SELECT
                    (SELECT SUM(rent_amount) FROM houses WHERE id IN (SELECT house_id FROM tenants WHERE house_id IS NOT NULL)) AS occupied_rent,
                    (SELECT SUM(rent_amount) FROM houses WHERE id NOT IN (SELECT house_id FROM tenants WHERE house_id IS NOT NULL)) AS vacant_rent`,
                [],
                (_, result) => {
                    const { occupied_rent, vacant_rent } = result.rows.item(0);
                    setOccupancyData([
                        { value: occupied_rent || 0, label: 'Occupied', color: '#4ade80' },
                        { value: vacant_rent || 0, label: 'Vacant', color: '#f87171' }
                    ]);
                }
            );

            // Expected rent from occupied houses
            tx.executeSql(
                `SELECT SUM(h.rent_amount) as target FROM houses h
                 WHERE h.id IN (SELECT house_id FROM tenants WHERE house_id IS NOT NULL)`,
                [],
                (_, result) => {
                    const target = result.rows.item(0).target || 0;
                    setRentTarget(target);
                }
            );

            // Monthly rent collection
            tx.executeSql(
                `SELECT month, SUM(amount) as total FROM rent_payments GROUP BY month ORDER BY rowid DESC LIMIT 6`,
                [],
                (_, result) => {
                    const rentChart: any = result.rows.raw().reverse().map(item => ({
                        value: item.total || 0,
                        label: item.month?.slice(0, 3) || '',
                        frontColor: '#60a5fa'
                    }));
                    setRentData(rentChart);
                }
            );
        });
    };

    return (
        <ScrollView className="flex-1 bg-gray-100 p-4">
            <Section title="Occupancy Status">
                <View className="bg-white flex-row justify-center gap-x-3 items-center rounded p-4">
                    <PieChart
                        data={occupancyData}
                        donut
                        showText
                        textColor="black"
                        innerRadius={40}
                        radius={80}
                        textSize={12}
                    />
                    <View className="flex gap-y-2 justify-around mt-4">
                        {occupancyData.map((item:any, idx) => (
                            <View key={idx} className="flex-row items-center gap-x-2 space-x-2">
                                <View className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                                <Text className="text-sm">{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </Section>

            <Section title="Rent Collection (Last 6 Months)">
                <View className="bg-white rounded p-4">
                    {rentData.length > 0 ? (
                        <>
                            <BarChart
                                data={rentData}
                                barWidth={30}
                                spacing={20}
                                noOfSections={5}
                                yAxisLabel="KES "
                                yAxisTextStyle={{ fontSize: 10 }}
                                xAxisLabelTextStyle={{ fontSize: 12 }}
                                maxValue={rentTarget > 0 ? rentTarget : undefined}
                                showLine
                                lineConfig={{
                                    color: '#10b981',
                                    thickness: 2,
                                    dashGap: 4,
                                    dashWidth: 4,
                                }}
                                lineData={rentData.map(() => ({
                                    value: rentTarget,
                                }))}
                                showValuesOnTopOfBars
                                valueTextStyle={{ fontSize: 10, color: '#1f2937' }}
                            />
                            <Text className="text-xs mt-2 text-gray-500 text-center">
                                Expected Monthly Total: KES {rentTarget.toLocaleString()}
                            </Text>
                        </>
                    ) : (
                        <Text className="text-center text-gray-500">No rent data available</Text>
                    )}
                </View>
            </Section>
        </ScrollView>
    );
}
