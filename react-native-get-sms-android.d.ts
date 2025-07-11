declare module 'react-native-get-sms-android' {
    interface SmsFilter {
      box?: 'inbox' | 'sent' | 'draft';
      address?: string;
      body?: string;
      read?: number;
      id?: number;
      indexFrom?: number;
      maxCount?: number;
    }
  
    const SmsAndroid: {
      list(
        filter: string,
        failureCallback: (error: string) => void,
        successCallback: (count: number, smsList: string) => void
      ): void;
    };
  
    export default SmsAndroid;
  }
  