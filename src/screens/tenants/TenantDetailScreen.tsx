import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons'
import db from '../../database/db';
import { useFocusEffect } from '@react-navigation/native';
import { generateRentPDF, RentTableHeader, RentTableRow } from './../rentTable';
import { Section } from '../../components/ui/elements';
import { useToast } from '../../../contexts/toastContext';
import { exportPaymentPDF } from './components';

const TenantDetailScreen = ({ route }: any) => {
    const { tenant, data } = route.params;
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(tenant.name);
    const [nationalId, setNationalId] = useState(tenant.national_id);
    const [houseNumber, setHouseNumber] = useState(tenant.house_number);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true)
    const { showToast } = useToast();
    const handleSave = () => {
        // Save logic
        console.log('Saved tenant:', { name, nationalId, houseNumber });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setName(tenant.name);
        setNationalId(tenant.national_id);
        setHouseNumber(tenant.house_number);
        setIsEditing(false);
    };
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
                    setLoading(false); // Move here
                },
                (txObj, error) => {
                    console.error("Error fetching tenant payments:", error);
                    showToast("Failed to load payments.", { type: "error" });
                    setLoading(false);
                    return true;
                }
            );
        });
    };

    useFocusEffect(
        useCallback(() => {
            fetchPayments(tenant.id);
        }, [])
    );


    const Item = ({ title, onchange, color, icon, value, keyboardType }: any) => {
        return (
            <View className="flex-row items-center gap-x-2 mb-2 space-x-4">
                <View className="border-green-100 p-2 rounded-md">
                    <Icon name={icon} size={22} color={color ? color : "#16A34A"} />
                </View>
                <View className="flex-1">
                    <Text className="text-sm text-gray-500">{title}</Text>
                    {isEditing ? (
                        <TextInput
                            value={value}
                            onChangeText={onchange}
                            keyboardType={keyboardType}
                            className="border-b border-gray-300 text-base text-gray-800 pb-1"
                        />
                    ) : (
                        <Text className="text-lg font-medium text-gray-800">{value}</Text>
                    )}
                </View>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-gray-100">
            {/* Main Content */}
            <ScrollView className="flex-1 px-4 py-6">
                <View className="bg-white rounded-2xl shadow-md p-5 space-y-6">
                    {/* Floating Edit/Save/Cancel Buttons */}
                    <View className="absolute top-6 right-6 z-10 flex-row space-x-2">
                        {isEditing ? (
                            <>
                                <TouchableOpacity
                                    onPress={handleCancel}
                                    className="bg-gray-300 px-4 py-2 rounded-full shadow"
                                >
                                    <Text className="text-gray-800 font-medium">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSave}
                                    className="bg-blue-600 px-4 py-2 rounded-full shadow"
                                >
                                    <Text className="text-white font-medium">Save</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                onPress={() => setIsEditing(true)}
                                className="bg-green-600 p-3 rounded-full shadow"
                            >
                                <Icon name="edit" size={20} color="#FFF" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Item
                        title="Full Name"
                        onchange={setName}
                        value={name}
                        icon="person"
                        keyboardType="default"
                        color="#2563EB"
                    />

                    <Item
                        title="National ID"
                        onchange={setNationalId}
                        value={nationalId}
                        icon="badge"
                        keyboardType="numeric"
                    />

                    {/* House Number Field */}
                    <View className="flex-row items-center space-x-4">
                        <View className="border-green-100 border p-2 rounded-full">
                            <Icon name="home" size={22} color="#CA8A04" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm text-gray-500">House Number</Text>
                            {isEditing ? (
                                <Picker
                                    selectedValue={houseNumber}
                                    onValueChange={(value) => setHouseNumber(value)}
                                    style={{ height: 50, marginBottom: 10 }}
                                >
                                    {data.map((h: any) => (
                                        <Picker.Item key={h.id} label={h.house_number} value={h.id} />
                                    ))}
                                </Picker>
                            ) : (
                                <Text className="text-lg font-medium text-gray-800">{houseNumber}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Payment Section */}
                <Section title="Payment history"
                    button={
                        <View className='flex flex-row gap-x-2'>
                            <TouchableOpacity onPress={() => exportPaymentPDF(payments)} className='h-6 px-2   rounded-sm justify-center items-center border-slate-200  border  flex '>
                                <Icon name="picture-as-pdf" size={20} color="#FF6701" />
                            </TouchableOpacity>
                        </View>
                    }
                >
                    <RentTableHeader />
                    <FlatList
                        data={payments}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => <RentTableRow item={item} />}
                        ListFooterComponent={loading ? <ActivityIndicator className="my-4 text-secondary" /> : null}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                </Section>
            </ScrollView>

            {/* Floating Share Button - Bottom of screen */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-blue-600 p-4 rounded-full shadow-lg"
                onPress={() => generateRentPDF(payments, tenant.id, tenant.name)}
            >
                <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
        </View>

    );
};

export default TenantDetailScreen;
