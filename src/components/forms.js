import React from 'react'
import { StyleSheet, View, TouchableOpacity, Text, TextInput, Image } from 'react-native'
import RNPickerSelect from 'react-native-picker-select';
import Asset from './assets';
import { styles, stylesheet } from '../styles'
// import * as RNUI_Checkbox from 'react-native-ui-lib/checkbox'

// export const Checkbox = RNUI_Checkbox

const formStyles = StyleSheet.create({
    button: {
        marginTop: 8,
        // height: 40,
        borderRadius: 24,
        // flex: 1,            // 宽度和高度自适应                                                                                                                                             
        alignItems: 'center',
        justifyContent: 'center',
        // alignSelf: 'center',
        paddingVertical: 12,
    },
    buttonTitle: {
        ...styles.textWhite,
        fontSize: 16,
        height: 18,
        fontWeight: "bold"
    },
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

export function Input(props) {
    return (
        <View style={styles.input}>
            <TextInput style={styles.inputText} {...props} />
        </View>
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
            color: 'black',
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
            color: 'black',
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
