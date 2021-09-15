import React, { useEffect, useState } from 'react'
import { FlatList, Alert, Text, SafeAreaView, ScrollView, View, TextInput, Linking, useWindowDimensions } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { stylesheet, htmlStyles } from '../styles/styles'
import { firebase } from '../firebase/config'
import RenderHtml from 'react-native-render-html'
import { WebView } from 'react-native-webview';
import { GiftedChat } from 'react-native-gifted-chat'
import { Chip } from '../components/chip'
import { CommentBubble, ProfileImage, SendButton, Message } from '../components/messages'
// import HTMLView from 'react-native-htmlview';
// import CommentScreen from './CommentScreen'
import time from '../utils/time'
import { tagNames } from '../firebase/functions'

export default function ArticleScreen(props) {

    const article = props.route.params.article
    const user = props.user.data()
    const storageRef = firebase.storage().ref()
    const commentsRef = firebase.firestore().collection('articles').doc(article.id).collection('comments')

    const [content, setContent] = useState(article.content)
    const [messages, setMessages] = useState([])
    const [inputText, setInputText] = useState([])

    const options = {
        title: article.meta.source,
        headerLeft: 'back',
        headerRight: {
            icon: 'chat',
            size: 18,
            onPress: () => {
                if (user.verification && user.verification.status == true) {
                    props.navigation.navigate('Comment', {article: article, commentsRef: commentsRef})
                } else {
                    Alert.alert('', "您尚未完成身分驗證，請先完成學生身分驗證。",
                        [{
                            text: "前往驗證",
                            onPress: () => Linking.openURL("https://supr.link/RWZbE")
                        }, {
                            text: "取消",
                            // onPress: () => console.log("Cancel Pressed"),
                            style: "cancel"
                        }]
                    )
                }
            }
        }
    }
    setHeaderOptions(props.navigation, options)
 // console.log('title', article.meta.source)

    /* Get Images */
    let newContent = content;
    console.log('articles/' + article.id + '/images/')
    storageRef.child('articles/' + article.id + '/images/').listAll()
    // storageRef.child('articles/9qAFUBpb7n0U1bzylreO/images/').listAll()
        .then(async res => {
            for (const imageRef of res.items) {
                // console.log('<img src="'+imageRef.name+'"')
                const url = await imageRef.getDownloadURL()
                // console.log('<img src="'+url+'"')
                newContent = newContent.replace('<img src="'+imageRef.name+'"', '<img src="'+url+'" style="width: 100%"')
                // console.log(newContent)
            }
            setContent(newContent)
        })

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
            }
            clearInput({}, true)
        }
    
        useEffect(() => {
            loadMessages()
        }, [])
    
        const renderBubble = ({user, currentMessage}) => {
            const message = {
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
            return <ProfileImage url={currentMessage.user.avatar} />
      }
    
    //   const renderSend = ({text}) => <SendButton input={text} onSend={sendMessage}/>
      const renderSend = ({text, onSend}) => <SendButton input={text} onSend={() => sendMessage(text, onSend)} />

      const Chips = []
      for (const tag of (article.tags || [])) {
          Chips.push(<Chip label={tagNames[tag]} type={'tag'} action={()=>props.navigation.navigate('Filter', {type: 'tag', data: tag}) } />)
      }

    return (
        <SafeAreaView style={stylesheet.container}>
            {(article.meta.url && article.meta.url != '') ? 
                <WebView source={{ uri: article.meta.url }} />
            :
                <ScrollView style={stylesheet.scrollView}>
                    <View style={stylesheet.articleContainer}>
                    <Text style={stylesheet.articleTitle}>
                        {article.title}
                    </Text>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={[stylesheet.textS, {marginRight: 6}]}>
                            {article.meta.source + ' @ '}
                            {time(article.publishedAt).format('YYYY/M/D h:mm a')}
                        </Text>
                        { Chips }
                    </View>
                    <RenderHtml
                        source={{html: content}}
                        tagsStyles={htmlStyles}
                        contentWidth={useWindowDimensions().width - 40}
                    />
                    </View>
                    {/* <GiftedChat
                        messages={messages}
                        renderBubble={renderBubble}
                        renderAvatar={renderAvatar}
                        renderSend={renderSend} 
                        renderDay={() => <></>}
                        // onSend={messages => Send(messages[0].text)}
                        showAvatarForEveryMessage={true}
                        renderAvatarOnTop = {true}
                        // alignTop={true}
                        user={{_id: ''}}
                    /> */}
                <FlatList
                    data={messages}
                    renderItem={Message}
                    keyExtractor={(item, index) => index.toString()}
                    // removeClippedSubviews={true}
                />
                <View style={stylesheet.formContainer}>
                    <TextInput
                        style={stylesheet.input}
                        placeholder='留言...'
                        placeholderTextColor="#aaaaaa"
                        onChangeText={(text) => setInputText(text)}
                        value={inputText}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity style={stylesheet.button} onPress={addComment}>
                        <Text style={stylesheet.buttonText}>送出</Text>
                    </TouchableOpacity>
                </View>
                </ScrollView>
            }
        </SafeAreaView>
    )
}
