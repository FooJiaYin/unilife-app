import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { stylesheet } from '../styles'
import { firebase } from '../firebase/config'
import { tagNames } from '../firebase/functions'
import { ArticleList } from "../components/articles/articleList";

export default function FilterScreen({type, ...props}) {
    // console.log(props)
    
    let user
    const [filter, setFilter] = useState(props.route.params)
    // const collection = props.route.params.collection || 'articles'
    let articlesRef = firebase.firestore().collection('articles')
    const [articles, setArticles] = useState([])
    // console.log("Ref", firebase.firestore().doc('articles/9qAFUBpb7n0U1bzylreO'))

    const options = {
        title: (filter.type == 'saved')? '收藏' : 
                (filter.type == 'history')? '我的貼文' : 
                '#' + (tagNames[filter.data] || filter.data),
        headerLeft: 'back'
    }

    async function loadSavedArticles() {
        // console.log("community", user.community)
        // console.log("identity", user.identity.community)
        const newArticles = []
        
        let snapshot = await props.user.ref.get()
        user = await snapshot.data()
        const savedArticles = user.bookmarks? user.bookmarks.reverse() : []
        let promises = []
        // console.log("bookmarks", savedArticles)
        for (var id of savedArticles) {
            const snapshot = await articlesRef.doc(id).get()
            const article = snapshot.data()
            article.id = snapshot.id
            /* Get Images */
            article.isSaved = savedArticles.includes(article.id)
            // promises.push(
            //     // storageRef.child('articles/' + article.id + '/images/' + article.meta.coverImage).getDownloadURL()
            //     storageRef.child('articles/9qAFUBpb7n0U1bzylreO/images/' + article.meta.coverImage).getDownloadURL()
            //         .then((url) => {
            //             article.imageUrl = url
            //         })
            //         .catch((e) => {
            //             // console.log('Errors while downloading => ', e)
            //         })
            //         .finally(() => {
                        newArticles.push(article)
            //         })
            // )
        }
        Promise.all(promises).finally(() => {
            // console.log("End promises", newArticles)
            setArticles(newArticles)
        })
    }

    let loadArticles = async function (filter) {
        // console.log("community", user.community)
        // console.log("identity", user.identity.community)
        if (filter.type == 'saved') {
            loadSavedArticles()
            // return
        } else {  
            let snapshot = await props.user.ref.get()
            user = await snapshot.data()
            const savedArticles = user.bookmarks || []
            if (filter.type == 'history') {
                // console.loglog("history", user.id)
                articlesRef = articlesRef.where("publishedBy", "==", user.id)
                                // .orderBy('publishedAt', 'desc')
            } else {
                // console.log(filter.data)
                articlesRef = articlesRef
                                .where("community", "in", [...user.identity.communities, "all"])
                                .where("status", "==", "published")
                                .where("tags", "array-contains", filter.data)
                                .orderBy('pinned', 'desc')
                                .orderBy('publishedAt', 'desc')
            }
            const newArticles = []
            articlesRef.get().then(querySnapshot => {
                let promises = []
                querySnapshot.forEach(async snapshot => {
                    const id = newArticles.push(snapshot.data()) -1
                    // const article = snapshot.data()
                    newArticles[id].id = snapshot.id
                    // console.loglog("article", snapshot.id)
                    // console.log(storageRef.child('articles/' + article.id + '/images/' + article.coverImage))
                    /* Get Images */
                    if(savedArticles!= undefined){
                        newArticles[id].isSaved = savedArticles.includes(newArticles[id].id)
                    }
                    if(newArticles[id].isSaved) console.log(newArticles[id].id, "is saved")
                    // promises.push(
                    //     storageRef.child('articles/' + newArticles[id].id + '/images/' + article.meta.coverImage).getDownloadURL()
                    //     // storageRef.child('articles/9qAFUBpb7n0U1bzylreO/images/' + newArticles[id].meta.coverImage).getDownloadURL()
                    //         .then((url) => {
                    //             newArticles[id].imageUrl = url
                    //         })
                    // )
                })
                Promise.all(promises).finally(() => {
                    // console.log("End promises", newArticles)
                    setArticles(newArticles)
                })
            }).finally(() => {
                // console.log("finally", newArticles)
                // setArticles(newArticles)
            })
        }
    }

    setHeaderOptions(props.navigation, options)

    useEffect(() => {
        loadArticles(filter)
    }, [])

    return (
        <View style={stylesheet.container}>
            { articles?.length > 0 && <ArticleList articles={articles} {...props} /> }
        </View>
    )
}