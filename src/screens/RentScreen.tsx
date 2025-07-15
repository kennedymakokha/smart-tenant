import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import db from '../database/db';
import { useToast } from '../../contexts/toastContext';
import Icon from 'react-native-vector-icons/FontAwesome'
import { useFocusEffect } from '@react-navigation/native';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import uuid from 'react-native-uuid'; // Or any UUID library
import NetInfo from '@react-native-community/netinfo';
import { insertSMSAsync, markSMSAsUnsynced } from '../../utils/saveSms.local';
import { useSendsmsMutation } from '../services/sms.service';
import { pick } from '@react-native-documents/picker'
import { Button, Section } from '../components/ui/elements';
import { matchFound } from '../../utils/Matchpdf';
import AnimatedPercentageLoader from '../components/PercentageLoader';
import { exportPaymentPDF } from './tenants/components';
import CenterModal from '../components/ui/centerModal';


export default function RentScreen({ navigation }: any) {
    const [tenant, setTenant] = useState<any>(null);
    const [show, setShow] = useState(false);
    const [tenants, setTenants] = useState([]);
    const [sentMessage] = useSendsmsMutation()
    const [tenantId, setTenantId] = useState(null);
    const [payments, setPayments] = useState([]);
    ;
    const [fileName, setFileName] = useState('');
    const [month, setMonth] = useState('');
    const { showToast } = useToast()
    const [matchCount, setMatchCount] = useState(0);
    const [percentage, setPercentage] = useState<number>(0);
    useFocusEffect(
        useCallback(() => {
            fetchTenants();
            fetchPayments();

        }, [])
    );

    const fetchTenants = async () => {
        const today = new Date();
        const month = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();
        setMonth(month)
        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                `SELECT tenants.id, tenants.name, tenants.phone, houses.house_number, houses.rent_amount
                 FROM tenants
                 LEFT JOIN houses ON tenants.house_id = houses.id
                 WHERE tenants.id NOT IN (
                     SELECT tenant_id FROM rent_payments WHERE month = ? AND year = ?
                 ) AND houses.house_number IS NOT NULL`,
                [month, year],
                (_: any, results: any) => {
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

    const confirmPayment = async (tenantId: any) => {

        const today = new Date();
        const day = today.getDate();

        if (day < 1 || day > 29) {
            showToast(`Rent can only be paid between 1st and 8th`, { type: 'error', position: "top" });
            return;
        }

        const month = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();
        const date = today.toISOString();

        const database = await db;

        database.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM tenants 
                 LEFT JOIN houses ON tenants.house_id = houses.id 
                 WHERE tenants.id = ?`,
                [tenantId],
                async (_, { rows }) => {
                    if (rows.length === 0) {
                        showToast("Tenant not found", { type: "error", position: "top" });
                        return;
                    }
                    const tenant = rows.item(0);
                    const phone = tenant.phone || tenant.phone_number;
                    if (!phone) {
                        showToast("Tenant phone number not available", { type: "error", position: "top" });
                        return;
                    }

                    const amount = tenant.rent_amount;

                    tx.executeSql(
                        `SELECT * FROM rent_payments 
                         WHERE tenant_id = ? AND month = ? AND year = ?`,
                        [tenantId, month, year],
                        (_, { rows: existing }) => {
                            if (existing.length > 0) {
                                showToast(`Already paid for ${month} by ${tenant.name}`, { type: 'info', position: "bottom" });
                            } else {
                                tx.executeSql(
                                    `INSERT INTO rent_payments (tenant_id, amount, month, year, date_paid) 
                                     VALUES (?, ?, ?, ?, ?)`,
                                    [tenantId, amount, month, year, date],
                                    async () => {
                                        showToast(`Payment recorded for ${tenant.name}`, { type: 'success' });
                                        fetchPayments();
                                        fetchTenants();
                                        setShow(false)
                                        // Send SMS confirmation after payment
                                        await sendPaymentConfirmationSMS({
                                            name: tenant.name,
                                            phone: phone,
                                            rent_amount: tenant.rent_amount
                                        });
                                    }
                                );
                            }
                        }
                    );
                }
            );
        });
    };

    const sendPaymentConfirmationSMS = async (tenant: any) => {
        const timestamp = Date.now();
        const id = uuid.v4();
        const netState = await NetInfo.fetch();
        const synced = netState.isConnected ? 1 : 0;

        const message = `Hi ${tenant.name}, we have received KSH ${tenant.rent_amount}/- rent payment for the month of ${month}. Thank you for staying with Siyenga Family.`;

        const smsData = {
            id,
            message,
            phone: tenant.phone,
            ref: "payment",
            timestamp,
            synced
        };

        try {
            const database = await db;
            await insertSMSAsync(database, smsData);

            if (synced === 1) {
                try {
                    await sentMessage({
                        message,
                        phone: tenant.phone,
                        ref: "payment",
                    }).unwrap();
                    showToast("Payment confirmation SMS sent");
                } catch (err) {
                    console.error("Failed to send SMS online", err);
                    await markSMSAsUnsynced(database, id);
                }
            }

        } catch (error) {
            console.error("Failed to save SMS locally:", error);
            showToast("Failed to save confirmation SMS.");
        }
    };


    const TableHeader = () => (
        <View className="flex-row bg-gray-200 border-b border-gray-400">


            <View className="w-[40%] p-2 border-l border-t border-r -border-b  border-gray-400">
                <Text className="font-bold text-gray-800">Tenant</Text>
            </View>
            <View className="w-[30%] p-2  border-r border-t    border-gray-400">
                <Text className="font-bold text-gray-800">amount</Text>
            </View>
            <View className="w-[30%] p-2 border-t border-gray-400 border-r ">
                <Text className="font-bold text-gray-800">Acknowledge</Text>
            </View>
        </View>
    );

    const pickDocument = async () => {
        try {
            if (tenants.length === 0) {
                showToast("Tenant list is empty. Try again later.", { type: "error" });
                return;
            }

            const [res] = await pick();
            setFileName(res.name);

            const formData = new FormData();
            formData.append('pdf', {
                uri: res.uri,
                name: res.name,
                type: 'application/pdf',
            });
            const response = await fetch('https://form-builder.mtandao.app/api/pdf', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            const data = await response.json();
            let matchCounter = 0;
            let runningPercentage = 0;

            tenants.forEach((tenant) => {
                const result = matchFound(data.transactions, tenant);
                if (result) {
                    confirmPayment(tenant.id)

                }
                matchCounter += 1;
                runningPercentage += (1 / tenants.length) * 100;

            });
            // console.log(runningPercentage)
            setMatchCount(matchCounter);
            setPercentage(Math.round(Math.min(runningPercentage, 100)));

        } catch (err) {
            console.error('Error uploading or processing PDF:', err);
            showToast('Failed to process PDF', { type: 'error' });
        }
    };



    // console.log(pac)
    const TableRow = ({ item }: any) => (
        <View className="flex-row border-b  border-gray-300 bg-white">
            <View className="w-[40%] p-2   border-r   border-gray-300 justify-center flex">
                <TouchableOpacity onPress={() => navigation.navigate('rentDetail', { rent: item })} className="flex">
                    <Text className="text-gray-700">{item.name}</Text>
                </TouchableOpacity>
            </View>
            <View className="w-[30%] border-r   border-gray-300 justify-center flex  p-2">
                <Text className="text-gray-700"> {item.rent_amount.toFixed(2)}</Text>
            </View>
            <View className="w-[30%] p-2 flex-row justify-between  border-r   border-gray-300 gap-x-2">
                <TouchableOpacity onPress={() => navigation.navigate('rentDetail', { rent: item })} className=" border rounded-sm  px-2 border-slate-300  items-center justify-center flex">
                    <Icon name="eye" size={20} color="gray" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setTenant(item); setShow(true) }} className=" border rounded-sm  px-2 border-slate-300  items-center justify-center flex">
                    <Icon name="check" size={20} color="gray" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-500 p-4">
            <Section title={`Pending payment for ${month} `}
                button={
                    <View className='flex flex-row gap-x-2'>
                        <TouchableOpacity onPress={pickDocument} className='size-6 rounded-sm justify-center items-center border-slate-200  border  flex '>
                            <Icon name="upload" size={20} color="#FF6701" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => exportPaymentPDF(tenants)} className='h-6 px-2   rounded-sm justify-center items-center border-slate-200  border  flex '>
                            <MIcon name="picture-as-pdf" size={20} color="#FF6701" />
                        </TouchableOpacity>
                    </View>

                }
            >
                <TableHeader />
                <FlatList
                    data={tenants.filter((x: any) => x.house_number !== null)}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={({ item }) => <TableRow item={item} />}
                />
                {percentage > 0 && <AnimatedPercentageLoader percentage={percentage} />}
            </Section>
            <CenterModal
                visible={show}
                loading={true}
                onConfirm={() => confirmPayment(tenant?.id)}
                title="Acknowldge payment"
                body={
                    <View className='w-full h-40 flex items-center justify-center'>
                        <Text>Confirm  that you have recieved {tenant?.rent_amount} from {tenant?.name} </Text>
                    </View>
                }
                onCancel={() => {
                    setShow(false);
                    setTenant(null)
                }}
            />
        </View>
    );
}
