import React from 'react'
import { StyleSheet, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { stylesheet, styles, Color } from '../styles'
import  Asset from './assets'
import { TransitionSpecs, CardStyleInterpolators } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
        navigation.setOptions(
            options.headerShown == false? options : 
            options.titleLeft? {
                title: "",
                headerStyle: {
                    height: 96,
                    shadowColor: 'transparent', 
                    borderBottomWidth: 0,
                },
                headerLeft: () => <HeaderLeft title={options.titleLeft} />,
                headerRight: () => (<ListButtons navigation={navigation} />),
            }: {
            // ...navigation.getOptions(),
            ...headerStyle,
            ...options.style,
            title: options.title,
            headerTitleAlign: 'center',
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

export function HeaderLeft({title, icon, style}) {
    const titleStyle = {
        fontSize: 24,
        color: "#0F355C",
        fontWeight: 700,
        letterSpacing: 3,
    };
    const imageStyle = {
        width: 56, 
        height: 21, 
        marginRight: 6,
        marginTop: 4,
    }
    return(
        <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 20}}>
            <Image source={Asset("Uni")} style={imageStyle} />
            <Text style={titleStyle}>{title}</Text>
        </View>
    )
}

export function ListButtons({ navigation }) {
    const buttonStyle = {
        width: 48,
        height: 48,
        marginLeft: 8,
    }

    return(
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'right', margin: 12 }}>
            <TouchableOpacity onPress={() => navigation.push('Filter', { type: 'saved' }) } >
                <Image source={Asset("save-list")} style={buttonStyle} />
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => navigation.push('Filter', { type: 'saved' }) } >
                <Image source={Asset("notification-list")} style={buttonStyle} />
            </TouchableOpacity> */}
        </View>
    )
}

export function HeaderButton({image, title, icon, style, onPress, custom}) {
    return(
        custom? custom : (
            <TouchableOpacity onPress={onPress} style={{flexDirection: 'row', alignItems: 'center'}}>
                {image && <Image source={Asset(image)} style={{width: 56, height: 21, margin: 12}} /> }
                {title && <Text style={[headerStyle.headerRight, style]}>{title}</Text>}
                {icon && <Image source={Asset(icon)} style={[stylesheet.icon, style]} />}
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

// const insets = useSafeAreaInsets();

export const tabBarOptions = {
    tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
        height: 56,
    },
    tabBarActiveTintColor: Color.blue,
    tabBarInactiveTintColor: Color.grey1,
}

export function tabBarObject(title, icon) {
    return {
        title: title,
        tabBarLabel: ({focused}) => <Text style={tabBarStyle(focused).label}>{title}</Text>,
        tabBarIcon: ({focused}) => tabIcon(icon, focused),
    }
}