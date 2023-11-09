import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Image, TouchableOpacity, Text, TextInput, useWindowDimensions } from 'react-native'
// import { InputToolbar } from 'react-native-gifted-chat'
import * as GiftedChat from 'react-native-gifted-chat'
import { styles, stylesheet } from '../styles'
import { Icon } from './assets'
import { Button } from './forms'
import { ProfileImage } from './profileImage'
import time from '../utils/time'
import { firebase } from '../firebase/config'

const messageStyle = StyleSheet.create({
    message: {
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'flex-start'
    },
    profileImage: {
        width: 40,
        height: 40,
        marginBottom: 0,
        marginTop: 6,
        marginLeft: 0,
        marginRight: 0,
        borderRadius: 50,
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
        flexShrink: 0,
        alignSelf: 'flex-end',
        marginHorizontal: 8,
    },
    messageText: {
        ...styles.text,
        ...styles.textDark,
        // ...styles.textBubble,
        // borderRadius: 40,
        // overflow: 'wrap',
        // backgroundColor: '#f2f3f3',
        fontSize: 14,
        flexShrink: 1,
        // flexGrow: 1,
    },
    wrapper: {
        ...styles.textBubble,
        paddingVertical: 4,
        paddingHorizontal: 6,
        backgroundColor: '#f2f3f3',
        marginRight: 0,
    },
    right: {
        flexDirection: 'row-reverse',
        textAlign: 'right',
        marginRight: 8,
    },
})

export function MessageBubble(message) {
    // moment.locale('zh-tw')
    // console.log(message.position)
    const width = useWindowDimensions().width
    
    return (
        <View style={[messageStyle.messageRight]}>
            <Text style={[stylesheet.textXS, stylesheet.textGrey, (message.position=='right') ?messageStyle.right:{}]}>
                {message.user}
            </Text>
            <View style={[messageStyle.messageRow, (message.position=='right') ?messageStyle.right:{}]}>
                {/* <Text style={messageStyle.messageText}>
                    {message.content}
                </Text> */}
                <View style={{flexShrink: 1}}>
                    <GiftedChat.Bubble 
                        currentMessage={message.currentMessage}
                        renderUsernameOnMessage={false}
                        renderMessageText={()=><GiftedChat.MessageText {...message} linkStyle={{right:styles.textWhite}}/>}
                        renderTime={()=>{<></>}}
                        textStyle={{left: [messageStyle.messageText, (message.position=='right') ? styles.textWhite : {}]}}
                        wrapperStyle={{left: [messageStyle.wrapper, 
                            (message.position=='right') ? 
                            (message.currentMessage.user.avatar.includes('0'))? styles.bgGreen : 
                            (message.currentMessage.user.avatar.includes('1'))? styles.bgBlue : 
                            styles.bgRed : {},
                            {maxWidth: width - 90},
                        ]}}
                        // containerStyle={{left: styles.textBubble}}
                    />
                </View>
                <Text style={[messageStyle.messageTime, (message.position=='right') ? messageStyle.right:{}]}>
                    {/* {moment(message.timestamp.toDate()).calendar()} */}
                    {time(message.timestamp).format('A h:mm')}
                </Text>
            </View>
        </View>
    )
}

export function CommentBubble(message) {
    // moment.locale('zh-tw')
    // console.log(message.position)
    const width = useWindowDimensions().width
    
    return (
        <View style={[messageStyle.messageRight, {marginVertical: 6}]}>
            <Text style={[stylesheet.textXS, stylesheet.textGrey]}>
                {message.user} • {time(message.timestamp).calendar()}
            </Text>
            <View style={messageStyle.messageRow}>
                {/* <Text style={messageStyle.messageText}>
                    {message.content}
                </Text> */}
                <View style={{flexShrink: 1}}>
                    <GiftedChat.Bubble 
                        currentMessage={message.currentMessage}
                        renderUsernameOnMessage={false}
                        renderMessageText={()=><GiftedChat.MessageText {...message} />}
                        renderTime={()=>{<></>}}
                        textStyle={{left: messageStyle.messageText}}
                        wrapperStyle={{left: messageStyle.wrapper}}
                        // containerStyle={{left: styles.textBubble}}
                    />
                </View>
            </View>
        </View>
    )
}

// export function CommentBubble(message) {
//     // moment.locale('zh-tw')
//     console.log(message.content)
//     return (
//         <View style={{...messageStyle.messageRight, marginVertical: 6}}>
//             <Text style={[stylesheet.textXS, stylesheet.textGrey]}>
//                 {message.user} • {time(message.timestamp).calendar()}
//             </Text>
//             <View style={[{backgroundColor: '#f2f3f3',  alignSelf: 'flex-start', marginVertical: 4}, styles.textBubble]}>
//                 <Text style={messageStyle.messageText}>
//                     {message.content}
//                 </Text>
//             </View>
//         </View>
//     )
// }

export function Comment(message) {
    // moment.locale('zh-tw')
    // console.log(message.content)
    return (
        <View style={messageStyle.message}>
             <ProfileImage source={message.profileImage} style={messageStyle.profileImage} />
             <CommentBubble {...message} />
         </View>
    )
}

export function Avatar({source}) {
    return <ProfileImage source={source} style={messageStyle.profileImage} />
}

export function Message ({props}) {
    return <GiftedChat.Message {...props} linkStyle={{right: styles.textWhite}}/>
} 
    
// export function Message(message) {
//     // console.log('Message', message)
//     return (
//         <View style={[messageStyle.message, {justifyContent: message.position}]}>
//             <ProfileImage id={0} />
//             <Bubble {...message} />
//         </View>
//     )
// }

export function InputBar({sendMessage, like, setLike}, ...props) {
    const [inputText, setInputText] = useState('')
    return (
        
    //   <View style={{ height: 80}}>
     //   <TextInput style={{ height: 100, backgroundColor: 'blue' }}/>
    // </View>
        <View style={[stylesheet.borderTop, stylesheet.inputBar]}>
            <TouchableOpacity onPress={() => setLike(!like)}>
                <Icon name={like? 'love-active' : 'love'} size={24} style={{marginLeft: 4}} />
            </TouchableOpacity>
            <TextInput
                style={{...stylesheet.input, flex: 1}}
                placeholder='留言...'
                placeholderTextColor="#aaaaaa"
                onChangeText={(text) => setInputText(text)}
                value={inputText}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
            />
            <SendButton input={inputText} onSend={() => sendMessage(inputText, (a,b) => setInputText(''))} />
        </View>
    )
}

export function SendButton ({input, onSend}) {
    return(
        <TouchableOpacity onPress={() => onSend(input)}>
            <Icon name={'send'} size={20} />
        </TouchableOpacity>
    )
}
   
export function Chatroom({item, size, navigation, matchState = {}, toggleWaiting}, ...props) {
    // console.log('props', props)
    // const window = useWindowDimensions()
    const [ users, setUsers ] = useState([])
    const [ active, setActive ] = useState(true)
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
                        // console.log('userNames', newUsers)
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
            flex: 0.55,
            // height: size * 0.6,
            // aspectRatio: 1.33,
            width: size * 0.4,
            paddingHorizontal: 38,
            // paddingVertical: 60,
            borderRadius: 36,
            justifyContent: 'center',
            // alignItems: 'center',
            ...styles.bgGreen
        },
        text: {
            ...styles.textWhite,
            ...styles.textCenter,
            // height: size * 0.15 + 30,
            // overflow: 'visible',
            paddingBottom: 12,
            flexWrap: "wrap",
            // lineHeight: 20,
            // justifyContent: 'center',
            // alignItems: 'center',
        },
        textL: {
            ...styles.textWhite,
            fontSize: 22,
            fontWeight: '700',
            flexWrap: "wrap",
            // paddingBottom: 30,
            lineHeight: 32
        },
        button: {
            ...styles.outlineWhite,
            borderWidth: 1.5,
            // flex: 1,
            // marginTop: 64,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            // paddingVertical: 15
        }
    }) 
    // console.log('item', item)
    // console.log('matchConfig', matchState)
    
    return (
        <View style={cardStyle.fullHeight}>
            {/* <Text>{ item.id }</Text> */}
            {item.id == 0?
                <View style={[cardStyle.card, stylesheet.bgBlue]}>
                    <View style={cardStyle.text}>
                        <Text style={[cardStyle.text, cardStyle.textL]}>{"在地聊天室"}</Text>
                        <Text style={[cardStyle.text]}>{matchState.text}</Text>
                    </View>
                    <Button style={cardStyle.button} title={'前往LINE社群'} onPress={item.action}/>
                    {/* <Text style={[stylesheet.textWhite, stylesheet.textCenter]}>{time.getNextDayofWeek(matchState.day, matchState.time).fromNow('倒數計時 %d %H %M')}</Text> */}
                    {/* <Text style={cardStyle.text}>{active ? 'Active' : 'Inactive'}</Text> */}
                </View>
                :
                <View style={[cardStyle.card, item.style]}>
                    <Text style={cardStyle.text}>
                        <Text style={cardStyle.textL}>{users.join('\n')}</Text>
                    </Text>
                    <Button style={cardStyle.button} title={(chatroom.active == true)? '繼續聊天' : '查看記錄'} onPress={() => navigation.navigate('Message', {chatroom: chatroom, messagesRef: messagesRef}) } />
                    <Text style={[stylesheet.textWhite, stylesheet.textCenter]}>{(chatroom.active == true)? time(item.startedAt).toNow('累計聊天 %d %H') : time(item.startedAt).format('yyyy/M/D')}</Text>
                    {/* <Text style={cardStyle.text}>{item.active ? 'Active' : 'Inactive'}</Text> */}
                </View>
            } 
        </View>
    )
}