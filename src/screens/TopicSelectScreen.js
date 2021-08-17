import React, { useState } from 'react'
import { ToastAndroid, StyleSheet, Image, Text, TouchableOpacity, View, FlatList, useWindowDimensions } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import Asset from '../components/assets'
import { stylesheet } from '../styles/styles'
import { TopicItem } from '../components/topicItem'
import { Button } from '../components/forms'
import { Color } from '../styles'
import { color } from '../styles/color'

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

    const topics=[
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
                onSelected(true)
                if(array.length==5){
                    setProceed(true)
                }             
            }
            else{
                // TODO: show overlay hint   
            }
        }else{
            var l=array.length
            for(var i=0; i<l&&l==array.length; i++){
                if (array[i]==index){
                    // console.log(array)
                    array.splice(i)
                    // console.log(array)
                    setSelectedItems(array)
                    onSelected(false)
                    if(array.length<5){
                        setProceed(false)
                    }             
                }
            }
        }
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

    const submit = () => {
        // TODO: submit user input here
        props.route.params.user.ref.update({
            interests: selectedItems
        })
        // return props.navigation.navigate('Tabs')
        return props.navigation.navigate('Success')
    }
    return(
        <>
            <View style={[topicStyle.container, {flex: 1}]}>
                <View style={topicStyle.hintMessage}>
                    <Text style={stylesheet.text}>{confirm?'興趣主題':'選擇你最感興趣的主題（至少5個）'}</Text>
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
                {confirm
                ?
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