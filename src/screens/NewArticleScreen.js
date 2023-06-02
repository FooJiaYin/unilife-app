import React, { useState, useEffect, useCallback } from 'react'
import { Image, Text, TextInput, Modal, View, Keyboard, Alert, ScrollView, TouchableOpacity, FlatList, useWindowDimensions } from 'react-native'
import { setHeaderOptions } from '../components/navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { stylesheet, htmlStyles, Color } from '../styles'
import { firebase } from '../firebase/config'
import { Button, Select, PasswordInput } from '../components/forms'
import RenderHtml from 'react-native-render-html'
import { Chip } from '../components/chip'
import { tagNames, helpTags, localTags, pandemicTags } from '../firebase/functions'
import Asset from '../components/assets'
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as WebBrowser from 'expo-web-browser';
import { marked } from 'marked';
import time from '../utils/time'

export default function NewArticleScreen(props) {
    let user = props.user
    let userData = user.data()
    const [article, setArticle] = useState({
        category: 'posts',
        community: userData.identity.county || userData.identity.community,
        title: '',
        content: '',
        rawContent: '',
        images: null,
        meta: {
            abstract: '',
            source: '',
        },
        pinned: false,
        publishedAt: firebase.firestore.Timestamp.now(),
        publishedBy: user.id,
        reviewedBy: '',
        stats: {
            readUser: 0,
            readTimes: 0,
            readDuration: {
                total: 0.0,
                max: 0.0,
            },
            save: 0,
            like: 0,
            share: 0,
            comment: 0,
            report: 0
        },
        topic: '',
        tags: [],
        type: 'article',
        status: 'published'
    })
    const [images, setImages] = useState([])
    const [termsAndConditions, setTermsAndConditions] = useState(false)
    const [isModalVisible, setModalVisibility] = useState(false)
    const [isTagSelectModalVisible, setTagSelectModalVisibility] = useState(false)
    const [isUploading, setUploading] = useState(false)
    const [currentHTML, setCurrentHTML] = useState("")
    const [options, setOptions] = useState({
        type: [
            {label: '文章', value: 'article'},
            {label: '連結', value: 'link'},
        ]
    }) 

    const headerOptions = {
        title: '發布貼文',
        headerLeft: 'back'
    }
    setHeaderOptions(props.navigation, headerOptions)

    async function loadTermsAndConditions() {
        // console.log(firebase.auth().currentUser)
        // console.log("community", user.community)
        // console.log("identity", user.identity.community)
        let snapshot = await firebase.firestore().doc('config/terms').get()
        let termsData = await snapshot.data()
        // console.log(termsData)
        setTermsAndConditions(termsData)
        setCurrentHTML(termsData.post)
    }

    async function loadUserData() {
        // console.log(firebase.auth().currentUser)
        // console.log("community", user.community)
        // console.log("identity", user.identity.community)
        let snapshot = await user.ref.get()
        userData = await snapshot.data()
        // console.log(userData)
    }

    async function uploadArticle() {
        // Alert.alert("發布中", "正在上傳，請稍後...", [])
        setUploading(true)
        const fetchImageFromUri = async (uri) => {
            const response = await fetch(uri);
            const blob = await response.blob();
            return blob;
        };
        // console.log(password)
        try {
            let content = marked.parse(article.rawContent, {breaks: true})
            let articleRef = await firebase.firestore().collection('articles').add({
                ...article,
                community: userData.identity.county || userData.identity.community,
                content: content,
                meta: {
                    abstract: article.rawContent,
                    source: '社群貼文',
                },
                publishedAt: firebase.firestore.Timestamp.now(),
            })
            let articleId = articleRef.id
            articleRef.update({
                id: articleRef.id
            })
            // Upload image to Firebase storage
            if (images.length > 0) {
                let storageRef = firebase.storage().ref()
                for (let i = 0; i < images.length; i++) {
                    console.log(images[i])
                    let imageRef = storageRef.child(`articles/${articleId}/images/${i}`)
                    let blob = await fetchImageFromUri(images[i])
                    let snapshot = await imageRef.put(blob)
                    let url = await snapshot.ref.getDownloadURL()
                    images[i] = url
                    content = content + `<img src="${url}" />`
                    await articleRef.update({
                        content: content,
                        images: {
                            src: images[0],
                            images: images
                        }
                    })
                }
                // Update article images
            }
        } catch (error) {
            console.log(error)
        }
        setUploading(false)
        props.navigation.navigate('Community')
    }

    const updateTags = (tags) => {
        setArticle({...article, tags: tags})
        setTagSelectModalVisibility(false)
    }
  
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            // allowsEditing: true,
            // aspect: [4, 3],
            quality: 1,
        });
    
        if (result.cancelled) return;

        console.log(result);

        if (result.width > 800) {
            const compressedResult = await ImageManipulator.manipulateAsync(
                result.localUri || result.uri,
                [{resize: {width: 800}}],
                { compress: 0.8, format: ImageManipulator.SaveFormat.PNG }
            );      
            setImages([...images, compressedResult.uri])
        }
        else {
            setImages([...images, result.uri])
        }
    }

    async function requestPermission() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
        }
    }

    const onLinkPress = (event, href) => {
        if (href.includes("privacy")) setCurrentHTML(termsAndConditions.privacy)
        if (href.includes("rules")) setCurrentHTML(termsAndConditions.rules)
    }

    const onRequestClose = () => {
        if (currentHTML === termsAndConditions.terms) setModalVisibility(false)
        else setCurrentHTML(termsAndConditions.terms)
    }

    const onRegisterPress = () => {
        if (!article.title || article.title == '') {
            Alert.alert('', "請填寫標題")
            return
        }
        uploadArticle()
        // updateUserData()
    }

    const PopupModal = ({html}) => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => onRequestClose()}
            >
                <View style={stylesheet.modal}>
                <ScrollView>
                    <View style={{paddingLeft: 20, paddingRight: 40}}>
                        <RenderHtml
                            source={{html: html}}
                            // tagsStyles={htmlStyles}
                            contentWidth={120}
                            renderersProps={{a: {onPress: onLinkPress}}}
                        />
                    </View>
                </ScrollView>
                <View style={{paddingHorizontal: 30}}>
                
                <Button
                    style={[stylesheet.bgGreen, {height: 50, wid: '100%'}]}
                    onPress={() => {
                        setModalVisibility(false)
                    }} 
                    title='關閉'
                />
                </View>
            </View>
            </Modal>
        )
    }

    useEffect(() => {
        loadUserData()
        loadTermsAndConditions()
        if (Platform.OS !== 'web') {
            requestPermission()  
        }
    }, [])

    return (
        <View style={stylesheet.container}>
            <PopupModal html={currentHTML} />
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%', height:'100%'}}
                keyboardShouldPersistTaps="always">
                <ScrollView style={{padding: 16}}>
                {/* <Text style={{...stylesheet.textDark, marginTop: 8}}>標題</Text> */}
                    {/* <Select 
                        value={article.type} 
                        items={options.type}
                        onChange={(input) => setArticle({ ...article, type: input })}
                        placeholder='請選擇貼文類型...'
                    /> */}
                    {/* <TextInput
                        style={[stylesheet.input, stylesheet.textGrey]}
                        value={article.rawContent}
                        placeholder='Email'
                        placeholderTextColor="#aaaaaa"
                        onChangeText={(inp) => setEmail(text)}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    /> */}
                    <TextInput
                        style={stylesheet.input}
                        defaultValue={article.title}
                        placeholder='輸入你的文章標題'
                        placeholderTextColor="#aaaaaa"
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        onChangeText={(input) => setArticle({ ...article, title: input })}
                    />
                    {/* <Text style={{...stylesheet.textDark, marginTop: 8}}>內文</Text> */}
                    <View style={{...stylesheet.input, height: 350 }}>
                        <TextInput
                            style={{...stylesheet.inputText, flexGrow: 0}}
                            defaultValue={article.rawContent}
                            placeholder="發布貼文，跟大家分享你的在地生活日常！或是提出問題？讓大家一起幫你解決！"
                            multiline={true}
                            // textAlignVertical='top'
                            placeholderTextColor="#aaaaaa"
                            underlineColorAndroid="transparent"
                            autoCapitalize="none"
                            onChangeText={(input) => setArticle({ ...article, rawContent: input })}
                        />
                    </View>
                    <TouchableOpacity onPress={() => setTagSelectModalVisibility(true)}>
                        <Text style={{...stylesheet.textDark, marginTop: 8}}>選擇標籤</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} 
                            style={{flexDirection: 'row', paddingTop: 14, paddingBottom: 5, flexGrow: 0}}
                            contentContainerStyle={{alignItems: 'center'}} >
                            {article.tags.map(tag => <Chip 
                                label={tagNames[tag] || tag} 
                                color={pandemicTags.includes(tag) ? Color.red : Color.green} 
                                size={'large'} focused 
                                action={() => setTagSelectModalVisibility(true)}
                            />)}
                            <Image source={Asset('add-circle')} style={[stylesheet.icon, {margin: 0, height: 30, width: 25}]}/>
                        </ScrollView>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => pickImage()}>
                    <Text style={{...stylesheet.textDark, marginTop: 8}}>添加圖片（長按圖片即可移除）</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} 
                            style={{flexDirection: 'row', paddingTop: 14, paddingBottom: 5, flexGrow: 0}}
                            contentContainerStyle={{alignItems: 'center'}} >
                            {images.map(image => 
                                <TouchableOpacity onLongPress={() =>setImages(images.filter(e => e !== image))} >
                                    <Image 
                                        style={{height: 100, width: 100, marginRight: 12, borderRadius: 6 }} 
                                        source={{ uri: image }}
                                    />
                                </TouchableOpacity>
                            )}
                            <Image source={Asset('add-circle')} style={[stylesheet.icon, {margin: 0, height: 30, width: 25}]}/>
                        </ScrollView>
                    </TouchableOpacity>
                    <View style={stylesheet.footerView}>
                        <Text style={stylesheet.footerText}>
                            請遵守
                            <Text onPress={()=>setModalVisibility(true)}
                                style={stylesheet.footerLink}>發文規範</Text>
                        </Text>
                        <Text style={{...stylesheet.textS, ...stylesheet.textGrey, margin: 12}}>
                            請注意，您在網路上的發言須負法律上的責任。請在發布訊息前進行查證，尤其在疫情期間，假消息可能會危及他人的健康。
                        </Text>
                        <Text style={{...stylesheet.textS, ...stylesheet.textGrey, marginHorizontal: 12}}>
                            若是您在UniLife看見不實資訊，請聯繫我們的
                            <Text onPress={()=>WebBrowser.openBrowserAsync('https://supr.link/HjULp')} style={{...stylesheet.footerLink, ...stylesheet.textS, opacity: 1}}>
                                檢舉受理單位
                            </Text>
                            ，或是點選
                            <Text onPress={()=>WebBrowser.openBrowserAsync('https://supr.link/xltJy')} style={{...stylesheet.footerLink, ...stylesheet.textS, opacity: 1}}>
                                聯絡客服
                            </Text>
                            洽客服人員尋求協助。UniLife團隊目前的人力無法審核所有的言論，懇請大家跟我們一起維護良好的社群風氣。
                        </Text>
                        <Text style={{...stylesheet.textS, ...stylesheet.textGrey, margin: 12}}>
                            發文後，請按文章列表左上角的重新整理按鈕，這樣您的文章才會出現在您的列表。
                        </Text>
                    </View>
                    <Button
                        style={stylesheet.bgBlue}
                        onPress={() => onRegisterPress()} 
                        title='發布貼文'
                    />
                    <TagSelectModal visible={isTagSelectModalVisible} onClose={updateTags} tags={article.tags} />
                    <LoadingModal visible={isUploading} />
                </ScrollView>
            </KeyboardAwareScrollView>
        </View>
    )
}

export function LoadingModal({visible}) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            style={{padding: 0}}
        >
            <View style={{...stylesheet.modal, alignSelf: 'center', alignItems: 'center', ...stylesheet.centerSelf}}>
                <Text style={{paddingHorizontal: 30, marginLeft: 'auto', marginRight: 'auto'}}>上傳中，請稍後...</Text>
            </View>
        </Modal>
    )
}

export function TagSelectModal ({visible, onClose, tags}) {
    const [selectedTags, setSelectedTags] = useState(tags)
    const storageRef = firebase.storage().ref()

    function updateTags(tag) {
        let tags = selectedTags.includes(tag)? selectedTags.filter(e => e !== tag) : [...selectedTags, tag]
        if (tags.length > 2) {
            Alert.alert('標籤數量已達上限', '目前最多只能選擇兩個標籤喔！')
            return
        }
        setSelectedTags(tags)
    }

    return <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => onRequestClose()}
    >
        <View style={[stylesheet.modal, stylesheet.centerSelf]}>
            <View style={{paddingHorizontal: 30}}>
                <Text style={stylesheet.headerText}>
                        {/* <Button
                            onPress={()=>setAgree(true)}
                            color={agree?'#00aebb':'#e2e3e4'}>
                                    v
                            </Button> */}
                            
                        </Text>
            <Text style={{flex: 0, ...stylesheet.textDark}}>鄰里互助</Text>
            <FlatList
                data={helpTags}
                style={{ marginVertical: 10 }}
                contentContainerStyle={{flexDirection : "row", flexWrap : "wrap", justifyContent : 'space-between'}} 
                renderItem={({item}) => 
                    <Chip 
                        style={{marginVertical: 6}}
                        label={tagNames[item] || item} 
                        type={'tag'} size={'large'} 
                        focused={selectedTags.includes(item)}
                        action={()=>updateTags(item)} /> 
                }
                // horizontal={true}
                keyExtractor={(item, index) => item}
            />
            <Text style={{flex: 0, ...stylesheet.textDark}}>在地生活</Text>
            <FlatList
                data={localTags}
                style={{ marginVertical: 10 }}
                contentContainerStyle={{flexDirection : "row", flexWrap : "wrap", justifyContent : 'space-between'}} 
                renderItem={({item}) => 
                    <Chip 
                        style={{marginVertical: 6}}
                        label={tagNames[item] || item} 
                        type={'tag'} size={'large'} 
                        focused={selectedTags.includes(item)}
                        action={()=>updateTags(item)} /> 
                }
                // horizontal={true}
                keyExtractor={(item, index) => item}
            />
            <Text style={{flex: 0, ...stylesheet.textDark}}>疫情資訊</Text>
            {/* <Text style={{flex: 0, ...stylesheet.textDark}}>美食</Text> */}
            <FlatList
                data={pandemicTags}
                style={{ marginVertical: 10 }}
                contentContainerStyle={{flexDirection : "row", flexWrap : "wrap", justifyContent : 'space-between'}} 
                renderItem={({item}) => 
                    <Chip 
                        style={{marginVertical: 6}}
                        label={tagNames[item] || item} 
                        color={Color.red}
                        size={'large'} 
                        focused={selectedTags.includes(item)}
                        action={()=>updateTags(item)} /> 
                }
                // horizontal={true}
                keyExtractor={(item, index) => item}
            />
            <Button
                style={[stylesheet.bgBlue, {height: 40, wid: '100%'}]}
                onPress={() => onClose(selectedTags)} 
                title='確認'
            />
            </View>
        </View>
    </Modal>
}