import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useCallback, useState } from 'react'
import db from '../database/db';
import { useFocusEffect } from '@react-navigation/native';
import { FormatDate } from '../../utils/dateFormarter';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { generateRentPDF, RentTableHeader, RentTableRow } from './rentTable';
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




    return (
        <View className='flex-1 bg-gray-100 p-4'>
            <RentTableHeader />
            <FlatList
                data={payments}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <RentTableRow item={item} />}
            />
            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-blue-600 p-4 rounded-full shadow-lg"
                onPress={() => generateRentPDF(payments, id,)}
            >
                <Ionicons name="download-outline" size={24} color="white" />
            </TouchableOpacity>
        </View>
    )
}

export default RentDetailscreen