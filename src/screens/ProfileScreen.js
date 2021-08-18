import React, { useEffect, useState, useCallback } from 'react'
import { ImageBackground, Image, Text, TextInput, Keyboard, View } from 'react-native'
import { useFocusEffect } from "@react-navigation/native";
import { setHeaderOptions } from '../components/navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
// import { DateTimePicker } from 'react-native-ui-lib/DateTimePicker'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Button } from '../components/forms'
import styles from '../styles/profileStyles'
import { firebase } from '../firebase/config'
import Asset from '../components/assets'
import time from '../utils/time'
import { stylesheet, Color } from '../styles'

export default function ProfileScreen(props) {
    const [info, setInfo] = useState({})
    const [identity, setIdentity] = useState({})
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

    const options = {
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
    setHeaderOptions(props.navigation, options)

    async function loadUserData() {
        // console.log("community", user.community)
        // console.log("identity", user.identity.community)
        let snapshot = await props.user.ref.get()
        let user = await snapshot.data()
     // console.log(user)
        setInfo(user.info)
        setIdentity(user.identity)
    }

    const updateUserData = async () => {
        // console.log(identity)
        if (!identity.grade || isNaN(identity.grade)) {
            // console.log(identity.grade)
            alert("請設定年級為數字（例：1）")
            return
        }
        await props.user.ref.update({
            info: info,
            identity: {
                ...identity,
                grade: Number(identity.grade),
            }
        })
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
        firebase.auth().signOut().then(() => {
            console.log( firebase.auth().currentUser)
            props.navigation.navigate('Login2')
        })
    }

    useEffect(() => {
        loadUserData()
    }, [])

    return (
        <View style={stylesheet.container}>
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%' ,backgroundColor: 'white'}}
                keyboardShouldPersistTaps="always">
                <View style={styles.green}>
                    <Image
                        style={styles.propic}
                        source={info.profileImage? Asset(info.profileImage) : Asset('profile-image-0.png')}/>
                </View>
                <View>
                    <ImageBackground source={Asset('bg-profile.jpg')} resizeMode="cover" style={styles.bg}>
                        <Button style={[stylesheet.outlineWhite, styles.editButton]} title="切換頭像" onPress={() => changeProfileImage()}/>
                    </ImageBackground>
                </View>
                <View style={styles.container}>
                    <TextInput
                        style={styles.input}
                        defaultValue={info.name}
                        placeholder='姓名'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        onChangeText={(input) => setInfo({ ...info, name: input })}
                    />
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
                    <TextInput
                        style={stylesheet.input}
                        defaultValue={identity.grade? identity.grade.toString() : null}
                        placeholder='年級（請輸入數字，例：1）'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        onChangeText={(input) => {
                            // console.log(identity)
                            setIdentity({ ...identity, grade: input })}}
                    />
                    {/* <TextInput
                        style={styles.input}
                        defaultValue={info.email}
                        placeholder='Email'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        onChangeText={(input) => setInfo({ ...info, email: input })}
                    /> */}
                    <Button
                        style={stylesheet.bgGreen}
                        onPress={() => updateUserData()} 
                        title='儲存'
                    />
                    <Button
                        style={stylesheet.outlineBlue} 
                        titleStyle={stylesheet.textBlue}
                        onPress={() => signOut()} 
                        title='登出'
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

