import React, { useState } from 'react'
import { Dimension, ImageBackground, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
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
        // navigation.navigate('Registration')
        WebBrowser.openBrowserAsync('https://supr.link/kmbjI');
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
                    .then(doc => {
                        if (!doc.exists) {
                            alert("User does not exist anymore.")
                            return
                        }
                        const user = doc.data()
                        if(user.interests && user.interests.length == 5) {
                            navigation.navigate('Tabs')
                        } else {
                            navigation.navigate('FillInfo', {user: doc})
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
                    placeholder='邀請碼'
                    // defaultValue={'password'}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <Button onPress={() => onLoginPress()} style={stylesheet.bgGreen} title="登入" />
            </View>
            <View style={styles.footerView}>
                <Text style={styles.footerText}>沒有邀請碼？<Text onPress={onFooterLinkPress} style={styles.footerLink}>預約試用</Text></Text>
            </View>
            </KeyboardAwareScrollView>
        </View>
    )
}
