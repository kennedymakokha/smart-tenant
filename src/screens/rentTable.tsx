import { Text, View } from "react-native"
import { FormatDate } from "../../utils/dateFormarter";
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';


export const generateRentPDF = async (payments: never[], id: string, name?: string) => {
    let htmlContent = `
        <h1>Rent Payment History</h1>
        <table border="1" style="width:100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="padding: 8px; background-color: #f0f0f0;">Amount</th>
                    <th style="padding: 8px; background-color: #f0f0f0;">Period</th>
                    <th style="padding: 8px; background-color: #f0f0f0;">Paid On</th>
                </tr>
            </thead>
            <tbody>
                ${payments
            .map(
                (p: any) => `
                    <tr>
                        <td style="padding: 8px;">KES ${p.amount}</td>
                        <td style="padding: 8px;">${p.month}/${p.year}</td>
                        <td style="padding: 8px;">${FormatDate(p.date_paid)}</td>
                    </tr>
                `
            )
            .join('')}
            </tbody>
        </table>
    `;

    try {
        const pdf = await RNHTMLtoPDF.convert({
            html: htmlContent,
            fileName: `${name}_rent_payments`,
            directory: 'Documents',
        });

        const filePath = pdf.filePath;

        if (filePath && (await RNFS.exists(filePath))) {
            const options = {
                url: `file://${filePath}`,
                type: 'application/pdf',
                failOnCancel: false,
            };

            await Share.open(options);
        } else {
            console.warn('PDF file not found at path:', filePath);
        }
    } catch (error) {
        console.error('PDF generation or sharing failed:', error);
    }
};
export const RentTableHeader = () => (
    <View className="flex-row bg-gray-200 border-b border-gray-400">


        <View className="w-[20%] p-2">
            <Text className="font-bold text-gray-800">Amount</Text>
        </View>
        <View className="w-[30%] p-2">
            <Text className="font-bold text-gray-800">Period</Text>
        </View>
        <View className="w-[50%] p-2">
            <Text className="font-bold text-gray-800">Paid On</Text>
        </View>
    </View>
);

export const RentTableRow = ({ item }: any) => (
    <View className="flex-row border-b border-gray-300 bg-white">

        <View className="w-[20%] p-2">
            <Text className="text-gray-700">{item.amount}</Text>
        </View>
        <View className="w-[30%] p-2">
            <Text className="text-gray-700"> {item.month}/{item.year}</Text>
        </View>
        <View className="w-[50%] p-2">
            <Text className="text-gray-700">{FormatDate(item.date_paid)}</Text>
        </View>
    </View>
);