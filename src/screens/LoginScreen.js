import React, { useState, useEffect } from 'react'
import { Platform, Dimension, ImageBackground, Image, Text, Linking, Alert, View } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Asset from '../components/assets'
import { Button, PasswordInput } from '../components/forms'
import { styles } from './LoginScreen/styles'
import { stylesheet } from '../styles'
import { firebase } from '../firebase/config'
import { CurvedBg } from '../components/decorative'
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { LineLoginUrl } from '../api/linelogin';

export default function LoginScreen({navigation, ...props}) {
    const usersRef = firebase.firestore().collection('users')
    const authToken = props.route.params && props.route.params.token
    console.log(props.route.params)

    setHeaderOptions(navigation)

    const lineLogin = () => {
        // WebBrowser.openBrowserAsync(LineLoginUrl)
        Linking.openURL(LineLoginUrl)
    }

    const appleLogin = async () => {
        try {
            const appleCredential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });
            console.log(appleCredential);
            const provider = new firebase.auth.OAuthProvider('apple.com');
            const credential = provider.credential({
                idToken: appleCredential.identityToken, 
                rawNonce: '123456789'
            });
            const response = await firebase.auth().signInWithCredential(credential);
            console.log(response);
            const uid = response.user.uid
            usersRef.doc(uid).get().then(async snapshot => {
                if (!snapshot.exists) {
                    let userInfo = {}
                    if (response.user.providerData[0].email) {
                        userInfo['email'] = response.user.providerData[0].email
                    }
                    await usersRef.doc(uid).set({
                        id: uid,
                        info: userInfo,
                        verification: {
                            status: true,
                            type: 'apple',
                            apple: response.user.providerData[0].uid
                        },               
                        guide: {
                            home: false,
                            intro: false,
                            notification: false,
                        },
                        identity: {
                            communities: [],
                        },
                        interests: [],
                        recommendation: [],
                        bookmarks: [],
                        score: {},
                        settings: {
                            chat: false,
                            inChat: false
                        },
                        createdTime: firebase.firestore.Timestamp.now(),
                        lastActive: firebase.firestore.Timestamp.now()
                    })  
                    usersRef.doc(uid).get().then(snapshot => {
                        navigation.navigate('FillInfo', {user: snapshot})
                    })
                }
                else {
                    const user = snapshot.data()
                    if(user.interests && user.interests.length == 5 && user.identity.communities) {
                        navigation.navigate('Tabs')
                    } else {
                        navigation.navigate('FillInfo', {user: snapshot})
                    }
                }
            })
        // signed in
        } catch (e) {
            if (e.code === 'ERR_CANCELED') {
                // handle that the user canceled the sign-in flow
            } else {
                // handle other errors
                console.log(e)
            }
        }
    }

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false
        })
      }, [navigation])

    useEffect(() => {
    }, [])

    return (
        <View style={{ flex: 1, width: '100%', justifyContent: 'center' }}>
            <ImageBackground source={Asset('bg-login.jpg')} resizeMode="cover" style={styles.bg}>
            </ImageBackground>
            <Image
                style={styles.logo}
                source={Asset('logo_with_text.png')}
            />
            <Button onPress={lineLogin} style={[stylesheet.bgGreen, {marginHorizontal: 50, marginBottom: 10, marginTop: 200}]} title="LINE 登入" />
            {Platform.OS === 'ios' &&
                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={44}
                    style={{ marginHorizontal: 50, marginBottom: 5, borderRadius: 50, height: 44 }}
                    onPress={appleLogin}
                />
            }
            <View style={stylesheet.footerView}>
                <Text style={stylesheet.footerText}>遇到問題嗎？<Text onPress={()=>WebBrowser.openBrowserAsync("https://supr.link/kmc3i")} style={stylesheet.footerLink}>聯絡客服</Text></Text>
            </View>
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
                <Text style={stylesheet.footerText}>需要協助嗎？<Text onPress={()=>WebBrowser.openBrowserAsync("https://supr.link/WMlqU")} style={stylesheet.footerLink}>聯絡客服</Text></Text>
            </View>
            </KeyboardAwareScrollView>
        </View>
    )
}
