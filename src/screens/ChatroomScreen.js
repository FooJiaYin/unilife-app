import React, { useEffect, useState } from 'react'
import { FlatList, Keyboard, Text, Image, TextInput, TouchableOpacity, View, StyleSheet, useWindowDimensions } from 'react-native'
import { setHeaderOptions } from '../components/header'
import { stylesheet, Color, styles } from '../styles'
import { Chatroom } from '../components/messages'
import { firebase } from '../firebase/config'
//import Carousel from 'react-native-snap-carousel'
// import Carousel from 'react-native-ui-lib/carousel';
import time from '../utils/time'
// import moment from 'moment'

export default function ChatroomScreen(props) {
    
    const user = props.user.data()
    const storageRef = firebase.storage().ref()
    const chatroomsRef = props.user.ref.collection('chatHistory')

    const [chatrooms, setChatrooms] = useState([])
    // carousel = React.createRef<typeof Carousel>();
    const window = useWindowDimensions()

    setHeaderOptions(props.navigation, { title: '聊天室'})

    useEffect(() => {
        chatroomsRef
            .orderBy('startedAt')
            .get()
            .then(querySnapshot => {
                const newChatrooms = []
                let promises = []
                let get_user_promises = []
                querySnapshot.forEach(async doc => {
                    const id = newChatrooms.push(doc.data()) -1
                    // const chatEntry = doc.data()
                    // console.log('chatEntry', newChatrooms[id].startedAt)
                    newChatrooms[id].messagesRef = newChatrooms[id].chatroom.collection('messages')
                    // console.log('MessagesRef', newChatrooms[id].messagesRef)
                    promises.push(
                        newChatrooms[id].chatroom.get().then(snapshot => {
                            // console.log('chatroom', snapshot.data())
                            newChatrooms[id].chatroom = snapshot.data()
                            newChatrooms[id].active = snapshot.data().active
                            newChatrooms[id].userNames = []
                            snapshot.data().users.forEach(user => {
                                get_user_promises.push(
                                    user.get()
                                    .then(userSnapshot => newChatrooms[id].userNames.push(userSnapshot.data().info.nickname))
                                    .finally(() => {
                                        // console.log('userNames', newChatrooms[id].userNames)
                                        // setChatrooms(newChatrooms)
                                    })
                                )
                            })
                        })
                    )
                })
                Promise.all(promises).finally(() => {
                        Promise.all(get_user_promises).finally(() => {
                        // console.log('users', newChatrooms[0].userNames)
                        newChatrooms.push({
                            active: true,
                            userNames: [],
                            id: '0',
                            style: stylesheet.bgGrey,
                            startedAt: firebase.firestore.Timestamp.now()
                        }) 
                        setChatrooms(newChatrooms)
                        // console.log('chatrooms', newChatrooms)
                    })
                })
            })
    }, [])

    return (
        <View style={stylesheet.container}>
            { chatrooms && (
                <View style={{ flex: 1 }}>
                    {/* <Carousel
                        layout={'default'}
                        style={{ flex: 1 }}
                        data={chatrooms}
                        renderItem={({item}) => <Chatroom item={item} size={window.height} navigation={props.navigation} />}
                        sliderWidth={window.width}
                        itemWidth={window.height * 0.4 + 30}
                        itemHeight={window.height * 0.6}
                        sliderHeight={window.height * 0.6}
                        inactiveSlideScale={1}
                        // activeSlideOffset={60}
                        keyExtractor={(item) => item.id}
                        // removeClippedSubviews={true}
                        // horizontal={true}
                        enableSnap={true}
                        firstItem={chatrooms.length - 2}
                        // inverted={true}
                    /> */}
                    {/* <FlatList
                        style={{ flex: 1 }}
                        data={chatrooms}
                        renderItem={chatroomItem}
                        keyExtractor={(item) => item.id}
                        removeClippedSubviews={true}
                        horizontal={true}
                        inverted={true}
                        getItemLayout={(data, index) => (
                            {length: 300, offset: 300 * index, index}
                        )}
                    /> */}
                </View>
            )}
        </View>
    )
}
