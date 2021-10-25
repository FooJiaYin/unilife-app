import React, { useState, useCallback, useEffect } from 'react'
import { Text, TouchableOpacity, View, StyleSheet} from 'react-native'
import { styles, Color } from '../styles'

export function Chip({ label, type, focused = false, size = 'small', action }) {
    const chipStyle = StyleSheet.create({
        container: {
            backgroundColor: !focused? 'transparent' : (type == 'tag')? Color.green : Color.blue,
            borderColor: (type == 'tag')? Color.green : Color.blue,
            borderWidth: 1,
            borderRadius: 20,
            justifyContent: 'center',
            alignSelf: 'flex-end',
        },
        text: {
            color: focused ? Color.white : (type == 'tag')? Color.green : Color.blue,
            margin: 0,
        }
    })
    const sizeStyle = {
        small: StyleSheet.create({
            container: {
                height: 20,
                // paddingVertical: 3,
                paddingHorizontal: 6,
                marginRight: 6
            },
            text: {
                ...styles.textS,
                // lineHeight: 12,
            }
        }),
        large: StyleSheet.create({
            container: {
                height: 36,
                paddingVertical: 9,
                paddingHorizontal: 10,
                marginRight: 8
            },
            text: {
                fontSize: 16,
                // lineHeight: 18,
            }
        })
    }
    return (
        <TouchableOpacity onPress={() => action()} style={[sizeStyle[size].container, chipStyle.container]}>
            <Text style={[sizeStyle[size].text, chipStyle.text]}>{label}</Text>
        </TouchableOpacity>
    )
}