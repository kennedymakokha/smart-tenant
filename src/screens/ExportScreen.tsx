import React from 'react';
import { View, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import db from '../database/db';
import { Button } from '../components/ui/elements';

const ExportScreen = () => {
  const exportCSV = async () => {
    const database = await db;

    database.transaction(tx => {
      tx.executeSql(
        `SELECT tenants.name, houses.house_number, rent_payments.amount, rent_payments.month, rent_payments.year
         FROM rent_payments
         JOIN tenants ON rent_payments.tenant_id = tenants.id
         JOIN houses ON tenants.house_id = houses.id
         ORDER BY rent_payments.year DESC, rent_payments.month DESC`,
        [],
        async (_, results) => {
          const rows = results.rows.raw();
          const header = 'Tenant,House,Amount,Month,Year\n';
          const data = rows
            .map(r => `${r.name},${r.house_number},${r.amount},${r.month},${r.year}`)
            .join('\n');
          const csv = header + data;

          const path = `${RNFS.DocumentDirectoryPath}/rent-summary.csv`;
          await RNFS.writeFile(path, csv, 'utf8');

          Share.open({ url: 'file://' + path, type: 'text/csv' })
            .catch(() => Alert.alert('Exported', `CSV saved to:\n${path}`));
        }
      );
    });
  };

  const exportPDF = async () => {
    const database = await db;

    database.transaction(tx => {
      tx.executeSql(
        `SELECT tenants.name, houses.house_number, rent_payments.amount, rent_payments.month, rent_payments.year
         FROM rent_payments
         JOIN tenants ON rent_payments.tenant_id = tenants.id
         JOIN houses ON tenants.house_id = houses.id
         ORDER BY rent_payments.year DESC, rent_payments.month DESC`,
        [],
        async (_, results) => {
          const rows = results.rows.raw();
          const rowsHtml = rows
            .map(
              r => `
                <tr>
                  <td>${r.name}</td>
                  <td>${r.house_number}</td>
                  <td>${r.amount}</td>
                  <td>${r.month}</td>
                  <td>${r.year}</td>
                </tr>`
            )
            .join('');

          const html = `
            <html>
              <body>
                <h2>Rent Payment Summary</h2>
                <table border="1" style="width:100%; text-align:left;">
                  <tr>
                    <th>Tenant</th>
                    <th>House</th>
                    <th>Amount</th>
                    <th>Month</th>
                    <th>Year</th>
                  </tr>
                  ${rowsHtml}
                </table>
              </body>
            </html>
          `;

          const pdf = await RNHTMLtoPDF.convert({
            html,
            fileName: 'rent-summary',
            directory: 'Documents',
          });

          Share.open({ url: 'file://' + pdf.filePath, type: 'application/pdf' })
            .catch(() => Alert.alert('Exported', `PDF saved to:\n${pdf.filePath}`));
        }
      );
    });
  };

  return (
    <View className='flex-1 bg-gray-100 p-4'>
      <Button title="Export CSV" onPress={exportCSV} />
      <View style={{ height: 20 }} />
      <Button title="Export PDF" onPress={exportPDF} />
    </View>
  );
};

export default ExportScreen;
