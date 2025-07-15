import React from 'react';
import { View, Alert } from 'react-native';
import RNFS from 'react-native-fs';


const filePath = `${RNFS.DocumentDirectoryPath}/house-management-backup.json`;

import db from "../src/database/db";

export const backupData = async () => {
    const database = await db;
    const getTable = (table: any) =>
        new Promise((resolve, reject) => {
            database.transaction(tx => {
                tx.executeSql(`SELECT * FROM ${table}`, [], (_:any, results:any) => {
                    resolve(results.rows.raw());
                }, (_, error) => reject(error));
            });
        });

    const houses = await getTable('houses');
    const tenants = await getTable('tenants');
    const payments = await getTable('rent_payments');

    const backup = { houses, tenants, payments };
    await RNFS.writeFile(filePath, JSON.stringify(backup), 'utf8');

    // Alert.alert('Backup Complete', `File saved to:\n${filePath}`);
};

export const restoreData = async () => {
    if (!(await RNFS.exists(filePath))) {
        Alert.alert(' Backup File Not Found', 'No backup file exists.');
        return;
    }

    const json = await RNFS.readFile(filePath, 'utf8');
    const { houses, tenants, payments } = JSON.parse(json);
    const database = await db;

    database.transaction(tx => {
        tx.executeSql('DELETE FROM houses');
        tx.executeSql('DELETE FROM tenants');
        tx.executeSql('DELETE FROM rent_payments');

        houses.forEach((h: any) => {
            tx.executeSql(
                'INSERT INTO houses (id, house_number, location, rent_amount) VALUES (?, ?, ?, ?)',
                [h.id, h.house_number, h.location, h.rent_amount]
            );
        });

        tenants.forEach((t: any) => {
            tx.executeSql(
                'INSERT INTO tenants (id, name, phone, house_id) VALUES (?, ?, ?, ?)',
                [t.id, t.name, t.phone, t.house_id]
            );
        });

        payments.forEach((p: any) => {
            tx.executeSql(
                'INSERT INTO rent_payments (id, tenant_id, amount, month, year, date_paid) VALUES (?, ?, ?, ?, ?, ?)',
                [p.id, p.tenant_id, p.amount, p.month, p.year, p.date_paid]
            );
        });
    });

    // Alert.alert(' Restore Complete', 'Database has been restored from backup.');
};