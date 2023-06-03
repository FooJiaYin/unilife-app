import React, { useEffect, useState, useCallback } from 'react'
import { Platform, ImageBackground, Text, TextInput, Keyboard, View, Alert } from 'react-native'
import { useFocusEffect } from "@react-navigation/native";
import { setHeaderOptions } from '../components/navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
// import { DateTimePicker } from 'react-native-ui-lib/DateTimePicker'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Button, Select } from '../components/forms'
import { ProfileImage } from '../components/profileImage'
import * as WebBrowser from 'expo-web-browser';
import styles from '../styles/profileStyles'
import { firebase } from '../firebase/config'
import Asset from '../components/assets'
import { defaultOptions } from '../utils/options'
import time from '../utils/time'
import { stylesheet, Color } from '../styles'
import { checkAuthStatus } from '../utils/auth';

export default function ProfileScreen(props) {
    const [info, setInfo] = useState({})
    const [identity, setIdentity] = useState({})
    const [user, setUser] = useState({})
    const [lineImage, setLineImage] = useState(undefined)
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
    const [options, setOptions] = useState(defaultOptions) 

    const headerOptions = {
        title: '編輯帳戶',
        style: {
            headerStyle: {
                backgroundColor: '#00aebb',
                borderBottomWidth: 0,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
                alignSelf: 'center',
                color: Color.white,
            }
        },
        headerLeft: 'back'
    }
    setHeaderOptions(props.navigation, headerOptions)

    async function loadOptions() {
        const snapshot = await firebase.firestore().doc('config/options').get()
        const newOptions = await snapshot.data()
        setOptions(newOptions)
        // console.log(newOptions)
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
        let districts = data && data.districts? data.districts.map(district => ({value: data.name + district, label: district})) : [];
        setOptions({...options, districts: districts})
        console.log(options)
    }

    async function loadUserData() {
        // console.log("community", user.community)
        // console.log("identity", user.identity.community)
        let snapshot = await props.user.ref.get()
        let user = await snapshot.data()
        // loadDepartments(user.identity.community)
        // console.log(user)
        if(user.info) {
            setInfo(user.info)
            if(user.info.profileImage && user.info.profileImage.startsWith("https://")) {
                setLineImage(user.info.profileImage)
            }
        }
        setUser(user)
        snapshot = await firebase.firestore().doc('communities/' + user.identity.county).get()
        let county = await snapshot.data()
        let districts = county && county.districts? county.districts.map(district => ({value: county.name + district, label: district})) : [];
        setOptions({...options, districts: districts})
        setIdentity(user.identity)
        checkAuthStatus(user, props, "馬上完成註冊，開啟設定頁面。\n點擊「切換頭像」解鎖更多小攸！")
    }

    const updateUserData = async () => {
        // console.log(identity)
        await props.user.ref.update({
            info: info,
            identity: {
                ...identity,
                community: identity.district,
                communities: [identity.district, identity.county],
            },
        })
        Alert.alert('儲存成功', '您的資料已儲存。\n如果其他頁面資料未更新，請重啟UniLife應用程序。')
    }

    const onSavePress = () => {
        if (!info.nickname || info.nickname == '') {
            Alert.alert('', "請設定暱稱")
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
        // if (!info.birthday) {
        //     Alert.alert('', "請設定生日日期")
        //     return
        // }
        // if (!info.gender || info.gender == '') {
        //     Alert.alert('', "請選擇性別")
        //     return
        // }
        // if (!identity.degree || identity.degree == '') {
        //     Alert.alert('', "請選擇學位")
        //     return
        // }
        // if (!identity.department || identity.department == '') {
        //     Alert.alert('', "請選擇系所")
        //     return
        // }
        // if (!identity.grade || identity.grade == '') {
        //     Alert.alert('', "請選擇年級")
        //     return
        // }
        updateUserData()
    }

    function changeProfileImage() {
        // console.log(info.profileImage)
        let currentId = (info.profileImage == "profile-image-0.png")? 0 : 
                        (info.profileImage == "profile-image-1.png")? 1 : 
                        (info.profileImage == "profile-image-2.png")? 2 : 3
        currentId = (currentId + 1) % (lineImage? 4 : 3)
        let image = currentId < 3? "profile-image-" + currentId + ".png" : lineImage
        setInfo({ ...info, profileImage: image })
        // updateUserData()
    }

    function setBirthday(date) {
        let birthday = time(date).toFirestore()
        setInfo({ ...info, birthday: birthday })
        setDatePickerVisibility(false)
    }

    function signOut() {
        firebase.firestore().doc('users/' + user.id).update({
            pushToken: null
        }).then(() => {
            firebase.auth().signOut().then(() => {
                console.log( firebase.auth().currentUser)
                props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                })
            })
        })
    }

    useFocusEffect(
        React.useCallback(() => {
            loadUserData()
        }, [])
    ) 

    return (
        <View style={stylesheet.container}>
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%' ,backgroundColor: 'white'}}
                keyboardShouldPersistTaps="always">
                <View style={styles.green}>
                    <ProfileImage style={styles.propic} source={info.profileImage} />
                </View>
                <View>
                    <ImageBackground source={Asset('bg-profile.jpg')} resizeMode="cover" style={styles.bg}>
                        <Button style={[stylesheet.outlineWhite, styles.editButton]} title="切換頭像" onPress={() => changeProfileImage()}/>
                    </ImageBackground>
                </View>
                {user && user.verification && user.verification.type != "anonymous" &&
                <View style={styles.container}>
                    <TextInput
                        style={styles.input}
                        defaultValue={info.nickname}
                        placeholder='暱稱'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        onChangeText={(input) => setInfo({ ...info, nickname: input })}
                    />
                    <TextInput
                        style={[styles.input, stylesheet.textGrey]}
                        value={identity.district} 
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        editable={false}
                    />
                    {/* <Select 
                        value={identity.county} 
                        items={options.counties}
                        onChange={(input) => setCounty(input)}
                        placeholder='請選擇縣市...'
                    />
                    <Select 
                        value={identity.district} 
                        items={options.districts}
                        onChange={(input) => setIdentity({ ...identity, district: input })}
                        placeholder='請選擇行政區...'
                    /> */}
                    <TextInput
                        style={[styles.input, stylesheet.textGrey]}
                        value={info.email}
                        placeholder='Email'
                        // onChangeText={(text) => setEmail(text)}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        editable={false}
                    />
                    <TextInput
                        style={styles.input}
                        defaultValue={info.birthday? time(info.birthday).format('YYYY-MM-DD') : ''}
                        value={info.birthday? time(info.birthday).format('YYYY-MM-DD') : ''}
                        placeholder={Platform.OS === 'android'?`生日（點選日曆上方${new Date().getFullYear()}即可快速選取年份）`: '生日'}
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
                    <Button
                        style={stylesheet.bgGreen}
                        onPress={() => onSavePress()} 
                        title='儲存'
                    />
                    <Button
                        style={stylesheet.outlineBlue} 
                        titleStyle={stylesheet.textBlue}
                        onPress={() => signOut()} 
                        title='登出'
                    />
                    <View style={stylesheet.footerView}>
                        <Text style={stylesheet.footerText}>如需變更社群、email或刪除帳號，請<Text onPress={()=>WebBrowser.openBrowserAsync('https://supr.link/ldq2V')} style={stylesheet.footerLink}>洽詢客服</Text></Text>
                    </View>
                    
                </View>
                }
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