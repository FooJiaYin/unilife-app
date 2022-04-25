import React, { useEffect, useState } from 'react'
import { FlatList, Text, Alert, ScrollView, View, StyleSheet,Image, useWindowDimensions } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import Asset from '../components/assets'
import { stylesheet, Color } from '../styles'
import { ListItem } from '../components/lists'
import time from '../utils/time'
import { firebase } from '../firebase/config'
import { useFocusEffect } from "@react-navigation/native";
import { StickedBg, ExpandCard } from '../components/decorative'
import { HomeShortcutItem, ShortcutEditModal } from '../components/shortcutItem'
import * as copilot from '../components/guide'
import * as WebBrowser from 'expo-web-browser'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import { set } from 'react-native-reanimated'
import { Chip } from '../components/chip'
import { tagNames, featuredTags } from '../firebase/functions'

export function ArticleTabs({articles, ...props}) {
    const layout = useWindowDimensions();
  
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
      { key: 'all', title: '所有文章' },
      { key: 'announcement', title: '社群公告' },
      { key: 'local', title: '在地生活' },
      { key: 'news', title: '精選内容' },
    ]);

    const articleListItem = (itemProps) => {
        // console.log('uid', props.user.id)
        return <ListItem {...itemProps} props={props}
            onPress={openArticle} 
            onButtonPress={() => toggleSaveArticle(itemProps.item)}
        />
    }
    
    const Chips = ({tags}) => <ScrollView horizontal showsHorizontalScrollIndicator={false} 
        style={{flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 5, height: 56}}>
        {tags.map(tag => <Chip 
            label={'#' + tagNames[tag]} 
            color={Color.green} 
            size={'large'} focused 
            action={()=>props.navigation.navigate('Filter', {type: 'tag', data: tag}) }
        />)}
    </ScrollView>
        
    const renderScene = SceneMap({
        
        // first: () =>　<View style={{ flex: 1, backgroundColor: '#ff4081' }} />,
        // second: () =>　<View style={{ flex: 1, backgroundColor: '#673ab7' }} />
        all: () => 
        <View>
            <Chips tags={featuredTags.all} />
            <FlatList
                    data={articles.all}
                    renderItem={articleListItem}
                    keyExtractor={(item) => item.id}
                    removeClippedSubExpandCards={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{marginBottom: 0, paddingBottom: 150}}
                />
        </View>,
        announcement: () =>  
        <View>
            <Chips tags={featuredTags.announcement} />
            <FlatList
                    data={articles.announcement}
                    renderItem={articleListItem}
                    keyExtractor={(item) => item.id}
                    removeClippedSubExpandCards={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{marginBottom: 0, paddingBottom: 150}}
                />
        </View>,
        local: () =>  
        <View>
            <Chips tags={featuredTags.local} />
            <FlatList
                    data={articles.local}
                    renderItem={articleListItem}
                    keyExtractor={(item) => item.id}
                    removeClippedSubExpandCards={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{marginBottom: 0, paddingBottom: 150}}
                />
        </View>,
        news: () =>  
        <View>
            <Chips tags={featuredTags.news} />
            <FlatList
                    data={articles.news}
                    renderItem={articleListItem}
                    keyExtractor={(item) => item.id}
                    removeClippedSubExpandCards={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{marginBottom: 0, paddingBottom: 150}}
                />
        </View>,
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
                readTimes: action == 'read'? article.stats.readTimes + 1 : article.stats.readTimes,
                save: action == 'unsave'? article.stats.save - 1 : action == 'save'? article.stats.save + 1 : article.stats.save,
                comment: action == 'comment'? article.stats.comment + 1 : article.stats.comment,
            }
        })
    }

    function openArticle(article) {
        setBehavior(article, 'read')
        // if (article.type=='banner') WebBrowser.openBrowserAsync(article.meta.url)
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
        renderTabBar={(props) => <TabBar {...props} routes={routes} 
                activeColor={Color.blue} inactiveColor={Color.grey1} labelStyle={{fontWeight: 'bold'}}
                indicatorStyle={stylesheet.bgBlue} style={stylesheet.bgWhite} 
            />}
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
    const [isModalVisible, setModalVisibility] = useState(false)
    const [currentShortcut, setCurrentShortcut] = useState({})

    // async function loadCategories() {
    //     for (const articleId of user.recommendation) {
    //         const snapshot = await firebase.firestore().doc('articles/' + articleId).get()
    //         const article = snapshot.data()
    //         article.isSaved = (savedArticles != undefined) && savedArticles.includes(articleId)
    //         // newArticles['all'].push(article)
    //         if (article && article.category && ['announcement', 'local', 'news'].includes(article.category)) {
    //             newArticles[article.category].push(article)
    //         }
    //     }
    //     setArticles(newArticles)
    // }
    
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
        setArticles(newArticles)
        articlesRef
            .where("community", "in", ["all", user.identity.community])
            .where("status", "==", "published")
            .where("pinned", "==", true)
            .get().then(querySnapshot => {
                // let promises = []
                querySnapshot.forEach(async snapshot => {
                    const article = snapshot.data()
                    newArticles.all.push(article)
                    if (article.category && ['announcement', 'local', 'news'].includes(article.category)) {
                        article.isSaved = savedArticles != undefined && savedArticles.includes(snapshot.id)
                        newArticles[article.category].push(article)
                    }
                    firebase.firestore().collection('behavior').where('user','==', props.user.id).where('article', '==', snapshot.id).get().then(querySnapshot => {
                        if(querySnapshot.docs.length == 0) {
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
                    })
                })
                
                for (const articleId of user.recommendation) {
                    const article = { id: articleId }
                    newArticles['all'].push(article)
                }
                setArticles(newArticles)
            }).then(() => {
                // newArticles['all'] = user.recommendation.map(articleId => { id : articleId })
                // for (const articleId of user.recommendation) {
                //     // const snapshot = await firebase.firestore().doc('articles/' + articleId).get()
                //     // const article = snapshot.data()
                //     const article = { id: articleId }
                //     newArticles['all'].push(article)
                //     // if (article && article.category && ['announcement', 'local', 'news'].includes(article.category)) {
                //     //     newArticles[article.category].push(article)
                //     // }
                // }
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
                setArticles(newArticles)
                // console.log("finally", newArticles)
                // setArticles(newArticles)
                var lastRenewed = new Date((new Date()).valueOf() - 3000*60*60*24);
                lastRenewed = (lastRenewed < user.lastActive.toDate()) ? lastRenewed : user.lastActive.toDate()
                firebase.firestore().collection('articles')
                .where("community", "in", ["all", user.identity.community])
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
                                recommendations.none.push({id: articleSnapshot.id, score: user.score[article.topic]})
                            }
                        }
                        // console.log(user.score[article.topic],article.title, article.topic)
                    })
                }).catch(err => {
                    alert(err)
                }).finally(async () => {
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
                    setArticles(newArticles)
                })
            }).finally(() => {
                // console.log(newArticles.all)
                setArticles(newArticles)
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

    setHeaderOptions(props.navigation, {headerShown: false})

    async function loadShortcuts() {
        let snapshot = await props.user.ref.get()
        user = await snapshot.data()
        if (!user.interests || user.interests.length == 0) props.navigation.navigate('FillInfo', {user: snapshot})
        setNickname(user.info.nickname)
        if(!user.guide || !user.guide.intro || user.guide.intro == false) {
            props.navigation.navigate('Intro', {user: props.user})
        }
        else if(user.guide.home == false) {
            // props.start()
        }
        if (!user.shortcuts) {
            snapshot = await firebase.firestore().doc('communities/' + user.identity.community).get()
            let data = await snapshot.data()
            setMyShortcuts(data.shortcuts)
        } else {
            setMyShortcuts(user.shortcuts)
        }
        snapshot = await firebase.firestore().doc('config/text').get()
        let data = await snapshot.data()
        setText(data.home)
    }

    function changeIcon(index) {
        setModalVisibility(true)
        setCurrentShortcut({index: index, ...myShortcuts[index]})
        console.log('long press')
    }

    function closeShortcutEditModal(update) {
        setModalVisibility(false)
        if (!update) return
        myShortcuts[currentShortcut.index] = currentShortcut
        console.log(props.user.id)
        firebase.firestore().doc('users/' + props.user.id).update({
            shortcuts: myShortcuts
        })
    }

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

    useFocusEffect(
        React.useCallback(() => {
            // console.log("Hello")
            loadShortcuts()
            // loadArticles()
        }, [])
    );

    useEffect(() => {
        loadArticles()
        loadShortcuts()
        // loadCategories()
        props.copilotEvents.on("stop", () => {
            firebase.firestore().doc('users/' + user.id).update({
                guide: {
                    intro: true,
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
            height: 28,
            width: 28,
            resizeMode:'contain',
        },
    })
 
    // React.useLayoutEffect(() => {
    //     props.navigation.setOptions({
    //         headerShown: false
    //     })
    //   }, [props.navigation])

    return (
        <View style={stylesheet.container}>
            <ShortcutEditModal visible={isModalVisible} onClose={closeShortcutEditModal} shortcut={currentShortcut} setShortcut={setCurrentShortcut} />
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
                    <View>
                        <copilot.Step
                            text="這裡是收藏區，將喜歡的文章收藏後，就能隨時在這找到它囉～"
                            order={1}
                            name="save"
                            >
                        <copilot.TouchableOpacity onPress={() => props.navigation.navigate('Filter', {type: 'saved'})}>
                            <Image style={homeCardStyle.icon}  source={Asset('bookmark')} />
                        </copilot.TouchableOpacity>
                        </copilot.Step>
                        <copilot.TouchableOpacity onPress={() => props.navigation.navigate('Intro', {user: props.user})}>
                            <Image style={homeCardStyle.icon}  source={Asset('guide')} />
                        </copilot.TouchableOpacity>
                    </View>
                </View>
                <copilot.Step
                    text="這裡一鍵就能直達你的常用網站了，很方便對吧？"
                    order={2}
                    name="shortcut"
                    >
                <copilot.View style={stylesheet.row}>
                    {myShortcuts.map((item, index)=><HomeShortcutItem item={item} key={index} onLongPress={() => changeIcon(index)} />)}
                </copilot.View>
                </copilot.Step>
            </View>
            <ExpandCard refresh={()=> loadArticles()} add={()=>newArticle()} >
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