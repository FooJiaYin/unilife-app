import React, { useState, useEffect, useCallback } from 'react'
import { ImageBackground, Image, Text, Linking, TouchableOpacity, View, TouchableHighlight, StyleSheet } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { setHeaderOptions } from '../components/navigation'
import { Button } from '../components/forms'
import Asset from '../components/assets'
import { firebase } from '../firebase/config'
import { CurveMaskedTop, CurvedBg } from '../components/decorative'
import { DecoratedProfileImage } from '../components/profileImage'
import { Color, stylesheet } from '../styles'


export default function SuccessScreen(props) {

    const options = {
        title: '',
        style: {
            headerStyle: {
                backgroundColor: Color.green,
                borderBottomWidth: 0,
            },
            headerTintColor: '#fff'
        },
        headerLeft: 'back',
    }
    setHeaderOptions(props.navigation, options)

    const screenStyle = StyleSheet.create({
        outlineButton:{
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#fff',
        marginVertical:8,
    },
    desc:{
        position:'relative',
        flex: 1,
        flexGrow: 1,
        // flexShrink: 0,
        // height: 60,
        justifyContent:'flex-end',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 60,
    },
    bottomButton:{
        marginTop: 40,
        // marginHorizontal: 20,
        paddingHorizontal: 60,
        flexShrink: 0,
        flexGrow: 0,
        // height: 60,
        backgroundColor: Color.blue,
        width: 320,
    }
    })
    

    const [info, setInfo] = useState({})
    const [verification, setVerification] = useState({})
    const [lineImage, setLineImage] = useState(undefined)
    const user = props.user || props.route.params.user

    async function loadUserData() {
        // console.log("user", user)
        // console.log("identity", user.identity.community)
        let snapshot = await user.ref.get()
        let data = await snapshot.data()
     // console.log(user)
        setInfo(data.info)
        if(data.info.profileImage && data.info.profileImage.startsWith("https://")) {
            setLineImage(data.info.profileImage)
        }
        setVerification(data.verification)
    }

    const updateUserData = useCallback( async () => {
        // console.log(info)
        await user.ref.update({
            info: info
        })
    }, [info])

    
    function changeProfileImage() {
        console.log(info.profileImage)
        console.log(lineImage)
        let currentId = (info.profileImage == "profile-image-0.png")? 0 : 
                        (info.profileImage == "profile-image-1.png")? 1 : 
                        (info.profileImage == "profile-image-2.png")? 2 : 3
        currentId = (currentId + 1) % (lineImage? 4 : 3)
        let image = currentId < 3? "profile-image-" + currentId + ".png" : lineImage
        setInfo({ ...info, profileImage: image })
        // updateUserData()
    }
    
    useEffect(() => {
        loadUserData()
    }, [])
    
    async function onStartPress() {
        await updateUserData()
        props.navigation.navigate('Tabs')
    }

    async function onVerifyPress() {
        await updateUserData()
        props.navigation.navigate('Verification', {user: user})
        // Linking.openURL("https://supr.link/RWZbE")
        // props.navigation.navigate('Tabs')
    }

    return (
            
        <View style={stylesheet.container}>
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%', height:'100%'}}
                keyboardShouldPersistTaps="always">
            <View style={stylesheet.bgGreen}>
                <DecoratedProfileImage image={info.profileImage} diameter={160}/>
            </View>
            <ImageBackground source={Asset('bg-profile.jpg')} resizeMode="cover" style={[stylesheet.bg]}>
                <Button 
                    style={[screenStyle.outlineButton, {alignSelf: 'center', marginBottom: 30}]} 
                    title="切換頭像"
                    onPress={() => changeProfileImage()}
                />
            </ImageBackground>
            <View style={screenStyle.desc}>
                <Text style={stylesheet.articleTitle}>註冊成功！</Text>
                { verification.status == true?
                <>
                    <Text style={[stylesheet.text, {flex:1, flexGrow: 1}]}>恭喜！你已成功註冊UniLife帳號！</Text>
                    <Button 
                        title='觀看使用導覽' 
                        style={screenStyle.bottomButton}
                        onPress={() => onStartPress()} 
                    /> 
                </> : <>
                    <Text style={[stylesheet.text, {flex:1, flexGrow: 1}]}>馬上前往驗證，開通聊天、留言功能！</Text>
                    <Button 
                        title='前往驗證' 
                        style={screenStyle.bottomButton}
                        onPress={() => onVerifyPress()} 
                    /> 
                </>}
            </View>
            </KeyboardAwareScrollView>
        </View>
            
    )
}
