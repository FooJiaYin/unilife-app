import React, { useEffect, useState } from 'react'
import { FlatList, Alert, Text, SafeAreaView, TouchableOpacity, ScrollView, View, TextInput, Linking, useWindowDimensions } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { stylesheet, htmlStyles } from '../styles/styles'
import { firebase } from '../firebase/config'
import RenderHtml from 'react-native-render-html'
import { WebView } from 'react-native-webview';
import { GiftedChat } from 'react-native-gifted-chat'
import { Chip } from '../components/chip'
import { Comment } from '../components/messages'
// import HTMLView from 'react-native-htmlview';
// import CommentScreen from './CommentScreen'
import time from '../utils/time'
import { tagNames } from '../firebase/functions'

export default function ArticleScreen(props) {

    const article = props.route.params.article
    let user = props.user.data()
    const storageRef = firebase.storage().ref()
    const commentsRef = firebase.firestore().collection('articles').doc(article.id).collection('comments')

    const [content, setContent] = useState(article.content)
    const [messages, setMessages] = useState([])
    const [source, setSource] = useState(article.meta.source)

    const options = {
        title: source,
        headerLeft: 'back',
        headerRight: {
            icon: 'chat',
            size: 18,
            onPress: () => {
                firebase.firestore().doc('users/' + user.id).get().then(snapshot => {
                    user = snapshot.data()
                    const verification = snapshot.data().verification
                    if (verification && verification.status == true) {
                        props.navigation.navigate('Comment', {article: article, commentsRef: commentsRef})
                    } else {
                        Alert.alert('', "您尚未完成身分驗證，請先完成學生身分驗證。",
                            [{
                                text: "前往驗證",
                                onPress: () =>props.navigation.navigate('Verification', {user: props.user})
                            }, {
                                text: "取消",
                                // onPress: () => console.log("Cancel Pressed"),
                                style: "cancel"
                            }]
                        )
                    }
                })
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
    
    function loadSource() {
        if (source == '社群貼文') {
            firebase.firestore().doc('users/' + article.publishedBy).get().then(snapshot => {
                setSource(snapshot.data().info.nickname)
                setHeaderOptions(props.navigation, options)
            })
        }
    }

    function loadMessages() {
        firebase.firestore().collection('behavior').where('user','==', user.id).where('article', '==', article.id).get().then(querySnapshot => {
            let data = querySnapshot.docs[0].data()
            console.log(data.stats.like)
            setLiked(data.stats.like)
        })
        commentsRef.orderBy('timestamp').onSnapshot(querySnapshot => {
        // commentsRef.orderBy('timestamp').get().then(querySnapshot => {
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
                            // setMessages(messageList)
                            // console.log(messageList[id].user._id, user.id, messageList[id].text)
                        })
                )
                // const snapshot = await message.user.get()
                // messageList[id].user = snapshot.data().info.nickname
                // messageList[id].replies = commentsRef.doc(doc.id).collection('replies')
                // if (messageList[id].timestamp == null) {
                //     messageList[id].timestamp = firebase.firestore.Timestamp.now();
                // }
            })
            Promise.all(promises).then(() => {
                setMessages(messageList)
                // console.log('complete')
            })
        })
    }

    useEffect(() => {
        loadMessages()
        loadSource()
    }, [])

      const Chips = []
      for (const tag of (article.tags || [])) {
          Chips.push(<Chip label={tagNames[tag]} type={'tag'} action={()=>props.navigation.navigate('Filter', {type: 'tag', data: tag}) } />)
      }

    return (
        <SafeAreaView style={stylesheet.container}>
            <View style={{ flex: 1, }}>{(article.meta.url && article.meta.url != '') ? 
                <WebView source={{ uri: article.meta.url }} />
                :
                <ScrollView style={stylesheet.scrollView}>
                    <View style={stylesheet.articleContainer}>
                        <Text style={stylesheet.articleTitle}>
                            {article.title}
                        </Text>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={[stylesheet.textS, {marginRight: 6}]}>
                                {source + ' @ '}
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
                    {user.verification && user.verification.status == true ?
                    <View>
                        <View style={stylesheet.borderBottom}></View>
                        <Text style={{...stylesheet.headerText, marginVertical: 12}}>留言區</Text>
                        <FlatList
                            data={messages}
                            renderItem={({item}) => {
                                const message = {
                                    currentMessage: item,
                                    user: item.user.name,
                                    profileImage: item.user.avatar,
                                    timestamp: item.createdAt,
                                    content: item.text,
                                    position: item.position
                                }
                                return <Comment {...message} />
                            }}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>
                    : null}
                </ScrollView>
            }
       
            </View>
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
                {/*<FlatList
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
                </View> */}
                </ScrollView>
            }
        </SafeAreaView>
    )
}
