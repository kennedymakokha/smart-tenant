import { View, Text } from 'react-native'
import React from 'react'
import { Image } from 'react-native'

const Loader = () => {
    return (
        <View className='flex-1 h-full items-center justify-center '>
            {/* <Image
                source={require('./../../assets/loader.png')}
                className="w-40 h-40 rounded-full mb-4 animate-spin"
                resizeMode="contain"
            /> */}
        </View>
    )
}

export default Loader