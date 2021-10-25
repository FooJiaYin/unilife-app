import React, { useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, Image, Share } from 'react-native'
import { styles, Color } from '../styles'
import Asset from './assets'
import * as WebBrowser from 'expo-web-browser';
import { firebase } from '../firebase/config'

export function HomeShortcutItem ({item}){
    // console.log(item.title)
    const storageRef = firebase.storage().ref()
    const [imageUrl, setImageUrl] = useState('')

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
            borderRadius: 1000,
            marginBottom:8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        icon:{
            resizeMode: 'contain',
            height:28,
            width:28,
            tintColor: Color.blue
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

    storageRef.child('icons/' + item.icon).getDownloadURL().then((url) => {
        setImageUrl(url)
    })
    
    function openLink(){
        console.log('openlink', item)
        if (item.share && item.share == true) {
            share(item)
        } else {
        // open url in browser
            if (item.url && item.url != '') {
                WebBrowser.openBrowserAsync(item.url);
                // Linking.openURL(item.url)
            }
        }
    }

    async function share(item) {
        try {
            const result = Share.share({
                message: item.message,
                url: item.url,
            });
        } catch(err) {
            console.log(err)
        }
    }

    return(
        <TouchableOpacity style={homeStyle.item} onPress={()=>openLink()}>
            <View style={homeStyle.round}>
                {item.icon&&<Image style={[homeStyle.icon]} source={{uri: imageUrl}}/>}
            </View>
            <Text style={[homeStyle.title]}>{item.title}</Text>
        </TouchableOpacity>
    )
}
