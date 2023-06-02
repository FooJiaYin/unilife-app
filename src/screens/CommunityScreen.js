import React, { useEffect, useState } from 'react'
import { useFocusEffect } from "@react-navigation/native";
import { FlatList, TextInput, Alert, TouchableOpacity, View, StyleSheet,Image, TouchableHighlight } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { stylesheet, Color } from '../styles'
import { ArticleListItem } from '../components/lists'
import { ScrollTags } from '../components/articles/tags'
import { firebase } from '../firebase/config'
import { featuredTags } from '../firebase/functions'
import Asset from '../components/assets'
import { checkAuthStatus } from '../utils/auth'

function PostBar (props) {
    const [editIconColor, setEditIconColor] = useState(Color.grey1);
    const [historyIconColor, setHistoryIconColor] = useState(Color.grey1);
    return (
        <TouchableHighlight 
            onPress={() => props.navigation.navigate('NewArticle')}
            onShowUnderlay={() => setEditIconColor(Color.blue)}
            onHideUnderlay={() => setEditIconColor(Color.grey1)}
            underlayColor={'#0000'}
        >
            <View style={[stylesheet.inputBar, {
                paddingTop: 0,
                paddingBottom: 4,
                marginBottom: 0,
                paddingHorizontal: 12,
            }]}>
                <TouchableHighlight 
                    onPress={() => props.navigation.navigate('Filter', {type: 'history'})}
                    onShowUnderlay={() => setHistoryIconColor(Color.blue)}
                    onHideUnderlay={() => setHistoryIconColor(Color.grey1)}
                    underlayColor={'#0000'}
                >
                    <Image source={Asset('history')} style={[stylesheet.iconColor, {tintColor: historyIconColor, width: 32, height: 32}]} />
                </TouchableHighlight>
                <TextInput
                    style={{...stylesheet.input, flex: 1, marginHorizontal: 12}}
                    editable={false}
                    placeholder='發布貼文；提出問題...'
                    placeholderTextColor="#aaaaaa"
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                    />
                {/* <Button  style={{...stylesheet.bgLight, flex: 1}} title="分享您的想法..."  /> */}
                <Image source={Asset('edit')} style={[stylesheet.iconColor, {tintColor: editIconColor, width: 28, height: 28}]} />
            </View>
        </TouchableHighlight>
    )
}


export default function CommunityScreen(props) {
    
    const articlesRef = firebase.firestore().collection('articles')
    let user
    const [communitiesName, setCommunitiesName] = useState(["", ""])
    const [articles, setArticles] = useState({
        all: [],
        announcement: [],
        local: [],
        news: []
    })
    
    async function loadArticles() {
        // console.log("identity", user.identity.community)
        let snapshot = await props.user.ref.get()
        user = await snapshot.data()
        const newArticles = {
            all: [],
        }
        newArticles[user.identity.district] = []
        newArticles[user.identity.county] = []
        newArticles['history'] = []
        setCommunitiesName([user.identity.district, user.identity.county])
        const savedArticles = user.bookmarks || []
        // console.log("recommendation", user.recommendation)
        console.log(user.identity.communities.concat(["all"]))
        // newArticles.all = user.recommendation.map(articleId => {id: articleId}) || []
        // setArticles(newArticles)
        articlesRef
            .where("community", "in", user.identity.communities.concat(["all"]))
            .where("category", "==", 'posts')
            .orderBy("pinned", 'desc')
            .where("status", "==", "published")
            .orderBy('publishedAt', 'desc')
            .get().then(querySnapshot => {
                // let promises = []
                querySnapshot.forEach(async snapshot => {
                    console.log(snapshot.id)
                    const article = snapshot.data()
                    article.isSaved = savedArticles != undefined && savedArticles.includes(snapshot.id)
                    if (article.community && article.community != 'all') {
                        newArticles[article.community].push(article)
                    }
                    newArticles['all'].push(article)
                    firebase.firestore().collection('behavior').where('user','==', props.user.id).where('article', '==', snapshot.id).get().then(querySnapshot => {
                        if(querySnapshot.docs.length == 0) {
                            firebase.firestore().collection('behavior').add({
                                user: user.id,
                                article: snapshot.id,
                                stats: {
                                    unread: true,
                                    read: 0,
                                    readDuration: {
                                        total: 0.0,
                                        max: 0.0,
                                    },
                                    save: false,
                                    like: false,
                                    share: 0,
                                    comment: 0,
                                    report: 0
                                },
                                logs: []
                            })
                        }
                    })
                })
                setArticles(newArticles)
                console.log("new articles", newArticles)
            })
    }
    // console.log("Ref", firebase.firestore().doc('articles/9qAFUBpb7n0U1bzylreO'))

    const options = {
        title: '在地社群',
        headerLeft: {
            icon: 'refresh',
            onPress: () => loadArticles()
        },
        headerRight: {
            icon: 'bookmark',
            onPress: () => props.navigation.navigate('Filter', {type: 'saved'})
        }
    }

    setHeaderOptions(props.navigation, options)
    
    function newArticle() {
        firebase.firestore().doc('users/' + props.user.id).get().then(snapshot => {
            const verification = snapshot.data().verification
            if (verification && verification.status == true) {
                props.navigation.navigate('NewArticle')
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
    useFocusEffect(
        React.useCallback(() => {
            checkAuthStatus(user, props, "馬上完成註冊，解鎖社群功能。\n看看你的鄰居都在討論那些在地大小事！")
            if (!user) loadUserData()
        }, [])
    )  
    useEffect(() => {
        console.log(articles)
        console.log(articles)
        loadArticles().then(() => {
            // setArticles(newArticles)
        })
    }, [])

    useEffect(() => {
        if (user) loadArticles()
        checkAuthStatus(user, props, "馬上完成註冊，解鎖社群功能。\n看看你的鄰居都在討論那些在地大小事！")
    }, [user])

    return (
        <View style={[stylesheet.container, {}]}>
            <ScrollTags {...props} tags={featuredTags['community']} />
            <View style={{flex: 1}}>

            <FlatList
                    data={articles['all']}
                    renderItem={({item}) => <ArticleListItem item={item} {...props} />}
                    keyExtractor={(item) => item.id}
                    removeClippedSubExpandCards={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{marginBottom: 0, paddingBottom: 150}}
                /> 
            </View>
            {/* <ArticleTabs titles={['所有貼文', ...communitiesName, '我的貼文']} articles={articles} {...props} /> */}
            <PostBar {...props} />
        </View>
    )
}