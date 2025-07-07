import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const db = SQLite.openDatabase({ name: 'housemanager.db', location: 'default' });

export const initDB = async () => {
  const database = await db;
  await database.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS houses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        house_number TEXT NOT NULL,
        location TEXT,
        rent_amount REAL
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        house_id INTEGER,
        FOREIGN KEY(house_id) REFERENCES houses(id)
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS rent_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER,
        amount REAL,
        month TEXT,
        year INTEGER,
        date_paid TEXT,
        FOREIGN KEY(tenant_id) REFERENCES tenants(id)
      );`
    );
  });
};

export default db;
