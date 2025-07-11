import SmsAndroid from "react-native-get-sms-android";
import { requestSmsPermission } from "./SmsPermisions";

export async function readMessages() {
    const hasPermission = await requestSmsPermission();
    if (!hasPermission) {
        console.warn('Permission not granted');
        return;
    }

    const filter = {
        box: 'inbox', // 'inbox' or 'sent' or 'draft'
        maxCount: 3,
    };

    SmsAndroid.list(
        JSON.stringify(filter),
        fail => {
            console.log('Failed with error: ' + fail);
        },
        (count, smsList) => {
            const messages = JSON.parse(smsList);
            return messages
            console.log('SMS Messages:', messages);
        }
    );
}