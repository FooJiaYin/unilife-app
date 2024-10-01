import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { stylesheet } from '../styles'
import { firebase } from '../firebase/config'
import { tagNames } from '../firebase/functions'
import { ArticleList } from "../components/articles/articleList";

export default function FilterScreen({type, category, ...props}) {
    // console.log(props)
    
    let user
    const [filter, setFilter] = useState(props.route.params)
    // const collection = props.route.params.collection || 'articles'
    let articlesRef = firebase.firestore().collection('articles')
    const [articles, setArticles] = useState([])
    // console.log("Ref", firebase.firestore().doc('articles/9qAFUBpb7n0U1bzylreO'))

    let options = {
        title: (filter.type == 'saved')? '收藏' : 
                (filter.type == 'user')? '' : 
                `#${tagNames[filter.data] || filter.data}`,
        headerLeft: 'back'
    }

    async function loadUserName() {
        const userId = filter.type == 'user'? filter.data : props.user.id
        const snapshot = await firebase.firestore().collection('users').doc(userId).get()
        const data = await snapshot.data()
        props.navigation.setOptions({
            title: data.info.nickname + '的貼文'
        });
        // setHeaderOptions(props.navigation, {...options, title: '@' + data.info.nickname})
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
            article.isSaved = savedArticles.includes(article.id) && ! user.hiddenArticles?.includes(article.id) && ! user.hiddenSources?.includes(article.publishedBy)
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
            if (filter.type == 'user') {
                // console.loglog("history", user.id)
                articlesRef = articlesRef.where("publishedBy", "==", filter.data)
                                .where("status", "==", "published")
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
            if (filter.category) {
                articlesRef = articlesRef.where("category", "==", filter.category)
            }
            const newArticles = []
            articlesRef.get().then(querySnapshot => {
                let promises = []
                querySnapshot.forEach(async snapshot => {
                    if (! user.hiddenArticles?.includes(snapshot.id) && ! user.hiddenSources?.includes(snapshot.data().publishedBy)) {
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
                    }
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
        if (filter.type == 'user') loadUserName()
    }, [])

    return (
        <View style={stylesheet.container}>
            { articles?.length > 0 && <ArticleList articles={articles} {...props} /> }
        </View>
    )
}