import React, { useEffect, useState } from 'react'
import { FlatList, View, useWindowDimensions } from 'react-native'
import { stylesheet, Color } from '../../styles'
import { ListItem } from '../lists'
import { firebase } from '../../firebase/config'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import { ScrollTags } from '../chip'
import { featuredTags } from '../../firebase/functions'

export function ArticleTabs({titles, articles, ...props}) {
    const layout = useWindowDimensions();
  
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'tab1', title: titles? titles[0] : "" },
        { key: 'tab2', title: titles? titles[1] : "" },
        { key: 'tab3', title: titles? titles[2] : "" },
        { key: 'tab4', title: titles? titles[3] : "" },
    ]);

    const articleListItem = (itemProps) => {
        return <ListItem {...itemProps} props={props}
            onPress={openArticle} 
            onButtonPress={() => toggleSaveArticle(itemProps.item)}
        />
    }

    const categories = Object.keys(articles)
        
    const renderScene = SceneMap({
        
        // first: () =>　<View style={{ flex: 1, backgroundColor: '#ff4081' }} />,
        // second: () =>　<View style={{ flex: 1, backgroundColor: '#673ab7' }} />
        tab1: () => 
        <View>
            <ScrollTags tags={featuredTags[categories[0]]} />
            <FlatList
                    data={articles[categories[0]]}
                    renderItem={articleListItem}
                    keyExtractor={(item) => item.title}
                    removeClippedSubExpandCards={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{marginBottom: 0, paddingBottom: 150}}
                />
        </View>,
        tab2: () =>  
        <View>
            <ScrollTags tags={featuredTags[categories[1]]} />
            <FlatList
                    data={articles[categories[1]]}
                    renderItem={articleListItem}
                    keyExtractor={(item) => item.title}
                    removeClippedSubExpandCards={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{marginBottom: 0, paddingBottom: 150}}
                />
        </View>,
        tab3: () =>  
        <View>
            <ScrollTags tags={featuredTags[categories[2]]} />
            <FlatList
                    data={articles[categories[2]]}
                    renderItem={articleListItem}
                    keyExtractor={(item) => item.id}
                    removeClippedSubExpandCards={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{marginBottom: 0, paddingBottom: 150}}
                />
        </View>,
        tab4: () =>  
        <View>
            <ScrollTags tags={featuredTags[categories[3]]} />
            <FlatList
                    data={articles[categories[3]]}
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
        lazy={true}
      />
    );
}