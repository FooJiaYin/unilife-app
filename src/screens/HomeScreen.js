import React, { useEffect, useState } from 'react'
import { FlatList, Text, Alert, ScrollView, View, StyleSheet,Image, useWindowDimensions } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import Asset from '../components/assets'
import { stylesheet, Color } from '../styles'
import time from '../utils/time'
import { firebase } from '../firebase/config'
import { useFocusEffect } from "@react-navigation/native";
import { StickedBg } from '../components/decorative'
import { HomeShortcutItem, ShortcutEditModal } from '../components/shortcutItem'
import Carousel from 'react-native-snap-carousel'
import * as copilot from '../components/guide'

export function HomeScreen(props) {
    
    let user
    const [nickname, setNickname] = useState('');
    const [text, setText] = useState({})
    const [myShortcuts, setMyShortcuts] = useState([
        {icon: 'blank.png', title: '', url: ''},
        {icon: 'blank.png', title: '', url: ''},
        {icon: 'blank.png', title: '', url: ''},
        {icon: 'blank.png', title: '', url: ''},
    ])
    const [featuredImages, setfeaturedImages] = useState([""]);
    const [isModalVisible, setModalVisibility] = useState(false)
    const [currentShortcut, setCurrentShortcut] = useState({})

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
        let images = []
        let communityData
        user.identity.communities.push('all')
        for(let i = 0; i < user.identity.communities.length; i++) {
            let comm = user.identity.communities[i]
            let snapshot = await firebase.firestore().doc('communities/' + comm).get()
            let data = await snapshot.data()
            if(i == 0) communityData = data
            if(data.featuredImages) images = images.concat(data.featuredImages)
        }
        if (!user.shortcuts) {
            setMyShortcuts(communityData.shortcuts)
        } else {
            setMyShortcuts(user.shortcuts)
        }
        snapshot = await firebase.firestore().doc('config/text').get()
        let data = await snapshot.data()
        setText(data.home)
        setfeaturedImages(images)
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

    useFocusEffect(
        React.useCallback(() => {
            loadShortcuts()
        }, [])
    );

    useEffect(() => {
        loadShortcuts()
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
        card: {
            aspectRatio: 3.0/4,
            marginHorizontal: 12,
            borderRadius: 24,
        },
        slide: {

        }
    })

    setHeaderOptions(props.navigation, {headerShown: false})

    return (
        <View style={stylesheet.container}>
            <ShortcutEditModal visible={isModalVisible} onClose={closeShortcutEditModal} shortcut={currentShortcut} setShortcut={setCurrentShortcut} />
            <StickedBg height={useWindowDimensions().height} image={Asset('home.jpg')}>
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
            <Carousel
                layout={'default'}
                // layout={'stack'} layoutCardOffset={`24`}
                style={{ flex: 1 }}
                contentContainerCustomStyle={{ alignItems: 'center',}}
                data={featuredImages}
                renderItem={({item}) => <Image source={{uri: item}} style={homeCardStyle.card} />}
                sliderWidth={useWindowDimensions().width}
                itemWidth={useWindowDimensions().width * 3/4 }
                itemHeight={useWindowDimensions().width}
                inactiveSlideScale={1}
                keyExtractor={(item) => item.id}
                loop={true}
                enableSnap={true}
                inverted={true}
            />
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