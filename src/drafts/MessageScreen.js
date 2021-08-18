import React, { useEffect, useState } from 'react'
import { FlatList, Keyboard, Text, SafeAreaView, ScrollView, View, TextInput, TouchableOpacity } from 'react-native'
import { stylesheet } from '../styles'
import { firebase } from '../firebase/config'
import RenderHtml from 'react-native-render-html'
import { Message, InputBar } from '../components/messages'
// import HTMLView from 'react-native-htmlview'

export default function MessageScreen(props) {

    const chatroom = props.route.params.chatroom
    // console.log('chatroom', chatroom)
    const user = props.user.data()
    const storageRef = firebase.storage().ref()
    const messagesRef = props.route.params.messagesRef

    const [messages, setMessages] = useState([])
    const [inputText, setInputText] = useState([])
    let isLoading = false
    let messageLoaded = []

    async function loadMessages() {
        isLoading = true
        const snapshots = await messagesRef.orderBy('timestamp', 'desc').limit(20).get()
        // console.log('snapshots', snapshots)
        for (var doc of snapshots.docs) {
            messageLoaded.push(doc.id)
        }
        for (var doc of snapshots.docs) {
            const message = doc.data()
            messageList[id].id = doc.id
            // console.log(message)
            const snapshot = await messageList[id].user.get()
            messageList[id].user = snapshot.data().info.nickname
            messageList[id].position = (snapshot.data().id == user.id) ? 'right' : 'left'
            messageList[id].replies = messagesRef.doc(doc.id).collection('replies')
            if (messageList[id].timestamp == null) {
                messageList[id].timestamp = firebase.firestore.Timestamp.now()
            }
            messageList.unshift(message)
            // console.log('messages', messages, messageList)
        }
        setMessages(messageList)
        isLoading = false
    }
        

    useEffect(() => {
        // loadMessages()
        messagesRef.orderBy('timestamp', 'desc').limit(20)
            .onSnapshot(querySnapshot => {
                const messageList = []
                let promises = []
                querySnapshot.forEach(async doc => {
                    const id = messageList.push(doc.data()) -1
                 // console.log(messageList)
                    const message = doc.data()
                    messageList[id].id = doc.id
                    promises.push(
                        message.user.get()
                            .then(snapshot => {
                                messageList[id].user = snapshot.data().info.nickname
                                messageList[id].position = (snapshot.data().id == user.id) ? 'right' : 'left'
                                messageList[id].replies = messagesRef.doc(doc.id).collection('replies')
                                if (messageList[id].timestamp == null) {
                                    messageList[id].timestamp = firebase.firestore.Timestamp.now()
                                }
                            })
                    )
                    // const snapshot = await message.user.get()
                    // messageList[id].user = snapshot.data().info.nickname
                    // messageList[id].replies = messagesRef.doc(doc.id).collection('replies')
                    // if (messageList[id].timestamp == null) {
                    //     messageList[id].timestamp = firebase.firestore.Timestamp.now();
                    // }
                })
                Promise.all(promises).then(() => {setMessages(messageList)})
            })
    }, [])

    const messageItem = ({item}) => {
        return (
            <Message {...item}></Message>
        )
    }
    
    const sendMessage = () => {
        if (inputText && inputText.length > 0) {
            const data = {
                user: firebase.firestore().doc('users/' + user.id),
                content: inputText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            }
            messagesRef.add(data)
                .then(_doc => {
                    Keyboard.dismiss()
                })
                .catch((error) => {
                    alert(error)
                })
        }
    }
    
    return (
        <View style={[stylesheet.container, {flex: 1}]}>
            {/* {messages && <FlatList
                // inverted={-1}
                // ref={(c) => { this.flatList = c }}
                data={messages.reverse()}
                renderItem={messageItem}
                keyExtractor={(item, index) => index.toString()}
                // removeClippedSubviews={true}
            />} */}
            <ScrollView>
                {messages.map((item, i) => (
                    <Message {...item}></Message>
                ))}
            </ScrollView>
            <View style={stylesheet.formContainer}>
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
                <TouchableOpacity style={stylesheet.button} onPress={sendMessage}>
                    <Text style={stylesheet.buttonText}>送出</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
