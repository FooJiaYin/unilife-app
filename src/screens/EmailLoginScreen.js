import React, { useState, useEffect } from 'react'
import { Platform, Dimension, ImageBackground, Image, Text, TextInput, Linking, Alert, View, KeyboardAvoidingView } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Asset from '../components/assets'
import { Button, PasswordInput } from '../components/forms'
import { styles } from './LoginScreen/styles'
import { stylesheet } from '../styles'
import { firebase } from '../firebase/config'
import { CurvedBg } from '../components/decorative'
import * as WebBrowser from 'expo-web-browser';
import { LineLoginUrl } from '../api/linelogin';

export default function EmailLoginScreen({navigation, ...props}) {
    const usersRef = firebase.firestore().collection('users')
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const authToken = props.route.params && props.route.params.token
    // console.log(props.route.params)

    setHeaderOptions(navigation)

    const onFooterLinkPress = () => {
        navigation.navigate('Registration')
        // WebBrowser.openBrowserAsync('https://supr.link/kmbjI');
        // Linking.openURL('https://supr.link/kmbjI')
    }

    const onLoginPress = () => {
        // console.log("Login")
        firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((response) => {
            // console.log(response)
            const uid = response.user.uid
            usersRef
                .doc(uid)
                .get()
                .then(snapshot => {
                    if (!snapshot.exists) {
                        Alert.alert('', "該帳號不存在")
                        return
                    }
                    const user = snapshot.data()
                    if(user.interests && user.interests.length == 5) {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Tabs' }],
                        })
                    } else {
                        navigation.navigate('FillInfo', {user: snapshot})
                    }
                })
                .catch(error => {
                    alert(error)
                })
        })
        .catch(error => {
            console.log(error)
            if(error.code == 'auth/user-not-found' || error.code == 'auth/invalid-email') Alert.alert("該用戶不存在", "請檢查您輸入的信箱是否與註冊信箱相同。如需更改信箱，請洽客服協助。")
            else if(error.code == 'auth/wrong-password') Alert.alert("密碼錯誤", "請檢查您輸入的密碼是否正確。")
            else Alert.alert(error)
        })
    }

    // React.useLayoutEffect(() => {
    //     navigation.setOptions({
    //         headerShown: false
    //     })
    //   }, [navigation])

    const headerOptions = {
        title: 'Email 註冊/登入',
        headerLeft: 'back'
    }
    setHeaderOptions(navigation, headerOptions)

    useEffect(() => {
        if(authToken) login(authToken)
    }, [])

    return (
        <View style={{ flex: 1, width: '100%', justifyContent: 'center' }}>
            <ImageBackground source={Asset('bg-login.jpg')} resizeMode="cover" style={styles.bg}>
            </ImageBackground>
            <Image
                style={styles.logo}
                source={Asset('logo_with_text.png')}
            />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : ""}>
            <View style={[styles.card, {marginVertical: 30}]}>
                <TextInput
                    style={styles.input}
                    placeholder='Email'
                    placeholderTextColor="#aaaaaa"
                    // defaultValue={'student@test.com'}
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <PasswordInput
                    placeholder='密碼'
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                />
                <Text onPress={() => navigation.navigate('ResetPassword')} style={[stylesheet.textGrey, {alignSelf: 'flex-end', marginTop: 4, marginBottom: 20}]}>
                    忘記密碼？
                </Text>
                <Button onPress={onLoginPress} style={stylesheet.bgGreen} title="登入" />
                <View style={[stylesheet.footerView, {marginBottom: 0}]}>
                    <Text style={stylesheet.footerText}>沒有帳號？<Text onPress={onFooterLinkPress} style={stylesheet.footerLink}>現在註冊</Text></Text>
                </View>
            </View>
            </KeyboardAvoidingView>
            <View style={stylesheet.footerView}>
                <Text style={stylesheet.footerText}>遇到問題嗎？<Text onPress={()=>WebBrowser.openBrowserAsync("https://supr.link/kmc3i")} style={stylesheet.footerLink}>聯絡客服</Text></Text>
            </View>
        </View>
    )
}