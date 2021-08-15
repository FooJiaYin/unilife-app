import React, { useState } from 'react'
import { ImageBackground, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { setHeaderOptions } from '../components/header'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Button } from '../components/forms'
import styles from '../styles/profileStyles'
import { firebase } from '../firebase/config'
import Asset from '../components/assets'
import { stylesheet } from '../styles'

export default function SettingScreen({navigation}) {

    setHeaderOptions(navigation)

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: '#00aebb',
                borderBottomWidth: 0,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            headerTitleStyle: { alignSelf: 'center' },
            headerRight: () => (
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.navigate('Profile')}>
                    <Text style={stylesheet.textWhite}>完成</Text>
                </TouchableOpacity>
            ),
        })
      }, [navigation])

    return (        
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
                        <Button style={[stylesheet.outlineWhite, styles.editButton]} title="編輯頭像" onPress={() => onLoginPress()}/>
                        
                    </ImageBackground>
                </View>
                <View style={styles.container}>
                    <TextInput
                        style={styles.input}
                        placeholder='姓名'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder='暱稱'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder='生日'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder='Email'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholderTextColor="#aaaaaa"
                        secureTextEntry
                        placeholder='密碼'
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholderTextColor="#aaaaaa"
                        secureTextEntry
                        placeholder='再次輸入密碼'
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                </View>
            </KeyboardAwareScrollView>
            
    )
}
