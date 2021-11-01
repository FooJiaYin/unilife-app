import React, { useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, TextInput, Image } from 'react-native'
import RNPickerSelect from 'react-native-picker-select';
import Asset from './assets';
import { styles, stylesheet, Color } from '../styles'
// import * as RNUI_Checkbox from 'react-native-ui-lib/checkbox'

// export const Checkbox = RNUI_Checkbox

export const formStyles = StyleSheet.create({
    button: {
        marginTop: 8,
        height: 44,
        borderRadius: 24,
        // flex: 1,            // 宽度和高度自适应                                                                                                                                             
        alignItems: 'center',
        justifyContent: 'center',
        // alignSelf: 'center',
        // paddingVertical: 12,
    },
    buttonTitle: {
        ...styles.textWhite,
        fontSize: 16,
        // height: 18,
        fontWeight: "bold"
    },
    label: {
        ...styles.textGrey,
        margin: 5,
    },
    inputText: {
        ...styles.inputText,
        overflow: 'scroll',
        flexShrink: 1,
        flexGrow: 1,
    },
    inputRow: {
        ...styles.input,
        display: 'flex', 
        flexDirection: 'row',  
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10
    }
})

export function Button({ title, onPress, style, titleStyle }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={[formStyles.button, style]}>
                <Text style={[formStyles.buttonTitle, titleStyle]}>{title}</Text>
            </View>
        </TouchableOpacity>
    )
}

export function Input({right, ...props}) {
    return (
        <View style={formStyles.inputRow}>
            <TextInput 
                style={formStyles.inputText} 
                placeholderTextColor="#aaaaaa" 
                underlineColorAndroid="transparent"
                autoCapitalize="none"
            {...props} />
            <View style={{flexShrink: 0, paddingHorizontal: 10}}>
                {right}
            </View>
        </View >
    )
}

export function PasswordInput(props) {
    const [showPassword, setPasswordVisible] = useState(false)

    return (
        <View style={[formStyles.inputRow, {paddingHorizontal: 0}]}>
            <TextInput 
                style={formStyles.inputText} 
                secureTextEntry={!showPassword}
                placeholderTextColor="#aaaaaa" 
                underlineColorAndroid="transparent"
                autoCapitalize="none"
            {...props} />
            <TouchableOpacity 
                onPress={() => setPasswordVisible(!showPassword)} 
                style={{flexShrink: 0, paddingRight: 0}}
            >
                <Image style={[stylesheet.icon, { tintColor: showPassword? Color.grey0 : Color.grey1}]} source={Asset('eye')} />
            </TouchableOpacity>
        </View >
    )
}

export function Select({items=[], onChange, value, placeholder='請選擇...'}) {
// export function Select() {
    const pickerSelectStyles = {
        inputIOS: {
            height: 40,
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: '#f2f3f3',
            color: Color.grey0,
            marginTop: 8,
            marginBottom: 8,
            paddingLeft: 16,
            fontSize: 14,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderWidth: 0,
            paddingRight: 30, // to ensure the text is never behind the icon
        },
        inputAndroid: {
            height: 40,
            borderRadius: 20,
            overflow: 'hidden',
            color: Color.grey0,
            backgroundColor: '#f2f3f3',
            marginTop: 8,
            marginBottom: 8,
            paddingLeft: 16,
            fontSize: 14,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderWidth: 0,
            paddingRight: 30, // to ensure the text is never behind the icon
        },
        iconContainer: {
            top: 8,
        },
    }
    return (
        <View style={{borderRadius: 20}}>
            <RNPickerSelect
                value={value}         
                onValueChange={onChange}
                items={items}
                placeholder={{label: placeholder, value: '', color: 'black'}}
                useNativeAndroidPickerStyle={false}
                style={pickerSelectStyles}
                Icon={() => <Image source={Asset('down')} style={[stylesheet.icon, {height: 12}]}/> }
            />
        </View>
    )
}
