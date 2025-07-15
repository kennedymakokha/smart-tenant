import { View, Text } from 'react-native'
import React from 'react'
import { TextInput } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';
import BottomModal from '../../components/ui/bottomModal';
import { Button } from '../../components/ui/elements';

const SmsModal = ({ body, visible, setBody, tenants, submit, close }: any) => {
    return (
        <>
            <BottomModal
                visible={visible}
                loading={true}
                title="Compose Sms"
                body={
                    <>
                        {tenants && <Picker
                            selectedValue={body.phone}
                            onValueChange={(value) => setBody((prev: any) => ({ ...prev, phone: value }))}
                            style={{
                                height: 50,
                                marginBottom: 10,
                                color: '#000',
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 5,
                                paddingHorizontal: 10, // optional for spacing inside the border
                            }}
                        >
                            <Picker.Item key={null} label="Select a recipient" value={null} />
                            {
                                tenants.map((h: any) => (
                                    <Picker.Item key={h.id} label={h.name} value={h.phone} />
                                ))
                            }
                        </Picker>}

                        <TextInput
                            className="min-h-[30%] border my-5   bg-slate-100 rounded-xl p-4 text-base text-black"
                            multiline
                            numberOfLines={10}
                            textAlignVertical="top" // ensures the text starts at the top
                            placeholder="Type your message..."
                            placeholderTextColor="#999"
                            value={body.message}
                            onChangeText={(e: string) => setBody((prev: any) => ({ ...prev, message: e }))}
                        />
                        {/* <Button title="Find" submit={() => setTimeout(async () => {

                   setShow(true)
               }, 2000)} /> */}
                        {/* </View> */}
                        <Button title="sent Message" onPress={submit} />
                    </>
                }
                onCancel={() => {
                    close();
                }}
            />
        </>
    )
}

export default SmsModal