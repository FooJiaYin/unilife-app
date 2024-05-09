import React, { useState, useEffect } from 'react'
import { Platform, Dimension, ImageBackground, Image, Text, Linking, Alert, View } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import Asset from '../components/assets'
import { Button, PasswordInput } from '../components/forms'
import { styles } from './LoginScreen/styles'
import { stylesheet } from '../styles'
import { firebase } from '../firebase/config'
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { LineLoginUrl } from '../api/linelogin';

export default function LoginScreen({navigation, ...props}) {
    const usersRef = firebase.firestore().collection('users')
    const authToken = props.route.params && props.route.params.token
    // console.log(props.route.params)

    setHeaderOptions(navigation)

    const lineLogin = () => {
        // WebBrowser.openBrowserAsync(LineLoginUrl)
        Linking.openURL(LineLoginUrl)
    }

    const emailLogin = () => {
        navigation.navigate('EmailLogin', props)
    }

    const appleLogin = async () => {
        try {
            const appleCredential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });
            // console.log(appleCredential);
            const provider = new firebase.auth.OAuthProvider('apple.com');
            const credential = provider.credential({
                idToken: appleCredential.identityToken, 
                rawNonce: '123456789'
            });
            const response = await firebase.auth().signInWithCredential(credential);
            // console.log(response);
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
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Tabs' }],
                        })
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

    const startTrial = () => {
        navigation.replace('Tabs')
        navigation.navigate('Intro', { anonymous: true })
    }

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false
        })
      }, [navigation])

    useEffect(() => {
    }, [])

    return (
        <View style={{ display: "flex", flex: 1, width: '100%', flexDirection: "column" }}>
            <ImageBackground source={Asset('bg-login.jpg')} resizeMode="cover" style={styles.bg}>
            </ImageBackground>
            <View style={{flex: 1}} />
            <Image
                style={styles.logo}
                source={Asset('logo_with_text.png')}
            />
            <View style={{flex: 1}} />
            <Button onPress={startTrial} style={[stylesheet.bgGreen, {marginHorizontal: 50, marginBottom: 10, height: 80}]} title="點擊試用，認識UniLife" />
            <Button onPress={lineLogin} style={[stylesheet.bgBlue, {marginHorizontal: 50, marginBottom: 10}]} title="LINE 註冊/登入" />
            <Button onPress={emailLogin} style={[stylesheet.bgBlue, {marginHorizontal: 50, marginBottom: 10}]} title="Email 註冊/登入" />
            {Platform.OS === 'ios' &&
                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={44}
                    style={{ marginHorizontal: 50, marginTop: 5, borderRadius: 50, height: 44 }}
                    onPress={appleLogin}
                />
            }
            <View style={stylesheet.footerView}>
            {Platform.OS === 'ios' && 
                <Text style={[stylesheet.footerText, stylesheet.textGrey]}>一鍵快速登入/註冊</Text>
            }
            {Platform.OS === 'ios' && 
                <Text style={[stylesheet.footerText, stylesheet.textGrey]}>為您客製化在地社群資訊</Text>
            }
                <Text></Text>
                <Text style={stylesheet.footerText}>遇到問題嗎？<Text onPress={()=>WebBrowser.openBrowserAsync("https://supr.link/kmc3i")} style={stylesheet.footerLink}>聯絡客服</Text></Text>
            </View>
        </View>
    )
}