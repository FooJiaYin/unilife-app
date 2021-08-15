import React from 'react'
import { StyleSheet, View, TouchableOpacity, Text, TextInput } from 'react-native'
import { styles } from '../styles'
import * as RNUI_Checkbox from 'react-native-ui-lib/checkbox'

export const Checkbox = RNUI_Checkbox

const formStyles = StyleSheet.create({
    button: {
        ...styles.bgGreen,
        marginTop: 8,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: 'center'
    },
    buttonTitle: {
        ...styles.textWhite,
        fontSize: 16,
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

