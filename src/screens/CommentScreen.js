import React, { useState, useCallback, useEffect } from 'react'
import { GiftedChat } from 'react-native-gifted-chat'
import { FlatList, Keyboard, Text, SafeAreaView, Image, View, TextInput, TouchableOpacity } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { stylesheet } from '../styles/styles'
import { firebase } from '../firebase/config'
import { CommentBubble, SendButton, Avatar } from '../components/messages'
import Asset from '../components/assets'

export default function MessageScreen(props) {
    const article = props.route.params.article || props.params.article
    // console.log('chatroom', chatroom)
    const user = props.user.data()
    const storageRef = firebase.storage().ref()
    const commentsRef = props.route.params.commentsRef ||　props.params.article

    const [messages, setMessages] = useState([])
    const [inputText, setInputText] = useState([])
    let isLoading = false
    let messageLoaded = []

    const options = {
        title: '留言',
        headerLeft: 'back'
    }
    setHeaderOptions(props.navigation, options)
    
    function loadMessages() {
        commentsRef.orderBy('timestamp', 'desc')//.limit(20)
            .onSnapshot(querySnapshot => {
                const messageList = []
                let promises = []
                querySnapshot.forEach(async doc => {
                    const id = messageList.push(doc.data()) -1
                    // console.log(messageList)
                    const message = doc.data()
                    messageList[id].id = doc.id
                    promises.push(
                        firebase.firestore().doc('users/' + message.user).get()
                            .then(snapshot => {
                                messageList[id].user = snapshot.data().info.nickname
                                messageList[id].position = 'left'
                                messageList[id].replies = commentsRef.doc(doc.id).collection('replies')
                                if (messageList[id].timestamp == null) {
                                    messageList[id].timestamp = firebase.firestore.Timestamp.now()
                                }
                                messageList[id].position = 'left'
                                // messageList[id].replies = commentsRef.doc(doc.id).collection('replies')
                                messageList[id].timestamp = messageList[id].timestamp.toDate()
                                messageList[id]._id = id
                                messageList[id].createdAt = messageList[id].timestamp
                                messageList[id].text = messageList[id].content
                                messageList[id].user = {
                                    _id: snapshot.data().id,
                                    name: snapshot.data().info.nickname,
                                    avatar: snapshot.data().info.profileImage
                                }
                                // console.log(messageList[id].user._id, user.id)
                            })
                    )
                    // const snapshot = await message.user.get()
                    // messageList[id].user = snapshot.data().info.nickname
                    // messageList[id].replies = commentsRef.doc(doc.id).collection('replies')
                    // if (messageList[id].timestamp == null) {
                    //     messageList[id].timestamp = firebase.firestore.Timestamp.now();
                    // }
                })
                Promise.all(promises).then(() => {setMessages(messageList)})
            })
    }

    function sendMessage(inputText, clearInput) {
        if (inputText && inputText.length > 0) {
            const data = {
                user: user.id,
                content: inputText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            }
            commentsRef.add(data)
                .then(_doc => {
                    Keyboard.dismiss()
                })
                .catch((error) => {
                    alert(error)
                })
            // console.log(user.id, article.id)
            firebase.firestore().collection('behavior').where('user','==', user.id).where('article', '==', article.id).get().then(querySnapshot => {
                let behaviorRef = querySnapshot.docs[0].ref
                let data = querySnapshot.docs[0].data()
                behaviorRef.update({
                    stats: {
                        ...data.stats,
                        comment: data.stats.comment + 1,
                    },
                    logs: firebase.firestore.FieldValue.arrayUnion({
                        action: 'comment',
                        time: firebase.firestore.Timestamp.now()
                    })
                })
            })
        }
        clearInput({}, true)
    }

    useEffect(() => {
        loadMessages()
    }, [])

    const renderBubble = ({user, currentMessage}) => {
        const message = {
            currentMessage: currentMessage,
            user: currentMessage.user.name,
            timestamp: currentMessage.createdAt,
            content: currentMessage.text,
            position: currentMessage.position
        }
        return (
            <CommentBubble {...message} />
        )
    }

  const renderAvatar = ({currentMessage}) => {
    //   console.log(currentMessage)
        return <Avatar source={currentMessage.user.avatar} />
  }

//   const renderSend = ({text}) => <SendButton input={text} onSend={sendMessage}/>
  const renderSend = ({text, onSend}) => <SendButton input={text} onSend={() => sendMessage(text, onSend)} />

    return (
        <View style={stylesheet.container}>
            <GiftedChat
                messages={messages}
                renderBubble={renderBubble}
                renderAvatar={renderAvatar}
                renderSend={renderSend} 
                renderDay={() => <></>}
                // onSend={messages => Send(messages[0].text)}
                showAvatarForEveryMessage={true}
                renderAvatarOnTop = {true}
                alignTop={true}
                user={{_id: ''}}
            />
        </View>
    )
}