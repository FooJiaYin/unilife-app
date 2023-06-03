import React, { useState, useEffect, useCallback } from 'react'
import { Platform, ImageBackground, Text, TextInput, Modal, View, Keyboard, Alert, ScrollView } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { stylesheet, Color } from '../styles'
import styles from '../styles/profileStyles'
import Asset from '../components/assets'
import { firebase } from '../firebase/config'
import { Button, Select, PasswordInput } from '../components/forms'
import RenderHtml from 'react-native-render-html'
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { defaultOptions } from '../utils/options'
import time from '../utils/time'

export default function FillInfoScreen(props) {
    const [info, setInfo] = useState({})
    const [identity, setIdentity] = useState({})
	// const [password, setPassword] = useState("")
	// const [confirmPassword, setConfirmPassword] = useState("")
    const [agree, setAgree] = useState(false)
    const [termsAndConditions, setTermsAndConditions] = useState(false)
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
    const [isModalVisible, setModalVisibility] = useState(false)
    const [currentHTML, setCurrentHTML] = useState("")
    const [options, setOptions] = useState(defaultOptions) 

    let user = props.route.params.user

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

    async function updateUserData() {
        // console.log(password)
        await user.ref.update({
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
            settings: {
                chat: false,
                inChat: false,
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

    const onLinkPress = (event, href) => {
        if (href.includes("privacy")) setCurrentHTML(termsAndConditions.privacy)
        if (href.includes("rules")) setCurrentHTML(termsAndConditions.rules)
    }

    const onRequestClose = () => {
        if (currentHTML === termsAndConditions.terms) setModalVisibility(false)
        else setCurrentHTML(termsAndConditions.terms)
    }

    const onRegisterPress = () => {
        // if (!info.name || info.name == '') {
        //     Alert.alert('', "請設定姓名")
        //     return
        // }
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
        if (!agree) {
            // Alert.alert('', "請閲讀並同意UniLife服務條款")
            setModalVisibility(true)
            return
        }
        updateUserData()
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
                <View style={{padding: 16}} >
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
                        style={[stylesheet.input, stylesheet.textGrey]}
                        value={info.email}
                        placeholder='Email'
                        placeholderTextColor="#aaaaaa"
                        onChangeText={(text) => setEmail(text)}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        editable={false}
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
                    <View style={stylesheet.footerView}>
                        <Text style={stylesheet.footerText}>                            
                            請閲讀並同意
                            <Text onPress={()=>setModalVisibility(true)}
                                style={stylesheet.footerLink}>UniLife服務條款</Text>
                        </Text>
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
