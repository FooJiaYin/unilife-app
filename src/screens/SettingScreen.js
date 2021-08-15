import React, { useEffect, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, TouchableHighlight, View, StyleSheet,Image, ImageBackground } from 'react-native'
import { Color, stylesheet } from '../styles'
import { StickedBg, ExpandCard, ProfilePicture } from '../components/decorative'
import { SettingItem, SettingSection } from '../components/settingItem'
import { Button } from '../components/forms'

export default function SettingScreen({navigation}) {
    const [name, setName] = useState('小攸')
    const [phone, setPhone] = useState('09123456789')
    
    setHeaderOptions(navigation)

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: '#00aebb',
                borderBottomWidth: 0,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            headerTitleStyle: { alignSelf: 'center' },
            headerRight: () => (
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.navigate('Profile')}>
                    <Text style={stylesheet.textWhite}>完成</Text>
                </TouchableOpacity>
            ),
        })
      }, [navigation])
    const screenStyle = StyleSheet.create(
        {
            top:{
                flexDirection: 'row',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxSizing: 'borderBox',
                backgroundColor: Color.green,
                paddingTop:24,
                paddingBottom:36,
                marginBottom: -20,
            },
            edit:{
                borderColor: '#fff',
                borderWidth: 1,
                paddingVertical: 16,
                paddingHorizontal: 24,
                marginRight:16,
            },
            card:{
                width: '100%',
                borderRadius: 20,
                transform:[{transformX:0},{transformY:-20}],
                paddingHorizontal: 16,
                paddingVertical: 24,
                backgroundColor: '#fff',
            },
            name:{
                fontSize: 24,
                fontWeight: 700,
                color: 'white',
                marginLeft:16,
            },
            phone:{
                marginLeft:16,
                fontSize: 20,
                color: 'white'

            },
            logout:{
                marginHorizontal: 48,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: Color.blue,
            }
        }
    )
    return(
        <ScrollView>
            <View style={stylesheet.container}>
                <ImageBackground style={screenStyle.top}>
                    <ProfilePicture diameter={70}></ProfilePicture>
                    <View style={{flex: 1}}>
                        <Text style={screenStyle.name}>{name}</Text>
                        <Text style={screenStyle.phone}>{phone}</Text>
                    </View>
                    <Button title="編輯"  style={screenStyle.edit}></Button>
                </ImageBackground>
                <View style={screenStyle.card}>
                    <SettingSection title="賬戶設定">
                        <SettingItem name="校園社群設定" type="open" hint="清華大學" onChange={null}/>
                        <SettingItem name="關鍵字訂閱" type="open" hint="管理" onChange={null}/>
                        <SettingItem name="快捷方式" type="open" hint="管理" onChange={null}/>
                    </SettingSection>
                    <SettingSection title="通知設定">
                        <SettingItem name="校園社群設定" type="open" hint="清華大學" onChange={null}/>
                        <SettingItem name="關鍵字訂閱" type="open" hint="管理" onChange={null}/>
                        <SettingItem name="快捷方式" type="open" hint="管理" onChange={null}/>
                    </SettingSection>
                    <SettingSection title="關於我們">
                        <SettingItem name="應用評價" type="link" hint="star-line" onChange={null}/>
                        <SettingItem name="聯絡我們" type="link" hint="mail" onChange={'mailto://'}/>
                        <SettingItem name="發文系統" type="link" hint="open" onChange={null}/>
                    </SettingSection>
                    <SettingSection title="">
                    <Button title="登出" style={screenStyle.logout} titleStyle={{color: Color.blue}}></Button>
                    </SettingSection>
                </View>
            </View>
        </ScrollView>
    )
}
