import React, { useState } from 'react'
import { Image, Text, TextInput, TouchableOpacity, View , Button} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { stylesheet } from '../styles/styles'
import { firebase } from '../firebase/config'

export default function RegistrationScreen({navigation}) {
    const usersRef = firebase.firestore().collection('users')
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [name, setName] = useState('')
    const [nickname, setNickname] = useState('')
    const [birthday, setBirthday] = useState('')
    const [agree, setAgree] = useState(false)

    // const myStyle = StyleSheet.create({
    //     input: {
            
    //     }
    // })

    // const [checkbox, setCheckbox] = useState('')

    const onFooterLinkPress = () => {
        navigation.navigate('Login')
    }

    const onRegisterPress = () => {
        if (password !== confirmPassword) {
            alert("確認密碼不相符！")
            return
        }
        let checkbox = true
        if (!checkbox) {
            alert("確認密碼不相符！")
            return
        }
    
        firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then((response) => {
                const uid = response.user.uid
                const data = {
                    id: uid,
                    info: {
                        email,
                        name,
                        nickname,
                        birthday
                    },
                    identity: {
                        community: firebase.firestore().doc('/communities/nthu/'),
                        grade: 1,
                        department: firebase.firestore().doc('/communities/nthu/departments/computerScience'),
                    },
                    verification: {
                        type: "file",
                        status: true
                    }
                }
                usersRef
                    .doc(uid)
                    .set(data)
                    .then(() => {
                        navigation.navigate('HomeStack', {user: data})
                    })
                    .catch((error) => {
                        alert(error)
                    })
            })
            .catch((error) => {
                alert(error)
        })
    }
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: 'white',
                borderBottomWidth: 0,
            },
            headerTintColor: '#fff',
            headerTitleStyle: { 
                fontWeight: 'bold',
                alignSelf: 'center' ,
                color:'#4A4D57'
            },
        })
      }, [navigation])

    return (
        <View style={stylesheet.container}>
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%', height:'100%'}}
                keyboardShouldPersistTaps="always">
                <TextInput
                    style={stylesheet.input}
                    placeholder='姓名'
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(text) => setName(text)}
                    value={name}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <TextInput
                    style={stylesheet.input}
                    placeholder='暱稱'
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(text) => setNickname(text)}
                    value={nickname}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <TextInput
                    style={stylesheet.input}
                    placeholder='生日'
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(text) => setBirthday(text)}
                    value={birthday}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <TextInput
                    style={stylesheet.input}
                    placeholder='Email'
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <TextInput
                    style={stylesheet.input}
                    placeholderTextColor="#aaaaaa"
                    secureTextEntry
                    placeholder='密碼'
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
                 <View style={{height: 100}} />
                <View style={stylesheet.footerView}>
                    <Text style={stylesheet.footerText}>
                    <Button
                        onPress={()=>setAgree(true)}
                        color={agree?'#00aebb':'#e2e3e4'}>
                                v
                        </Button>
                        
                        我同意 
                        <Text onPress={onFooterLinkPress} style={stylesheet.footerLink}>UniLife個資授權書與使用者條款</Text>
                    </Text>
                </View>
                <TouchableOpacity
                    style={stylesheet.button}
                    onPress={() => onRegisterPress()}>
                    <Text style={stylesheet.buttonTitle}>註冊</Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </View>
    )
}
