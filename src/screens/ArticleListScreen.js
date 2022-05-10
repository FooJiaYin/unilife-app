import React, { useEffect, useState } from 'react'
import { FlatList, Text, Alert, ScrollView, View, StyleSheet,Image, useWindowDimensions } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { stylesheet, Color } from '../styles'
import { firebase } from '../firebase/config'
import { ArticleTabs } from '../components/articles/articleTabs'

export default function ArticleListScreen(props) {
    
    const articlesRef = firebase.firestore().collection('articles')
    let user
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
            announcement: [],
            local: [],
            news: []
        }
        const savedArticles = user.bookmarks || []
        let recommendations = {
            all: [],
            announcement: [],
            local: [],
            news: [],
            none: [],
        }
        // console.log("recommendation", user.recommendation)
        // console.log(savedArticles)
        // newArticles.all = user.recommendation.map(articleId => {id: articleId}) || []
        // setArticles(newArticles)
        articlesRef
            .where("community", "in", user.identity.communities.concat(["all"]))
            .where("status", "==", "published")
            .where("pinned", "==", true)
            .get().then(querySnapshot => {
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
                    const article = { id: articleId }
                    newArticles['all'].push(article)
                }
                setArticles(newArticles)
            }).then(() => {
                for (const [i, articleId] of user.recommendation.entries()) {
                    firebase.firestore().doc('articles/' + articleId).get().then((snapshot) => {
                        // const snapshot = await firebase.firestore().doc('articles/' + articleId).get()
                        const article = snapshot.data()
                        article.isSaved = (savedArticles != undefined) && savedArticles.includes(articleId)
                        // newArticles['all'][i] = article
                        if (article && article.category && ['announcement', 'local', 'news'].includes(article.category)) {
                            newArticles[article.category].push(article)
                        }
                    })
                }
                // setArticles(newArticles)
                // console.log("finally", newArticles)
                // setArticles(newArticles)
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
                    recommendations.all = recommendations.all.concat(user.recommendation).slice(0, 500)
                    // console.log('all', recommendations.all.length)
                    // Update user
                    // console.log("gg")
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
                    // setArticles(newArticles)
                })
            }).finally(() => {
                // console.log(newArticles.all)
                setArticles(newArticles)
                // console.log(recommendations.concat(data.recommendation).slice(0,200))
                // console.log(recommendations.concat(data.recommendation).slice(0,200))
            })
    }
    // console.log("Ref", firebase.firestore().doc('articles/9qAFUBpb7n0U1bzylreO'))

    const options = {
        title: 'Uni資訊',
        headerLeft: {
            icon: 'refresh',
            onPress: () => loadArticles()
        },
        headerRight: {
            icon: 'bookmark',
            onPress: () => props.navigation.navigate('Filter', {type: 'saved'})
        }
    }

    useEffect(() => {
        loadArticles().then(() => {
            // setArticles(newArticles)
        })
    }, [])

    setHeaderOptions(props.navigation, options)

    return (
        <View style={stylesheet.container}>
            <ArticleTabs key={'news'} titles={['所有文章', '公佈欄', '在地生活', '精選内容']} articles={articles} {...props} />
        </View>
    )
}