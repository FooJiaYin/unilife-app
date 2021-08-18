import React, { useState, useEffect, useCallback } from 'react'
import { Image, Text, TextInput, TouchableOpacity, View, Keyboard } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { stylesheet, Color } from '../styles/styles'
import { firebase } from '../firebase/config'
import { Button } from '../components/forms'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import time from '../utils/time'

export default function FillInfoScreen(props) {
    const [info, setInfo] = useState({})
    const [identity, setIdentity] = useState({})
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
    const [agree, setAgree] = useState(false)
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

    let user = props.route.params.user

    const options = {
        title: '註冊',
        headerLeft: 'back'
    }
    setHeaderOptions(props.navigation, options)

    async function loadUserData() {
        // console.log(firebase.auth().currentUser)
        // console.log("community", user.community)
        // console.log("identity", user.identity.community)
        let snapshot = await user.ref.get()
        let userData = await snapshot.data()
        // console.log(userData)
        if(userData.info) setInfo(userData.info)
        if(userData.identity) setIdentity(userData.identity)
    }

    async function updateUserData() {
        // console.log(password)
        await user.ref.update({
            info: info,
            verification: {
                status: true,
                type: 'file'
            },
            identity: {
                ...identity,
                grade: Number(identity.grade),
            },
            settings: {
                chat: false
            }
        })
        try {
            await firebase.auth().currentUser.updateProfile({
                displayName: info.name,
                emailVerified: true
            })
            await firebase.auth().currentUser.updatePassword(password)
        } catch (error) {
            console.log(error)
        }
        props.navigation.navigate('Topic', {user: user})
    }

    function setBirthday(date) {
        let birthday = time(date).toFirestore()
        setInfo({ ...info, birthday: birthday })
        setDatePickerVisibility(false)
    }

    const onRegisterPress = () => {
        if (!info.birthday) {
            alert("請設定生日日期")
            return
        }
        const genders = ['男', '女', '其他']
        if (!genders.includes(info.gender)) {
            alert("請設定性別為男/女/其他")
            return
        }
        if (!identity.grade || isNaN(identity.grade)) {
            alert("請設定年級為數字（例：1）")
            return
        }
        if (password.length < 6) {
            alert("密碼長度不足")
            return
        }
        if (password !== confirmPassword) {
            alert("確認密碼不相符！")
            return
        }
        let checkbox = true
        if (!checkbox) {
            alert("確認密碼不相符！")
            return
        }
        updateUserData()
    }

    useEffect(() => {
        loadUserData()
        setInfo({
            email: firebase.auth().currentUser.email,
            profileImage: info.profileImage || 'profile-image-0.png'
        })
    }, [])

    return (
        <View style={stylesheet.container}>
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%', height:'100%'}}
                keyboardShouldPersistTaps="always">
                <View style={{padding: 16}}>
                    <TextInput
                        style={stylesheet.input}
                        defaultValue={info.name}
                        placeholder='姓名'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        onChangeText={(input) => setInfo({ ...info, name: input })}
                    />
                    <TextInput
                        style={stylesheet.input}
                        defaultValue={info.nickname}
                        placeholder='暱稱'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        onChangeText={(input) => setInfo({ ...info, nickname: input })}
                    />
                    <TextInput
                        style={stylesheet.input}
                        // defaultValue={time(info.birthday).format('YYYY-MM-DD') || ''}
                        value={info.birthday? time(info.birthday).format('YYYY-MM-DD') : ''}
                        placeholder='生日'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        showSoftInputOnFocus={false}
                        // onChangeText={(input) => setInfo({ ...info, birthday: input })}
                        onFocus={()=>{
                            setDatePickerVisibility(true)
                            Keyboard.dismiss()}
                        }
                    />                    
                    <TextInput
                        style={stylesheet.input}
                        defaultValue={info.gender}
                        placeholder='性別（男/女/其他）'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        onChangeText={(input) => setInfo({ ...info, gender: input })}
                    />
                    <TextInput
                        style={stylesheet.input}
                        defaultValue={identity.grade}
                        placeholder='年級（請輸入數字，例：1）'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        onChangeText={(input) => setIdentity({ ...identity, grade: input })}
                    />
                    <TextInput
                        style={[stylesheet.input, stylesheet.textGrey]}
                        value={info.email}
                        placeholder='Email'
                        placeholderTextColor="#aaaaaa"
                        onChangeText={(text) => setEmail(text)}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        editable={false}
                    />
                    <TextInput
                        style={stylesheet.input}
                        placeholderTextColor="#aaaaaa"
                        secureTextEntry
                        placeholder='密碼（至少6字元）'
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={stylesheet.input}
                        placeholderTextColor="#aaaaaa"
                        secureTextEntry
                        placeholder='再次輸入密碼'
                        onChangeText={(text) => setConfirmPassword(text)}
                        value={confirmPassword}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                    <View style={{height: 100}} />
                    <View style={stylesheet.footerView}>
                        {/* <Text style={stylesheet.footerText}>
                        <Button
                            onPress={()=>setAgree(true)}
                            color={agree?'#00aebb':'#e2e3e4'}>
                                    v
                            </Button>
                            
                            我同意 
                            <Text onPress={onFooterLinkPress} style={stylesheet.footerLink}>UniLife個資授權書與使用者條款</Text>
                        </Text> */}
                    </View>
                    <Button
                        style={stylesheet.bgGreen}
                        onPress={() => onRegisterPress()} 
                        title='註冊'
                    />
                </View>
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    date={info.birthday? info.birthday.toDate() : new Date()}
                    onConfirm={(date)=>setBirthday(date)}
                    onCancel={()=>setDatePickerVisibility(false)}
                />
            </KeyboardAwareScrollView>
        </View>
    )
}
