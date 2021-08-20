import React, { useEffect, useState, useCallback } from 'react'
import { ImageBackground, Image, Text, TextInput, Keyboard, View } from 'react-native'
import { useFocusEffect } from "@react-navigation/native";
import { setHeaderOptions } from '../components/navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
// import { DateTimePicker } from 'react-native-ui-lib/DateTimePicker'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {Picker} from '@react-native-picker/picker'
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
    const [departments, setDepartments] = useState([])

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

    async function loadDepartments(community) {
        let querySnapshot = await firebase.firestore().doc('communities/' + community).collection('departments').get()
        let newDepartments = []
        querySnapshot.forEach(snapshot => {
            newDepartments.push({
                id: snapshot.id,
                ...snapshot.data()
            })
        })
        setDepartments(newDepartments)
        console.log(newDepartments)
        // console.log(departments)
    }

    async function loadUserData() {
        // console.log("community", user.community)
        // console.log("identity", user.identity.community)
        let snapshot = await props.user.ref.get()
        let user = await snapshot.data()
        loadDepartments(user.identity.community)
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

    const onSavePress = () => {
        if (!info.name || info.name == '') {
            alert("請設定姓名")
            return
        }
        if (!info.nickname || info.nickname == '') {
            alert("請設定暱稱")
            return
        }
        if (!info.birthday) {
            alert("請設定生日日期")
            return
        }
        if (!info.gender || info.gender == '') {
            alert("請選擇性別")
            return
        }
        if (!identity.degree || identity.degree == '') {
            alert("請選擇學位")
            return
        }
        if (!identity.department || identity.department == '') {
            alert("請選擇系所")
            return
        }
        if (!identity.grade || identity.grade == '') {
            alert("請選擇年級")
            return
        }
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
                    <View style={[stylesheet.input, {justifyContent: 'center'}]}>
                        <Picker
                            selectedValue={identity.department}
                            onValueChange={(itemValue, itemIndex) =>{
                                setIdentity({ ...identity, department: itemValue })
                            }}
                            style={{padding: 0, margin: -10}}
                            // mode="dropdown"
                        >
                            <Picker.Item label="請選擇系所..." value="" />
                            {departments.map((department, i)=>
                                <Picker.Item label={department.name} value={department.id} />
                            )}
                        </Picker> 
                    </View>  
                    <View style={[stylesheet.input, {justifyContent: 'center'}]}>
                        <Picker
                            selectedValue={identity.degree}
                            onValueChange={(itemValue, itemIndex) =>{
                                setIdentity({ ...identity, degree: itemValue })
                            }}
                            style={{padding: 0, margin: -10}}
                            // mode="dropdown"
                        >
                            <Picker.Item label="請選擇學位..." value="" />
                            <Picker.Item label="大學部" value="bachelor" />
                            <Picker.Item label="碩士班" value="master" />
                            <Picker.Item label="博士班" value="phd" />
                        </Picker> 
                    </View> 
                    <View style={[stylesheet.input, {justifyContent: 'center'}]}>
                        <Picker
                            selectedValue={identity.grade}
                            onValueChange={(itemValue, itemIndex) =>{
                                setIdentity({ ...identity, grade: itemValue })
                            }}
                            style={{padding: 0, margin: -10}}
                            // mode="dropdown"
                        >
                            <Picker.Item label="請選擇年級..." value="" />
                            <Picker.Item label="1" value={1} />
                            <Picker.Item label="2" value={2} />
                            <Picker.Item label="3" value={3} />
                            <Picker.Item label="4" value={4} />
                            <Picker.Item label="5" value={5} />
                            <Picker.Item label="6" value={6} />
                            <Picker.Item label="7" value={7} />
                        </Picker> 
                    </View>
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
                        onPress={() => onSavePress()} 
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

