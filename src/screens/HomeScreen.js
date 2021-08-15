import React, { useEffect, useState } from 'react'
import { FlatList, Text, TouchableOpacity, TouchableHighlight, View } from 'react-native'
import { setHeaderOptions } from '../components/header'
import { stylesheet } from '../styles'
import { ListItem } from '../components/lists'
import { firebase } from '../firebase/config'
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen(props) {
    // console.log(props)
    
    let user
    // console.log(props.user)
    const storageRef = firebase.storage().ref()
    const articlesRef = firebase.firestore().collection('articles')
    const [articles, setArticles] = useState([])
    // console.log("Ref", firebase.firestore().doc('articles/9qAFUBpb7n0U1bzylreO'))

    const options = {
        title: 'Uni資訊',
        headerRight: {
            icon: 'bookmark',
            onPress: () => props.navigation.navigate('Saved')
        }
    }

    async function loadArticles() {
        // console.log("community", user.community)
        // console.log("identity", user.identity.community)
        let snapshot = await props.user.ref.get()
        user = await snapshot.data()
        const newArticles = []
        const savedArticles = user.bookmarks
        // console.log("bookmarks", savedArticles)
        articlesRef
            .where("community", "in", ["all", user.identity.community])
            .orderBy('publishedAt', 'desc')
            .get().then(querySnapshot => {
                let promises = []
                querySnapshot.forEach(snapshot => {
                    const article = snapshot.data()
                    article.id = snapshot.id
                    // console.log("article", article)
                    // console.log(storageRef.child('articles/' + article.id + '/images/' + article.coverImage))
                    /* Get Images */
                    article.isSaved = savedArticles.includes(article.id)
                    if(article.isSaved) console.log(article.id, "is saved")
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

    useFocusEffect(
        React.useCallback(() => {
         // console.log("Hello")
            loadArticles()
        }, [])
    );

    useEffect(() => {
        loadArticles()
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