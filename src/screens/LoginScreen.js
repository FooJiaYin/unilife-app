import React, { useState, useEffect } from 'react'
import { Dimension, ImageBackground, Image, Text, Linking, Alert, View } from 'react-native'
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

export default function LoginScreen({navigation, ...props}) {
    const usersRef = firebase.firestore().collection('users')
    const authToken = props.route.params && props.route.params.token
    console.log(props.route.params)

    setHeaderOptions(navigation)

    const onLoginPress = () => {
        // WebBrowser.openBrowserAsync(LineLoginUrl)
        Linking.openURL(LineLoginUrl)
    }

    const login = (token) => {
        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then((response) => {
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
                            navigation.navigate('Home')
                        } else {
                            navigation.navigate('FillInfo', {user: snapshot})
                        }
                    })
                    .catch(error => {
                        alert(error)
                    })
            })
            .catch(error => {
                if(error.code == 'auth/user-not-found' || error.code == 'auth/invalid-email') Alert.alert("該用戶不存在", "請檢查您輸入的信箱是否與註冊信箱相同。如需更改信箱，請洽客服協助。")
                else if(error.code == 'auth/wrong-password') Alert.alert("密碼錯誤", "請檢查您輸入的密碼是否正確。")
                else Alert.alert(error)
            })
    }

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false
        })
      }, [navigation])
    return (
        <View style={{ flex: 1, width: '100%', justifyContent: 'center' }}>
            <ImageBackground source={Asset('bg-login.jpg')} resizeMode="cover" style={styles.bg}>
            </ImageBackground>
            <Image
                style={styles.logo}
                source={Asset('logo_with_text.png')}
            />
            <Button onPress={() => onLoginPress()} style={[stylesheet.bgGreen, {margin: 60, marginTop: 200}]} title="LINE 登入" />
        </View>
    )
}

export function ResetPasswordScreen({navigation}) {
    const usersRef = firebase.firestore().collection('users')
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [resetPassword, setResetPassword] = useState(false)

    setHeaderOptions(navigation)

    const sendPasswordResetEmail = () => {
        firebase.auth().sendPasswordResetEmail(email, null)
        .then(function() {
            // Password reset email sent.
            Alert.alert("重置密碼郵件已發送", "請前往信箱點擊連結，重設您的密碼")
        })
        .catch(function(error) {
            if(error.code == 'auth/user-not-found' || error.code == 'auth/invalid-email') Alert.alert("該用戶不存在", "請檢查您輸入的信箱是否與註冊信箱相同。如需更改信箱，請洽客服協助。")
            console.log(error)
        // Error occurred. Inspect error.code.
        });
    }

    const onFooterLinkPress = () => {
        navigation.navigate('Registration')
        // WebBrowser.openBrowserAsync('https://supr.link/kmbjI');
        // Linking.openURL('https://supr.link/kmbjI')
    }

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false
        })
      }, [navigation])
    return (
        <View style={{ flex: 1, width: '100%', justifyContent: 'center' }}>
            <ImageBackground source={Asset('bg-login.jpg')} resizeMode="cover" style={styles.bg}>
            </ImageBackground>
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%'}}>
            <Image
                style={styles.logo}
                source={Asset('logo_with_text.png')}
            />
            <View style={styles.card}>
                <TextInput
                    style={[styles.input]}
                    placeholder='Email'
                    placeholderTextColor="#aaaaaa"
                    // defaultValue={'student@test.com'}
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <Button onPress={sendPasswordResetEmail} style={stylesheet.bgGreen} title="重設密碼" />
            </View>
            <View style={stylesheet.footerView}>
                <Text style={stylesheet.footerText}>需要協助嗎？<Text onPress={()=>WebBrowser.openBrowserAsync("https://supr.link/znUbr")} style={stylesheet.footerLink}>聯絡客服</Text></Text>
            </View>
            </KeyboardAwareScrollView>
        </View>
    )
}
