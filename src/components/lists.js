import React, { useState, useCallback, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, Image, Modal } from 'react-native'
import { styles, Color } from '../styles'
import Asset, { Icon } from './assets'
import time from '../utils/time'
import { Chip } from './chip'
import { firebase } from '../firebase/config'
import { tagNames } from '../firebase/functions'
import * as copilot from '../components/guide'
import { NavigationContainer, CommonActions } from '@react-navigation/native';

export function ListItem({ item, onPress, style, onButtonPress, props, chipAction }) {
    const [ isSaved, setIsSaved ] = useState(item.isSaved)
    const [ isLiked, setIsLiked ] = useState(false)
    const [ imageUrl, setImageUrl ] = useState(item.images && item.images.src ? item.images.src : '')
    const [ stats, setStats ] = useState(item.stats)
    const [ data, setData ] = useState({
        meta: {},
        tags: [],
        ...item
    })
 // console.log(item.id, isSaved)
    const storageRef = firebase.storage().ref()

    useEffect(() => {
        // loadArticle_old()
        console.log(item.id)
        loadArticle_new(item.id)
    }, [])

    function loadArticle_old() {
        if(item.images && item.images.src && item.images.src!='') {
            // console.log(item.images.src)    
            setImageUrl(item.images.src) 
        } else {
            if(item.meta.coverImage) storageRef.child('articles/' + item.id + '/images/' + item.meta.coverImage).getDownloadURL().then((url) => {
                setImageUrl(url)
            })
        }
        firebase.firestore().doc('articles/' + item.id).get().then(snapshot => {
            const stats = snapshot.data().stats
            setStats(stats)
        })
        if (props.user.id && item.id) {
            // setIsLiked(true)
            firebase.firestore().collection('behavior').where('user', '==', props.user.id).where('article', '==', item.id).where('stats.like', '==', true).get().then(querySnapshot => {
                if(querySnapshot.docs.length > 0) {
                    setIsLiked(true)
                }
            })
        }
    }

    function loadArticle_new(articleId) {
        firebase.firestore().doc('articles/' + articleId).get().then(snapshot => {
            const data = snapshot.data()
            const stats = snapshot.data().stats
            setStats(stats)
            setData(data)
            
            if(data.images && data.images.src && data.images.src!='') {
                // console.log(item.images.src)    
                setImageUrl(data.images.src) 
            } else {
                if(data.meta.coverImage) storageRef.child('articles/' + data.id + '/images/' + data.meta.coverImage).getDownloadURL().then((url) => {
                    setImageUrl(url)
                })
            }
            if (props.user.id && articleId) {
                // setIsLiked(true)
                firebase.firestore().collection('behavior').where('user', '==', props.user.id).where('article', '==', articleId).where('stats.like', '==', true).get().then(querySnapshot => {
                    if(querySnapshot.docs.length > 0) {
                        setIsLiked(true)
                    }
                })
            }
        })
    }

    const listItemStyle = StyleSheet.create({
        container: {
            flex: 1,
            width: '100%',
            flexDirection: 'row',
            height: 100,
            marginVertical: 8,
            paddingHorizontal: 16,
            overflow: 'hidden',
        },
        image: {
            width: 100,
            height: 100,
            borderRadius: 6,
        },
        imageFull: {
            flex: 1,
            height: 100,
            borderRadius: 6,
        },
        textContainer: {
            flexDirection: 'column',
            flexShrink: 1,
            flexGrow: 1,
            paddingLeft: 2,
            height: 100,
        },
        title: {
            ...styles.text,
            // height: 42,
            flexWrap: 'wrap',
            overflow: 'hidden',
            paddingBottom: 3,
        },
        description: {
            ...styles.textS,
            ...styles.textGrey,
            flexBasis: 34,
            lineHeight: 16,
            // flexGrow: 1,
            flexShrink: 1,
            flexWrap: 'wrap',
            overflow: 'hidden',
        },
        bottom: {
            flexDirection: 'row',
            flexShrink: 0,
            flex: 1,
            justifyContent: 'space-between',
        },
        bottomText: {
            ...styles.textS,
            ...styles.textGrey2,
            alignSelf: 'flex-end',
            flex:1,
        },
        bottomIcon: {
            alignSelf: 'flex-end',
            paddingHorizontal: 5,
        }
    })
    
    const iconStyle = {
        ...styles.icon,
        height: 14,
        width: 14,
        margin: 0,
    }
    
    const handleButtonPress = () => {
        onButtonPress();
        setIsSaved(!isSaved)
    }
    const [ showOption, setShowOption ] = useState(false)
    const [ descriptionLines, setDescriptionLines ] = useState(2)

    const optionItems = [
        {iconSrc: 'share.png', text: '分享'},
        {iconSrc: 'report.png', text: '舉報'},
    ]

    const onTextLayout = e => {
        // console.log( e.nativeEvent.lines.length)
        // setDescriptionLines(4 - e.nativeEvent.lines.length)
    }

    const Chips = ({tags}) => <View
        style={{flexDirection: 'row'}}>
        {tags.map(tag => <Chip 
            label={tagNames[tag]} 
            type={'tag'} 
            action={chipAction? ()=> chipAction('tag', tag) : ()=>props.navigation.navigate('Filter', {type: 'tag', data: tag}) }
        />)}
    </View>

    return (
        <TouchableOpacity onPress={()=>onPress(data)} >
            {/* <OptionOverlay
                visible={showOption}
                options={optionItems}
                onBackCB={()=>setShowOption(false)}
            /> */}
            
            <View style={style? [listItemStyle.container, style.container] : listItemStyle.container}>
                { data.category=='announcement' || imageUrl != '' ? 
                    <Image 
                        style={data.type == 'banner'? listItemStyle.imageFull : listItemStyle.image} 
                        source={(data.category=='announcement' && data.tags && imageUrl == '')? Asset(data.tags[0]) : {uri: imageUrl}}
                    /> : null 
                }
                {/* <Image style={style? [listItemStyle.image, style.image] : listItemStyle.image} source={ {uri: imageUrl}}/> */}
                { data.type=='banner' && data.title == '' ? null : 
                    <View style={[listItemStyle.textContainer, style? style.textContainer : null, (data.category=='announcement' || imageUrl != '')? { paddingLeft: 16 } : null ]}>
                        <Text style={style? [listItemStyle.title, style.title] : listItemStyle.title}
                            onTextLayout={(e) => onTextLayout(e)}
                            numberOfLines={2}
                            ellipsizeMode={"tail"}>
                            {data.title}
                        </Text>
                        <Text style={style? [listItemStyle.description, style.description] : listItemStyle.description}
                            numberOfLines={2}
                            // onLayout={(e) => setDescriptionLines(e.nativeEvent.layout.height > 34 ? 2 : 1)}
                            ellipsizeMode={"tail"}>
                            {data.meta.abstract}
                        </Text>
                        <View style={[style? style.bottom : null, listItemStyle.bottom]}>
                            {/* (for tags of data.tags) */}
                            {/* <copilot.Step
                                text="報你知與你有關的校園資訊，或是你可能會感興趣的資訊～"
                                order={5}
                                name="article"
                                >
                            <copilot.View> */}
                            <Chips tags={data.tags} />
                            {/* </copilot.View>
                            </copilot.Step> */}
                            <Text style={style? [listItemStyle.bottomText, style.bottomText] : listItemStyle.bottomText}>
                                {time(data.publishedAt).fromNow('en')}
                            </Text>
                            {/* <Icon size={14} name="bookmark" style={style? style.bottomIcon : {}}/> */}
                            <TouchableOpacity onPress={() => {}} style={{...listItemStyle.bottomIcon, flexDirection: 'row'}}>
                                <Image source={Asset(isLiked? `love-active` : `love`)} style={[iconStyle]} />
                                <Text style={[style? style.bottomText: null, listItemStyle.bottomText, {flex: 0, marginLeft: 4}]}>{stats && stats.like? stats.like : 0 }</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleButtonPress()} style={listItemStyle.bottomIcon}>
                                <Image source={Asset(isSaved? `bookmark-active` : `bookmark`)} style={[iconStyle]} />
                            </TouchableOpacity>
                            {/* <TouchableOpacity onPress={() => setShowOption(true)} style={listItemStyle.bottomIcon}>
                                <Image source={Asset('option')} style={[iconStyle]} />
                            </TouchableOpacity> */}
                        </View> 
                    </View>
                }
            </View>
        </TouchableOpacity>
    )
}