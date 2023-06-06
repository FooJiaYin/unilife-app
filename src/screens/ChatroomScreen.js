import React, { useEffect, useState } from 'react'
import { View, useWindowDimensions, Linking, Alert } from 'react-native'
import { useFocusEffect } from "@react-navigation/native";
import { setHeaderOptions } from '../components/navigation'
import { stylesheet, Color, styles } from '../styles'
import { Chatroom } from '../components/messages'
import { firebase } from '../firebase/config'
import Carousel from 'react-native-snap-carousel'
import * as WebBrowser from 'expo-web-browser';
// import Carousel from 'react-native-ui-lib/carousel';
import { checkAuthStatus } from '../utils/auth'
// import moment from 'moment'

export default function ChatroomScreen(props) {
    
    let user = props.user.data()
    const storageRef = firebase.storage().ref()
    const chatroomsRef = props.user.ref.collection('chatHistory')

    const [matchCard, setMatchCard] = useState([])
    const [chatrooms, setChatrooms] = useState([])
    const [matchState, setMatchState] = useState({
        day: 0,
        time: 20,
        waiting: false,
        inChat: true,
    })
    // carousel = React.createRef<typeof Carousel>();
    const window = useWindowDimensions()

    setHeaderOptions(props.navigation, { title: '聊天室'})

    function displayChatrooms(newChatrooms = []) {    
        newChatrooms.push({
            active: true,
            userNames: [],
            id: '0',
            startedAt: firebase.firestore.Timestamp.now()
        }) 
        setChatrooms(newChatrooms)
    }

    async function loadSetting() {
        let snapshot = await props.user.ref.get()
        let user = snapshot.data()

        firebase.firestore().doc('config/matching').onSnapshot(snapshot => {
            // console.log('onSnapshot', snapshot)
            let matchConfig = snapshot.data()
            setMatchState({
                ...matchConfig,
                waiting: (user.settings && user.settings.chat) ? user.settings.chat : false,
                inChat: (user.settings && user.settings.inChat) ? user.settings.inChat : false,
                verified: (user.verification && user.verification.status) ? user.verification.status : false,
            });
            firebase.firestore().doc(`communities/${user.identity.district || user.identity.community}`).onSnapshot(snapshot => {
                let community = snapshot.data()
                if(user.settings && user.settings.inChat == false) {
                    let newChatrooms = chatrooms
                    setMatchCard([{
                        action: () => {
                            if (checkAuthStatus(user)) {
                                if (community.lineChat != '') {
                                    WebBrowser.openBrowserAsync(community.lineChat);
                                }
                            } 
                        },
                        active: true,
                        userNames: [],
                        id: '0',
                        style: stylesheet.bgLight,
                        startedAt: firebase.firestore.Timestamp.now()
                    }])
                }
            })
        })
    }

    async function loadChatrooms() {
        await loadSetting()
        chatroomsRef
            .orderBy('startedAt')
            .get()
            .then(querySnapshot => {
                const newChatrooms = []
                let promises = []
                // let get_user_promises = []
                // if (querySnapshot.size === 0) {
                //     displayChatrooms(newChatrooms)
                // }
                querySnapshot.forEach(async snapshot => {
                    // console.log(snapshot.data())
                    // snapshot.data().then(data => {
                    const id = newChatrooms.push(snapshot.data()) -1
                    // console.log(id, querySnapshot.length)
                    if(id == querySnapshot.size - 1) {
                        // console.log(get_user_promises)
                        // Promise.all(get_user_promises).finally(() => {
                            // console.log('users', newChatrooms[0].userNames)
                        // if (matchConfig.inChat == false) {
                        //     newChatrooms.push({
                        //         active: true,
                        //         userNames: [],
                        //         id: '0',
                        //         style: stylesheet.bgLight,
                        //         startedAt: firebase.firestore.Timestamp.now()
                        //     }) 
                        // }
                        setChatrooms(newChatrooms.reverse())
                        // console.log('chatrooms', newChatrooms)
                        // })
                    }
                })
            })
    }

    function toggleWaiting() {
        if (!matchState.verified) {  
            Alert.alert('', "您尚未完成身分驗證，請先完成學生身分驗證。",
                [{
                    text: "前往驗證",
                    onPress: () => props.navigation.navigate('Verification', {user: props.user})
                }, {
                    text: "取消",
                    // onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                }]
            )
        } else if (!matchState.inChat) {
            props.user.ref.update({
                settings: {
                    chat: !matchState.waiting,
                    inChat: false,
                }
            })
            setMatchState({
                ...matchState,
                waiting: !matchState.waiting,
            })
        } else {
            Alert.alert('', matchState.alert)
        }
    }

    useEffect(() => {
        // if(databaseSnapshot.exists) 
        loadChatrooms()
        // console.log('chatrooms', chatrooms)
    }, [])

    useFocusEffect(
        React.useCallback(() => {
            checkAuthStatus(user, props, "馬上完成註冊，解鎖在地聊天室。\n與你的鄰居們即時開啟話題交流！")
        }, [])
    )  

    return (
        <View style={stylesheet.container}>
            { chatrooms && (
                <View style={{ flex: 1 }}>
                    <Carousel
                        layout={'default'}
                        style={{ flex: 1 }}
                        data={matchCard.concat(chatrooms)}
                        renderItem={({item}) => <Chatroom 
                            item={item} size={window.width * 1.5} 
                            navigation={props.navigation}
                            toggleWaiting={toggleWaiting} 
                            matchState={matchState}
                        />}
                        sliderWidth={window.width}
                        itemWidth={window.width * 0.6 + 30}
                        itemHeight={window.width * 0.8}
                        sliderHeight={window.width * 0.8}
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
