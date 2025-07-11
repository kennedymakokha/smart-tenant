import db from "../src/database/db";
import NetInfo from '@react-native-community/netinfo';

import uuid from 'react-native-uuid'; // Or any UUID library
import { getUnsyncedMessages, markMessageAsSynced } from "../src/database/sms";
import { executeSqlAsync } from "./sqliteHelpers";
import { SMSItem } from "../types";


export const saveToSQLite = async (smsArray: any[]) => {
    if (!smsArray || smsArray.length === 0) return;
    const database = await db;

    return new Promise<void>((resolve, reject) => {
        database.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS sms (
      id TEXT PRIMARY KEY,
      message TEXT,
      phone TEXT,
      ref TEXT,
      timestamp INTEGER
     synced INTEGER
    )`
            );

            for (const sms of smsArray) {
                const id = sms._id || uuid.v4();
                tx.executeSql(
                    `INSERT OR REPLACE INTO sms (id, message, phone, ref, timestamp,synced)
       VALUES (?, ?, ?, ?, ?, ?)`,
                    [id, sms.message, sms.phone, sms.ref, sms.timestamp, 1]
                );
            }
        },
            error => {
                console.error("Error saving to SQLite:", error);
                reject(error);
            },
            () => {
                console.log("Data saved to SQLite");
                resolve();
            });
    });
}
export const syncUnsyncedMessages = async () => {
    const unsynced: any = await getUnsyncedMessages();

    for (const msg of unsynced) {
        try {
            // await sendSMSAPI(msg);
            await markMessageAsSynced(msg.id);
        } catch (e) {
            console.log("Failed to sync message", msg.id);
        }
    }
};
// Insert an SMS message
export const insertSMSAsync = (db: any, sms: SMSItem) => {
    const sql = `
      INSERT INTO sms (id, message, phone, ref, timestamp, synced)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params: SMSItem | any = [
        sms.id,
        sms.message,
        sms.phone,
        sms.ref,
        sms.timestamp,
        sms.synced
    ];
    return executeSqlAsync(db, sql, params);
};

// Update SMS sync status
export const markSMSAsUnsynced = (db: any, id: string | any) => {
    const sql = `UPDATE sms SET synced = 0 WHERE id = ?`;
    return executeSqlAsync(db, sql, [id]);
};

// Select all SMS
export const getAllSMSAsync = (db: any) => {
    const sql = `SELECT * FROM sms ORDER BY timestamp DESC`;
    return executeSqlAsync(db, sql);
};


