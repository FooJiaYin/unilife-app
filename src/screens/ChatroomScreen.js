import React, { useEffect, useState } from 'react'
import { View, useWindowDimensions, KeyboardAwareScrollView } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { stylesheet, Color, styles } from '../styles'
import { Chatroom } from '../components/messages'
import { firebase } from '../firebase/config'
import Carousel from 'react-native-snap-carousel'
// import Carousel from 'react-native-ui-lib/carousel';
import time from '../utils/time'
// import moment from 'moment'

export default function ChatroomScreen(props) {
    
    const user = props.user.data()
    const storageRef = firebase.storage().ref()
    const chatroomsRef = props.user.ref.collection('chatHistory')

    const [chatrooms, setChatrooms] = useState([])
    const [matchState, setMatchState] = useState({
        day: 0,
        time: 20,
        waiting: false,
    })
    // carousel = React.createRef<typeof Carousel>();
    const window = useWindowDimensions()

    setHeaderOptions(props.navigation, { title: '聊天室'})

    function displayChatrooms(newChatrooms = []) {    
        newChatrooms.push({
            active: true,
            userNames: [],
            id: '0',
            style: stylesheet.bgLight,
            startedAt: firebase.firestore.Timestamp.now()
        }) 
        setChatrooms(newChatrooms)
    }

    async function loadSetting() {
        let snapshot = await props.user.ref.get()
        let userData = snapshot.data()
        snapshot = await firebase.firestore().doc('config/20210816').get()
        let matchConfig = snapshot.data().matching
        setMatchState({
            ...matchConfig,
            waiting: (userData.settings && userData.settings.chat) ? userData.settings.chat : false,
        })
    }

    function toggleWaiting() {
        props.user.ref.update({
            settings: {
                chat: !matchState.waiting,
            }
        })
        setMatchState({
            ...matchState,
            waiting: !matchState.waiting,
        })
    }

    useEffect(() => {
        // if(databaseSnapshot.exists) 
        loadSetting()
        chatroomsRef
            .orderBy('startedAt')
            .get()
            .then(querySnapshot => {
                const newChatrooms = []
                let promises = []
                // let get_user_promises = []
                if (querySnapshot.size === 0) {
                    displayChatrooms(newChatrooms)
                }
                querySnapshot.forEach(async snapshot => {
                    console.log(snapshot.data())
                    // snapshot.data().then(data => {
                    const id = newChatrooms.push(snapshot.data()) -1
                    // console.log(id, querySnapshot.length)
                    if(id == querySnapshot.size - 1) {
                        // console.log(get_user_promises)
                        // Promise.all(get_user_promises).finally(() => {
                            // console.log('users', newChatrooms[0].userNames)
                        newChatrooms.push({
                            active: true,
                            userNames: [],
                            id: '0',
                            style: stylesheet.bgLight,
                            startedAt: firebase.firestore.Timestamp.now()
                        }) 
                        setChatrooms(newChatrooms)
                        console.log('chatrooms', newChatrooms)
                        // })
                    }
                
                /* const chatEntry = doc.data()
                    console.log('chatEntry', newChatrooms[id])
                    newChatrooms[id].chatroom = await firebase.firestore().doc('chatrooms/' + newChatrooms[id].chatroom)
                    newChatrooms[id].messagesRef = newChatrooms[id].chatroom.collection('messages')
                    newChatrooms[id].userNames = []
                    // console.log('MessagesRef', newChatrooms[id].messagesRef)
                    promises.push(
                        newChatrooms[id].chatroom.get().then(async snapshot => {
                        console.log('chatroom', snapshot.data())
                        newChatrooms[id].chatroom = snapshot.data()
                        newChatrooms[id].active = snapshot.data().active
                        snapshot.data().users.forEach(user => {
                            // console.log('add user')
                            get_user_promises.push(
                                firebase.firestore().doc('users/' + user).get()
                                .then(userSnapshot => newChatrooms[id].userNames.push(userSnapshot.data().info.nickname))
                                .finally(() => {
                                    // console.log('userNames', newChatrooms[id].userNames)
                                    setChatrooms(newChatrooms)
                                    // console.log(get_user_promises)
                                })
                            )
                    }) */
                })
            })
    }, [])

    return (
        <View style={stylesheet.container}>
            { chatrooms && (
                <View style={{ flex: 1 }}>
                    <Carousel
                        layout={'default'}
                        style={{ flex: 1 }}
                        data={chatrooms}
                        renderItem={({item}) => <Chatroom 
                            item={item} size={window.height} 
                            navigation={props.navigation}
                            toggleWaiting={toggleWaiting} 
                            matchState={matchState}
                        />}
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
                    />
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
