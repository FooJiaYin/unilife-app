import React, { useState } from 'react'
import { ToastAndroid, StyleSheet, Image, Text, TouchableOpacity, View, FlatList, useWindowDimensions } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import Asset from '../components/assets'
import { firebase } from '../firebase/config'
import { stylesheet } from '../styles/styles'
import { TopicItem } from '../components/topicItem'
import { Button } from '../components/forms'
import { Color } from '../styles'
import { color } from '../styles/color'
import { remove } from '../utils/array'

export default function TopicSelectScreen(props) {
    const [selectedItems, setSelectedItems] = useState([])
    const [proceed, setProceed] = useState(false)
    const [confirm, setConfirm] = useState(false)
    const width = useWindowDimensions().width

    const options = {
        title: '選擇興趣',
        headerLeft: 'back'
    }
    setHeaderOptions(props.navigation, options)

    const topics = [
        '影集戲劇', '國際政經', '時事評論',
        '娛樂八卦', '行銷/管理', '科技趨勢',
        '創新創業', '職場關係', '情感關係',
        '生活/人文', '表演展覽', '美妝穿搭',
        '手工藝', '神秘占卜', '法律',
        '寵物', '球類運動', '健身健康',
        '教育', '心靈成長', '音樂',
        '美食', '旅遊遊記', '電子遊戲',
        '桌上/實境遊戲', '日式動漫', '歐美動漫',
        '好書推薦', '理財投資', '電影',
    ]

    const topicStyle = StyleSheet.create({
        container:{
            width: '100%',
            paddingHorizontal: 16,
            flex:1,
            backgroundColor: '#fff'
        },
        hintMessage:{
            display: 'flex',
            height: 'auto',
            flexDirection: 'row',
            paddingVertical: 8,
            justifyContent: 'space-between'
        },
        nextButtonContainer:{
            position:'absolute',
            bottom: 60,
            // height: 40,
            width: width,
            alignItems: 'center',
            justifyContent: 'center'
        },
        nextButton:{
            width:320,
            // height: 40,
            // flexGrow: 1,
            alignSelf: 'center'
        },
        
        
    })
    const onItemPressed = (index, onSelected) =>{
        var array = selectedItems
        if(!array.includes(index)){
            if(array.length<5){
                array.push(index)
                setSelectedItems(array)
                // console.log(array)
                onSelected(true)
                if(array.length==5){
                    setProceed(true)
                }             
            }
            else{
                // TODO: show overlay hint   
            }
        }else{
            array = remove(array, index)
            setSelectedItems(array)
            onSelected(false)
            if(array.length < 5){
                setProceed(false)
            }
        }
        console.log(array)
    }
    
    const topicItem = ({item, index}) => {
        return(
        <TopicItem 
            item={item}
            index={index} 
            onPress={onItemPressed}
            initSelected={false}>
        </TopicItem>
    )}

    const selectedTopicsItem = ({item}) => {
        return(
        <TopicItem 
            item={topics[item]}
            index={item}
            initSelected>
        </TopicItem>)
        }

    const goNext = () => {
        if(proceed){
            setConfirm(true)
        }else{
            // TODO: show pop up hint
        }
    }

    function getScore(interests) {
        var dictIntestMap = {
            0: '影集戲劇', 
            1: '國際政經', 
            2: '時事評論', 
            3: '娛樂八卦', 
            4: '行銷/管理', 
            5: '科技趨勢', 
            6: '創新創業', 
            7: '職場關係', 
            8: '情感關係', 
            9: '生活/人文', 
            10: '表演展覽', 
            11: '美妝穿搭', 
            12: '手工藝', 
            13: '神秘占卜', 
            14: '法律', 
            15: '寵物', 
            16: '球類運動', 
            17: '健身健康', 
            18: '教育', 
            19: '心靈成長', 
            20: '音樂', 
            21: '美食', 
            22: '旅遊遊記', 
            23: '電子遊戲', 
            24: '桌上/實境遊戲', 
            25: '動畫/漫畫/cosplay/二次元相關', 
            26: 'Youtuber/網紅/實況主/Vtuber', 
            27: '好書推薦', 
            28: '理財投資', 
            29: '電影'
        }
        var dictInterestCate = {
            "寵物" : ["娛樂", "生活"],
            "球類運動" : ["體育"],
            "健身健康" : ["體育", "生活"],
            "教育" : ["教育"],
            "心靈成長" : ["教育", "情感"],
            "音樂" : ["藝文", "娛樂"],
            "美食" : ["生活"],
            "旅遊遊記" : ["生活"],
            "電子遊戲" : ["ACG"],
            "桌上/實境遊戲" : ["ACG"],
            "動畫/漫畫/cosplay/二次元相關" : ["ACG"],
            "Youtuber/網紅/實況主/Vtuber" : ["娛樂"],
            "好書推薦" : ["生活", "藝文"],
            "理財投資" : ["財經"],
            "電影" : ["娛樂"],
            "影集戲劇" : ["娛樂"],
            "國際政經" : ["財經", "時事"],
            "時事評論" : ["議題", "時事"],
            "娛樂八卦" : ["娛樂"],
            "行銷/管理" : ["科技", "教育"],
            "科技趨勢" : ["科技"],
            "創新創業" : ["教育", "職場"],
            "職場關係" : ["職場"],
            "情感關係" : ["情感"],
            "生活/人文" : ["生活", "藝文"],
            "表演展覽" : ["生活", "藝文"],
            "美妝穿搭" : ["娛樂"],
            "手工藝" : ["藝文", "娛樂"],
            "神秘占卜" : ["藝文"],
            "法律" : ["時事"]
        }
        var dictTtlCateCount = {}
        for(var interest in dictInterestCate) {
            for (var cate of dictInterestCate[interest]) {
                dictTtlCateCount[cate] = (cate in dictTtlCateCount)? dictTtlCateCount[cate]+1 : 1
            }
        }
        // console.log(dictTtlCateCount)
        let score = {'娛樂': 0, '生活': 0, '體育': 0, '教育': 0, '情感': 0, '藝文': 0, 'ACG': 0, '財經': 0, '時事': 0, '議題': 0, '科技': 0, '職場': 0}
        for(var interest of interests) {
            console.log(interest)
            let relatedTopic = dictInterestCate[dictIntestMap[interest]]
            console.log(relatedTopic)
            for(var topic of relatedTopic) {
                console.log(topic)
                score[topic] += 1
            }
        }
        for(var topic in score) {
            score[topic] = score[topic]/dictTtlCateCount[topic]*7
        }
        console.log(score)
        return score;
    }

    const submit = () => {
        // TODO: submit user input here

        // setInterest(selectedItems)
        const user = 
        props.route.params.user.ref.get().then(snapshot => {
                const data = snapshot.data()
                // console.log(data.info.name, data.lastActive, data.score)
                var recommendations = []
                firebase.firestore().collection('articles')
                .where("community", "in", data.identity.communities.concat(["all"]))
                .orderBy("pinned", 'desc')
                .where("status", "==", "published")
                .orderBy('publishedAt', 'desc')
                .get().then(article_querySnapshot => {
                    article_querySnapshot.forEach(articleSnapshot => {
                        const data = articleSnapshot.data()
                        if (data.category && data.category != "posts") {
                            recommendations.push(articleSnapshot.id)
                        }
                        // console.log(data.title, data.publishedAt.toDate(), data.topic)
                    })
                }).finally(() => {
                    snapshot.ref.update({   
                        interests: selectedItems,
                        score: getScore(selectedItems),
                        recommendation: recommendations.slice(0,500),
                        lastActive: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    return props.navigation.navigate('Success')
                })
            })
    }
    return(
        <>
            <View style={[topicStyle.container, {flex: 1}]}>
                <View style={topicStyle.hintMessage}>
                    <Text style={stylesheet.text}>{confirm?'興趣主題':'選擇你最感興趣的5個主題'}</Text>
                    <Text style={stylesheet.text}>{selectedItems.length}{!confirm&&'/5'}</Text>
                </View>
                {!confirm
                    ?<FlatList
                        data={topics}
                        renderItem={topicItem}
                        numColumns={3}
                        keyExtractor={(item)=>'c'+item}
                        initSelected={false}
                        />
                    :<FlatList
                        data={selectedItems}
                        renderItem={selectedTopicsItem}
                        numColumns={3}
                        style={{flex: 1}}
                        initSelected
                        keyExtractor={(item, index)=>'d'+selectedItems.index}
                     />
                }
                {confirm?
                <View style={[topicStyle.nextButtonContainer, {height: 60}]}>
                    <Button onPress={submit} title="完成"  style={[topicStyle.nextButton, {backgroundColor:Color.blue}]}></Button>
                    <Button onPress={() => {setConfirm(false); setProceed(false); setSelectedItems([])}} title="重新選擇"  style={[topicStyle.nextButton, {backgroundColor:'transparent'}]} titleStyle={{ color: Color.blue}}></Button>
                </View>
                :
                <View style={topicStyle.nextButtonContainer}>
                    {proceed
                    ?<Button onPress={goNext} title="下一步"  style={[topicStyle.nextButton, {backgroundColor:Color.blue}]}></Button>
                    :<Button onPress={goNext} title="下一步"  style={[topicStyle.nextButton, {backgroundColor:Color.lightgrey}]}></Button>
                    }
                </View>
                }
            </View>
        </>
    )

}