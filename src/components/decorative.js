import React, { Children, useState, useRef } from 'react'
import { Dimensions, StyleSheet, View, Image, ImageBackground, Text, ScrollView, Animated } from 'react-native'
import { Directions } from 'react-native-gesture-handler'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { styles, Color, stylesheet} from '../styles'
import Asset from './assets'
import { useScrollToTop } from '@react-navigation/native';
import { headerIcon } from './headerIcon'
import * as copilot from '../components/guide'
// import { PanListenerView,
//   PanningProvider,
//   PanResponderView } from 'react-native-ui-lib'

export function ProfilePicture({user, icon, image, diameter}){
    
    // const userImage = () => {
    //     // TODO: get user profile image here
    //     return Asset('profile-image-0.png')
    // }
    
    const defaultImage = Asset('profile-image-0.png')
    
    // const imageSource = icon?Asset(`${icon}`):user?userImage:defaultImage
    const imageSource = image ? Asset(image) : defaultImage
    
    const profilePictureStyles = StyleSheet.create({
        border:{
            borderWidth: 1,
            borderColor: '#fff',
            borderRadius: 1000,
            position: 'relative',
            padding: 10,
            marginTop: 40,
            margin: 8,
            alignSelf: 'center'
        },
        secondBorder:{
            //position: 'absolute',
            width: '100%',
            height: '100%',
            borderWidth: 4,
            borderColor: '#fff',
            borderRadius: 1000,
            // boxSizing: 'padding-box'
        },
        image:{
            height: '100%',
            width: '100%',
            resizeMode:'contain',
            borderRadius:1000
        },
    })
    return(
        <View style={[profilePictureStyles.border, {height: diameter, width: diameter}]}>
            <View style={[profilePictureStyles.secondBorder]}>
                <Image source={imageSource} style={profilePictureStyles.image}/>
            </View>
        </View>

)}

export function CurvedBg({pureColor = Color.green, image = Asset('topic-1'), height= 300, diameter=400, ...props}){

    const imageSource = image
    const bgstyle = {
        bg:{
            position:'absolute',
            height: diameter,
            width: '200%',
            top:height-diameter,
            marginBottom:height-diameter,
            borderRadius: 1000,
            backgroundColor: pureColor,
        },
        childrenContainer:{
            height: height,
            // boxSizing: 'padding-box',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingVertical: 40
            
        },
        image:{
            alignSelf: 'center',
            // justifySelf: 'flex-end',
            height: 300,
            width: '40%',
            resizeMode:'cover',
            borderRadius:1000,
            // resizeBy: '0 100'
        },
    }
    const curveStyles = StyleSheet.create(bgstyle)
    return(
        <>
            <View style={[curveStyles.bg]}>
            </View>
            <View style={[curveStyles.childrenContainer]}>
                {props.children}
                {image&&<ImageBackground source={imageSource} style={curveStyles.image}/>}
            </View>
        </>
    )
}

export function StickedBg({pureColor=Color.green, image = null, height= 320, ...props}){

    const imageSource = image
    const bgstyle = {
        bg:{
            position:'absolute',
            height: height,
            width: '100%',
            backgroundColor: pureColor,
            zIndex:0,
        },
        image:{
            flex: 1,
            height: height,
            width: '100%',
            right: 0,
            resizeMode:'cover',
            position:'absolute',
            zIndex:10
        },
    }
    const curveStyles = StyleSheet.create(bgstyle)
    return(
        <>
            <View style={[curveStyles.bg]}>
                {image&&<Image source={imageSource} style={[curveStyles.image]}/>}
            </View>
        </>
    )
}

export function ExpandCard({height = 300, ...props}){
    const vh = Dimensions.get('window').height
    const [fixHeader, setFixHeader] = useState(false)
    const [scrolling, setScrolling] = useState(false)
    const insets = useSafeAreaInsets()
    const cardStyle = {
        scrollable:{
           width:'100%',
           flex:1,
           height:vh,// - insets.top,
           position:'absolute',
        //    bottom: 0
        },
        card:{
            marginTop:height,// - insets.top,
            height: vh,// - insets.top,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: '#fff',
        },
        header:{
            width: '100%',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: 64,
            backgroundColor:'#fff',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 20,
            // paddingTop: 20 + insets.top,
            zIndex: 2,
        },
        fixedHeader:{
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            width: '100%',
            height: 56,
            backgroundColor:'#fff',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 20,
            zIndex: 2,
        }
    }
    const curveStyles = StyleSheet.create(cardStyle)
    const scrollY = useRef(new Animated.Value(0)).current

    return(
        <ScrollView
        onScroll={Animated.event(
            // scrollX = e.nativeEvent.contentOffset.x
            [{ nativeEvent: {
                 contentOffset: {
                   y: scrollY
                 }
               }
            }], {
                // useNativeDriver: true,
                listener: event => {
                    if (scrolling != (event.nativeEvent.contentOffset.y > 2)) {
                        setScrolling(event.nativeEvent.contentOffset.y > 2)
                    }
                // do something special
                },
            },
        )}
        scrollEventThrottle={16}
        style={[curveStyles.scrollable,{zIndex:(scrolling?3:1)}]}>
            <copilot.Step
                text="報你知與你有關的校園資訊，或是你可能會感興趣的資訊～"
                order={3}
                name="article"
                >
            <copilot.View style={[curveStyles.card]}>
            {/* {fixHeader? <SafeAreaView /> : null} */}
                <copilot.Step
                    text="往上滑可以開啟文章列表；按住Uni資訊往下滑就會回到首頁囉～"
                    order={4}
                    name="articletab"
                    >
                <copilot.AnimatedView style={[curveStyles.header, {paddingTop: scrollY.interpolate({
                    inputRange: [0, height - 80, height],
                    outputRange: [20, 20, insets.top + 20],
                }) }]}>
                    <Text style={[stylesheet.headerText]}>Uni資訊</Text>
                </copilot.AnimatedView>
                </copilot.Step>
                    {props.children}
            </copilot.View>
            </copilot.Step>
        </ScrollView>
    )

}