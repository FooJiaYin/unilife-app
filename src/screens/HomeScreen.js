import React, { useEffect, useState } from 'react'
import { FlatList, Text, TouchableOpacity, ScrollView, View, StyleSheet,Image, useWindowDimensions } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import Asset from '../components/assets'
import { stylesheet, Color } from '../styles'
import { ListItem } from '../components/lists'
import time from '../utils/time'
import { firebase } from '../firebase/config'
import { useFocusEffect } from "@react-navigation/native";
import { StickedBg, ExpandCard } from '../components/decorative'
import { HomeShortcutItem } from '../components/shortcutItem'
import * as copilot from '../components/guide'
import * as WebBrowser from 'expo-web-browser';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { set } from 'react-native-reanimated'
import { Chip } from '../components/chip'
import { tagNames, featuredTags } from '../firebase/functions'

export function ArticleTabs({articles, ...props}) {
    const layout = useWindowDimensions();
  
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
      { key: 'all', title: '所有文章' },
      { key: 'announcement', title: '最新公告' },
      { key: 'local', title: '社群資訊' },
      { key: 'news', title: '精選内容' },
    ]);

    const articleListItem = (itemProps) => 
        <ListItem {...itemProps} props={props}
            onPress={() => openArticle(itemProps.item) } 
            onButtonPress={() => toggleSaveArticle(itemProps.item)}
        />

    let Chips = []
    for (const tag of (featuredTags || [])) {
        Chips.push(<Chip label={'#' + tagNames[tag]} type={'tag'} size={'large'} focused action={()=>props.navigation.navigate('Filter', {type: 'tag', data: tag}) } />)
    }
        
    const renderScene = SceneMap({
        
        // first: () =>　<View style={{ flex: 1, backgroundColor: '#ff4081' }} />,
        // second: () =>　<View style={{ flex: 1, backgroundColor: '#673ab7' }} />
        all: () => <FlatList
                data={articles.all}
                renderItem={articleListItem}
                keyExtractor={(item) => item.id}
                removeClippedSubExpandCards={true}
                nestedScrollEnabled={true}
                contentContainerStyle={{marginBottom: 0, paddingBottom: 56}}
            />,
        announcement: () => <FlatList
            data={articles.announcement}
            renderItem={articleListItem}
            keyExtractor={(item) => item.id}
            removeClippedSubExpandCards={true}
            nestedScrollEnabled={true}
            contentContainerStyle={{marginBottom: 0, paddingBottom: 56}}
        />,
        local: () => <FlatList
            data={articles.local}
            renderItem={articleListItem}
            keyExtractor={(item) => item.id}
            removeClippedSubExpandCards={true}
            nestedScrollEnabled={true}
            contentContainerStyle={{marginBottom: 0, paddingBottom: 56}}
        />,
        news: () => <FlatList
            data={articles.news}
            renderItem={articleListItem}
            keyExtractor={(item) => item.id}
            removeClippedSubExpandCards={true}
            nestedScrollEnabled={true}
            contentContainerStyle={{marginBottom: 56, paddingBottom: 56}}
        />,
      });

    async function setBehavior(article, action) {
        let behaviorRef
        let data
        let querySnapshot = await firebase.firestore().collection('behavior').where('user','==', props.user.id).where('article', '==', article.id).get()
        if (querySnapshot.size > 0) {
            behaviorRef = querySnapshot.docs[0].ref
            data = querySnapshot.docs[0].data()
        } else {
            data = {
                user: props.user.id,
                article: article.id,
                stats: {
                    unread: false,
                    read: 0,
                    readDuration: {
                        total: 0.0,
                        max: 0.0,
                    },
                    save: false,
                    share: 0,
                    comment: 0,
                    report: 0
                },
                logs: []
            }
            behaviorRef = await firebase.firestore().collection('behavior').add(data)
        }
        behaviorRef.update({
            stats: {
                ...data.stats,
                read: action == 'read'? data.stats.read + 1 : data.stats.read,
                save: action == 'unsave'? false : action == 'save'? true : data.stats.save,
            },
            logs: firebase.firestore.FieldValue.arrayUnion({
                action: action,
                time: firebase.firestore.Timestamp.now()
            })
        })
        firebase.firestore().doc('articles/' + article.id).update({
            stats: {
                ...article.stats,
                read: action == 'read'? article.stats.read + 1 : article.stats.read,
                save: action == 'unsave'? article.stats.save - 1 : action == 'save'? article.stats.save + 1 : article.stats.save,
                comment: action == 'comment'? article.stats.comment + 1 : article.stats.comment,
            }
        })
    }

    function openArticle(article) {
        setBehavior(article, 'read')
        props.navigation.navigate('Article', {article: article})
    }

    function toggleSaveArticle(article) {
    // console.log(article)
        if (article.isSaved) {
            setBehavior(article, 'unsave')
            props.user.ref.update({
                bookmarks: firebase.firestore.FieldValue.arrayRemove(article.id)
            });
        } else {
            setBehavior(article, 'save')
            props.user.ref.update({
                bookmarks: firebase.firestore.FieldValue.arrayUnion(article.id)
            });
        }
        article.isSaved = !article.isSaved
    }

    async function openWeb(url) {
        let result = await WebBrowser.openBrowserAsync(url);
    };

    return (
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={(props) => <View>
            <TabBar {...props} routes={routes} 
                activeColor={Color.blue} inactiveColor={Color.grey1} labelStyle={{fontWeight: 'bold'}}
                indicatorStyle={stylesheet.bgBlue} style={stylesheet.bgWhite} 
            />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexDirection: 'row', paddingHorizontal: 10, paddingTop: 14, paddingBottom: 5}}>
                { Chips }
            </ScrollView>
            </View>}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    );
}


export function HomeScreen(props) {
    // console.log(props)
    
    // console.log(props.user)
    const storageRef = firebase.storage().ref()
    const articlesRef = firebase.firestore().collection('articles')
    let user
    const [nickname, setNickname] = useState('');
    const [text, setText] = useState({})
    const [myShortcuts, setMyShortcuts] = useState([
        {icon: 'blank.png', title: '', url: ''},
        {icon: 'blank.png', title: '', url: ''},
        {icon: 'blank.png', title: '', url: ''},
        {icon: 'blank.png', title: '', url: ''},
    ])
    const [articles, setArticles] = useState({
        all: [],
        announcement: [],
        local: [],
        news: []
    })
    
    async function loadArticles() {
        // console.log("community", user.community)
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
        let recommendations = []
        // console.log(savedArticles)
        // newArticles.all = user.recommendation.map(articleId => {id: articleId}) || []
        articlesRef
            .where("community", "in", ["all", user.identity.community])
            .where("status", "==", "published")
            .where("pinned", "==", true)
            .get().then(querySnapshot => {
                let promises = []
                querySnapshot.forEach(async snapshot => {
                    const article = snapshot.data()
                    newArticles.all.push(article)
                    if (article.category && ['announcement', 'local', 'news'].includes(article.category)) {
                        newArticles[article.category].push(article)
                    }
                })
            }).then(async () => {
                // console.log("finally", newArticles)
                setArticles(newArticles)
                var lastRenewed = new Date((new Date()).valueOf() - 7000*60*60*24);
                lastRenewed = (lastRenewed < user.lastActive.toDate()) ? lastRenewed : user.lastActive.toDate()
                firebase.firestore().collection('articles')
                .where("community", "in", ["all", user.identity.community])
                .where('status', '==', 'published')
                .where('pinned', '==', false)
                .where('publishedAt', '>=', lastRenewed)
                .orderBy('publishedAt', 'desc').get().then(article_querySnapshot => {
                    article_querySnapshot.forEach(articleSnapshot => {
                        if(!user.recommendation.includes(articleSnapshot.id)) {
                            const data = articleSnapshot.data()
                            // console.log(data.title, data.publishedAt.toDate(), data.topic)
                            recommendations.push({id: articleSnapshot.id, score: user.score[data.topic]})
                            firebase.firestore().collection('behavior').add({
                                user: user.id,
                                article: articleSnapshot.id,
                                stats: {
                                    unread: true,
                                    read: 0,
                                    readDuration: {
                                        total: 0.0,
                                        max: 0.0,
                                    },
                                    save: false,
                                    share: 0,
                                    comment: 0,
                                    report: 0
                                },
                                logs: []
                            })
                        }
                        // console.log(score[data.topic],data.title, data.topic)
                    })
                }).catch(err => {
                    alert(err)
                }).finally(async () => {
                    // console.log(newArticles.all)
                    recommendations.sort((a, b) => b.score - a.score);
                    // console.log(data.recommendation)
                    recommendations = recommendations.map(recommendation => recommendation.id)
                    recommendations = recommendations.concat(user.recommendation).slice(0, 200)
                    for (const articleId of recommendations) {
                        const snapshot = await firebase.firestore().doc('articles/' + articleId).get()
                        const article = snapshot.data()
                        article.isSaved = savedArticles != undefined && savedArticles.includes(articleId)
                        newArticles['all'].push(article)
                        if (article.category && ['announcement', 'local', 'news'].includes(article.category)) {
                            newArticles[article.category].push(article)
                        }
                    }
                    setArticles(newArticles)
                    props.user.ref.update({
                        recommendation: recommendations,
                        lastActive: firebase.firestore.FieldValue.serverTimestamp()
                    })
                })
            }).finally(() => {
                // console.log(newArticles.all)
                // setArticles(newArticles)
                // console.log(recommendations.concat(data.recommendation).slice(0,200))
                // console.log(recommendations.concat(data.recommendation).slice(0,200))
            })
        // console.log("bookmarks", savedArticles)

        // articlesRef
        //     .where("community", "in", ["all", user.identity.community])
        //     .where("status", "==", "published")
        //     .orderBy('pinned', 'desc')
        //     .orderBy('publishedAt', 'desc')
        //     .get().then(querySnapshot => {
        //         let promises = []
        //         querySnapshot.forEach(async snapshot => {
        //             const id = newArticles.all.push(snapshot.data()) -1
        //             // const article = snapshot.data()
        //             newArticles.all[id].id = snapshot.id
        //             // console.log("article", article)
        //             // console.log(storageRef.child('articles/' + article.id + '/images/' + article.coverImage))
        //             /* Get Images */
        //             if(savedArticles!= undefined){
        //                 newArticles.all[id].isSaved = savedArticles.includes(newArticles.all[id].id)
        //             }
        //             if(newArticles.all[id].isSaved) console.log(newArticles.all[id].id, "is saved")
        //             // promises.push(
        //             //     storageRef.child('articles/' + newArticles[id].id + '/images/' + article.meta.coverImage).getDownloadURL()
        //             //     // storageRef.child('articles/9qAFUBpb7n0U1bzylreO/images/' + newArticles[id].meta.coverImage).getDownloadURL()
        //             //         .then((url) => {
        //             //             newArticles[id].imageUrl = url
        //             //         })
        //             // )
        //         })
        //         Promise.all(promises).finally(() => {
        //          // console.log("End promises", newArticles)
        //             for (const article of newArticles.all) {
        //                 if (article.category && ['announcement', 'local', 'news'].includes(article.category)) {
        //                     newArticles[article.category].push(article)
        //                 }
        //             }
        //             setArticles(newArticles)
        //         })
        //     }).finally(() => {
        //         // console.log("finally", newArticles)
        //         // setArticles(newArticles)
        //     })
    }
    // console.log("Ref", firebase.firestore().doc('articles/9qAFUBpb7n0U1bzylreO'))

    // const options = {
    //     title: 'Uni資訊',
    //     headerRight: {
    //         icon: 'bookmark',
    //         onPress: () => props.navigation.navigate('Filter')
    //     }
    // }

    // setHeaderOptions(props.navigation, options)

    async function loadShortcuts() {
        let snapshot = await props.user.ref.get()
        user = await snapshot.data()
        if (!user.interests || user.interests.length == 0) props.navigation.navigate('FillInfo', {user: snapshot})
        setNickname(user.info.nickname)
        if(!user.guide || !(user.guide.home == true)) {
            props.start();
        }
        snapshot = await firebase.firestore().doc('communities/' + user.identity.community).get()
        let data = await snapshot.data()
        setMyShortcuts(data.shortcuts)
        snapshot = await firebase.firestore().doc('config/text').get()
        data = await snapshot.data()
        setText(data.home)
    }

    useFocusEffect(
        React.useCallback(() => {
            // console.log("Hello")
            loadShortcuts()
            loadArticles()
        }, [])
    );

    useEffect(() => {
        loadArticles()
        props.copilotEvents.on("stop", () => {
            firebase.firestore().doc('users/' + user.id).update({
                guide: {
                    home: true
                }
            })
          });
    }, [])
    
    const homeCardStyle = StyleSheet.create({
        container:{
            width: '100%',
            paddingTop: 56,
            zIndex:3,
        },
        greeting: {
            paddingHorizontal:16,
            marginBottom:16,
            fontSize: 24,
            color:'white',
        },
        time:{
            marginBottom:40,
            paddingHorizontal:16,
            fontSize: 16,
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
                        <copilot.Step
                            text="這裡會顯示小攸想對你說的話唷～"
                            order={0}
                            name="greet"
                            >
                            <copilot.Text style={homeCardStyle.greeting}>{ nickname}{text.greeting}</copilot.Text>
                        </copilot.Step>
                        <Text style={homeCardStyle.time}>{time().format('LLLL')}</Text>
                    </View>
                    {/* <TouchableOpacity>
                        <Image source={require('../../assets/icons/bookmark.png')} style={homeCardStyle.icon} tintColor='#fff'/>
                    </TouchableOpacity> */}
                    {/* <TouchableOpacity onPress={() => props.navigation.navigate('Filter', {type: 'saved'})}> */}
                    <copilot.Step
                        text="這裡是收藏區，將喜歡的文章收藏後，就能隨時在這找到它囉～"
                        order={1}
                        name="save"
                        >
                    <copilot.TouchableOpacity onPress={() => props.navigation.navigate('Filter', {type: 'saved'})}>
                        <Image style={homeCardStyle.icon}  source={Asset('bookmark')} tintColor='#fff'/>
                    </copilot.TouchableOpacity>
                    </copilot.Step>
                </View>
                <copilot.Step
                    text="這裡一鍵就能直達你的常用網站了，很方便對吧？"
                    order={2}
                    name="shortcut"
                    >
                <copilot.View style={stylesheet.row}>
                    {myShortcuts.map((item, index)=><HomeShortcutItem item={item} key={index}/>)}
                </copilot.View>
                </copilot.Step>
            </View>
            <ExpandCard>
                <ArticleTabs articles={articles} {...props} />
            </ExpandCard>
        </View>
    )
}

export default copilot.guide({
    overlay: "svg", // or 'view'
    animated: true, // or false
    labels: {
        previous: "上一步",
        next: "下一步",
        skip: "跳過導覽",
        finish: "完成",
      }
})(HomeScreen)