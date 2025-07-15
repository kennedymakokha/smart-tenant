import React, { useCallback, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import db from '../../database/db';
import { Section } from '../../components/ui/elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useToast } from '../../../contexts/toastContext';
import { useFocusEffect } from '@react-navigation/native';
import { useSendsmsMutation } from '../../services/sms.service';
import NetInfo from '@react-native-community/netinfo';
import { insertSMSAsync, markSMSAsUnsynced } from '../../../utils/saveSms.local';
import uuid from 'react-native-uuid'; // Or any UUID library
import SmsModal from './senSmsModal';
import { SkeletonList, TableHeader, TableRow } from './components';
const SMSDetailsSMSScreen = ({ route }: any) => {
  
    const [sentMessage] = useSendsmsMutation()
    const [loading, setloading] = useState(true);
    const [newMessage, setnewMessage] = useState(false);

    const [body, setBody] = useState<any>({
        phone: route.params.phone,
        reciever: "",
        ref: "info",
        application: "smarttenant",
        message: ""
    })
    const { showToast } = useToast()




    useFocusEffect(
        useCallback(() => {
            setTimeout(() => {
                setloading(false);
            }, 500);
        }, [])
    );


    const handleSendSMS = async () => {
        const timestamp = Date.now();
        const id = uuid.v4();
        const netState = await NetInfo.fetch();
        const synced = netState.isConnected ? 1 : 0;
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
                    data={route.params.data.filter((x: any) => x.phone === route.params.phone)}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={({ item }) => <TableRow item={item} />}
                    ListFooterComponent={loading ? <ActivityIndicator className="my-4 text-secondary" /> : null}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />}
            </Section>
            <SmsModal body={body} setBody={setBody}  submit={handleSendSMS} visible={newMessage} close={() => setnewMessage(!newMessage)} />
        </View>
    );
};

export default SMSDetailsSMSScreen;
