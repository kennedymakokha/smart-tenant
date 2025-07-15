import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Alert, TouchableOpacity } from 'react-native';
import db from '../../database/db';
import { Picker } from '@react-native-picker/picker';
import { Button, Input, Section } from '../../components/ui/elements';
import uuid from 'react-native-uuid'; // Or any UUID library
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomModal from '../../components/ui/bottomModal';
import { useToast } from '../../../contexts/toastContext';
import { useFocusEffect } from '@react-navigation/native';
import { fetchTenants } from '../../database/tenants';
import { useSendsmsMutation } from '../../services/sms.service';

import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { insertSMSAsync, markSMSAsUnsynced } from '../../../utils/saveSms.local';
import { ActivityIndicator } from 'react-native';
import { maskID, maskPhone, SkeletonList, TableHeader, TableRow } from './components';
import CenterModal from '../../components/ui/centerModal';
const TenantScreen = ({ navigation }: any) => {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [show, setShow] = useState(false)
    const [id, setId] = useState('');
    const [houseId, setHouseId] = useState(null);
    const [houses, setHouses] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [tenant, setTenant] = useState<any>(null);
    const [addNewTenant, setAddNewTenant] = useState(false);
    const [sentMessage] = useSendsmsMutation()
    const [loading, setLoading] = useState(true)
    const fetchHouses = async () => {
        const database = await db;
        database.transaction(tx => {
            tx.executeSql('SELECT * FROM houses', [], (_, results: any) => {
                setHouses(results.rows.raw());
                if (results.rows.length > 0) {
                    setHouseId(results.rows.item(0).id);
                }
            });
        });
    };


    const loadTenants: any = async () => {
        const tenants: any = await fetchTenants();
        setTenants(tenants);
        setTimeout(() => {
            setLoading(false);
        }, 3000);
    };

    const unassignTenant = async (tenantId: any) => {
        const database = await db;
        database.transaction(tx => {
            tx.executeSql(
                'UPDATE tenants SET house_id = NULL WHERE id = ?',
                [tenantId],
                () => {
                    showToast('Tenant unassigned from house', { type: 'success' });
                    loadTenants();

                }
            );
        });
    };
    const exportPDF = async () => {

        if (!tenants || tenants.length === 0) {
            showToast('No tenant data to export.', { type: 'info' });
            return;
        }

        const rowsHtml = tenants
            .map(
                (tenant: any) => `
            <tr>
              <td>${tenant.name}</td>
              <td>${maskID(tenant.national_id || '')}</td>
              <td>${maskPhone(tenant.phone || '')}</td>
              <td>${tenant.house_number || '-'}</td>
            </tr>`
            )
            .join('');

        const html = `
          <html>
            <body>
              <h2>Tenant List</h2>
              <table border="1" style="width:100%; text-align:left; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Phone</th>
                    <th>House</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
            </body>
          </html>
        `;

        try {
            const pdf = await RNHTMLtoPDF.convert({
                html,
                fileName: 'tenant-list',
                directory: 'Documents',
            });

            await Share.open({ url: 'file://' + pdf.filePath, type: 'application/pdf' })
                .catch(() => {
                    showToast(`PDF saved to:\n${pdf.filePath}`, { type: "success", position: "top" });
                });

        } catch (error) {
            console.error("PDF Export Error:", error);
            showToast("Failed to export tenant PDF.", { type: 'error' });
        }
    };

    const assignTenant = async () => {
        if (!name || !houseId || !phone) {
            showToast('Enter all fields', { type: 'error', position: "top" });
            return;
        }

        const database = await db;

        database.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM tenants WHERE house_id = ?',
                [houseId],
                async (_, { rows }) => {
                    if (rows.length > 0) {
                        showToast('This house is already assigned to another tenant.', { type: 'error', position: 'top' });
                    } else {
                        tx.executeSql(
                            'INSERT INTO tenants (name, phone, house_id, national_id) VALUES (?, ?, ?, ?)',
                            [name, phone, houseId, id],
                            async () => {
                                const newTenant = { name, phone, house_id: houseId };
                                setName('');
                                setPhone('');
                                setId('');
                                setAddNewTenant(false);
                                loadTenants();

                                showToast(`Tenant added & assigned a room`, { type: 'success' });
                                setShow(false)
                                // Now that tenant is available, send SMS
                                await sendTenantWelcomeSMS(newTenant);
                            }
                        );
                    }
                }
            );
        });
    };

    const sendTenantWelcomeSMS = async (tenant: any) => {
        const timestamp = Date.now();
        const id = uuid.v4();
        const netState = await NetInfo.fetch();
        const synced = netState.isConnected ? 1 : 0;

        const message = `Hi ${tenant.name}, welcome to Siyenga Family. We delight in having you join this family.\nAt siyenga all the amenities are guaranteed for your comfort\n*Water\n*Electricity\n*Security `;

        const smsData = {
            id,
            message,
            phone: tenant.phone,
            ref: "info",
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
                        ref: "info",
                    }).unwrap();
                    showToast("Welcome message sent successfully");
                } catch (err) {
                    console.error("Failed to send SMS online", err);
                    await markSMSAsUnsynced(database, id);
                }
            }

        } catch (error) {
            console.error("Failed to save SMS locally:", error);
            showToast("Failed to save welcome message.");
        }
    };


    useFocusEffect(
        useCallback(() => {
            fetchHouses()
            loadTenants()

        }, [])
    );

    return (
        <View className='flex-1 bg-gray-100 p-4'>
            <Section title="Tenants"
                button={
                    <View className='flex flex-row gap-x-2'>
                        <TouchableOpacity onPress={() => setAddNewTenant(true)}
                            className='size-6 rounded-sm justify-center items-center border-slate-200  border  flex '>
                            <Icon name="add" size={20} color="#FF6701" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => exportPDF()} className='h-6 px-2   rounded-sm justify-center items-center border-slate-200  border  flex '>
                            <Icon name="picture-as-pdf" size={20} color="#FF6701" />
                        </TouchableOpacity>
                    </View>
                }
            >
                <View className="flex ">
                    <TableHeader />
                    {loading ? <SkeletonList /> : <FlatList
                        data={tenants.filter((x: any) => x.house_number !== null)}
                        keyExtractor={(item: any) => item.id.toString()}
                        renderItem={({ item }) => <TableRow data={houses} navigation={navigation} unassignTenant={() => { setTenant(item); setShow(true) }} item={item} />}
                        ListFooterComponent={loading ? <ActivityIndicator className="my-4 text-secondary" /> : null}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />}
                </View>

            </Section>
            <BottomModal
                visible={addNewTenant}
                loading={true}
                title="ADD New Tenant"
                body={
                    <>
                        <Input
                            placeholder="Tenant Name"
                            value={name}
                            onChangeText={setName}
                            style={{ borderWidth: 1, marginVertical: 10, padding: 5 }}
                        />
                        <Input
                            placeholder="Phone Number"
                            value={phone}
                            onChangeText={setPhone}
                            style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
                            keyboardType="phone-pad"
                        />
                        <Input
                            placeholder="ID Number"
                            value={id}
                            onChangeText={setId}
                            style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
                            keyboardType="phone-pad"
                        />
                        <Text>Select House:</Text>
                        <Picker
                            selectedValue={houseId}
                            onValueChange={(value) => setHouseId(value)}
                            style={{ height: 50, marginBottom: 10 }}
                        >
                            {houses.map((h: any) => (
                                <Picker.Item key={h.id} label={h.house_number} value={h.id} />
                            ))}
                        </Picker>
                        <Button title="Assign Tenant" onPress={assignTenant} />
                    </>
                }

                onCancel={() => {

                    setAddNewTenant(false);
                }}
            />
            <CenterModal
                visible={show}
                loading={true}
                onConfirm={() => unassignTenant(tenant?.id)}
                title="Revoke tenancy"
                body={
                    <View className='w-full h-40 flex items-center justify-center'>
                        <Text>Confirm  that {tenant?.name} is no longer a tenant </Text>
                    </View>
                }
                onCancel={() => {
                    setShow(false);
                    setTenant(null)
                }}
            />
        </View>
    );
};

export default TenantScreen;
