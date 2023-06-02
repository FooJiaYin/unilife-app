import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useFocusEffect } from "@react-navigation/native";
import { setHeaderOptions } from '../components/navigation'
import { stylesheet, Color } from '../styles'
import { firebase } from '../firebase/config'
import { ArticleTabs } from '../components/articles/articleTabs'
import { getUnique } from '../utils/array'
import { checkAuthStatus } from '../utils/auth'
import time from '../utils/time'

export default function ArticleListScreen(props) {
    
    const articlesRef = firebase.firestore().collection('articles')
    const [user, setUser] = useState()
    const [articles, setArticles] = useState({
        all: [],
        announcement: [],
        local: [],
        news: []
    })

    async function loadUserData() {
        console.log("loadUserData")
        props.user.ref.onSnapshot(async snapshot => {
            console.log("userData received")
            let userData = await snapshot.data()
            if (!user) {
                setUser(userData)
                recommendation(userData)
            } else if (userData.recommendation[0] != user.recommendation[0]) {
                setUser(userData)
            }
        })
    }
    
    async function loadArticles() {
        console.log("loadArticles", user.recommendation[0])
        // console.log(time().diff(time(user.lastActive), 'minutes'))
        articlesRef
        .where("community", "in", user.identity.communities.concat(["all"]))
        .where("status", "==", "published")
        .where("pinned", "==", true)
        .onSnapshot(querySnapshot => {
            const newArticles = {
                all: [],
                announcement: [],
                local: [],
                news: []
            }
            const savedArticles = user.bookmarks || []
            // console.log("recommendation", user.recommendation)
            // console.log(savedArticles)
            // newArticles.all = user.recommendation.map(articleId => {id: articleId}) || []
            // setArticles(newArticles)
            console.log("articles received")
            // let promises = []
            querySnapshot.forEach(async snapshot => {
                const article = snapshot.data()
                if (article.category && ['announcement', 'local', 'news'].includes(article.category)) {
                    article.isSaved = savedArticles != undefined && savedArticles.includes(snapshot.id)
                    newArticles[article.category].push(article)
                    newArticles.all.push(article)
                }
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
            
            for (const articleId of user.recommendation) {
                if (!newArticles.all.find(article => article.id === articleId)) {
                    const article = { id: articleId }
                    newArticles['all'].push(article)
                }
            }
            
            for (const [i, articleId] of user.recommendation.entries()) {
                firebase.firestore().doc('articles/' + articleId).get().then((snapshot) => {
                    // const snapshot = await firebase.firestore().doc('articles/' + articleId).get()
                    const article = snapshot.data()
                    article.isSaved = (savedArticles != undefined) && savedArticles.includes(articleId)
                    // newArticles['all'][i] = article
                    if (article && article.category && ['announcement', 'local', 'news'].includes(article.category) && !article.pinned) {
                        newArticles[article.category].push(article)
                    }
                })
            }
            console.log("fin")
            setArticles(newArticles)
        })
    }

    async function recommendation(user) {
        console.log("recommendation", user.id)
        let recommendations = {
            all: [],
            announcement: [],
            local: [],
            news: [],
            none: [],
        }
        console.log("recommendation", time().diff(time(user.lastActive), 'minutes'))
        if (user.id != "anonymous" && time().diff(time(user.lastActive), 'minutes') > 3) {
            console.log("recommendation", time().diff(time(user.lastActive), 'minutes'))
            var lastRenewed = new Date((new Date()).valueOf() - 3000*60*60*24);
            lastRenewed = (lastRenewed < user.lastActive.toDate()) ? lastRenewed : user.lastActive.toDate()
            firebase.firestore().collection('articles')
            .where("community", "in", user.identity.communities.concat(["all"]))
            .where('status', '==', 'published')
            .where('pinned', '==', false)
            .where('publishedAt', '>=', lastRenewed)
            .orderBy('publishedAt', 'desc').get().then(article_querySnapshot => {
                article_querySnapshot.forEach(articleSnapshot => {
                    const article = articleSnapshot.data()
                    if(!user.recommendation.includes(articleSnapshot.id) && article.topic && article.topic != '') {
                        // console.log(data.title, data.publishedAt.toDate(), data.topic)
                        // console.log(user.score[article.topic],article.title, article.topic)
                        // recommendations.all.push({id: articleSnapshot.id, score: user.score[article.topic]})
                        if (article && article.category && ['announcement', 'local', 'news'].includes(article.category)) {
                            recommendations[article.category].push({id: articleSnapshot.id, score: user.score[article.topic]})
                        } else {
                            // recommendations.none.push({id: articleSnapshot.id, score: user.score[article.topic]})
                        }
                    }
                    // console.log(user.score[article.topic],article.title, article.topic)
                })
            }).catch(err => {
                alert(err)
            }).finally(async () => {
                // setArticles(newArticles)
                // console.log(newArticles.all)
                // recommendations.all.sort((a, b) => b.score - a.score);
                let count = {}, ratio = {}, minCount = 200
                for (const key in recommendations) {
                    recommendations[key] = recommendations[key].sort((a, b) => b.score - a.score)
                    // recommendations[key] = recommendations[key].map(recommendation => recommendation.id)
                    count[key] = recommendations[key].length
                    if (count[key] > 200) count[key] = 200
                    if (count[key] < minCount && count[key] > 0) minCount = count[key]
                }
                // console.log(recommendations)
                // console.log(count)
                // let minCount = Math.min(count.announcement, count.local, count.news)
                for (const key in count) {
                    ratio[key] = Math.ceil(count[key] / minCount)
                    if (ratio[key] > 10) ratio[key] = 10
                }
                console.log(ratio)
                for (let i = 0; i < 20; i++) {
                    let temp = []
                    for (const key in recommendations) {
                        for (let j = 0; j < ratio[key]; j++) {
                            if (i * ratio[key] + j < count[key]) {
                                // console.log(key, i * ratio[key] + j, count[key])
                                temp.push(recommendations[key][i * ratio[key] + j])
                            }
                        }
                    }
                    temp = temp.sort((a, b) => b.score - a.score).map(recommendation => recommendation.id)
                    console.log(temp)
                    recommendations.all.push(...temp)
                }
                // console.log('all', recommendations.all)
                recommendations.all = getUnique(recommendations.all.concat(user.recommendation).slice(0, 500))
                // console.log('all', recommendations.all.length)
                // Update user
                firebase.firestore().collection('users').doc(user.id).update({
                    recommendation: recommendations.all,
                    lastActive: firebase.firestore.FieldValue.serverTimestamp()
                })
                for (const articleId of recommendations.all) {
                    // const snapshot = await firebase.firestore().doc('articles/' + articleId).get()
                    // const article = snapshot.data()
                    // article.isSaved = (savedArticles != undefined) && savedArticles.includes(articleId)
                    // newArticles['all'].push(article)
                    // if (article && article.category && ['announcement', 'local', 'news'].includes(article.category)) {
                    //     newArticles[article.category].push(article)
                    // }
                    if(!user.recommendation.includes(articleId)) {
                        firebase.firestore().collection('behavior').add({
                            user: user.id,
                            article: articleId,
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
                }
            })
        }
    }
    // console.log("Ref", firebase.firestore().doc('articles/9qAFUBpb7n0U1bzylreO'))

    const options = {
        title: 'Uni資訊',
        headerLeft: {
            icon: 'refresh',
            onPress: () => recommendation()
        },
        headerRight: {
            icon: 'bookmark',
            onPress: () => props.navigation.push('Filter', {type: 'saved'})
        }
    }

    useEffect(() => {
        loadUserData()
    }, [])

    useEffect(() => {
        checkAuthStatus(user, props, "馬上完成註冊，解鎖資訊列表。\n取得專屬於你的在地新聞與活動！")
        if (user) loadArticles()
    }, [user])

    useFocusEffect(
        React.useCallback(() => {
            console.log("focus", user)
            checkAuthStatus(user, props, "馬上完成註冊，解鎖資訊列表。\n取得專屬於你的在地新聞與活動！")
            if (user) recommendation()
            else loadUserData()
        }, [])
    )

    setHeaderOptions(props.navigation, options)

    return (
        <View style={stylesheet.container}>
            <ArticleTabs key={'news'} titles={['所有文章', '公佈欄', '在地生活', '精選内容']} articles={articles} {...props} />
        </View>
    )
}