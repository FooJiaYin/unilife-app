import React, { useState, useEffect, useCallback } from 'react'
import { Image, Text, TextInput, Modal, View, Keyboard, Alert, ScrollView } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { stylesheet, htmlStyles } from '../styles/styles'
import { firebase } from '../firebase/config'
import { Button, Select } from '../components/forms'
import RenderHtml from 'react-native-render-html'
import DateTimePickerModal from "react-native-modal-datetime-picker"
import time from '../utils/time'

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
    const [options, setOptions] = useState({
        grade: [
            {label: '一年級', value: 1},
            {label: '二年級', value: 2},
            {label: '三年級', value: 3},
            {label: '四年級', value: 4},
            {label: '五年級', value: 5},
            {label: '六年級', value: 6},
            {label: '七年級', value: 7},
        ],
        degree: [
            {label: '大學部', value: 'bachelor'},
            {label: '碩士班', value: 'master'},
            {label: '博士班', value: 'phd'},
        ],
        gender: [
            {label: '男', value: '男'},
            {label: '女', value: '女'}
        ]
    }) 

    const headerOptions = {
        title: '註冊',
        headerLeft: 'back'
    }
    setHeaderOptions(props.navigation, headerOptions)

    async function loadTermsAndConditions() {
        // console.log(firebase.auth().currentUser)
        // console.log("community", user.community)
        // console.log("identity", user.identity.community)
        let snapshot = await firebase.firestore().doc('config/terms').get()
        let termsData = await snapshot.data()
        // console.log(termsData)
        setTermsAndConditions(termsData)
        setCurrentHTML(termsData.terms)
    }

    async function loadCommunities(community) {
        let querySnapshot = await firebase.firestore().collection('communities').get()
        let newCommunities = await[]
        querySnapshot.forEach(snapshot => {
			if (snapshot.id != 'test' && snapshot.id != 'all') {
				newCommunities.push({
					value: snapshot.id,
					label: snapshot.data().name
				})
			}
        })
        setOptions({...options, communities: newCommunities})
        console.log(newCommunities)
        // console.log(departments)
    }

    async function loadDepartments(community) {
        let querySnapshot = await firebase.firestore().doc('communities/' + community).collection('departments').get()
        let newDepartments = []
        querySnapshot.forEach(snapshot => {
            newDepartments.push({
                value: snapshot.id,
                label: snapshot.data().name
            })
        })
        setOptions({...options, departments: newDepartments})
        console.log(newDepartments)
        // console.log(departments)
    }

    async function createUser() {
		firebase.auth().createUserWithEmailAndPassword(info.email, password)
			.then(response => {
				const uid = response.user.uid
				const data = {
					id: uid,
					info: info,
					identity: identity,
					settings: {
						chat: false,
						inChat: false,
					},
					verification: {
						type: "",
						status: false,
					},
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
        if (!info.email || info.email == '') {
            Alert.alert('', "請設定Email")
            return
        }
        if (!info.email.includes('@')) {
            Alert.alert('', "Email格式不符合")
            return
        }
        if (!info.name || info.name == '') {
            Alert.alert('', "請設定姓名")
            return
        }
        if (!info.nickname || info.nickname == '') {
            Alert.alert('', "請設定暱稱")
            return
        }
        if (!info.birthday) {
            Alert.alert('', "請設定生日日期")
            return
        }
        if (!info.gender || info.gender == '') {
            Alert.alert('', "請選擇性別")
            return
        }
        if (!identity.community || identity.community == '') {
            Alert.alert('', "請選擇學校")
            return
        }
        if (!identity.department || identity.department == '') {
            Alert.alert('', "請選擇系所")
            return
        }
        if (!identity.degree || identity.degree == '') {
            Alert.alert('', "請選擇學位")
            return
        }
        if (!identity.grade || identity.grade == '') {
            Alert.alert('', "請選擇年級")
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
		console.log(info)
		console.log(identity)
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
		loadCommunities()
        loadTermsAndConditions()
        setInfo({
            email: '',//firebase.auth().currentUser.email,
            profileImage: info.profileImage || 'profile-image-0.png'
        })
    }, [])

    return (
        <View style={stylesheet.container}>
            <PopupModal html={currentHTML} />
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%', height:'100%'}}
                keyboardShouldPersistTaps="always">
                <View style={{padding: 16}}>
                    <TextInput
                        style={stylesheet.input}
                        placeholder='Email'
                        placeholderTextColor="#aaaaaa"
						onChangeText={(input) => setInfo({ ...info, email: input })}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={stylesheet.input}
                        placeholder='姓名'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        onChangeText={(input) => setInfo({ ...info, name: input })}
                    />
                    <TextInput
                        style={stylesheet.input}
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
                    <Select 
                        // value={info.gender} 
                        items={options.gender}
                        onChange={(input) => setInfo({ ...info, gender: input })}
                        placeholder='請選擇生理性別...'
                    />
                    <Select 
                        // value={identity.department} 
                        items={options.communities}
                        onChange={(input) => {
							setIdentity({ ...identity, community: input })
							loadDepartments(input)
						}}
                        placeholder='請選擇學校...'
                    />
                    <Select 
                        // value={identity.department} 
                        items={options.departments}
                        onChange={(input) => setIdentity({ ...identity, department: input })}
                        placeholder='請選擇系所...'
                    />
                    <Select 
                        // value={identity.degree} 
                        items={options.degree}
                        onChange={(input) => setIdentity({ ...identity, degree: input })}
                        placeholder='請選擇學位...'
                    />
                    <Select 
                        // value={identity.grade} 
                        items={options.grade}
                        onChange={(input) => setIdentity({ ...identity, grade: input })}
                        placeholder='請選擇年級...'
                    /> 
                    {/* <View style={[stylesheet.input, {justifyContent: 'center'}]}>
                        <Picker
                            selectedValue={''}
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
                            selectedValue={''}
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
                            selectedValue={''}
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
                    </View>  */}
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
                    {/* <View style={{height:70}} /> */}
                    <View style={stylesheet.footerView}>
                        <Text style={stylesheet.footerText}>
                        {/* <Button
                            onPress={()=>setAgree(true)}
                            color={agree?'#00aebb':'#e2e3e4'}>
                                    v
                            </Button> */}
                            
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
