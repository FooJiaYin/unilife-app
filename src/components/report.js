import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, View, TouchableOpacity, Text, TextInput, Image, Share, Modal, FlatList } from 'react-native';
import { stylesheet, Color } from '../styles';
import { Icon } from './assets';
import { firebase } from '../firebase/config';
import { remove } from '../utils/array'

export function ReportModal({ visible, onClose, article, user }) {
    function reportArticle(articleId) {
        Alert.alert('', "已收到您的舉報，我們會盡快處理，謝謝您的回報。");
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
                    <Text style={[stylesheet.text, stylesheet.textBold, { fontSize: 17 }]}>舉報此貼文</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ ...stylesheet.row, alignItems: 'center' }} onPress={() => hideArticle(article.id)}>
                    <Icon name='report' size={20} style={{ marginRight: 10 }} />
                    <Text style={[stylesheet.text, stylesheet.textBold, { fontSize: 17 }]}>隱藏此貼文</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ ...stylesheet.row, alignItems: 'center' }} onPress={() => hideSource(article.publishedBy)}>
                    <Icon name='report' size={20} style={{ marginRight: 10 }} />
                    <Text style={[stylesheet.text, stylesheet.textBold, { fontSize: 17 }]}>隱藏所有來自 {article.source} 的貼文</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ ...stylesheet.row, justifyContent: 'flex-end' }} onPress={() => onClose()}>
                    <Text style={[stylesheet.textCenter, { color: Color.green, fontSize: 17, marginRight: 12 }]}>取消</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>;
}
