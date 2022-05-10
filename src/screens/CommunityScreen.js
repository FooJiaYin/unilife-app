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

const PostBar = (props) =>
        <TouchableOpacity 
            onPress={() => props.navigation.navigate('NewArticle')} 
            style={[stylesheet.inputBar, {
                paddingTop: 0,
                paddingBottom: 4,
                marginBottom: 0,
                paddingHorizontal: 12,
            }]}
        >
            <Image source={Asset('edit')} style={[stylesheet.iconColor, {tintColor: Color.grey0, width: 28, height: 28}]} />
            <TextInput
                style={{...stylesheet.input, flex: 1, marginHorizontal: 12}}
                editable={false}
                placeholder='分享您的想法..'
                placeholderTextColor="#aaaaaa"
                underlineColorAndroid="transparent"
                autoCapitalize="none"
                />
            
            <TouchableOpacity onPress={() => props.navigation.navigate('Filter', {type: 'saved'})}>
                <Image source={Asset('history')} style={[stylesheet.iconColor, {tintColor: Color.grey0, width: 32, height: 32}]} />
            </TouchableOpacity>
    </TouchableOpacity>


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
                    if (article.community) {
                        article.isSaved = savedArticles != undefined && savedArticles.includes(snapshot.id)
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

    useEffect(() => {
        console.log(articles)
        console.log(articles)
        loadArticles().then(() => {
            // setArticles(newArticles)
        })
    }, [])

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