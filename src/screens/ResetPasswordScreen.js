import React, { useState } from 'react'
import { ImageBackground, Image, Text, TextInput, Linking, Alert, View, KeyboardAvoidingView} from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import Asset from '../components/assets'
import { Button } from '../components/forms'
import { styles } from './LoginScreen/styles'
import { stylesheet } from '../styles'
import { firebase } from '../firebase/config'
import * as WebBrowser from 'expo-web-browser';

export default function ResetPasswordScreen({navigation}) {
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

    // React.useLayoutEffect(() => {
    //     navigation.setOptions({
    //         headerShown: false
    //     })
    //   }, [navigation])

    const headerOptions = {
        title: '忘記密碼',
        headerLeft: 'back'
    }
    setHeaderOptions(navigation, headerOptions)

    return (
        <View style={{ flex: 1, width: '100%', justifyContent: 'center' }}>
            <ImageBackground source={Asset('bg-login.jpg')} resizeMode="cover" style={styles.bg}>
            </ImageBackground>
            {/* <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%' }}> */}
            <Image
                style={[styles.logo, {marginBottom: 40}]}
                source={Asset('logo_with_text.png')}
            />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : ""}>
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
            </KeyboardAvoidingView>
        </View>
    )
}
