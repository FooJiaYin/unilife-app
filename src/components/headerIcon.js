import React, { useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, Image } from 'react-native'
import { styles, Color, stylesheet } from '../styles'
import Asset from './assets'

export function headerIcon ({name, onPress, size=32}){
    const style={
        icon:{
            resizeMode: 'contain',
            width: 32,
            height: 32,
        },
    }
    const iconStyle= StyleSheet.create(style)
    return(
        <TouchableOpacity onPress={onPress}>
            <Image source={Asset(`icons/${name}.png`)} style={iconStyle.icon}/>
        </TouchableOpacity>
    )
}