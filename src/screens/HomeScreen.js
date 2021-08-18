import React, { useEffect, useState } from 'react'
import { FlatList, Text, TouchableOpacity, TouchableHighlight, View, StyleSheet,Image } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import Asset from '../components/assets'
import { stylesheet } from '../styles'
import { ListItem } from '../components/lists'
import time from '../utils/time'
import { firebase } from '../firebase/config'
import { useFocusEffect } from "@react-navigation/native";
import { StickedBg, ExpandCard } from '../components/decorative'
import { HomeShortcutItem } from '../components/shortcutItem'
import * as WebBrowser from 'expo-web-browser';

export default function HomeScreen(props) {
    // console.log(props)
    
    // console.log(props.user)
    const storageRef = firebase.storage().ref()
    const articlesRef = firebase.firestore().collection('articles')
    const [articles, setArticles] = useState([])
    const [nickname, setNickname] = useState('');
    
    const [myShortcuts, setMyShortcuts] = useState([
        {icon: 'ic-class.png', title: '', url: ''},
        {icon: 'ic-book.png', title: '', url: ''},
        {icon: 'ic-bus.png', title: '', url: ''},
        {icon: 'ic-announce.png', title: '', url: ''},
    ])
    // console.log("Ref", firebase.firestore().doc('articles/9qAFUBpb7n0U1bzylreO'))

    // const options = {
    //     title: 'Uni資訊',
    //     headerRight: {
    //         icon: 'bookmark',
    //         onPress: () => props.navigation.navigate('Saved')
    //     }
    // }

    // setHeaderOptions(props.navigation, options)

    async function loadShortcuts() {
        let snapshot = await props.user.ref.get()
        user = await snapshot.data()
        snapshot = await firebase.firestore().doc('communities/' + user.identity.community).get()
        const data = await snapshot.data()
        setMyShortcuts(data.shortcuts)
    }

    async function loadArticles() {
        // console.log("community", user.community)
        // console.log("identity", user.identity.community)
        let snapshot = await props.user.ref.get()
        user = await snapshot.data()
        setNickname(user.info.nickname)
        const newArticles = []
        const savedArticles = user.bookmarks || []
        // console.log("bookmarks", savedArticles)
        articlesRef
            .where("community", "in", ["all", user.identity.community])
            .orderBy('pinned', 'desc')
            .orderBy('publishedAt', 'desc')
            .get().then(querySnapshot => {
                let promises = []
                querySnapshot.forEach(async snapshot => {
                    const id = newArticles.push(snapshot.data()) -1
                    // const article = snapshot.data()
                    newArticles[id].id = snapshot.id
                    // console.log("article", article)
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

    async function openWeb(url) {
        let result = await WebBrowser.openBrowserAsync(url);
    };

    useFocusEffect(
        React.useCallback(() => {
         // console.log("Hello")
            loadShortcuts()
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
    
    const homeCardStyle = StyleSheet.create({
        container:{
            width: '100%',
            paddingTop: 56,
            zIndex:3,
        },
        greeting: {
            paddingHorizontal:16,
            marginBottom:16,
            fontSize: 32,
            color:'white',
        },
        time:{
            marginBottom:40,
            paddingHorizontal:16,
            fontSize: 18,
            color:'white',
        },
        icon:{
            marginHorizontal:16,
            // boxSizing: 'paddingBox',
            marginVertical: 8,
            height: 32,
            width: 32,
            resizeMode:'contain',
        },
    })
 
    React.useLayoutEffect(() => {
        props.navigation.setOptions({
            headerShown: false
        })
      }, [props.navigation])
    return (
        <View style={stylesheet.container}>
            <StickedBg image={Asset('home.jpg')}>
            </StickedBg>
            <View style={homeCardStyle.container}>
                <View style={stylesheet.row}>
                    <View style={{flex:1}}>
                        <Text style={homeCardStyle.greeting}>{ nickname}，你好！</Text>
                        <Text style={homeCardStyle.time}>{time().format('LLLL')}</Text>
                    </View>
                    {/* <TouchableOpacity>
                        <Image source={require('../../assets/icons/bookmark.png')} style={homeCardStyle.icon} tintColor='#fff'/>
                    </TouchableOpacity> */}
                    <TouchableOpacity onPress={() => props.navigation.navigate('Saved')}>
                        <Image style={homeCardStyle.icon}  source={Asset('bookmark')} tintColor='#fff'/>
                    </TouchableOpacity>
                </View>
                <View style={stylesheet.row}>
                    {myShortcuts.map((item, index)=><HomeShortcutItem item={item} key={index}/>)}
                </View>
            </View>
            {/* <FlatList
                data = {myShortcuts}
                renderItem = {(itemProps) => <HomeShortcutItem {...itemProps}/>}
                keyExtractor={(item, index) => 'sc'+index}
                numColumns={4}
            /> */}
            <ExpandCard>
                { articles && (
                    <FlatList
                        data={articles}
                        renderItem={articleListItem}
                        keyExtractor={(item) => item.id}
                        removeClippedSubExpandCards={true}
                        nestedScrollEnabled={true}
                        style={{marginBottom: 0, paddingBottom: 20}}
                    />
                )}
            </ExpandCard>
        </View>
    )
}