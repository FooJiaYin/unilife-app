import React, { useEffect, useState } from 'react'
import { FlatList, View, useWindowDimensions } from 'react-native'
import { firebase } from '../../firebase/config'
import { stylesheet, Color } from '../../styles'
import { ArticleListItem } from './listsItem'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import { ScrollTags } from './tags'

export function ArticleTabs({titles, articles, ...props}) {
    const layout = useWindowDimensions();
    const [featuredTags, setFeaturedTags] = useState({})
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'tab1', title: titles? titles[0] : "" },
        { key: 'tab2', title: titles? titles[1] : "" },
        { key: 'tab3', title: titles? titles[2] : "" },
        { key: 'tab4', title: titles? titles[3] : "" },
    ]);

    const categories = Object.keys(articles)

    useEffect(() => {
        loadTags()
    }, [])

    function loadTags() {
        // load tags from firestore 'config/tags['featuredTags']
        firebase.firestore().doc('config/tags').get().then(snapshot => {
            let data = snapshot.data()
            setFeaturedTags(data.featuredTags)
        })  
    }

        
    const renderScene = SceneMap({
        
        // first: () =>　<View style={{ flex: 1, backgroundColor: '#ff4081' }} />,
        // second: () =>　<View style={{ flex: 1, backgroundColor: '#673ab7' }} />
        tab1: () => 
        <View>
            <ScrollTags {...props} tags={featuredTags[categories[0]]? featuredTags[categories[0]]: []} />
            <FlatList
                    data={articles[categories[0]]}
                    renderItem={({item}) => <ArticleListItem item={item} {...props} />}
                    // removeClippedSubviews={true}
                    initialNumToRender={7}
                    maxToRenderPerBatch={3}
                    windowSize={3}
                    keyExtractor={(item) => item.id}
                    removeClippedSubExpandCards={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{marginBottom: 0, paddingBottom: 150}}
                />
        </View>,
        tab2: () =>  
        <View>
            <ScrollTags {...props} tags={featuredTags[categories[1]]? featuredTags[categories[1]]: []} />
            <FlatList
                    data={articles[categories[1]]}
                    renderItem={({item}) => <ArticleListItem item={item} {...props} />}
                    // removeClippedSubviews={true}
                    initialNumToRender={6}
                    maxToRenderPerBatch={3}
                    windowSize={3}
                    keyExtractor={(item) => item.id}
                    removeClippedSubExpandCards={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{marginBottom: 0, paddingBottom: 150}}
                />
        </View>,
        tab3: () =>  
        <View>
            <ScrollTags {...props} tags={featuredTags[categories[2]]? featuredTags[categories[2]]: []} />
            <FlatList
                    data={articles[categories[2]]}
                    renderItem={({item}) => <ArticleListItem item={item} {...props} />}
                    // removeClippedSubviews={true}
                    initialNumToRender={6}
                    maxToRenderPerBatch={3}
                    windowSize={3}
                    keyExtractor={(item) => item.id}
                    removeClippedSubExpandCards={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{marginBottom: 0, paddingBottom: 150}}
                />
        </View>,
        tab4: () =>  
        <View>
            <ScrollTags {...props} tags={featuredTags[categories[3]]? featuredTags[categories[3]]: []} />
            <FlatList
                    data={articles[categories[3]]}
                    renderItem={({item}) => <ArticleListItem item={item} {...props} />}
                    removeClippedSubviews={true}
                    initialNumToRender={6}
                    maxToRenderPerBatch={3}
                    windowSize={3}
                    keyExtractor={(item) => item.id}
                    removeClippedSubExpandCards={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{marginBottom: 0, paddingBottom: 150}}
                />
        </View>,
      });

    return (
      <TabView
        navigationState={{ index, routes }}
        swipeEnabled={false}
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