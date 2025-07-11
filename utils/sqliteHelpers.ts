// utils/sqliteHelpers.ts

export const executeSqlAsync = (db: any, sql: any, params = []) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
            tx.executeSql(
                sql,
                params,
                (_: any, result: any) => resolve(result),
                (_: any, error: any) => reject(error)
            );
        });
    });
};
