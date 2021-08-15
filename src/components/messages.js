import React, { useState } from 'react'
import { StyleSheet, View, Image, TouchableOpacity, Text, TextInput, useWindowDimensions } from 'react-native'
// import { InputToolbar } from 'react-native-gifted-chat'
import { styles, stylesheet } from '../styles'
import Asset from './assets'
import { Button } from './forms'
import time from '../utils/time'

const messageStyle = StyleSheet.create({
    message: {
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: 20,
        marginVertical: 8,
        justifyContent: 'flex-start'
    },
    profileImage: {
        width: 40,
        height: 40,
        marginBottom: 0,
        marginTop: 6,
        marginLeft: 0,
        marginRight: 0
    },
    messageRight: {
        flex: 'column',
        flexShrink: 1,
        marginLeft: 8,
    },    
    userNickname: {
        ...styles.textS,
        ...styles.textGrey,
        fontWeight: 'bold',
    },
    messageRow: {
        flexDirection: 'row',
        marginVertical: 4,
        alignItems: 'flex-end'
    },
    messageTime: {
        ...styles.textXS,
        ...styles.textGrey,
        alignSelf: 'flex-end',
        marginHorizontal: 8,
    },
    messageText: {
        ...styles.text,
        ...styles.textBubble,
        // overflow: 'wrap',
        backgroundColor: '#f2f3f3',
        fontSize: 14,
    },
    right: {
        flexDirection: 'row-reverse',
        textAlign: 'right',
        marginRight: 8,
    }
})

export function MessageBubble(message) {
    // moment.locale('zh-tw')
    console.log(message.position)
    return (
        <View style={[messageStyle.messageRight]}>
            <Text style={[stylesheet.textXS, stylesheet.textGrey, (message.position=='right') ?messageStyle.right:{}]}>
                {message.user}
            </Text>
            <View style={[messageStyle.messageRow, (message.position=='right') ?messageStyle.right:{}]}>
                <Text style={messageStyle.messageText}>
                    {message.content}
                </Text>
                <Text style={messageStyle.messageTime}>
                    {/* {moment(message.timestamp.toDate()).calendar()} */}
                    {time(message.timestamp).calendar()}
                </Text>
            </View>
        </View>
    )
}

export function CommentBubble(message) {
    // moment.locale('zh-tw')
    console.log(message.position)
    return (
        <View style={[messageStyle.messageRight]}>
            <Text style={[stylesheet.textXS, stylesheet.textGrey, (message.position=='right') ?messageStyle.right:{}]}>
                {message.user} • {time(message.timestamp).calendar()}
            </Text>
            <View style={[messageStyle.messageRow, (message.position=='right') ?messageStyle.right:{}]}>
                <Text style={messageStyle.messageText}>
                    {message.content}
                </Text>
            </View>
        </View>
    )
}

export function ProfileImage({id}) {
    return (
        <Image source={Asset('profile-image-'+id+'.png')} style={messageStyle.profileImage} />
    )
}
    
export function Message(message) {
    console.log('Message', message)
    return (
        <View style={[messageStyle.message, {justifyContent: message.position}]}>
            <ProfileImage id={0} />
            <Bubble {...message} />
        </View>
    )
}

export function InputBar({onSend}, ...props) {
    const [inputText, setInputText] = useState('')
    return (
        <View>
            {/* <InputToolbar style={stylesheet.input} /> */}
            <TextInput
                style={stylesheet.input}
                placeholder='留言...'
                placeholderTextColor="#aaaaaa"
                onChangeText={(text) => setInputText(text)}
                value={inputText}
                multiline={true}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
            />
            <TouchableOpacity style={stylesheet.button} onPress={onSend(inputText)}>
                <Text style={stylesheet.buttonText}>送出</Text>
            </TouchableOpacity>
            {/* <View style={styles.messageText}>
                <TextInput
                    style={styles.messageTextInput}
                    multiline={true}
                    placeholder="Type a message"
                    onChangeText={(text) => {
                        console.log(text)
                    }}
                />
            </View> */}
        </View>
    )
}

export function SendButton ({input, onSend}) {
    return(
        <TouchableOpacity onPress={() => onSend(input)}>
            <Image source={Asset('icons/send.png')} style={[stylesheet.icon, {width: 20, height: 20}]} />
        </TouchableOpacity>
    )
}
   
export function Chatroom({item, size, navigation}, ...props) {
    console.log('props', props)
    // const window = useWindowDimensions()
    const cardStyle = StyleSheet.create({
        fullHeight: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        card: {
            flex: 0.7,
            // height: size * 0.6,
            // aspectRatio: 1.33,
            width: size * 0.4,
            paddingHorizontal: 38,
            borderRadius: 36,
            justifyContent: 'center',
            // alignItems: 'center',
            ...styles.bgGreen
        },
        text: {
            ...styles.textWhite,
            ...styles.textCenter,
            height: size * 0.15,
            // justifyContent: 'center',
            // alignItems: 'center',
        },
        textL: {
            fontSize: size * 0.04,
            fontWeight: '700',
            paddingBottom: 16,
        },
        button: {
            ...styles.outlineWhite,
            borderWidth: 1.5,
            flex: 1,
            marginTop: 64,
            marginBottom: 8,
        }
    }) 
    console.log('item', item)
    console.log('time', item.startedAt.toDate())
    return (
        <View style={cardStyle.fullHeight}>
            {item.id == 0? 
                (<View style={[cardStyle.card, item.style]}>
                    <Text style={cardStyle.text}>
                        <Text style={cardStyle.textL}>{'下次配對\n'}</Text>
                        <Text>{'每週一晚上8點'}</Text>
                    </Text>
                    <Button style={cardStyle.button} title={'開啓配對'} />
                    <Text style={[stylesheet.textWhite, stylesheet.textCenter]}>{time().getNextDayofWeek(1, 20).fromNow('倒數計時 %d %H %M')}</Text>
                    {/* <Text style={cardStyle.text}>{item.active ? 'Active' : 'Inactive'}</Text> */}
                </View>) 
                :
                (<View style={[cardStyle.card, item.style]}>
                    <Text style={cardStyle.text}>
                        <Text style={cardStyle.textL}>{item.userNames.join('\n')}</Text>
                    </Text>
                    <Button style={cardStyle.button} title={'繼續聊天'} onPress={() => navigation.navigate('Message', {chatroom: item.chatroom, messagesRef: item.messagesRef}) } />
                    <Text style={[stylesheet.textWhite, stylesheet.textCenter]}>{time(item.startedAt).toNow('累計聊天 %d %H')}</Text>
                    {/* <Text style={cardStyle.text}>{item.active ? 'Active' : 'Inactive'}</Text> */}
                </View>)
            } 
        </View>
    )
}