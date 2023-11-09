import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, View, TouchableOpacity, Text, TextInput, Image, Share, Modal, FlatList } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { stylesheet, Color } from '../styles';
import { Icon } from './assets';
import { firebase } from '../firebase/config';
import { remove } from '../utils/array'
import time from "../utils/time";

export function ReportModal({ visible, onClose, article, user }) {
    function reportArticle(articleId) {
        const reportMessage = `我要檢舉社群貼文

貼文ID：
${articleId}（請勿修改）
貼文標題：
${article.title}
由 ${article.source} 於 ${time(article.publishedAt).format('YYYY/M/D hh:mm')} 發佈

檢舉原因：
<請自行填入>

檢舉者：${user.info.nickname}（Email: ${user.info.email})`

        Alert.alert('確定要檢舉此貼文嗎？', 
            `按下確認後，將會開啟LINE客服人員聊天室。請務必填寫檢舉原因，否則將無法處理您的檢舉。\r\n如您無意檢舉此貼文，請按下取消。`,
            [
                {
                    text: "取消",
                    style: "cancel"
                },
                { text: "確認", onPress: () => WebBrowser.openBrowserAsync(`https://line.me/R/oaMessage/@221zrpwu/?${encodeURIComponent(reportMessage)}`) }
            ]
        );
        onClose();
    }

    function hideArticle(articleId) {
        Alert.alert('', "已隱藏此貼文。");
        console.log(articleId)
        console.log(user.id);
        firebase.firestore().doc('users/' + user.id).update({
            hiddenArticles: firebase.firestore.FieldValue.arrayUnion(articleId),
        })
        onClose();
    }

    function hideSource(userId) {
        Alert.alert('', `已隱藏來自${article.source}的貼文，您將不會再看到來自此用戶的貼文。`);
        firebase.firestore().doc('users/' + user.id).update({
            hiddenSources: firebase.firestore.FieldValue.arrayUnion(userId),
        })
        onClose();
    }

    return <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => onClose()}
    >
        <View style={[stylesheet.modal, stylesheet.centerSelf]}>
            <View style={{ paddingHorizontal: 10 }}>
                <TouchableOpacity style={{ ...stylesheet.row, alignItems: 'center' }} onPress={() => reportArticle(article.id)}>
                    <Icon name='report' size={20} style={{ marginRight: 10 }} />
                    <Text style={[stylesheet.text, stylesheet.textBold, { fontSize: 17 }]}>向客服人員檢舉此貼文</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ ...stylesheet.row, alignItems: 'center' }} onPress={() => hideArticle(article.id)}>
                    <Icon name='hide' size={20} style={{ marginRight: 10 }} />
                    <Text style={[stylesheet.text, stylesheet.textBold, { fontSize: 17 }]}>隱藏此貼文</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ ...stylesheet.row, alignItems: 'center' }} onPress={() => hideSource(article.publishedBy)}>
                    <Icon name='hide-user' size={20} style={{ marginRight: 10 }} />
                    <Text style={[stylesheet.text, stylesheet.textBold, { fontSize: 17 }]}>隱藏所有來自 {article.source} 的貼文</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ ...stylesheet.row, justifyContent: 'flex-end' }} onPress={() => onClose()}>
                    <Text style={[stylesheet.textCenter, { color: Color.green, fontSize: 17, marginRight: 12 }]}>取消</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>;
}
