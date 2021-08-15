import React, { useEffect, useState } from 'react'
import { FlatList, Text, TouchableOpacity, TouchableHighlight, View, StyleSheet,Image } from 'react-native'
import { setHeaderOptions } from '../components/header'
import Asset from '../components/assets'
import { stylesheet } from '../styles'
import { ListItem } from '../components/lists'
import { firebase } from '../firebase/config'
import { useFocusEffect } from "@react-navigation/native";
import { StickedBg, ExpandCard } from '../components/decorative'
import { HomeShortcutItem } from '../components/shortcutItem'

export default function HomeScreen(props) {
    // console.log(props)
    
    let user
    // console.log(props.user)
    const storageRef = firebase.storage().ref()
    const articlesRef = firebase.firestore().collection('articles')
    const [articles, setArticles] = useState([])
    // console.log("Ref", firebase.firestore().doc('articles/9qAFUBpb7n0U1bzylreO'))

    // const options = {
    //     title: 'Uni資訊',
    //     headerRight: {
    //         icon: 'bookmark',
    //         onPress: () => props.navigation.navigate('Saved')
    //     }
    // }

    // setHeaderOptions(props.navigation, options)

    async function loadArticles() {
        // console.log("community", user.community)
        // console.log("identity", user.identity.community)
        let snapshot = await props.user.ref.get()
        user = await snapshot.data()
        const newArticles = []
        const savedArticles = user.bookmarks || []
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
                    if(savedArticles!= undefined){
                        article.isSaved = savedArticles.includes(article.id)
                    }
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
            marginVertical: 8,
            height: 32,
            width: 32,
            resizeMode:'contain',
        },
    })

    const [myShortcuts, setMyShortcuts] = useState([
        {icon: 'ic-class', title: 'ILMS', url: 'https://google.com'},
        {icon: 'ic-book', title: '圖書館系統', url: ''},
        {icon: 'ic-bus', title: '校車時刻表', url: ''},
        {icon: 'ic-announce', title: '公佈欄', url: ''},
    ]) 
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
                        <Text style={homeCardStyle.greeting}>小攸，午安！</Text>
                        <Text style={homeCardStyle.time}>6月24日星期六 下午3點30分</Text>
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
                    />
                )}
            </ExpandCard>
        </View>
    )
}