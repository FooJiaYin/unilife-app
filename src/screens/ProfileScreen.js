import React, { useEffect, useState, useCallback } from 'react'
import { ImageBackground, Image, Text, TextInput, Keyboard, View, Alert } from 'react-native'
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
import time from '../utils/time'
import { stylesheet, Color } from '../styles'

export default function ProfileScreen(props) {
    const [info, setInfo] = useState({})
    const [identity, setIdentity] = useState({})
    const [user, setUser] = useState({})
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
    const [options, setOptions] = useState({
        counties: [
            {label: '基隆市', value: 'keelung'},
            {label: '臺北市', value: 'taipei'},
            {label: '新北市', value: 'newtaipei'},
            {label: '桃園市', value: 'taoyuan'},
            {label: '新竹市', value: 'hsinchuCity'},
            {label: '新竹縣', value: 'hsinchuCounty'},
            {label: '苗栗縣', value: 'miaoli'},
            {label: '臺中市', value: 'taichung'},
            {label: '彰化縣', value: 'changhua'},
            {label: '南投縣', value: 'nantou'},
            {label: '雲林縣', value: 'yunlin'},
            {label: '嘉義市', value: 'chiayiCity'},
            {label: '嘉義縣', value: 'chiayiCounty'},
            {label: '臺南市', value: 'tainan'},
            {label: '高雄市', value: 'kaohsiung'},
            {label: '屏東縣', value: 'pintung'},
            {label: '臺東縣', value: 'taitung'},
            {label: '花蓮縣', value: 'hualien'},
            {label: '宜蘭縣', value: 'yilan'},
            {label: '澎湖縣', value: 'penghu'},
            {label: '金門縣', value: 'kinmen'},
            {label: '連江縣', value: 'matsu'},
        ],
    }) 

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
        }
        setUser(user)
        setIdentity(user.identity)
        setCounty(user.identity.county)
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
                        (info.profileImage == "profile-image-1.png")? 1 : 2
        currentId = (currentId + 1) % 3
        let image = "profile-image-" + currentId + ".png"
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
                props.navigation.navigate('Login')
            })
        })
    }

    useEffect(() => {
        // loadOptions()
        loadUserData()
    }, [])

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
                    <Select 
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
                    />
                    <TextInput
                        style={[styles.input]}
                        value={info.email}
                        placeholder='Email'
                        placeholderTextColor="#aaaaaa"
                        onChangeText={(text) => setEmail(text)}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        editable={false}
                    />
                    <TextInput
                        style={styles.input}
                        defaultValue={info.birthday? time(info.birthday).format('YYYY-MM-DD') : ''}
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
                            <Text onPress={()=>WebBrowser.openBrowserAsync('https://supr.link/znUbr')} style={stylesheet.footerLink}>聯繫客服</Text>
                    </View>
                    
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