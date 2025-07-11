import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import db from '../database/db';
import { Section } from '../components/ui/elements';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-gifted-charts';
import { useGetsmsBalanceMutation } from '../services/sms.service';
export default function DashboardScreen() {
    const [occupancyData, setOccupancyData] = useState([]);
    const [rentData, setRentData] = useState([]);
    const [rentTarget, setRentTarget] = useState(0);
    const [categoryOccupancyData, setCategoryOccupancyData] = useState([]);

    const [categoryLineData, setCategoryLineData] = useState([]);
    const [categoryLabels, setCategoryLabels] = useState([]);
    const categoryColors = [
        '#facc15', // yellow
        '#34d399', // green
        '#60a5fa', // blue
        '#f472b6', // pink
        '#fb923c', // orange
        '#a78bfa', // purple
    ];
    const [fetchBalance] = useGetsmsBalanceMutation()
    const findBalance = async () => {
        let v = await fetchBalance({}).unwrap()
        console.log(v)
    }
    useEffect(() => {
        findBalance()
    }, [])
    useFocusEffect(
        useCallback(() => {
            fetchStats();
            findBalance()
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
                        { value: occupied_rent || 0, label: 'Occupied', color: '#1e293b' },
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
            tx.executeSql(
                `SELECT h.category,
                        COUNT(h.id) as total,
                        SUM(CASE WHEN t.house_id IS NOT NULL THEN 1 ELSE 0 END) as occupied,
                        COUNT(h.id) - SUM(CASE WHEN t.house_id IS NOT NULL THEN 1 ELSE 0 END) as vacant
                 FROM houses h
                 LEFT JOIN tenants t ON h.id = t.house_id
                 GROUP BY h.category`,
                [],
                (_, result) => {
                    const raw = result.rows.raw();

                    const labels = raw.map(item => item.category || 'Unknown');

                    const totalLine = raw.map(item => ({
                        value: item.total,
                    }));

                    const occupiedLine = raw.map(item => ({
                        value: item.occupied,
                    }));

                    const vacantLine = raw.map(item => ({
                        value: item.vacant,
                    }));

                    setCategoryLineData([
                        { data: totalLine, color: '#94a3b8', label: 'Total Houses' },    // gray
                        { data: occupiedLine, color: '#1e293b', label: 'Occupied Houses' }, // blue
                        { data: vacantLine, color: '#f87171', label: 'Vacant Houses' }   // red
                    ]);

                    setCategoryLabels(labels);
                }
            );

            tx.executeSql(
                `SELECT h.category,
                        COUNT(h.id) as total,
                        SUM(CASE WHEN t.house_id IS NOT NULL THEN 1 ELSE 0 END) as occupied,
                        COUNT(h.id) - SUM(CASE WHEN t.house_id IS NOT NULL THEN 1 ELSE 0 END) as vacant
                 FROM houses h
                 LEFT JOIN tenants t ON h.id = t.house_id
                 GROUP BY h.category`,
                [],
                (_, result) => {
                    const raw = result.rows.raw();

                    const stackedData = raw.map((item, index) => ({
                        label: item.category || 'Unknown',
                        stacks: [
                            {
                                value: item.occupied,
                                color: '#1e293b',
                                label: 'Occupied',
                            },
                            {
                                value: item.vacant,
                                color: '#f87171',
                                label: 'Vacant',
                            },
                        ],
                    }));

                    setCategoryOccupancyData(stackedData);
                }
            );

        });
    };


    return (
        <ScrollView className="flex-1 bg-gray-100 p-4">
            <Section title="Occupancy Status">
                <View className="flex flex-col  px-2 gap-y-3">
                    <View className="bg-white w-full border border-slate-300 flex justify-center items-center rounded p-4">
                        <PieChart
                            data={occupancyData}
                            donut
                            showText
                            textColor="black"
                            innerRadius={0}
                            radius={80}
                            textSize={12}
                        />
                        <View className="flex gap-y-2 justify-around mt-4">
                            {occupancyData.map((item: any, idx) => (
                                <View key={idx} className="flex-row items-center gap-x-2 space-x-2">
                                    <View className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                                    <Text className="text-sm">{item.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </Section>
            {/* <Section title="House occupancy by category">
                <View className="bg-white w-full rounded p-4">
                    {categoryLineData.length > 0 ? (
                        <>
                            <Text className="text-base font-semibold mb-2 text-center">Occupancy by Category</Text>
                            <LineChart
                                data={categoryLineData}
                                xAxisLabelTexts={categoryLabels}
                                hideDataPoints={false}
                                dataPointsRadius={6}
                                dataPointsColor="black"
                                thickness={2}
                                height={200}
                                spacing={30}
                                showValuesAsDataPointsText={true}
                                isAnimated={false}
                                areaChart={false}
                                hideRules={false}
                                xAxisLabelTextStyle={{ fontSize: 10 }}
                                yAxisTextStyle={{ fontSize: 10 }}
                                xAxisIndicesHeight={10}
                            />


                            <View className="flex flex-row justify-around mt-4">
                                {categoryLineData.map((line, index) => (
                                    <View key={index} className="flex-row items-center gap-x-2">
                                        <View className="w-4 h-4 rounded-full" style={{ backgroundColor: line.color }} />
                                        <Text className="text-sm">{line.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    ) : (
                        <Text className="text-center text-gray-500">No data available</Text>
                    )}
                </View>

            </Section> */}
            {/* <Section title="Occupancy by Category (Stacked)">
                <View className="bg-white w-full rounded p-4">
                    {categoryOccupancyData.length > 0 ? (
                        <>
                            <Text className="text-base font-semibold mb-2 text-center">Stacked Occupancy by Category</Text>
                            <BarChart
                                stackData={categoryOccupancyData}
                                barWidth={30}
                                spacing={30}
                                noOfSections={5}
                                yAxisTextStyle={{ fontSize: 10 }}
                                xAxisLabelTextStyle={{ fontSize: 10 }}
                                showValuesOnTopOfBars
                                valueTextStyle={{ fontSize: 10, color: '#1f2937' }}
                            />
                            <View className="flex flex-row justify-around mt-4">
                                <View className="flex-row items-center gap-x-2">
                                    <View className="w-4 h-4 rounded-full" style={{ backgroundColor: '#1e293b' }} />
                                    <Text className="text-sm">Occupied</Text>
                                </View>
                                <View className="flex-row items-center gap-x-2">
                                    <View className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f87171' }} />
                                    <Text className="text-sm">Vacant</Text>
                                </View>
                            </View>
                        </>
                    ) : (
                        <Text className="text-center text-gray-500">No data available</Text>
                    )}
                </View>
            </Section> */}
            <Section title="Occupancy by Category (Stacked)">
                <View className="bg-white w-full border border-slate-300 rounded p-4">
                    {categoryOccupancyData.length > 0 ? (
                        <>
                            <Text className="text-base font-semibold mb-2 text-center">Stacked Occupancy by Category</Text>

                            <View className="relative h-72 justify-center items-center">
                                {/* Background Pie Chart */}
                                <View className="absolute opacity-10 z-0">
                                    <PieChart
                                        data={occupancyData}
                                        donut
                                        showText
                                        textColor="black"
                                        innerRadius={0}
                                        radius={80}
                                        textSize={12}
                                    />
                                </View>

                                {/* Stacked Bar Chart */}
                                <View className="z-10">
                                    <BarChart
                                        stackData={categoryOccupancyData}
                                        barWidth={30}
                                        spacing={30}
                                        noOfSections={5}
                                        yAxisTextStyle={{ fontSize: 10 }}
                                        xAxisLabelTextStyle={{ fontSize: 10 }}
                                        showValuesOnTopOfBars
                                        valueTextStyle={{ fontSize: 10, color: '#1f2937' }}
                                    />
                                </View>
                            </View>

                            {/* Legend */}
                            <View className="flex flex-row justify-around mt-4">
                                <View className="flex-row items-center gap-x-2">
                                    <View className="w-4 h-4 rounded-full" style={{ backgroundColor: '#1e293b' }} />
                                    <Text className="text-sm">Occupied</Text>
                                </View>
                                <View className="flex-row items-center gap-x-2">
                                    <View className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f87171' }} />
                                    <Text className="text-sm">Vacant</Text>
                                </View>
                            </View>
                        </>
                    ) : (
                        <Text className="text-center text-gray-500">No data available</Text>
                    )}
                </View>
            </Section>

            <Section title="Rent Collection (Last 6 Months)">
                <View className="bg-white border border-slate-300 rounded p-4">
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
        </ScrollView >
    );
}
