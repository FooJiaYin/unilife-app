import React, { useState } from 'react'
import { Modal, StyleSheet, View, Text, TouchableHighlight, Image } from 'react-native'
import Asset from './assets'
import { styles, Color } from '../styles'

// TODO: Replace with action sheet in IOS
const overlayStyle = StyleSheet.create({
    option: {
        position: 'absolute',
        left: 100,
        top: '100%',
        backgroundColor: '#454566',
        height: 18,
        width: 13,
        color: Color.grey0,
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
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
    overlay: {
        flex: 1,
        opacity: 0.5,
        position: 'absolute',
        width:'100%',
        height:'100%',
        backgroundColor: '#000000',
        zIndex: 2
    }
})

const optionStyle = StyleSheet.create({
    icon:{
        height: 14,
        width: 14,
        resizeMode: 'contain',
        tintColor: Color.grey0,
    }
})

export function OptionOverlay({ visible=false, onBackCB , options=[], style=null}) {
    // console.log(options)
    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={()=>{onBackCB()
            console.log(visible)}}
        >
            <View style={{flex:1, justifyContent: 'center'}}>
            <View style={{
                margin: 20,
                backgroundColor: "white",
                borderRadius: 20,
                padding: 35,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: {
                width: 0,
                height: 2
                },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5
            }}>
            {/* <Text>Yay</Text> */}
                {options.map((option, i)=>
                    <OptionItem
                    // iconSrc={option.iconSrc}
                    text={option.text}
                ></OptionItem>
                )}
            </View>
        </View>
        </Modal>
    )
}
export function OptionItem({iconSrc, text, onPress}){
    return (
        <TouchableHighlight onPress={onPress}>
            {/* <Image source={Asset(iconSrc)} style={optionStyle.icon}/> */}
            <Text style={optionStyle.text}>{text}</Text>
        </TouchableHighlight>
    )
}

export function PopupOverlay({children, style, dimBackground}) {
    return (
        // {dimBackground && <View style={overlay}>}
        <View style={styles.input}>
            <TextInput style={styles.inputText} {...props} />
        </View>
    )
}
