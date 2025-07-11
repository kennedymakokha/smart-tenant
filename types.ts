
export type RootStackParamList = {
    Landing: undefined,
    Login: undefined,
    Dashboard: undefined,
    Signup: undefined
    Savings: undefined;
    SavingsDetail: {
        title: string;
        amount: number;
        target: number;
    };
}

export interface SMSItem {
    id: string;
    message: string;
    phone: string;
    ref: string;
    timestamp: number;
    synced: number;
}

export interface TENANTItem {
    id?: string,
    name: string,
    phone: string,
    house_id: string,
}
