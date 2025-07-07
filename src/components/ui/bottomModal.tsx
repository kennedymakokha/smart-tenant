import { View, Text, Modal } from 'react-native'
import React from 'react'
import { TouchableWithoutFeedback } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import { Platform } from 'react-native';
import { Button } from './elements';

type Props = {
    visible: boolean;
    buttonTitle?: string | any
    title?: string | any;
    body: any,
    loading?: boolean
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel: () => void;
};

const BottomModal: React.FC<Props> = ({
    visible,
    title,
    loading,
    buttonTitle,
    body,
    onConfirm,
    onCancel,
}) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onCancel}
        >
            <TouchableWithoutFeedback onPress={onCancel}>
                <View className="flex-1 justify-end bg-black/30">
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            className="bg-white p-4 rounded-t-2xl"
                        >
                            <Text className="text-lg font-bold mb-2">{title}</Text>
                            {body}
                            {onConfirm && <Button loading={loading} title={buttonTitle ? buttonTitle : title} action={onConfirm} />}
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>

    )
}

export default BottomModal