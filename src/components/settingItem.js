import React, { useState } from 'react'
import { Switch, StyleSheet, View, TouchableOpacity, Text, Image } from 'react-native'
import { styles, Color, stylesheet } from '../styles'
import Asset from './assets'

const style = {
    item:{
        margin: 8,
        flexDirection: 'row',
        justifyContents: 'space-between',
        alignItems: 'center',
        boxSizing: 'borderBox',
    },
    hint:{
        color: Color.blue,
    },
    right:{
        height: 12,
        width: 6,
        resizeMode: 'contain',
    },
    icon:{
        height: 24,
        width: 24,
        resizeMode: 'contain',
        resizeMode: 'cover',
    },
    title:{
        margin: 8,
        color: Color.blue,
        lineHeight: 30,
        fontSize: 20,
        fontWeight: 700,
    },
    section:{
        boxSizing: 'borderBox',
        width: '100%',
        marginVertical: 16,
    },
}
const settingItemStyle = StyleSheet.create(style)

export function SettingItem ({name, type, value, hint, action}){
    var settingControl = null
    switch (type) {
        case 'toggle':
            settingControl = toggle(value,action)
            break;
        case 'open':
            settingControl = open(hint,action)
            break;
        case 'link':
            settingControl = link(hint,action)
            break;
    
        default:
            break;
    }
    return(
        <TouchableOpacity style={settingItemStyle.item} onPress={()=>{
            onPress(index,setSelected)
        }}
        >
            <Text style={[stylesheet.text, {flex: 1}]}>{name}</Text>
            {settingControl}
        </TouchableOpacity>
        )
}

const toggle = (value, onChange) =>
    <Switch
        trackColor={{ false: Color.grey2, true: Color.green }}
        thumbColor={'#fff'}
        onValueChange={onChange}
        value={value}
      />

const open = (hint, onPress) => 
    <TouchableOpacity onPress={onPress}>
        <Text style={settingItemStyle.hint}></Text>
        <Image style={settingItemStyle.right} source={Asset('icons/right.png')}/>
    </TouchableOpacity>

const link = (icon, url) => 
    <TouchableOpacity onPress={()=>Linking.openURL(url)}>
        <Image style={settingItemStyle.icon} source={Asset(`icons/${icon}.png`)}/>
    </TouchableOpacity>


export function SettingSection ({title, ...props}){
    return(
        <View style={settingItemStyle.section}>
            <Text style={[settingItemStyle.title]}>{title}</Text>
            {props.children}
        </View>
    )
}


