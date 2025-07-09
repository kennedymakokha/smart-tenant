import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useCallback, useState } from 'react'
import db from '../database/db';
import { useFocusEffect } from '@react-navigation/native';
import { FormatDate } from '../../utils/dateFormarter';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Ionicons from 'react-native-vector-icons/Ionicons'
const RentDetailscreen = ({ route }: any) => {
    const { params: { rent: { id } } } = route
    const [payments, setPayments] = useState([]);
    const fetchPayments = async (tenantId: number) => {
        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                `SELECT rent_payments.*, tenants.name FROM rent_payments
                 LEFT JOIN tenants ON rent_payments.tenant_id = tenants.id
                 WHERE rent_payments.tenant_id = ?
                 ORDER BY date_paid DESC`,
                [tenantId],
                (_, results: any) => {
                    setPayments(results.rows.raw());
                },
                (txObj, error) => {
                    console.error("Error fetching tenant payments:", error);
                    return true; // roll back on error
                }
            );
        });
    };
    useFocusEffect(
        useCallback(() => {
            fetchPayments(id);
        }, [])
    );

    const generatePDF = async () => {
        let htmlContent = `
            <h1>Rent Payment History</h1>
            <table border="1" style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 8px; background-color: #f0f0f0;">Amount</th>
                        <th style="padding: 8px; background-color: #f0f0f0;">Period</th>
                        <th style="padding: 8px; background-color: #f0f0f0;">Paid On</th>
                    </tr>
                </thead>
                <tbody>
                    ${payments
                .map(
                    (p: any) => `
                        <tr>
                            <td style="padding: 8px;">KES ${p.amount}</td>
                            <td style="padding: 8px;">${p.month}/${p.year}</td>
                            <td style="padding: 8px;">${FormatDate(p.date_paid)}</td>
                        </tr>
                    `
                )
                .join('')}
                </tbody>
            </table>
        `;

        try {
            const pdf = await RNHTMLtoPDF.convert({
                html: htmlContent,
                fileName: `rent_payments_${id}`,
                directory: 'Documents',
            });

            const filePath = pdf.filePath;

            if (filePath && (await RNFS.exists(filePath))) {
                const options = {
                    url: `file://${filePath}`,
                    type: 'application/pdf',
                    failOnCancel: false,
                };

                await Share.open(options);
            } else {
                console.warn('PDF file not found at path:', filePath);
            }
        } catch (error) {
            console.error('PDF generation or sharing failed:', error);
        }
    };

    const TableHeader = () => (
        <View className="flex-row bg-gray-200 border-b border-gray-400">


            <View className="w-[20%] p-2">
                <Text className="font-bold text-gray-800">Amount</Text>
            </View>
            <View className="w-[30%] p-2">
                <Text className="font-bold text-gray-800">Period</Text>
            </View>
            <View className="w-[50%] p-2">
                <Text className="font-bold text-gray-800">Paid On</Text>
            </View>
        </View>
    );

    const TableRow = ({ item }: any) => (
        <View className="flex-row border-b border-gray-300 bg-white">

            <View className="w-[20%] p-2">
                <Text className="text-gray-700">{item.amount}</Text>
            </View>
            <View className="w-[30%] p-2">
                <Text className="text-gray-700"> {item.month}/{item.year}</Text>
            </View>
            <View className="w-[50%] p-2">
                <Text className="text-gray-700">{FormatDate(item.date_paid)}</Text>
            </View>
        </View>
    );
    return (
        <View className='flex-1 bg-gray-100 p-4'>
            <TableHeader />
            <FlatList
                data={payments}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <TableRow item={item} />}
            />
            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-blue-600 p-4 rounded-full shadow-lg"
                onPress={generatePDF}
            >
                <Ionicons name="download-outline" size={24} color="white" />
            </TouchableOpacity>
        </View>
    )
}

export default RentDetailscreen