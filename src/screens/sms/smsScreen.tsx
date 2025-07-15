import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import db, { initDB } from '../../database/db';
import { Button, Input, Section } from '../../components/ui/elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomModal from '../../components/ui/bottomModal';
import { useToast } from '../../../contexts/toastContext';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { useGetsmsQuery, useSendsmsMutation } from '../../services/sms.service';
import { getDurationFromNow } from '../../../utils/dateFormarter';
import NetInfo from '@react-native-community/netinfo';
import { getAllSMS } from '../../database/sms';
import { insertSMSAsync, markSMSAsUnsynced, saveToSQLite, syncUnsyncedMessages } from '../../../utils/saveSms.local';
import { fetchTenants } from '../../database/tenants';
import { Image } from 'react-native';
import Loader from '../../components/loader';
import uuid from 'react-native-uuid'; // Or any UUID library

import SmsModal from './senSmsModal';
import { SMSItem } from '../../../types';
import { SkeletonList, TableHeader, TableRow } from './components';
const SMSScreen = ({ navigation }: any) => {
    const { data, refetch } = useGetsmsQuery({})
    const [sentMessage] = useSendsmsMutation()
    const [loading, setloading] = useState(true);
    const [newMessage, setnewMessage] = useState(false);
    const [localSMS, setLocalSMS] = useState<SMSItem[]>([]);
    const [tenants, setTenats] = useState([]);
    const [body, setBody] = useState<any>({
        phone: "",
        reciever: "",
        ref: "info",
        application: "smarttenant",
        message: ""
    })
    const { showToast } = useToast()


    const fetchData = async () => {
        setloading(true);
        const database = await db;
        const tenantsList: any = await fetchTenants();
        setTenats(tenantsList);
        const netState = await NetInfo.fetch();
        const isConnected = netState.isConnected;

        if (isConnected) {
            try {
                for (let sms of localSMS) {
                    if (sms.synced === 0) {
                        await sentMessage({
                            phone: sms.phone,
                            reciever: "",
                            ref: "info",
                            application: "smarttenant",
                            message: sms.message,
                            timestamp: sms.timestamp
                        }).unwrap()

                    }
                }
                await syncUnsyncedMessages()
                const res = await refetch();
                if (res?.data?.sms) {
                    await saveToSQLite(res.data.sms);
                }

            } catch (error) {
                console.error('API fetch failed:', error);
                showToast('Failed to sync data from server.');
            }
        }

        const localData: any = await getAllSMS();
        const sortedData = localData.sort((a: any, b: any) => b.timestamp - a.timestamp);
        setLocalSMS(sortedData);

        setTimeout(() => {
            setloading(false);
        }, 1000);
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );


    const handleSendSMS = async () => {
        const timestamp = Date.now();
        const id = uuid.v4();
        const netState = await NetInfo.fetch();
        const synced = netState.isConnected ? 1 : 0;
        if (!body.phone || !body.message) {
            showToast("Kindly check to have selected a  reciepient and have a message", { type: "error", position: "top" });
        }
        const smsData = {
            id,
            message: body.message,
            phone: body.phone,
            ref: body.ref,
            timestamp,
            synced
        };

        try {
            const database = await db;
            await insertSMSAsync(database, smsData);
            setLocalSMS(prev => [smsData, ...prev]);
            if (synced === 1) {
                try {
                    await sentMessage(body).unwrap();
                    showToast("Message sent successfully");
                } catch (err) {
                    console.error("API error, marking as unsynced");
                    await markSMSAsUnsynced(database, id);
                }
            }
            setBody({
                phone: "",
                reciever: "",
                ref: "info",
                application: "smarttenant",
                message: ""
            })
            await fetchData();
            setnewMessage(false);
        } catch (error) {
            console.error("Failed to handle SMS:", error);
            showToast("Failed to save message locally.");
        }
    };

    return (
        <View className='flex-1 bg-gray-100 p-4'>
            <Section title="sms"
                button={
                    <TouchableOpacity onPress={() => setnewMessage(true)} className='size-6 rounded-sm justify-center items-center border-slate-200  border  flex '>
                        <Icon name="add" className="text-red-500" size={20} color="red" />
                    </TouchableOpacity>
                }
            >
                <TableHeader />
                {loading ? <SkeletonList /> : <FlatList
                    data={localSMS}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={({ item }) => <TableRow navigation={navigation} data={localSMS} item={item} />}
                    ListFooterComponent={loading ? <ActivityIndicator className="my-4 text-secondary" /> : null}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />}
            </Section>
            <SmsModal setBody={setBody} body={body} tenants={tenants} submit={handleSendSMS} visible={newMessage} close={() => setnewMessage(!newMessage)} />
        </View>
    );
};

export default SMSScreen;
