import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, TextInput, Image, Share, Modal, FlatList } from 'react-native'
import { stylesheet, Color } from '../styles'
import { Button } from '../components/forms'
import Asset from './assets'
import * as WebBrowser from 'expo-web-browser';
import { firebase } from '../firebase/config'
import { set } from 'react-native-reanimated'

export function HomeShortcutItem ({item, onLongPress}){
    // console.log(item.title)
    const storageRef = firebase.storage().ref()
    const [imageUrl, setImageUrl] = useState('')

    const homeStyle = StyleSheet.create({
        item:{
            alignItems:'center',
            justifyContent:'flex-start',
            flex:1,
        },
        round:{
            backgroundColor: '#ffffffee',
            height: 56,
            width: 56,
            borderRadius: 1000,
            marginBottom:8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        icon:{
            resizeMode: 'contain',
            height:28,
            width:28,
            tintColor: Color.blue
        },
        title:{
            margin: 4,
            color: '#fff',
            fontSize: 12,
            lineHeight: 16,
            width:'100%',
            textAlign: 'center',
        }
    })

    storageRef.child('icons/' + item.icon).getDownloadURL().then((url) => {
        setImageUrl(url)
    })
    
    function openLink(){
        console.log('openlink', item)
        if (item.action) {
            item.action();
        } else if (item.share && item.share == true) {
            share(item)
        } else {
        // open url in browser
            if (item.url && item.url != '') {
                WebBrowser.openBrowserAsync(item.url);
                // Linking.openURL(item.url)
            }
        }
    }

    async function share(item) {
        try {
            const result = Share.share({
                message: item.message,
                url: item.url,
            });
        } catch(err) {
            console.log(err)
        }
    }

    return(
        <TouchableOpacity style={homeStyle.item} onPress={()=>openLink()} onLongPress={item.onLongPress || onLongPress}>
            <View style={homeStyle.round}>
                {item.icon&&<Image style={[homeStyle.icon]} source={{uri: imageUrl}}/>}
            </View>
            <Text style={[homeStyle.title]}>{item.title}</Text>
        </TouchableOpacity>
    )
}

export function ShortcutEditModal ({visible, onClose, shortcut, setShortcut, updateShortcut}) {
    const [icons, setIcons] = useState([])
    const storageRef = firebase.storage().ref()

    useEffect(()=>{
        getIcons()
    }, [])

    async function getIcons() {
        let result = await storageRef.child('icons').listAll()
            // console.log(result.items)
        const icons_ = []
        const blankUrl = ''
        for (let i = 0; i < result.items.length; i++) {
            const item = result.items[i]
            const url = await item.getDownloadURL()
            if (item.name!='blank.png') icons_.push({name: item.name, url: url})
        }
        if (icons_.length % 4 !== 0) {
            for (let i = 0; icons_.length % 4 != 0; i++) {
                icons_.push({name: '', url: ''})
            }
        }
        setIcons(icons_)
    }

    return <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => onRequestClose()}
    >
        <View style={[stylesheet.modal, stylesheet.centerSelf]}>
        {/* <ScrollView>
            <View style={{paddingLeft: 20, paddingRight: 40}}>
            </View>
        </ScrollView>  */}
            <View style={{paddingHorizontal: 30}}>
            <TextInput
                style={[stylesheet.input, stylesheet.inputText]}
                placeholder='標題'
                placeholderTextColor="#aaaaaa"
                value={shortcut.title}
                onChangeText={(input) => setShortcut({ ...shortcut, title: input })}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
            />
            <TextInput
                style={[stylesheet.input, stylesheet.inputText]}
                placeholder='連結'
                placeholderTextColor="#aaaaaa"
                value={shortcut.url}
                onChangeText={(input) => setShortcut({ ...shortcut, url: input })}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
            />
            <FlatList
                data={icons}
                style={{ marginTop: 20 }}
                renderItem={({item}) => (
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <TouchableOpacity onPress={() => setShortcut({ ...shortcut, icon: item.name })}>
                        <Image
                            style={{
                                resizeMode: 'contain',
                                height: item.name == shortcut.icon ? 40 : 25,
                                width: item.name == shortcut.icon ? 40 : 25,
                                tintColor: Color.blue,
                                opacity: item.name == shortcut.icon ? 1 : 0.3,
                            }}
                            source={{uri: item.url}}
                        />
                    </TouchableOpacity>
                </View>
                )}
                //Setting the number of column
                numColumns={4}
                keyExtractor={(item, index) => index}
            />
            <View style={{flexDirection: 'row', marginTop: 20}}>
            <Button
                style={[stylesheet.bgGreen, {flex: 1, marginRight: 8}]}
                onPress={() => onClose(true)} 
                title='確認'
            />
            <Button
                style={[stylesheet.outlineGreen, stylesheet.textGreen, {flex: 1, marginLeft: 8}]}
                titleStyle={stylesheet.textGreen}
                onPress={() => onClose(false)} 
                title='返回'
            />
            </View>
            </View>
        </View>
    </Modal>
}
