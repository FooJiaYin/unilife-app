import React, { useState, useEffect, useCallback } from 'react'
import { Image, Text, TouchableOpacity, Modal, View, Keyboard, Alert, ScrollView, Linking } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { stylesheet } from '../styles'
import { firebase } from '../firebase/config'
import { Button, Select, Input, formStyles } from '../components/forms'
import RenderHtml from 'react-native-render-html'
import DateTimePickerModal from "react-native-modal-datetime-picker"
import time from '../utils/time'

export default function VerificationScreen(props) {
    const [verification, setVerification] = useState({
        type: '',
        status: false,
    })
    const [options, setOptions] = useState({
        type: [
            {label: '學校信箱驗證', value: 'email'},
            {label: '上傳證明文件', value: 'file'},
        ],
    }) 

    let user = props.route.params.user
    let userData = user.data()

    const headerOptions = {
        title: '驗證',
        headerLeft: 'back'
    }
    setHeaderOptions(props.navigation, headerOptions)

    const verify = async () => {
        var code = Math.floor(Math.random() * 1000000).toString()
        await user.ref.update({
            verification: {
                ...verification, 
                code: code
            }
        })
        if (verification.type == 'email') {
            if (verification.email == '') Alert.alert('', "請設定信箱")
            else if (!verification.email.includes('@') || !verification.email.includes('.')) Alert.alert('Email', "請填寫正確的Email")
            else if (!verification.email.endsWith(`@${userData.identity.community}.edu.tw`) && !verification.email.endsWith(`.${userData.identity.community}.edu.tw`)) 
                Alert.alert('學校信箱不符合',  `請使用以 ${userData.identity.community}.edu.tw 為結尾的信箱`)
            else if (userData.identity.community == 'ccu' && !verification.email.endsWith(`.pccu.edu.tw`)) 
                Alert.alert('學校信箱不符合',  `請使用以 pccu.edu.tw 為結尾的信箱`)
            else {
                const sendVerificationMail = firebase.functions().httpsCallable('sendVerificationMail');
                sendVerificationMail({
                    uid: user.id,
                    code: code
                })
                Alert.alert('感謝您提供驗證信箱',  `您可以開始使用UniLife！\r\n驗證信將於5-10分鐘内發送至 ${verification.email}，請點擊信内的連接進行驗證。如未收到信件，請至垃圾郵件檢查。`)
            }
        } else {
            Linking.openURL("https://supr.link/RWZbE")
        }
    }

    const next = () => {
        if(verification.type == 'file') {
            props.navigation.navigate('Tabs', {user: user})
        } else if(verification.type == '') {
            Alert.alert('未完成身份驗證', "您將無法使用聊天、發文及留言功能。確定要先跳過驗證步驟嗎？\r\n如果已經提供驗證信箱或是上傳證明文件，請直接點選「跳過驗證」開始使用。", [
                {
                    text: "跳過驗證",
                    onPress: () => props.navigation.navigate('Tabs', {user: user}),
                    style: "cancel"
                },
                { text: "繼續驗證", onPress: () => {} }
            ])
        } else {
            firebase.firestore().doc('users/' + user.id).get().then(snapshot => {
                const status = snapshot.data().verification.status
                // console.log(status)
                if (status == true) {
                    props.navigation.navigate('Tabs', {user: user})
                } else {
                    Alert.alert('未完成身份驗證', "您將無法使用聊天、發文及留言功能。確定要先跳過驗證步驟嗎？\r\n如果已經提供驗證信箱或是上傳證明文件，請直接點選「跳過驗證」開始使用。", [
                        {
                            text: "跳過驗證",
                            onPress: () => props.navigation.navigate('Tabs', {user: user}),
                            style: "cancel"
                        },
                        { text: "繼續驗證", onPress: () => {} }
                    ])
                }
            })
        }
    }

    useEffect(() => {
    }, [])

    return (
        <View style={stylesheet.container}>
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%', height:'100%'}}
                keyboardShouldPersistTaps="always">
                <View style={{padding: 16}}>
                    <Text style={formStyles.label}>請填入以 {userData.identity.community} 為結尾的email作為學校信箱驗證。</Text>
                    <Text style={formStyles.label}>若您是新生，或還沒有校園信箱，請選擇【上傳證明文件】</Text>
                    {/* <Text style={formStyles.label}>驗證方式</Text> */}
                    <Select 
                        // value={info.gender} 
                        items={options.type}
                        onChange={(input) => setVerification({ ...verification, type: input })}
                        placeholder='請選擇驗證方式...'
                        style={stylesheet.textDark}
                    />
                    <Text style={formStyles.label}></Text>
                    {verification.type == 'email' &&
                    <View>
                        <Text style={formStyles.label}>請使用以 {userData.identity.community}.edu.tw 為結尾的信箱</Text>
                        <Input
                            // style={[stylesheet.input, stylesheet.textDark]}
                            value={verification.email}
                            placeholder='學校信箱'
                            onChangeText={(input) => setVerification({ ...verification, email: input })}
                            right={
                                <TouchableOpacity onPress={verify}>
                                    <Text style={[stylesheet.textBlue, {fontWeight: 'bold'}]}>驗證</Text>
                                </TouchableOpacity>
                            }
                        />
                    </View>}
                    {verification.type == 'file' &&
                    <View>
                        <Button
                            titleStyle={stylesheet.textBlue}
                            onPress={verify} 
                            title='前往LINE@ 上傳驗證文件'
                        />
                    </View>}
                    <View style={stylesheet.footerView}>
                    </View>
                    <Button
                        style={stylesheet.bgGreen}
                        onPress={() => next()} 
                        title='開始使用 UniLife'
                    />

                    {/* <View style={{height:70}} /> */}
                </View>
            </KeyboardAwareScrollView>
        </View>
    )
}
