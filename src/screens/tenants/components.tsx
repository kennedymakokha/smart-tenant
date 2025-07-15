import { TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { useToast } from "../../../contexts/toastContext";
import { Alert } from 'react-native';
export const TableHeader = () => (
    <View className="flex-row bg-gray-200 border-b border-gray-400">

        <View className="w-[30%] p-2">
            <Text className="font-bold text-gray-800">Name</Text>
        </View>
        <View className="w-[25%] p-2">
            <Text className="font-bold text-gray-800">ID</Text>
        </View>
        <View className="w-[25%] p-2">
            <Text className="font-bold text-gray-800">phone</Text>
        </View>
        <View className="w-[10%] p-2">
            <Text className="font-bold text-gray-800">House</Text>
        </View>
        <View className="w-[10%] p-2">
            <Text className="font-bold text-gray-800">action</Text>
        </View>

    </View>
);

export const TableRow = ({ item, navigation, data, unassignTenant }: any) => (
    <View className="flex-row border-b  border-gray-300 bg-white">
        <View className="w-[30%] p-2 border-r   border-gray-300  justify-center flex">
            <TouchableOpacity onPress={() => navigation.navigate('tenantDetail', { tenant: item, data: data })}
                className="flex">
                <Text className="text-gray-700">{item.name}</Text>
            </TouchableOpacity>
        </View>
        <View className="w-[25%] border-r   border-gray-300  justify-center flex p-2 ">
            <Text className="text-gray-700"> {item.national_id}</Text>
        </View>
        <View className="w-[25%]  border-r   border-gray-300 justify-center flex p-2 ">
            <Text className="text-gray-700"> {item.phone}</Text>
        </View>
        <View className="w-[10%]  justify-center border-r   border-gray-300 flex p-2 ">
            <Text className="text-gray-700"> {item.house_number}</Text>
        </View>
        <View className="w-[10%]  justify-center flex p-2  ">
            <TouchableOpacity onPress={() => unassignTenant(item.id)} className=" border rounded-sm   border-slate-300  items-center justify-center flex">
                <Icon name="cancel" size={20} color="gray" />
            </TouchableOpacity>
        </View>

    </View>
);
export const SkeletonRow = () => {
    return (
        <View className="flex-row bg-white border-b border-gray-300 animate-pulse">
            <View className="w-[30%] p-2">
                <View className="h-4 bg-gray-300 rounded w-3/4" />
            </View>
            <View className="w-[25%] p-2">
                <View className="h-4 bg-gray-300 rounded w-2/3" />
            </View>
            <View className="w-[25%] p-2">
                <View className="h-4 bg-gray-300 rounded w-2/3" />
            </View>
            <View className="w-[10%] p-2">
                <View className="h-4 bg-gray-300 rounded w-1/2" />
            </View>
            <View className="w-[10%] p-2">
                <View className="h-4 bg-gray-300 rounded w-full" />
            </View>
        </View>
    );
};

export const SkeletonList = () => (
    <FlatList
        data={Array.from({ length: 20 })}
        keyExtractor={(_, i) => i.toString()}
        renderItem={SkeletonRow}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 100 }}
    />
);
export const maskPhone = (phone: string) => {
    if (!phone) return '-';
    if (phone.length < 4) return '*'.repeat(phone.length);
    return phone.slice(0, 3) + '****' + phone.slice(-2);
};

export const maskID = (id: string) => {
    if (!id) return '-';
    if (id.length < 4) return '*'.repeat(id.length);
    return id.slice(0, 2) + '****' + id.slice(-3);
};


export const exportTenantsPDF = async ({ tenants }: any) => {
    const { showToast } = useToast();
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





export const exportPaymentPDF = async (payments: any) => {

    if (!payments || payments.length === 0) {
        Alert.alert('No tenant data to export.');
        return;
    }

    const rowsHtml = payments
        .map(
            (payment: any) => `
            <tr>
              <td>${payment.amount || payment.rent_amount}</td>
              <td>${payment.month ? payment.month : new Date().toLocaleString('default', { month: 'long' })}</td>
              <td>${payment.date_paid ? payment.date_paid : "not paid"}</td>
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
                    <th>Amount</th>
                    <th>Period</th>
                    <th>Date Paid</th>
                   
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
                // showToast(`PDF saved to:\n${pdf.filePath}`, { type: "success", position: "top" });
            });

    } catch (error) {
        console.error("PDF Export Error:", error);
        // showToast("Failed to export tenant PDF.", { type: 'error' });
    }
};
