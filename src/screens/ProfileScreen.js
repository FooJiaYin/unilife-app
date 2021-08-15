import React, { useEffect, useState, useCallback } from 'react'
import { ImageBackground, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { setHeaderOptions } from '../components/header'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Button } from '../components/forms'
import styles from '../styles/profileStyles'
import { firebase } from '../firebase/config'
import Asset from '../components/assets'
import { stylesheet, Color } from '../styles'

// export default function ProfileScreen(props) {
//     const [info, setInfo] = useState({})
//     const [name, setName] = useState({})

//     const options = {
//         title: '編輯賬戶',
//         style: {
//             headerStyle: {
//                 backgroundColor: '#00aebb',
//                 borderBottomWidth: 0,
//             },
//             headerTintColor: '#fff',
//             headerTitleStyle: {
//                 fontWeight: 'bold',
//                 alignSelf: 'center',
//                 color: Color.white,
//             }
//         },
//         headerLeft: {
//             icon: 'left',
//             style: {
//                 tintColor: Color.white
//             },
//             onPress: () => props.navigation.goBack()
//         },
//         headerRight: {
//             title: '完成',
//             style: styles.headerRight,
//             onPress: () => console.log(name)
//         }
//     }
//     setHeaderOptions(props.navigation, options)

//     async function loadUserData() {
//         // console.log("community", user.community)
//         // console.log("identity", user.identity.community)
//         let snapshot = await props.user.ref.get()
//         let user = await snapshot.data()
//         console.log(user)
//         setInfo(user.info)
//     }

//     async function updateUserData() {
//         await props.user.ref.update({
//             info: info
//         })
//     }

//     useEffect(() => {
//         loadUserData()
//     }, [])

//     return (
//         <KeyboardAwareScrollView
//             style={{ flex: 1, width: '100%' ,backgroundColor: 'white'}}
//             keyboardShouldPersistTaps="always">
//             <View style={styles.green}>
//                 <Image
//                     style={styles.propic}
//                     source={Asset('default-propic.png')}/>
//             </View>
//             <View>
//                 <ImageBackground source={Asset('bg-profile.jpg')} resizeMode="cover" style={styles.bg}>
//                     <Button style={[stylesheet.outlineWhite, styles.editButton]} title="切換頭像" onPress={() => onLoginPress()}/>
                    
//                 </ImageBackground>
//             </View>
//             <View style={styles.container}>
//                 <TextInput
//                     style={styles.input}
//                     defaultValue={info.name}
//                     placeholder='姓名'
//                     placeholderTextColor="#aaaaaa"
//                     underlineColorAndroid="transparent"
//                     autoCapitalize="none"
//                     onChangeText={(text) => setName(text)}
//                 />
//                 <TextInput
//                     style={styles.input}
//                     defaultValue={info.nickname}
//                     placeholder='暱稱'
//                     placeholderTextColor="#aaaaaa"
//                     underlineColorAndroid="transparent"
//                     autoCapitalize="none"
//                     onChangeText={(input) => setInfo({ ...info, nickname: input })}
//                 />
//                 <TextInput
//                     style={styles.input}
//                     defaultValue={info.birthday}
//                     placeholder='生日'
//                     placeholderTextColor="#aaaaaa"
//                     underlineColorAndroid="transparent"
//                     autoCapitalize="none"
//                     onChangeText={(input) => setInfo({ ...info, birthday: input })}
//                 />
//                 <TextInput
//                     style={styles.input}
//                     defaultValue={info.email}
//                     placeholder='Email'
//                     placeholderTextColor="#aaaaaa"
//                     underlineColorAndroid="transparent"
//                     autoCapitalize="none"
//                     onChangeText={(input) => setInfo({ ...info, email: input })}
//                 />
//                 {/* <TextInput
//                     style={styles.input}
//                     placeholderTextColor="#aaaaaa"
//                     secureTextEntry
//                     placeholder='密碼'
//                     underlineColorAndroid="transparent"
//                     autoCapitalize="none"
//                 />
//                 <TextInput
//                     style={styles.input}
//                     placeholderTextColor="#aaaaaa"
//                     secureTextEntry
//                     placeholder='再次輸入密碼'
//                     underlineColorAndroid="transparent"
//                     autoCapitalize="none"
//                 /> */}
//             </View>
//         </KeyboardAwareScrollView>
//     )
// }

export default function ProfileScreen(props) {
    const [info, setInfo] = useState({})

    const options = {
        title: '編輯賬戶',
        style: {
            headerStyle: {
                backgroundColor: '#00aebb',
                borderBottomWidth: 0,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
                alignSelf: 'center',
                color: Color.white,
            }
        },
        headerLeft: {
            icon: 'left',
            style: {
                tintColor: Color.white
            },
            onPress: () => props.navigation.goBack()
        },
    }
    setHeaderOptions(props.navigation, options)

    async function loadUserData() {
        // console.log("community", user.community)
        // console.log("identity", user.identity.community)
        let snapshot = await props.user.ref.get()
        let user = await snapshot.data()
        console.log(user)
        setInfo(user.info)
    }

    const updateUserData = useCallback( async () => {
        console.log(info)
        await props.user.ref.update({
            info: info
        })
    }, [info])

    useEffect(() => {
        loadUserData()
    }, [])

    return (
        <View style={stylesheet.container}>
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%' ,backgroundColor: 'white'}}
                keyboardShouldPersistTaps="always">
                <View style={styles.green}>
                    <Image
                        style={styles.propic}
                        source={Asset('default-propic.png')}/>
                </View>
                <View>
                    <ImageBackground source={Asset('bg-profile.jpg')} resizeMode="cover" style={styles.bg}>
                        <Button style={[stylesheet.outlineWhite, styles.editButton]} title="切換頭像" onPress={() => onLoginPress()}/>
                        
                    </ImageBackground>
                </View>
                <View style={styles.container}>
                    <TextInput
                        style={styles.input}
                        defaultValue={info.name}
                        placeholder='姓名'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        onChangeText={(input) => setInfo({ ...info, name: input })}
                    />
                    <TextInput
                        style={styles.input}
                        defaultValue={info.nickname}
                        placeholder='暱稱'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        onChangeText={(input) => setInfo({ ...info, nickname: input })}
                    />
                    <TextInput
                        style={styles.input}
                        defaultValue={info.birthday}
                        placeholder='生日'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        onChangeText={(input) => setInfo({ ...info, birthday: input })}
                    />
                    <TextInput
                        style={styles.input}
                        defaultValue={info.email}
                        placeholder='Email'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        onChangeText={(input) => setInfo({ ...info, email: input })}
                    />
                    <Button
                        style={stylesheet.bgGreen}
                        onPress={() => updateUserData()} 
                        title='儲存'
                    />
                </View>
                 
            </KeyboardAwareScrollView>
        </View>
    )
}

