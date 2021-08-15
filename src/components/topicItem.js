import React, { useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, Image } from 'react-native'
import { styles, Color } from '../styles'
import Asset from './assets'

export function TopicItem ({item, index, onPress=()=>null, initSelected=false}){
    const [selected, setSelected] = useState(initSelected)
    const topicItemStyle = StyleSheet.create({
        topicItem:{
            flex: 1,
            borderRadius: 8,
            height:72,
            margin:4,
        },
        cover:{
            resizeMode: 'cover',
            position:'absolute',
            top: 0,
            bottom: 0,
            height: '100%',
            width: '100%',
            borderRadius: 8,
        },
        
        text:{
            margin: 4,
            color: '#fff',
            fontWeight: 700
        }
    })
    console.log(topicItemStyle)
    return(
        <TouchableOpacity style={topicItemStyle.topicItem} onPress={()=>{
            onPress(index,setSelected)
        }}
        >
            <Image style={[topicItemStyle.cover, {zIndex:1}]} source={Asset(`topics/cover_${index+1}.jpg`)}/>
            <Image style={[topicItemStyle.cover, {zIndex:2}]} source={Asset(`topics/overlay${selected?'_selected':''}.png`)}/>
            <Text style={[topicItemStyle.text, {zIndex:3}]}>{item}</Text>
        </TouchableOpacity>
        )
    }