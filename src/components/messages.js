import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Image, TouchableOpacity, Text, TextInput, useWindowDimensions } from 'react-native'
// import { InputToolbar } from 'react-native-gifted-chat'
import { styles, stylesheet } from '../styles'
import Asset from './assets'
import { Button } from './forms'
import time from '../utils/time'
import { firebase } from '../firebase/config'

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
        flexDirection: 'column',
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
        flexWrap: "wrap",
        flexBasis: 50,
        flexShrink: 1,
        alignSelf: 'flex-end',
        marginHorizontal: 8,
    },
    messageText: {
        ...styles.text,
        ...styles.textBubble,
        // borderRadius: 40,
        // overflow: 'wrap',
        backgroundColor: '#f2f3f3',
        fontSize: 15,
        flexShrink: 1,
        // flexGrow: 1,
    },
    right: {
        flexDirection: 'row-reverse',
        textAlign: 'right',
        marginRight: 8,
    }
})

export function MessageBubble(message) {
    // moment.locale('zh-tw')
    // console.log(message.position)
    return (
        <View style={[messageStyle.messageRight]}>
            <Text style={[stylesheet.textXS, stylesheet.textGrey, (message.position=='right') ?messageStyle.right:{}]}>
                {message.user}
            </Text>
            <View style={[messageStyle.messageRow, (message.position=='right') ?messageStyle.right:{}]}>
                <Text style={messageStyle.messageText}>
                    {message.content}
                </Text>
                <Text style={[messageStyle.messageTime, (message.position=='right') ?messageStyle.right:{}]}>
                    {/* {moment(message.timestamp.toDate()).calendar()} */}
                    {time(message.timestamp).format('h:mm A')}
                </Text>
            </View>
        </View>
    )
}

export function CommentBubble(message) {
    // moment.locale('zh-tw')
    // console.log(message.position)
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

export function ProfileImage({url}) {
    return (
        <Image source={Asset(url)} style={messageStyle.profileImage} />
    )
}
    
export function Message(message) {
    // console.log('Message', message)
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
                     // console.log(text)
                    }}
                />
            </View> */}
        </View>
    )
}

export function SendButton ({input, onSend}) {
    return(
        <TouchableOpacity onPress={() => onSend(input)}>
            <Image source={Asset('send')} style={[stylesheet.icon, {width: 20, height: 20}]} />
        </TouchableOpacity>
    )
}
   
export function Chatroom({item, size, navigation, matchState = {}, toggleWaiting}, ...props) {
    // console.log('props', props)
    // const window = useWindowDimensions()
    const [ users, setUsers ] = useState([])
    // const [ active, setActive ] = useState(true)
    const [ messagesRef, setMessagesRef ] = useState(true)
    const [ chatroom, setChatroom ] = useState(true)
    //     let promises = []
        
    useEffect(() => {
        if (item.id != 0) {
            let newUsers = []
            firebase.firestore().doc('chatrooms/' + item.chatroom).get().then(async snapshot => {
                const chatroom = await snapshot.data()
                setChatroom(chatroom)
                setMessagesRef(snapshot.ref.collection('messages'))
                chatroom.users.forEach(user => {
        //             // console.log('add user')
                    firebase.firestore().doc('users/' + user).get()
                        .then(userSnapshot => newUsers.push(userSnapshot.data().info.nickname))
                        .finally(() => {
                            console.log('userNames', newUsers)
                            if(newUsers.length == 3) setUsers(newUsers)
                            // console.log(get_user_promises)
                        })
                })
            })
        }
    }, [item])

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
            // height: size * 0.15,
            // overflow: 'visible',
            flexWrap: "wrap",
            // lineHeight: 20,
            // justifyContent: 'center',
            // alignItems: 'center',
        },
        textL: {
            ...styles.textWhite,
            fontSize: size * 0.04,
            fontWeight: '700',
            flexWrap: "wrap",
            paddingBottom: 16,
            lineHeight: 40
        },
        button: {
            ...styles.outlineWhite,
            borderWidth: 1.5,
            // flex: 1,
            marginTop: 64,
            marginBottom: 8,
            paddingVertical: 20
        }
    }) 
    // console.log('item', item)
    // console.log('matchConfig', matchState)
    return (
        <View style={cardStyle.fullHeight}>
            {item.id == 0? 
                (<View style={[cardStyle.card, item.style]}>
                    <Text style={cardStyle.text}>
                        <Text style={cardStyle.textL}>{'下次配對\n'}</Text>
                        <Text>{matchState.text + '\n' + (matchState.waiting? '等待配對中...' : '') }</Text>
                    </Text>
                    <Button style={cardStyle.button} title={(matchState.waiting? '關閉配對' : '開啟配對')} onPress={() => toggleWaiting()}/>
                    {/* <Text style={[stylesheet.textWhite, stylesheet.textCenter]}>{time().getNextDayofWeek(matchState.day, matchState.time).fromNow('倒數計時 %d %H %M')}</Text> */}
                    {/* <Text style={cardStyle.text}>{active ? 'Active' : 'Inactive'}</Text> */}
                </View>) 
                :
                (<View style={[cardStyle.card, item.style]}>
                    <Text style={cardStyle.text}>
                        <Text style={cardStyle.textL}>{users.join('\n')}</Text>
                    </Text>
                    <Button style={cardStyle.button} title={'繼續聊天'} onPress={() => navigation.navigate('Message', {chatroom: chatroom, messagesRef: messagesRef}) } />
                    <Text style={[stylesheet.textWhite, stylesheet.textCenter]}>{time(item.startedAt).toNow('累計聊天 %d %H')}</Text>
                    {/* <Text style={cardStyle.text}>{item.active ? 'Active' : 'Inactive'}</Text> */}
                </View>)
            } 
        </View>
    )
}