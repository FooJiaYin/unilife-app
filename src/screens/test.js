import React, { useState } from 'react'
import { ImageBackground, Image, Text, TextInput, TouchableOpacity, View, TouchableHighlight, StyleSheet } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Button } from '../components/forms'
import { firebase } from '../firebase/config'
import { CurveMaskedTop, ProfilePicture, CurvedBg } from '../components/decorative'
import { Color, stylesheet } from '../styles'


export default function Test({navigation}) {

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

      const screenStyle = StyleSheet.create({
          outlineButton:{
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: '#fff',
            marginVertical:8,
        },
        desc:{
            position:'relative',
            flex: 1,
            alignItems: 'center',
            marginTop: 40,
            marginBottom: 60,
        },
        bottomButton:{
            marginTop: 'auto',
            backgroundColor: Color.blue,
            width: 320,
        }
      })

    return (
            
        <View style={stylesheet.container}>
            <CurvedBg>
                <ProfilePicture diameter={160}/>
                <Button style={screenStyle.outlineButton} title="編輯頭像"/>
            </CurvedBg>
            <View style={screenStyle.desc}>
                <Text style={stylesheet.articleTitle}>註冊成功！</Text>
                <Text style={[stylesheet.text, {flex:1}]}>恭喜！你已成功註冊UniLife帳號！</Text>
                <Button title='下一步' style={screenStyle.bottomButton}/>
            </View>
        </View>
            
    )
}
