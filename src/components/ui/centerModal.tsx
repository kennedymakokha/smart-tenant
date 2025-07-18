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
    onConfirm: () => void;
    onCancel: () => void;
};

const CenterModal: React.FC<Props> = ({
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
            animationType="fade"
            transparent
            onRequestClose={onCancel}
        >
            <TouchableWithoutFeedback onPress={onCancel}>
                <View className="flex-1 justify-center items-center bg-black/30 px-4">
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            className="w-full bg-white p-4 rounded-xl"
                        >
                            <View className="flex py-2 border-b border-[#FF6701]">
                            <Text className="text-lg text-center text-[#FF6701] font-bold mb-2 ">{title}</Text>
                            </View>
                            {body}
                            <Button loading={loading} title={buttonTitle ? buttonTitle : title} onPress={onConfirm} />

                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default CenterModal