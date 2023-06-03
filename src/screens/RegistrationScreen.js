import React, { useState, useEffect, useCallback } from 'react'
import { Platform, ImageBackground, Text, TextInput, Modal, View, Keyboard, Alert, ScrollView } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { stylesheet, Color } from '../styles'
import * as Linking from 'expo-linking'
import { firebase } from '../firebase/config'
import { defaultOptions } from '../utils/options'
import { Button, Select, PasswordInput } from '../components/forms'
import RenderHtml from 'react-native-render-html'
import DateTimePickerModal from "react-native-modal-datetime-picker"
import time from '../utils/time'
import { LineLoginUrl } from '../api/linelogin';

export default function RegistrationScreen(props) {
    const [info, setInfo] = useState({})
    const [identity, setIdentity] = useState({})
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
    const [agree, setAgree] = useState(false)
    const [termsAndConditions, setTermsAndConditions] = useState(false)
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
    const [isModalVisible, setModalVisibility] = useState(false)
    const [currentHTML, setCurrentHTML] = useState("")
    const [options, setOptions] = useState(defaultOptions) 

    const headerOptions = {
        title: '註冊',
        headerLeft: 'back'
    }
    setHeaderOptions(props.navigation, headerOptions)

    async function loadTermsAndConditions() {
        let snapshot = await firebase.firestore().doc('config/terms').get()
        let termsData = await snapshot.data()
        setTermsAndConditions(termsData)
        setCurrentHTML(termsData.terms)
    }

    async function loadUserData() {
        let snapshot = await user.ref.get()
        let userData = await snapshot.data()
        if(userData.info) {
            setInfo(userData.info)
        }
        if(userData.identity) {
            // userData.identity.communities = [undefined, undefined]
            setIdentity(userData.identity)
        }
    }

    async function setCounty(county) {
        if (county != identity.county) {
            setIdentity({ 
                ...identity, 
                county: county, 
                district: undefined,
            })
        }
        let snapshot = await firebase.firestore().doc('communities/' + county).get()
        let data = await snapshot.data()
        let districts = data && data.districts? data.districts.map(district => ({value: (data.name + district), label: district})) : [];
        setOptions({...options, districts: districts})
    }

    async function createUser() {
		firebase.auth().createUserWithEmailAndPassword(info.email, password)
			.then(response => {
				const uid = response.user.uid
				const data = {
					id: uid,
					info: info,
					identity: {
                        ...identity,
                        community: identity.district,
                        communities: [identity.district, identity.county],
                        // grade: Number(identity.grade),
                    },
                    guide: {
                        home: false,
                        intro: false,
                        notification: false,
                    },
                    interests: [],
                    recommendation: [],
                    bookmarks: [],
                    score: {},
					settings: {
						chat: false,
						inChat: false,
					},
					verification: {
						type: "email",
						status: true,
					},
                    createdTime: firebase.firestore.Timestamp.now(),
                    lastActive: firebase.firestore.Timestamp.now()
				}
				console.log('data', data)
				firebase.firestore().collection('users')
					.doc(uid)
					.set(data)
					.catch((error) => {
						alert(error)
					})
					.then(async () => { 
						let snapshot = await firebase.firestore().doc('users/' + uid).get()
						console.log(snapshot)
						props.navigation.navigate('Topic', {user: snapshot})})
			})
			.catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				if (errorCode == 'auth/weak-password') {
					alert('The password is too weak.');
				} else {
					alert(errorMessage);
				}
				console.log(error);
			});
    }

    function setBirthday(date) {
        let birthday = time(date).toFirestore()
        setInfo({ ...info, birthday: birthday })
        setDatePickerVisibility(false)
    }

    const onLinkPress = (event, href) => {
        if (href.includes("privacy")) setCurrentHTML(termsAndConditions.privacy)
        if (href.includes("rules")) setCurrentHTML(termsAndConditions.rules)
    }

    const onRequestClose = () => {
        if (currentHTML === termsAndConditions.terms) setModalVisibility(false)
        else setCurrentHTML(termsAndConditions.terms)
    }

    const onRegisterPress = () => {
        if (!info.nickname || info.nickname == '') {
            Alert.alert('', "請設定暱稱")
            return
        }
        if (!info.gender || info.gender == '') {
            Alert.alert('', "請設定性別")
            return
        }
        if (!identity.county || identity.county == '') {
            Alert.alert('', "請選擇縣市")
            return
        }
        if (!identity.district || identity.district == '') {
            Alert.alert('', "請選擇行政區")
            return
        }
        if (password.length < 6) {
            Alert.alert('', "密碼長度不足")
            return
        }
        if (password !== confirmPassword) {
            Alert.alert('', "確認密碼不相符！")
            return
        }
        if (!agree) {
            // Alert.alert('', "請閲讀並同意UniLife服務條款")
            setModalVisibility(true)
            return
        }
        createUser()
    }

    const PopupModal = ({html}) => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => onRequestClose()}
            >
                <View style={stylesheet.modal}>
                <ScrollView>
                    <View style={{paddingLeft: 20, paddingRight: 40}}>
                        <RenderHtml
                            source={{html: html}}
                            // tagsStyles={htmlStyles}
                            contentWidth={120}
                            renderersProps={{a: {onPress: onLinkPress}}}
                        />
                    </View>
                </ScrollView>
                {currentHTML === termsAndConditions.terms ?
                    <View style={{paddingHorizontal: 30}}>
                    
                    <Button
                        style={[stylesheet.bgGreen, {height: 50, wid: '100%'}]}
                        onPress={() => {
                            setAgree(true)
                            setModalVisibility(false)
                        }} 
                        title='同意'
                    />
                    </View> : <></>
                }
            </View>
            </Modal>
        )
    }

    useEffect(() => {
        loadUserData()
        loadTermsAndConditions()
    }, [])

    return (
        <View style={stylesheet.container}>
            <PopupModal html={currentHTML} />
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%', height:'100%'}}
                keyboardShouldPersistTaps="always">
                <View style={{padding: 16, paddingTop: 0}} >
                    
                <Button
                    style={stylesheet.bgGreen}
                    onPress={() => Linking.openURL(LineLoginUrl)} 
                    title='LINE 註冊'
                />
                    
                    <View style={stylesheet.footerView}>
                        <Text style={stylesheet.footerText}>                            
                            或
                        </Text>
                    </View>
                    <TextInput
                        style={stylesheet.input}
                        defaultValue={info.nickname}
                        placeholder='暱稱（必填）'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        onChangeText={(input) => setInfo({ ...info, nickname: input })}
                    />
                    <TextInput
                        style={stylesheet.input}
                        value={info.email}
                        placeholder='Email'
                        placeholderTextColor="#aaaaaa"
                        onChangeText={(input) => setInfo({ ...info, email: input })}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                    <Select 
                        value={identity.county} 
                        items={options.counties}
                        onChange={(input) => setCounty(input)}
                        placeholder='請選擇縣市（必填）...'
                    />
                    <Select 
                        value={identity.district} 
                        items={options.districts}
                        onChange={(input) => setIdentity({ ...identity, district: input })}
                        placeholder='請選擇行政區（必填）...'
                    />
                    <Select 
                        // value={info.gender} 
                        items={options.gender}
                        onChange={(input) => setInfo({ ...info, gender: input })}
                        placeholder='請選擇您的性別（必填）...'
                    />
                    <TextInput
                        style={stylesheet.input}
                        value={info.birthday? time(info.birthday).format('YYYY-MM-DD') : ''}
                        placeholder={Platform.OS === 'android'?`生日（點選日曆上方${new Date().getFullYear()}即可快速選取年份）`: '生日'}
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        showSoftInputOnFocus={false}
                        onFocus={()=>{
                            setDatePickerVisibility(true)
                            Keyboard.dismiss()}
                        }
                    />
                    <PasswordInput
                        placeholder='密碼（至少6字元）'
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                    />
                    <PasswordInput
                        placeholder='再次輸入密碼'
                        onChangeText={(text) => setConfirmPassword(text)}
                        value={confirmPassword}
                    />
                    <View style={stylesheet.footerView}>
                        <Text style={stylesheet.footerText}>                            
                            請閲讀並同意
                            <Text onPress={()=>setModalVisibility(true)}
                                style={stylesheet.footerLink}>UniLife服務條款</Text>
                        </Text>
                    </View>
                    <Button
                        style={stylesheet.bgBlue}
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
