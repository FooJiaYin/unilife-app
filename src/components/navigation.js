import React from 'react'
import { StyleSheet, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { stylesheet, styles, Color } from '../styles'
import  Asset from './assets'
import { TransitionSpecs, CardStyleInterpolators } from '@react-navigation/stack';

export const setHeaderOptions = (navigation, options = {}) => {
    if (options.headerLeft == 'back')  {
        options.headerLeft = {
            icon: 'left',
            style: {
                tintColor: options.style? options.style.headerTintColor || Color.grey0 : Color.grey0,
            },
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

const tabBarStyle = (focused) => {
    let color = focused? Color.blue : Color.grey1
    return {
        label: {
            fontSize: 11,
            marginVertical: 8,
            color: focused? Color.blue : Color.grey1,
        },
        icon:{
            width: 26, 
            height: 26, 
            tintColor: color, 
            resizeMode: 'contain',
            marginVertical: 8,
        }
    }
}
export function tabIcon(icon, focused) {
    return (
        <Image
            source={Asset(icon)}
            style={tabBarStyle(focused).icon}
        />
    )
}

export const tabBarOptions = {
    style: {
        paddingBottom: 6,
        paddingTop: 4,
        height: 56
    },
    activeTintColor: Color.blue,
    inactiveTintColor: Color.grey1,
}

export function tabBarObject(title, icon) {
    return {
        title: title,
        // tabBarLabel: ({focused}) => <Text style={tabBarStyle(focused).label}>{title}</Text>,
        tabBarIcon: ({focused}) => tabIcon(icon, focused),
    }
}