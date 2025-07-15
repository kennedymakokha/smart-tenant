import db from './db';

export const insertSMS = async (smsArray: any) => {
    const database = await db;
    const insertQuery = `
        INSERT OR REPLACE INTO sms (id, message, phone, ref, timestamp)
        VALUES (?, ?, ?, ?, ?)
    `;
    database.transaction(
        tx => {
            for (const sms of smsArray) {
                tx.executeSql(insertQuery, [
                    sms.id,
                    sms.message,
                    sms.phone,
                    sms.ref,
                    sms.timestamp
                ]);
            }
        }
    );

};

export const getAllSMS = async () => {
    const database = await db;
    return new Promise((resolve, reject) => {
        database.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM sms ORDER BY timestamp DESC',
                [],
                (_:any, results:any) => {
                    const rows = results.rows;
                    const data = [];
                    for (let i = 0; i < rows.length; i++) {
                        data.push(rows.item(i));
                    }
                    resolve(data);
                },
                (_, error) => {
                    reject(error);
                    return false;
                }
            );
        });
    });
};


export const getUnsyncedMessages = async () => {
    const database = await db;
    return new Promise((resolve, reject) => {
        database.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM sms WHERE synced = 0',
                [],
                (_:any, result:any) => {
                    const items = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        items.push(result.rows.item(i));
                    }
                    resolve(items);
                },
                (_, error) => {
                    reject(error);
                    return false;
                }
            );
        });
    });
};

export const markMessageAsSynced = async (id: string) => {
    const database = await db;
    return new Promise((resolve, reject) => {
        database.transaction(tx => {
            tx.executeSql(
                `UPDATE sms SET synced = 1 WHERE id = ?`,
                [id],
                () => resolve(true),
                (_, error) => {
                    reject(error);
                    return false;
                }
            );
        });
    });
};
