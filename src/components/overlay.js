import React, { useState } from 'react'
import { Modal, StyleSheet, View, Text, TouchableHighlight } from 'react-native'
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
        position: 'fixed',
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

export function OptionOverlay({ visible=false, onBackCB , options=null, style=null}) {

    return (
        <View style={{flex:1}}>
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={()=>{onBackCB()
            console.log(visible)}}
        >
            <View style={style?style:overlayStyle.option}>
                {options.map((option, i)=>{
                    <OptionItem
                    // iconSrc={option.iconSrc}
                    text={option.text}
                ></OptionItem>
                })}
            </View>
        </Modal>
        </View>
    )
}
export function OptionItem({iconSrc, text}){
    return (
        <TouchableHighlight onPress={onPress}>
            {/* <Image source={Asset('icons/'+iconSrc)} style={optionStyle.icon}/> */}
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
