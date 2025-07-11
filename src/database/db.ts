import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const db = SQLite.openDatabase({ name: 'housemanager.db', location: 'default' });

export const initDB = async () => {
  const database = await db;
  await database.transaction(tx => {
    // Create tables if they don't exist
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS houses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        house_number TEXT NOT NULL,
        location TEXT,
        rent_amount REAL,
        created_at TEXT DEFAULT (datetime('now'))
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        house_id INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(house_id) REFERENCES houses(id)
      );`
    );
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS sms (
          id TEXT PRIMARY KEY,
          message TEXT,
          phone TEXT,
          ref TEXT,
          timestamp INTEGER,
          synced INTEGER DEFAULT 0
      );
  `);
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS rent_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER,
        amount REAL,
        month TEXT,
        year INTEGER,
        date_paid TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(tenant_id) REFERENCES tenants(id)
      );`
    );

    // Add `category` to houses if not already added
    tx.executeSql(`PRAGMA table_info(houses);`, [], (_, result) => {
      const columns = result.rows.raw().map(col => col.name);
      if (!columns.includes('category')) {
        tx.executeSql(`ALTER TABLE houses ADD COLUMN category TEXT;`);
      }
    });

    // Add `national_id` to tenants if not already added
    tx.executeSql(`PRAGMA table_info(tenants);`, [], (_, result) => {
      const columns = result.rows.raw().map(col => col.name);
      if (!columns.includes('national_id')) {
        tx.executeSql(`ALTER TABLE tenants ADD COLUMN national_id TEXT;`);
      }
    });
  });
};


export default db;
