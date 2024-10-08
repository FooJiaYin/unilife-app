import React, { useEffect, useState } from 'react'
import { Platform, FlatList, Alert, Text, SafeAreaView, TouchableOpacity, ScrollView, View, KeyboardAvoidingView, TextInput, useWindowDimensions } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { HeaderButton, setHeaderOptions } from '../components/navigation'
import { stylesheet, htmlStyles } from '../styles/styles'
import { firebase } from '../firebase/config'
import RenderHtml from 'react-native-render-html'
import { WebView } from 'react-native-webview';
import { GiftedChat } from 'react-native-gifted-chat'
import { Chip } from '../components/chip'
import { InputBar, Comment } from '../components/messages'
import { ReportModal } from '../components/report'
// import HTMLView from 'react-native-htmlview';
// import CommentScreen from './CommentScreen'
import time from '../utils/time'
import { tagNames } from '../firebase/functions'

export default function ArticleScreen(props) {
    let articleId = props.route.params.article?.id ?? props.route.params.id;
    let user = props.user.data();
    const storageRef = firebase.storage().ref();
    const commentsRef = firebase.firestore().collection('articles').doc(articleId).collection('comments');

    const [article, setArticle] = useState(props.route.params.article)
    const [content, setContent] = useState(props.route.params.article?.content ?? "")
    const [liked, setLiked] = useState(false)
    const [messages, setMessages] = useState([])
    const [source, setSource] = useState(props.route.params.article?.meta.source ?? "")
    const [isModalVisible, setModalVisibility] = useState(false)

    useEffect(() => {
        console.log('loading article', props.route.params.id)
        if (props.route.params.id) {
            firebase.firestore().collection('articles').doc(articleId).get().then(snapshot => {
                setArticle(snapshot.data());
            });
        } else {
            setHeader(props.route.params.article);
            loadSource(props.route.params.article);
            setImages(props.route.params.article);
        }
        loadMessages()
    }, []);

    useEffect(() => {
        if (!article) return;
        setSource(article?.meta.source);
        setHeader(article)
        loadSource(article);
        setImages(article);
    }, [article]);

    setHeaderOptions(props.navigation, {
        title: source,
        headerLeft: 'back'
    });

    function setHeader(article) {
        const headerRight = source == '社群貼文' ?
            article?.publishedBy == user.id ?
                {
                    icon: 'trash',
                    size: 20,
                    onPress: () => {
                        {
                            Alert.alert('', "您確定要刪除這篇文章嗎？",
                                [{
                                    text: "確定",
                                    onPress: () => {
                                        firebase.firestore().collection('articles').doc(articleId).update({
                                            status: 'deleted'
                                        }).then(() => {
                                            props.navigation.goBack();
                                        });
                                    }
                                }, {
                                    text: "取消",
                                }]
                            );
                        }
                    }
                } :
                {
                    icon: 'flag',
                    size: 20,
                    onPress: () => setModalVisibility(true)
                } :
            {
                icon: 'chat',
                size: 18,
                onPress: () => {
                    firebase.firestore().doc('users/' + user.id).get().then(snapshot => {
                        user = snapshot.data();
                        const verification = snapshot.data().verification;
                        if (verification && verification.status == true) {
                            props.navigation.navigate('Comment', { article: article, commentsRef: commentsRef });
                        } else {
                            Alert.alert('', "您尚未完成身分驗證，請先完成學生身分驗證。",
                                [{
                                    text: "前往驗證",
                                    onPress: () => props.navigation.navigate('Verification', { user: props.user })
                                }, {
                                    text: "取消",
                                    // onPress: () => console.log("Cancel Pressed"),
                                    style: "cancel"
                                }]
                            );
                        }
                    });
                }
            };
        props.navigation.setOptions({
            headerRight: () => (<HeaderButton {...headerRight} />),
        });
    }
    // setHeaderOptions(props.navigation, options)
 // console.log('title', article.meta.source)

    function setImages(article) {
        /* Get Images */
        let newContent = article.content;
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
    }

    function loadSource(article) {
        if (article.meta.source == '社群貼文') {
            firebase.firestore().doc('users/' + article.publishedBy).get().then(snapshot => {
                setSource(snapshot.data().info.nickname)
            })
            firebase.firestore().doc('communities/' + article.community).get().then(snapshot => {
                props.navigation.setOptions({ title: snapshot.data().name })
            })
        }
    }

    function loadMessages() {
        firebase.firestore().collection('behavior').where('user','==', user.id).where('article', '==', articleId).get().then(querySnapshot => {
            let data = querySnapshot.docs[0].data()
            // console.log(data.stats.like)
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

    function sendMessage(inputText, clearInput) {
        firebase.firestore().doc('users/' + user.id).get().then(snapshot => {
            user = snapshot.data()
            const verification = snapshot.data().verification
            if (verification && verification.status == true) {
                if (inputText && inputText.length > 0) {
                    const data = {
                        user: user.id,
                        content: inputText,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    }
                    commentsRef.add(data)
                        .catch((error) => {
                            alert(error)
                        })
                }
                clearInput({}, true)
                // messages.push({
                //     user: user.info.nickname,
                //     position: 'left',
                //     // replies: commentsRef.doc(doc.id).collection('replies'),
                //     timestamp: firebase.firestore.Timestamp.now(),
                //     // _id: id,
                //     createdAt: firebase.firestore.Timestamp.now(),
                //     text: inputText,
                //     user: {
                //         _id: user.id,
                //         name: user.info.nickname,
                //         avatar: user.info.profileImage
                //     }
                // })
                firebase.firestore().collection('behavior').where('user', '==', user.id).where('article', '==', articleId).get().then(querySnapshot => {
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
                firebase.firestore().collection('articles').doc(articleId).update({
                    stats: {
                        ...article.stats,
                        comment: article.stats.comment + 1,
                    }
                })
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
                return;
            }
        })
    }

    function like(_liked) {
        setLiked(_liked)
        firebase.firestore().collection('behavior').where('user', '==', user.id).where('article', '==', articleId).get().then(querySnapshot => {
            let behaviorRef = querySnapshot.docs[0].ref
            // console.log(behaviorRef.id)
            let data = querySnapshot.docs[0].data()
            behaviorRef.update({
                stats: {
                    ...data.stats,
                    like: _liked,
                },
                logs: firebase.firestore.FieldValue.arrayUnion({
                    action: _liked? 'like' : 'unlike',
                    time: firebase.firestore.Timestamp.now()
                })
            })
        })
        article.stats.like = article.stats.like || 0
        article.stats.like = _liked ? article.stats.like + 1 : article.stats.like - 1
        firebase.firestore().collection('articles').doc(articleId).update({
            stats: {
                ...article.stats,
                like: article.stats.like
            }
        })
    }

    const Wrapper = (props) => Platform.OS === "ios" ? <KeyboardAwareScrollView>{props.children}</KeyboardAwareScrollView> : <View>{props.children}</View>;

    return (
        <SafeAreaView style={stylesheet.container}>
            <ReportModal visible={isModalVisible} onClose={()=>setModalVisibility(false)} article={{...article, source}} user={user} />
            {article &&
            <View style={{ flex: 1, }}>{(article.meta.url && article.meta.url != '') ? 
                <WebView source={{ uri: article.meta.url }} />
                :
                <ScrollView style={stylesheet.scrollView}>
                    <View style={stylesheet.articleContainer}>
                        <Text style={stylesheet.articleTitle}>
                            {article.title}
                        </Text>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={[stylesheet.textS, {marginRight: 6}]} onPress={() => props.navigation.push('Filter', { type: 'user', data: article.publishedBy, category: article.category })}>
                                {source}
                            </Text>
                            <Text style={[stylesheet.textS, {marginRight: 6}]}>
                                {' @ ' + time(article.publishedAt).format('YYYY/M/D h:mm a')}
                            </Text>
                            {article.tags && article.tags.map((tag) => <Chip label={tagNames[tag] || tag} type={'tag'} action={() => props.navigation.push('Filter', { type: 'tag', data: tag, category: article.category })} />)}
                        </View>
                        <RenderHtml
                            source={{html: content}}
                            tagsStyles={htmlStyles}
                            // contentWidth={useWindowDimensions().width - 40}
                        />
                    </View>
                    {user.verification && user.verification.status == true &&
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
                    </View>}
                </ScrollView>
            }
       
            </View>
            }
            <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={90} enabled={Platform.OS === "ios"}>
      
            <InputBar sendMessage={sendMessage} like={liked} setLike={like} />
            {/* <Wrapper>
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
                <View>
                    <View style={stylesheet.borderBottom}></View>
                    <Text style={{...stylesheet.headerText, marginVertical: 12}}>留言區</Text>
                </View>
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
                <View style={{height: 80}}></View>
                </ScrollView>
            }
            <InputBar sendMessage={sendMessage} like={liked} setLike={like} />
            </Wrapper> */}
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
