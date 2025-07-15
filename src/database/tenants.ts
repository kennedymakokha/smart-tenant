import db from "./db";

export const fetchTenants = async (setloading?: any): Promise<any[]> => {
    const database = await db;
    return new Promise((resolve, reject) => {
        database.transaction(tx => {
            tx.executeSql(
                `SELECT tenants.*, houses.house_number 
           FROM tenants
           LEFT JOIN houses ON tenants.house_id = houses.id`,
                [],
                (_:any, results:any) => {
                    const data = results.rows.raw(); // Get all rows as array
                    resolve(data);
                    setloading(false)
                },
                (_, error) => {
                    console.error("Failed to fetch tenants:", error);
                    reject(error);
                    setloading(false)
                    return true;
                }
            );
        });
    });
};
