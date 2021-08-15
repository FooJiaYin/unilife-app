import React, { Children, useState, useRef } from 'react'
import { Dimensions, StyleSheet, View, Image, ImageBackground, Text, ScrollView } from 'react-native'
import { Directions } from 'react-native-gesture-handler'
import { styles, Color, stylesheet} from '../styles'
import Asset from './assets'
import { useScrollToTop } from '@react-navigation/native';
import { headerIcon } from './headerIcon'
// import { PanListenerView,
//   PanningProvider,
//   PanResponderView } from 'react-native-ui-lib'

export function ProfilePicture({user, icon, borderStyle, diameter}){
    
    const userImage = () => {
        // TODO: get user profile image here
        return Asset('profile-image-0.png')
    }
    
    const defaultImage = Asset('profile-image-1.png')
    
    const imageSource = icon?Asset(`icons/${icon}`):user?userImage:defaultImage
    
    const profilePictureStyles = StyleSheet.create({
        border:{
            borderWidth: 1,
            borderColor: '#fff',
            borderRadius: '100%',
            position: 'relative',
            padding: 10,
            margin: 8,
            
        },
        secondBorder:{
            //position: 'absolute',
            width: '100%',
            height: '100%',
            borderWidth: 4,
            borderColor: '#fff',
            borderRadius: '100%',
            boxSizing: 'padding-box'
        },
        image:{
            height: '100%',
            width: '100%',
            resizeMode:'contain',
            borderRadius:'100%'
        },
    })
    return(
        <View style={[profilePictureStyles.border, {height: diameter, width: diameter}]}>
            <View style={[profilePictureStyles.secondBorder]}>
                <Image source={imageSource} style={profilePictureStyles.image}/>
            </View>
        </View>

)}

export function CurvedBg({pureColor = Color.green, image = Asset('topics/cover_1.jpg'), height= 300, diameter=400, ...props}){

    const imageSource = image
    const bgstyle = {
        bg:{
            position:'absolute',
            height: diameter,
            width: '200%',
            top:height-diameter,
            marginBottom:height-diameter,
            borderRadius: '100%',
            backgroundColor: pureColor,
        },
        childrenContainer:{
            height: height,
            boxSizing: 'padding-box',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingVertical: 40
            
        },
        image:{
            alignSelf: 'center',
            justifySelf: 'flex-end',
            height: 300,
            width: '40%',
            resizeMode:'cover',
            borderRadius:'100% 0 0 0',
            resizeBy: '0 100'
        },
    }
    const curveStyles = StyleSheet.create(bgstyle)
    return(
        <>
            <View style={[curveStyles.bg]}>
            </View>
            <View style={[curveStyles.childrenContainer]}>
                {props.children}
                {image&&<ImageBackground source={imageSource} imageStyle={curveStyles.image}/>}
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
            resizeMode:'cover',
            position:'absolute',
        },
    }
    const curveStyles = StyleSheet.create(bgstyle)
    return(
        <>
            <View style={[curveStyles.bg]}>
                {image&&<Image source={imageSource} imageStyle={[curveStyles.image,{ zIndex:10}]}/>}
            </View>
        </>
    )
}

export function ExpandCard({height = 320, ...props}){
    const vh = Dimensions.get('window').height
    const [fixHeader, setFixHeader] = useState(false)
    const [scrolling, setScrolling] = useState(false)
    const cardStyle = {
        scrollable:{
           width:'100%',
           flex:1,
           height:vh,
           position:'absolute',
        },
        card:{
            marginTop:height-20,
            paddingBottom: 60,
            height: vh,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: '#fff'
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
    return(
        <ScrollView
        onScroll={({nativeEvent})=>{
            if(scrolling==(nativeEvent.contentOffset.y==0)){
                setScrolling(!scrolling)
            }else if(fixHeader==(nativeEvent.contentOffset.y<height-20)){
                setFixHeader(!fixHeader)
            }
        }}
        scrollEventThrottle={16}
        style={[curveStyles.scrollable,{zIndex:(scrolling?3:1)}]}>
            <View style={[curveStyles.card]}>
                <View style={fixHeader?curveStyles.fixedHeader:curveStyles.header}>
                    <Text style={stylesheet.headerText}>Uni資訊</Text>
                </View>
                {props.children}
            </View>
        </ScrollView>
    )

}