import React, { useEffect, useState } from 'react'
import { useFocusEffect } from "@react-navigation/native";
import { TextInput, Alert, View, Image, TouchableHighlight } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { stylesheet, Color } from '../styles'
import { ScrollTags } from '../components/articles/tags'
import { firebase } from '../firebase/config'
import Asset from '../components/assets'
import { checkAuthStatus } from '../utils/auth'
import { ArticleList } from "../components/articles/articleList";

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
                    onPress={() => props.navigation.push('Filter', {type: 'history'})}
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
    const [user, setUser] = useState()
    const [featuredTags, setFeaturedTags] = useState({})
    const [articles, setArticles] = useState({
        all: [],
        announcement: [],
        local: [],
        news: []
    })

    async function loadUserData() {
        // console.log("identity", user.identity.community)
        props.user.ref.onSnapshot(async snapshot => {
            let userData = await snapshot.data()
            setUser(userData)
        })
    }
    
    async function loadArticles() {
        // console.log(user.identity.communities.concat(["all"]))
        firebase.firestore().collection('userActivity').add({
            user: user.id,
            action: 'community',
            time: firebase.firestore.Timestamp.now()
        }).then(() => {
            // see if there is a duplicate user activity wuth same action and time
            firebase.firestore().collection('userActivity').where('time', '>', Date.now() - 60000).where('user', '==', user.id).where('action', '==', 'community').get().then(snapshot => {
                if (snapshot.size > 1) {
                    snapshot.docs.slice(1).forEach(doc => {
                        doc.ref.delete()
                    })
                }
            })
        }) 
        articlesRef
            .where("community", "in", user.identity.communities.concat(["all"]))
            .where("category", "==", 'posts')
            .orderBy("pinned", 'desc')
            .where("status", "==", "published")
            .orderBy('publishedAt', 'desc')
            .limit(200)
            .onSnapshot(querySnapshot => {
                const newArticles = {
                    all: [],
                }
                newArticles[user.identity.district] = []
                newArticles[user.identity.county] = []
                newArticles['history'] = []
                let savedArticles = user.bookmarks || []

                querySnapshot.forEach(async snapshot => {
                    // console.loglog(snapshot.id)
                    const article = snapshot.data()
                    article.isSaved = savedArticles != undefined && savedArticles.includes(snapshot.id)
                    // if (article.community && article.community != 'all') {
                    //     newArticles[article.community].push(article)
                    // }
                    if (! user.hiddenArticles?.includes(snapshot.id) && ! user.hiddenSources?.includes(article.publishedBy)) {
                        newArticles['all'].push({
                            ...article, 
                            // NOTE: This is a workaround to avoid crash after creating articles
                            // Cause:
                            // The id field is updated after creating article
                            // When this onSnapshot triggered (article created), 
                            // the id field is not yet updated
                            id: snapshot.id,
                        })
                    }
                    // firebase.firestore().collection('behavior').where('user','==', props.user.id).where('article', '==', snapshot.id).get().then(querySnapshot => {
                    //     if(querySnapshot.docs.length == 0) {
                    //         firebase.firestore().collection('behavior').add({
                    //             user: user.id,
                    //             article: snapshot.id,
                    //             stats: {
                    //                 unread: true,
                    //                 read: 0,
                    //                 readDuration: {
                    //                     total: 0.0,
                    //                     max: 0.0,
                    //                 },
                    //                 save: false,
                    //                 like: false,
                    //                 share: 0,
                    //                 comment: 0,
                    //                 report: 0
                    //             },
                    //             logs: []
                    //         })
                    //     }
                    // })
                })
                setArticles(newArticles)
            })
    }
    // console.log("Ref", firebase.firestore().doc('articles/9qAFUBpb7n0U1bzylreO'))
    
    function loadTags() {
        // load tags from firestore 'config/tags['featuredTags']
        firebase.firestore().doc('config/tags').get().then(snapshot => {
            let data = snapshot.data()
            setFeaturedTags(data.featuredTags)
        })  
    }

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

    useFocusEffect(
        React.useCallback(() => {
            checkAuthStatus(user, props, "馬上完成註冊，解鎖社群功能。\n看看你的鄰居都在討論那些在地大小事！")
            if (!user) loadUserData()
        }, [])
    )  

    useEffect(() => {
        loadUserData()
        loadTags()
    }, [])

    useEffect(() => {
        if (user) loadArticles()
        checkAuthStatus(user, props, "馬上完成註冊，解鎖社群功能。\n看看你的鄰居都在討論那些在地大小事！")
    }, [user])

    return (
        <View style={[stylesheet.container, {}]}>
            <ScrollTags {...props} tags={featuredTags['community']} />
            <View style={{flex: 1}}>
                <ArticleList articles={articles['all']} maxToRenderPerBatch {...props} />
            </View>
            {/* <ArticleTabs titles={['所有貼文', ...communitiesName, '我的貼文']} articles={articles} {...props} /> */}
            <PostBar {...props} />
        </View>
    )
}