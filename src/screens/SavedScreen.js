import React, { useEffect, useState } from 'react'
import { FlatList, Text, TouchableOpacity, TouchableHighlight, View } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { stylesheet } from '../styles'
import { ListItem } from '../components/lists'
import { firebase } from '../firebase/config'

export default function SavedScreen(props) {
    // console.log(props)
    
    let user
    const storageRef = firebase.storage().ref()
    const articlesRef = firebase.firestore().collection('articles')
    const [articles, setArticles] = useState([])
    // console.log("Ref", firebase.firestore().doc('articles/9qAFUBpb7n0U1bzylreO'))

    const options = {
        title: '收藏',
        headerLeft: 'back'
    }

    async function loadArticles(setArticles) {
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
            promises.push(
                // storageRef.child('articles/' + article.id + '/images/' + article.meta.coverImage).getDownloadURL()
                storageRef.child('articles/9qAFUBpb7n0U1bzylreO/images/' + article.meta.coverImage).getDownloadURL()
                    .then((url) => {
                        article.imageUrl = url
                    })
                    .catch((e) => {
                        // console.log('Errors while downloading => ', e)
                    })
                    .finally(() => {
                        newArticles.push(article)
                    })
            )
        }
        Promise.all(promises).finally(() => {
            // console.log("End promises", newArticles)
            setArticles(newArticles)
        })
    }

    function toggleSaveArticle(article) {
     // console.log(article)
        if (article.isSaved) {
            props.user.ref.update({
                bookmarks: firebase.firestore.FieldValue.arrayRemove(article.id)
            });
        } else {
            props.user.ref.update({
                bookmarks: firebase.firestore.FieldValue.arrayUnion(article.id)
            });
        }
        article.isSaved = !article.isSaved
    }

    setHeaderOptions(props.navigation, options)

    useEffect(() => {
        loadArticles(setArticles)
    }, [])

    const articleListItem = (itemProps) => 
        <ListItem {...itemProps} 
            onPress={() => props.navigation.navigate('Article', {article: itemProps.item}) } 
            onButtonPress={() => toggleSaveArticle(itemProps.item)}
        />

    return (
        <View style={stylesheet.container}>
            { articles && (
                <FlatList
                    data={articles}
                    renderItem={articleListItem}
                    keyExtractor={(item) => item.id}
                    removeClippedSubviews={true}
                />
            )}
        </View>
    )
}