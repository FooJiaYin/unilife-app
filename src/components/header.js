import React from 'react'
import { StyleSheet, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { stylesheet, styles, Color } from '../styles'
import  Asset from './assets'
import { TransitionSpecs, CardStyleInterpolators } from '@react-navigation/stack';

export const setHeaderOptions = (navigation, options = {}) => {
    if (options.headerLeft == 'back')  {
        options.headerLeft = {
            icon: 'left',
            onPress: () => navigation.goBack()
        }
        options.cardStyleInterpolator = CardStyleInterpolators.forFadeFromBottomAndroid
    }
    React.useLayoutEffect(() => {
        navigation.setOptions({
            // ...navigation.getOptions(),
            ...headerStyle,
            ...options.style,
            title: options.title,
            headerLeft: () => (<HeaderButton {...options.headerLeft} />),
            headerRight: () => (<HeaderButton {...options.headerRight} />),
        })
    }, [navigation])
}

export const headerStyle = StyleSheet.create({
    headerLeft:{
        backgroundColor: 'transparent',
        fontSize: 16,
        marginHorizontal: 16,
    },
    headerRight:{
        backgroundColor: 'transparent',
        fontSize: 16,
        marginHorizontal: 16,
    },
    headerTitleStyle: {
        ...styles.textDark,
        fontWeight: 'bold',
        alignSelf: 'center' 
    },
    headerStyle: {
        shadowColor: 'transparent',
        borderBottomWidth: 0,
    }
})

export function HeaderButton({title, icon, style, onPress, custom}) {
    return(
        custom? custom : (
            <TouchableOpacity onPress={onPress}>
                {(title)? (
                    <Text style={[headerStyle.headerRight, style]}>{title}</Text>
                ): null}
                {(icon)? (
                    <Image source={Asset(icon)} style={[stylesheet.icon, style]} />
                ): null}
            </TouchableOpacity>
        )
    )
}