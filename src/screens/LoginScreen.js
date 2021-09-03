import React, { useState } from 'react'
import { Dimension, ImageBackground, Image, Text, TextInput, Alert, View } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Asset from '../components/assets'
import { Button } from '../components/forms'
import { styles } from './LoginScreen/styles'
import { stylesheet } from '../styles'
import { firebase } from '../firebase/config'
import { CurvedBg } from '../components/decorative'
import * as WebBrowser from 'expo-web-browser';

export default function LoginScreen({navigation}) {
    const usersRef = firebase.firestore().collection('users')
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    setHeaderOptions(navigation)

    const onFooterLinkPress = () => {
        navigation.navigate('Registration')
        // WebBrowser.openBrowserAsync('https://supr.link/kmbjI');
        // Linking.openURL('https://supr.link/kmbjI')
    }

    const onLoginPress = () => {
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
                alert(error)
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
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%'}}>
            <Image
                style={styles.logo}
                source={Asset('logo_with_text.png')}
            />
            <View style={styles.card}>
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
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#aaaaaa"
                    secureTextEntry
                    placeholder='密碼'
                    // defaultValue={'password'}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <Button onPress={() => onLoginPress()} style={stylesheet.bgGreen} title="登入" />
            </View>
            <View style={stylesheet.footerView}>
                <Text style={stylesheet.footerText}>沒有帳號？<Text onPress={onFooterLinkPress} style={stylesheet.footerLink}>現在註冊</Text></Text>
            </View>
            </KeyboardAwareScrollView>
        </View>
    )
}
