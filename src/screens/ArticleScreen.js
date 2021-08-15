import React, { useEffect, useState } from 'react'
import { FlatList, Keyboard, Text, SafeAreaView, ScrollView, View, TextInput, TouchableOpacity, useWindowDimensions } from 'react-native'
import { setHeaderOptions } from '../components/header'
import { stylesheet } from '../styles/styles'
import { firebase } from '../firebase/config'
import RenderHtml from 'react-native-render-html'
// import HTMLView from 'react-native-htmlview';
import time from '../utils/time'

export default function ArticleScreen(props) {

    const article = props.route.params.article
    const user = props.user.data()
    const storageRef = firebase.storage().ref()
    const commentsRef = firebase.firestore().collection('articles').doc(article.id).collection('comments')

    const [content, setContent] = useState(article.content)
    const [comments, setComments] = useState([])
    const [inputText, setInputText] = useState([])

    const options = {
        title: article.meta.source,
        headerLeft: 'back',
        headerRight: {
            icon: 'chat',
            style: {
                width: 18,
                height: 18,
            },
            onPress: () => {props.navigation.navigate('Comment', {article: article, commentsRef: commentsRef})}
        }
    }
    console.log('title', article.meta.source)
    setHeaderOptions(props.navigation, options)

    /* Get Images */
    let newContent = content;
    // storageRef.child('articles/' + article.id + '/images/').listAll()
    storageRef.child('articles/9qAFUBpb7n0U1bzylreO/images/').listAll()
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
    
    useEffect(() => {
        commentsRef
            .orderBy('timestamp', 'desc')
            .limit(5)
            // .orderBy('timestamp')
            .onSnapshot(
                querySnapshot => {
                    const comments = []
                    querySnapshot.forEach(async doc => {
                        const comment = doc.data()
                        comment.id = doc.id
                        // console.log(comment)
                        const snapshot = await comment.user.get()
                        comment.user = snapshot.data().info.nickname
                        comment.replies = commentsRef.doc(doc.id).collection('replies')
                        if (comment.timestamp == null) {
                            comment.timestamp = firebase.firestore.Timestamp.now();
                        }
                        comments.unshift(comment)
                        setComments(comments)
                    });
                },
                error => {
                    // console.log(error)
                }
            )
            // setComments([
            //     {id: '1', user: 'zdv', comment: 'First Comment', timestamp: Date.now(), replies: null},
            //     {id: '2', user: 'sdcxrg', comment: 'Second Comment', timestamp: Date.now(), replies: null},
            //     {id: '1', user: 'xdfger', comment: 'Third Comment', timestamp: Date.now(), replies: null}
            // ])
    }, [])

    const commentItem = ({item}) => {
        return (
            <View style={stylesheet.commentItem}>
                <Text style={stylesheet.inputText}>{item.user}</Text>
                <Text style={stylesheet.inputText}>{item.timestamp.toDate().toString()}</Text>
                <Text style={stylesheet.inputText}>{item.content}</Text>
            </View>
        )
    }
    
    const addComment = () => {
        if (inputText && inputText.length > 0) {
            const timestamp = firebase.firestore.FieldValue.serverTimestamp();
            const data = {
                user: firebase.firestore().doc('users/' + user.id),
                comment: inputText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            };
            commentsRef.add(data)
                .then(_doc => {
                    Keyboard.dismiss()
                })
                .catch((error) => {
                    alert(error)
                });
        }
    }

    const tagsStyles = {
        b: {
            fontWeight: 'bold'
        },
        h2: {
            fontSize: 18,
            fontWeight: 'bold',
            marginTop: 18,
            marginBottom: 4,
        },
        p: {
            fontSize: 15,
            lineHeight: 24,
            marginBottom: 8,
        },
        ul: {
            marginBottom: 8
        },
        li: {
            fontSize: 15,
            lineHeight: 24,
            marginLeft: 8
        },
        img: {
            enableExperimentalPercentWidth: true,
            width: '100%',
            justifyContent: 'center',
            alignText: 'center',
            marginVertical: 8
          }
    }
    
    return (
        <SafeAreaView style={stylesheet.container}>
            <ScrollView style={stylesheet.scrollView}>
                <View style={stylesheet.articleContainer}>
                <Text style={stylesheet.articleTitle}>
                    {article.title}
                </Text>
                <Text style={stylesheet.textS}>
                    {article.meta.source + ' '}
                    {time(article.publishedAt).format('YYYY/M/D h:mm a')}
                </Text>
                <RenderHtml
                    source={{html: content}}
                    tagsStyles={tagsStyles}
                    contentWidth={useWindowDimensions().width - 40}
                />
                </View>

                {/* <FlatList
                    data={comments}
                    renderItem={commentItem}
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
        </SafeAreaView>
    )
}
