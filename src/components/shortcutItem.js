import React, { useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, Image, Linking } from 'react-native'
import { styles, Color } from '../styles'
import Asset from './assets'

export function HomeShortcutItem ({item}){
    // console.log(item.title)
    const homeStyle = StyleSheet.create({
        item:{
            alignItems:'center',
            justifyContent:'flex-start',
            flex:1,
        },
        round:{
            backgroundColor: '#ffffffee',
            height: 56,
            width: 56,
            borderRadius: '100%',
            marginBottom:8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        icon:{
            resizeMode: 'contain',
            height:28,
            width:28
        },
        title:{
            margin: 4,
            color: '#fff',
            fontSize: 12,
            lineHeight: 16,
            width:'100%',
            textAlign: 'center',
        }
    })
    
    function openLink(){
        // open url in browser
        Linking.openURL(item.url)
    }

    return(
        <TouchableOpacity style={homeStyle.item} onPress={()=>openLink()}>
            <View style={homeStyle.round}>
                {item.icon&&<Image style={[homeStyle.icon]} source={Asset(`icons/${item.icon}.png`)}/>}
            </View>
            <Text style={[homeStyle.title]}>{item.title}</Text>
        </TouchableOpacity>
    )
}
