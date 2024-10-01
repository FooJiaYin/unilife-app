import React, { useState } from 'react'
import { TextInput, View, Image, TouchableHighlight } from 'react-native'
import { stylesheet, Color } from '../styles'
import Asset from '../components/assets'

export default function PostBar ({category, ...props}) {
    const [editIconColor, setEditIconColor] = useState(Color.grey1);
    const [historyIconColor, setHistoryIconColor] = useState(Color.blue);
    return (
        <TouchableHighlight 
            onPress={() => props.navigation.navigate('NewArticle', {category: category})}
            onShowUnderlay={() => setEditIconColor(Color.blue)}
            onHideUnderlay={() => setEditIconColor(Color.grey1)}
            underlayColor={'#0000'}
        >
            <View style={[stylesheet.inputBar, {
                paddingTop: 0,
                paddingBottom: 4,
                marginBottom: 0,
                paddingHorizontal: 12,
            }]}>
                <TouchableHighlight 
                    onPress={() => props.navigation.push('Filter', {type: 'user', data: props.user.id, category: category})}
                    onShowUnderlay={() => setHistoryIconColor(Color.blue)}
                    // onHideUnderlay={() => setHistoryIconColor(Color.grey1)}
                    underlayColor={'#0000'}
                >
                    <Image source={Asset('history')} style={[stylesheet.iconColor, {tintColor: historyIconColor, width: 42, height: 46}]} />
                </TouchableHighlight>
                <TextInput
                    style={{...stylesheet.input, flex: 1, marginHorizontal: 12}}
                    editable={false}
                    placeholder='發布貼文；提出問題...'
                    placeholderTextColor="#aaaaaa"
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                    />
                <Image source={Asset('edit')} style={[stylesheet.iconColor, {tintColor: editIconColor, width: 28, height: 28}]} />
            </View>
        </TouchableHighlight>
    )
}