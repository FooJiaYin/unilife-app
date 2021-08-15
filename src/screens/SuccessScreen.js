import React, { useState } from 'react'
import { ImageBackground, Image, Text, TextInput, TouchableOpacity, View, TouchableHighlight } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Button } from '../components/forms'
import { firebase } from '../firebase/config'
import { stylesheet } from '../styles/styles'
import { CurveMaskedTop, ProfilePicture } from '../components/decorative'
import { Color } from '../styles'


export default function SuccessScreen({navigation}) {

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: '#00aebb',
                borderBottomWidth: 0,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            headerTitleStyle: { alignSelf: 'center' },
            headerRight: () => (
                <TouchableOpacity
                style={stylesheet.headerButton}
                onPress={() => true}>
                <Text style={stylesheet.buttonTitle}>完成</Text>
            </TouchableOpacity>
            ),
        })
      }, [navigation])

    return (
            
           // <View style={{ flex: 1, width: '100%' , height: '100%',backgroundColor: 'red'}}>
            <View style={stylesheet.container}>
                <CurveMaskedTop>
                    <ProfilePicture diameter={160}/>
                    <Button style={{width:320}} title="編輯頭像"/>
                </CurveMaskedTop>
                    {/* <Text style={StyleSheet.text}>恭喜！你已成功註冊UniLife帳號！</Text>
                    <Button title='下一步'/> */}
                 </View>
            // </View> 
            
    )
}
