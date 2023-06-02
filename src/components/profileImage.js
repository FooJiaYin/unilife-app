import React from 'react'
import { View, Image, StyleSheet } from 'react-native'
import Asset from '../components/assets'
import { stylesheet, Color } from '../styles'

export function ProfileImage({source, ...props}) {
    return (
    <Image 
        style={props.style} 
        source={source? 
            source.startsWith("https://")? 
                {uri: source} : 
                Asset(source) : 
            Asset('profile-image-0.png')
        } 
    />
    )
}

export function DecoratedProfileImage({user, icon, image, diameter}){
    
    // const userImage = () => {
    //     // TODO: get user profile image here
    //     return Asset('profile-image-0.png')
    // }
    
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
                <ProfileImage style={profilePictureStyles.image} source={image} />
            </View>
        </View>

)}