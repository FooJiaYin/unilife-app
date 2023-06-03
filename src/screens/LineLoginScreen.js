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

export default function LineLoginScreen({navigation, ...props}) {
    const usersRef = firebase.firestore().collection('users')
    const authToken = props.route.params && props.route.params.token
    console.log(props.route.params)

    setHeaderOptions(navigation)

    const onLoginPress = () => {
        // WebBrowser.openBrowserAsync(LineLoginUrl)
        Linking.openURL(LineLoginUrl)
        // console.log("hello hello")
    }

    const login = (token) => {
        console.log(token)
        firebase
            .auth()
            .signInWithCustomToken(token)
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
                        if(user.interests && user.interests.length == 5 && user.identity.communities) {
                            navigation.navigate('Tabs')
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
            <Button onPress={() => {}} style={[stylesheet.bgLightGrey, {marginHorizontal: 50, marginBottom: 5, marginTop: 200}]} title="LINE 登入中..." />
            <View style={stylesheet.footerView}>
                <Text style={stylesheet.footerText}>遇到問題嗎？<Text onPress={()=>WebBrowser.openBrowserAsync("https://supr.link/kmc3i")} style={stylesheet.footerLink}>聯絡客服</Text></Text>
            </View>
        </View>
    )
}
