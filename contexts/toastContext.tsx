import React, {
    createContext,
    useContext,
    useState,
    useRef,
    ReactNode,
    useCallback,
    useEffect,
} from 'react';
import { Text, Animated, Dimensions, ViewStyle } from 'react-native';

type ToastType = 'default' | 'success' | 'error' | 'info';
type ToastPosition = 'top' | 'bottom';

type Toast = {
    message: string;
    duration: number;
    type: ToastType;
    position: ToastPosition;
};

type ToastContextType = {
    showToast: (
        message: string,
        options?: {
            duration?: number;
            type?: ToastType;
            position?: ToastPosition;
        }
    ) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [currentToast, setCurrentToast] = useState<Toast | null>(null);
    const [queue, setQueue] = useState<Toast[]>([]);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const showToast = useCallback(
        (message: string, options?: { duration?: number; type?: ToastType; position?: ToastPosition }) => {
            const toast: Toast = {
                message,
                duration: options?.duration ?? 3000,
                type: options?.type ?? 'default',
                position: options?.position ?? 'bottom',
            };
            setQueue((prev) => [...prev, toast]);
        },
        []
    );

    useEffect(() => {
        if (!currentToast && queue.length > 0) {
            const toast = queue[0];
            setQueue((prev) => prev.slice(1));
            setCurrentToast(toast);

            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => setCurrentToast(null));
                }, toast.duration);
            });
        }
    }, [queue, currentToast, fadeAnim]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {currentToast && <ToastComponent toast={currentToast} fadeAnim={fadeAnim} />}
        </ToastContext.Provider>
    );
};

const getToastStyle = (type: ToastType): ViewStyle => {
    const baseStyle: ViewStyle = {
        backgroundColor: '#333',
    };

    switch (type) {
        case 'success':
            return { ...baseStyle, backgroundColor: '#4CAF50' };
        case 'error':
            return { ...baseStyle, backgroundColor: '#F44336' };
        case 'info':
            return { ...baseStyle, backgroundColor: '#2196F3' };
        default:
            return baseStyle;
    }
};

const ToastComponent = ({
    toast,
    fadeAnim,
}: {
    toast: Toast;
    fadeAnim: Animated.Value;
}) => {
    const positionStyle: ViewStyle =
        toast.position === 'top'
            ? { top: 50 }
            : { bottom: 50 };

    return (
        <Animated.View
            style={{
                position: 'absolute',
                alignSelf: 'center',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
                zIndex: 1000,
                opacity: fadeAnim,
                maxWidth: Dimensions.get('window').width - 40,
                ...getToastStyle(toast.type),
                ...positionStyle,
            }}
        >
            <Text style={{ color: 'white', textAlign: 'center' }}>{toast.message}</Text>
        </Animated.View>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
