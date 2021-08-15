import React, { useState } from 'react'
import { ImageBackground, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { setHeaderOptions } from '../components/header'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Asset from '../components/assets'
import { Button } from '../components/forms'
import { styles } from './LoginScreen/styles'
import { stylesheet } from '../styles'
import { firebase } from '../firebase/config'

export default function LoginScreen({navigation}) {
    const usersRef = firebase.firestore().collection('users')
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    setHeaderOptions(navigation)

    const onFooterLinkPress = () => {
        navigation.navigate('Registration')
    }
    
    const onLoginPress = () => {
        navigation.navigate('Profile')

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
                        navigation.navigate('FillInfo', {user: user})
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
            <ImageBackground source={Asset('bg-login.jpg')} resizeMode="cover" style={styles.bg}>
        <View  style={styles.container}>
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%'}}
                keyboardShouldPersistTaps="always">
                    {/* <View style={{ flex: 1, width: '100%', justifyContent: 'space-around' }}> */}
                <Image
                    style={styles.logo}
                    source={Asset('logo_with_text.png')}
                />
                <View style={styles.card}>
                    <TextInput
                        style={styles.input}
                        placeholder='E-mail'
                        placeholderTextColor="#aaaaaa"
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholderTextColor="#aaaaaa"
                        secureTextEntry
                        placeholder='Password'
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                    <Button onPress={() => onLoginPress()} style={stylesheet.bgGreen} title="登入" />
                </View>
                <View style={styles.footerView}>
                    <Text style={styles.footerText}>Don't have an account? <Text onPress={onFooterLinkPress} style={styles.footerLink}>Sign up</Text></Text>
                </View>
                {/* </View> */}
            </KeyboardAwareScrollView>
        </View>
            </ImageBackground>
    )
}
