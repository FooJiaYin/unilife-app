import React, { useState, useCallback, useEffect } from 'react'
import { Text, TouchableOpacity, View, StyleSheet} from 'react-native'
import { styles, Color } from '../styles'

export function Chip({ label, type, focused = false, size = 'small', action, style, color }) {
    if (!color) color = style && style.color? style.color : (type == 'tag')? Color.green : Color.blue
    const chipStyle = StyleSheet.create({
        container: {
            backgroundColor: !focused? 'transparent' : color,
            borderColor: color,
            borderWidth: 1,
            borderRadius: 20,
            justifyContent: 'center',
            alignSelf: 'flex-end',
        },
        text: {
            color: focused ? Color.white : color,
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
                height: 37,
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
        <TouchableOpacity onPress={() => action()} style={[sizeStyle[size].container, chipStyle.container, style]}>
            <Text style={[sizeStyle[size].text, chipStyle.text]}>{label}</Text>
        </TouchableOpacity>
    )
}