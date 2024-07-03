import React, { useState } from 'react'
import { Alert, StyleSheet, Image, Text, TouchableOpacity, View, FlatList, useWindowDimensions } from 'react-native'
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
    const [count, setCount] = useState(0)
    const [proceed, setProceed] = useState(false)
    const [confirm, setConfirm] = useState(false)
    const width = useWindowDimensions().width

    const options = {
        title: '選擇興趣',
        headerLeft: 'back'
    }
    setHeaderOptions(props.navigation, options)

    const topics = [
        '在地美食', '店家優惠', '新店開幕',
        '地方新聞', '交通路況', '鄰居推薦',
        '親子活動', '假日市集', '表演活動',
        '藝文講座', '在地景點', '贈送二手',
        '毛小孩', '與鄰揪團', '慈善公益',
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
        setCount(array.length)
        // console.log(array)
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
        var dictInterestCate = {
            "在地美食" : ["生活"],
            "店家優惠" : ["生活"],
            "新店開幕" : ["時事", "生活"],
            "地方新聞" : ["時事", "議題", "生活"],
            "交通路況" : ["時事", "議題"],
            "鄰居推薦" : ["生活"],
            "親子活動" : ["教育", "生活"],
            "假日市集" : ["藝文"],
            "表演活動" : ["藝文", "娛樂"],
            "藝文講座" : ["藝文", "娛樂"],
            "在地景點" : ["生活", "藝文"],
            "贈送二手" : ["生活"],
            "毛小孩" : ["生活", "議題"],
            "與鄰揪團" : ["生活"],
            "慈善公益" : ["議題", "生活"],
        }
        var dictTtlCateCount = {'娛樂': 0, '生活': 0, '體育': 0, '教育': 0, '情感': 0, '藝文': 0, 'ACG': 0, '財經': 0, '時事': 0, '議題': 0, '科技': 0, '職場': 0}
        for(var interest in dictInterestCate) {
            for (var cate of dictInterestCate[interest]) {
                dictTtlCateCount[cate] += 1
            }
        }
        // console.log(dictTtlCateCount)
        let score = {'娛樂': 0, '生活': 0, '體育': 0, '教育': 0, '情感': 0, '藝文': 0, 'ACG': 0, '財經': 0, '時事': 0, '議題': 0, '科技': 0, '職場': 0}
        for(var interest of interests) {
            let relatedTopic = dictInterestCate[topics[interest]]
            for(var topic of relatedTopic) {
                score[topic] += 1
            }
        }
        console.log(score)
        console.log(dictTtlCateCount)
        for(var topic in score) {
            score[topic] = score[topic]/(dictTtlCateCount[topic]*7) || 0
        }
        console.log(score)
        return score;
    }

    const submit = () => {
        // TODO: submit user input here

        // setInterest(selectedItems)
        Alert.alert('請耐心等待', "正在為您客制化在地資訊，需要約10秒...",
            [], {cancelable: false}
        )
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
                    firebase.firestore().collection('userActivity').add({
                        user: props.route.params.user.id,
                        action: 'recommendation',
                        time: firebase.firestore.Timestamp.now()
                    })
                    Alert.alert('完成！', "感謝您耐心等候！",
                        [{
                            text: "OK",
                            // onPress: () => console.log("Cancel Pressed"),
                            style: "cancel"
                        }]
                    )
                    return props.navigation.navigate('Success')
                })
            })
    }
    return(
        <>
            <View style={[topicStyle.container, {flex: 1}]}>
                <View style={topicStyle.hintMessage}>
                    <Text style={stylesheet.text}>{confirm?'我們將根據以下主題，提供您感興趣的在地資訊':'選擇你最感興趣的5個主題'}</Text>
                    {!confirm && <Text style={stylesheet.text}>{count}/5</Text> }
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
                    <Button onPress={() => {setConfirm(false); setProceed(false); setSelectedItems([]); setCount(0)}} title="重新選擇"  style={[topicStyle.nextButton, {backgroundColor:'transparent'}]} titleStyle={{ color: Color.blue}}></Button>
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