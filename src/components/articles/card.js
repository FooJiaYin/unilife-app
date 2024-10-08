import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image, Modal } from 'react-native';
import { styles, Color } from '../../styles';
import Asset, { Icon } from '../assets';
import time from '../../utils/time';
import { SmallTags } from './tags';
import { firebase } from '../../firebase/config';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { ProfileImage } from "../profileImage";

export function Card({ item, onPress, style, onButtonPress, chipAction, ...props }) {
    const [isSaved, setIsSaved] = useState(item?.isSaved);
    const [isLiked, setIsLiked] = useState(false);
    const [imageUrl, setImageUrl] = useState(item.images && item.images.src ? item.images.src : '');
    const [stats, setStats] = useState(item?.stats);
    const [data, setData] = useState({
        meta: {},
        tags: [],
        ...item
    });
    const [author, setAuthor] = useState({});
    const storageRef = firebase.storage().ref();

    useEffect(() => {
        loadArticle(item.id);
        if (item.publishedBy) loadAuthor(item.publishedBy);
    }, [item]);

    useEffect(() => {
        if (!author.id && data.publishedBy) loadAuthor(data.publishedBy);
    }, [data.publishedBy]);

    async function loadAuthor(authorId) {
        let author = await firebase.firestore().doc('users/' + authorId).get();
        setAuthor(author.data());
    }

    function loadArticle(articleId) {
        firebase.firestore().doc('articles/' + articleId).onSnapshot(async snapshot => {
            const data = await snapshot.data();
            const stats = data.stats;
            setStats(stats);
            setData(data);

            if (data.images && data.images.src && data.images.src != '') {
                // console.log(item.images.src)    
                setImageUrl(data.images.src);
            } else {
                if (data.meta.coverImage) storageRef.child('articles/' + data.id + '/images/' + data.meta.coverImage).getDownloadURL().then((url) => {
                    setImageUrl(url);
                });
            }
            if (props.user.id && articleId) {
                // setIsLiked(true)
                firebase.firestore().collection('behavior').where('user', '==', props.user.id).where('article', '==', articleId).where('stats.like', '==', true).get().then(querySnapshot => {
                    if (querySnapshot.docs.length > 0) {
                        setIsLiked(true);
                    }
                });
            }
        });
    }

    const cardStyle = StyleSheet.create({
        container: {
            flex: 1,
            width: '100%',
            marginVertical: 8,
            paddingHorizontal: 16,
        },
        user: {
            fontSize: 16,
            fontWeight: 'bold',
            ...styles.textDark,
        },
        image: {
            width: '100%',
            resizeMode: 'cover',
            objectFit: "cover",
            aspectRatio: 1,
            borderRadius: 8,
            marginBottom: 10,
        },
        coverImage: {
            width: 40,
            height: 40,
            borderRadius: 40,
        },
        title: {
            ...styles.text,
            fontSize: 16,
            lineHeight: 24,
            // height: 42,
            flexWrap: 'wrap',
            overflow: 'hidden',
            marginVertical: 4,
        },
        description: {
            ...styles.textDark,
            opacity: 0.6,
            fontSize: 13,
            lineHeight: 20,
            // height: 42,
            flexWrap: 'wrap',
            overflow: 'hidden',
            marginBottom: 10,
        },
        row: {
            flexDirection: 'row',
            flexShrink: 0,
            flex: 1,
            gap: 8,
            marginVertical: 2,
            alignItems: 'center',
        },
        smallText: {
            ...styles.textS,
            ...styles.textDark,
            lineHeight: 14,
        },
        bottomIcon: {
            paddingHorizontal: 5,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        }
    });

    const iconStyle = {
        ...styles.icon,
        height: 20,
        width: 20,
        margin: 0,
    };

    const handleButtonPress = () => {
        onButtonPress();
        setIsSaved(!isSaved);
    };

    return (
        <TouchableOpacity onPress={() => onPress(data)} >
            <View style={style ? [cardStyle.container, style.container] : cardStyle.container}>
                <View style={cardStyle.row}>
                    <TouchableOpacity onPress={() => (data.category != "posts") && props.navigation.push('Filter', { type: 'user', data: data.publishedBy, category: data.category })} >
                        <ProfileImage
                            style={cardStyle.coverImage}
                            source={author?.info?.profileImage}
                        />
                    </TouchableOpacity>
                    <View>
                        <Text style={cardStyle.user} onPress={() => (data.category != "posts") && props.navigation.push('Filter', { type: 'user', data: data.publishedBy, category: data.category })} >
                            {author?.info?.nickname ?? ""}
                        </Text>
                        <View style={cardStyle.row}>
                            <Text style={style ? [cardStyle.smallText, style.smallText] : cardStyle.smallText}>
                                {time(data.publishedAt).toText('en')}
                            </Text>
                            {data.tags && <SmallTags tags={data.tags} category={data.category} {...props} />}
                        </View>
                    </View>
                </View>
                <Text style={style ? [cardStyle.title, style.title] : cardStyle.title}
                    // onTextLayout={(e) => onTextLayout(e)}
                    numberOfLines={2}
                    ellipsizeMode={"tail"}>
                    {data.title?.replace(/(\r\n|\n|\r)/gm, "")}
                </Text>
                <Text style={cardStyle.description}
                    numberOfLines={2}
                    ellipsizeMode={"tail"}>
                    {
                        data.meta.abstract?.replace(/(\r\n|\n|\r)/gm, "")
                    }
                </Text>
                {(data.category == 'announcement' || imageUrl != '') &&
                    <Image
                        style={cardStyle.image}
                        resizeMode="contain"
                        source={(data.category == 'announcement' && data.tags && imageUrl == '') ? Asset(data.tags[0]) : { uri: imageUrl }}
                    />
                }

                <View style={[cardStyle.row]}>
                    {/* <Icon size={14} name="bookmark" style={style? style.bottomIcon : {}}/> */}
                    <View style={cardStyle.bottomIcon}>
                        <Image source={Asset(isLiked ? `knock-active` : `knock`)} style={[iconStyle]} />
                        <Text style={[style ? style.smallText : null, cardStyle.smallText]}>{stats && stats.like ? stats.like : 0} 拜訪</Text>
                    </View>
                    <View style={cardStyle.bottomIcon}>
                        <Image source={Asset(`chat`)} style={[iconStyle]} />
                        <Text style={[style ? style.smallText : null, cardStyle.smallText]}>{stats && stats.comment ? stats.comment : 0} 留言</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleButtonPress()} style={{ ...cardStyle.bottomIcon, marginLeft: "auto" }}>
                        <Image source={Asset(isSaved ? `bookmark-active` : `bookmark`)} style={[iconStyle]} />
                        <Text style={[style ? style.smallText : null, cardStyle.smallText]}>收藏</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export function ArticleCard(props) {
    async function setBehavior(article, action) {
        let behaviorRef;
        let data;
        let querySnapshot = await firebase.firestore().collection('behavior').where('user', '==', props.user.id).where('article', '==', article.id).get();
        if (querySnapshot.size > 0) {
            behaviorRef = querySnapshot.docs[0].ref;
            data = querySnapshot.docs[0].data();
        } else {
            data = {
                user: props.user.id,
                article: article.id,
                stats: {
                    unread: false,
                    read: 0,
                    readDuration: {
                        total: 0.0,
                        max: 0.0,
                    },
                    like: 0,
                    save: false,
                    share: 0,
                    comment: 0,
                    report: 0
                },
                logs: []
            };
            behaviorRef = await firebase.firestore().collection('behavior').add(data);
        }
        behaviorRef.update({
            stats: {
                ...data.stats,
                read: action == 'read' ? data.stats.read + 1 : data.stats.read,
                save: action == 'unsave' ? false : action == 'save' ? true : data.stats.save,
            },
            logs: firebase.firestore.FieldValue.arrayUnion({
                action: action,
                time: firebase.firestore.Timestamp.now()
            })
        });
        firebase.firestore().doc('articles/' + article.id).update({
            stats: {
                ...article.stats,
                readTimes: action == 'read' ? article.stats.readTimes + 1 : article.stats.readTimes,
                save: action == 'unsave' ? article.stats.save - 1 : action == 'save' ? article.stats.save + 1 : article.stats.save,
                comment: action == 'comment' ? article.stats.comment + 1 : article.stats.comment,
            }
        });
    }

    function openArticle(article) {
        setBehavior(article, 'read');
        // if (article.type=='banner') WebBrowser.openBrowserAsync(article.meta.url)
        props.navigation.push('Article', { article: article });
    }

    function toggleSaveArticle(article) {
        // console.log(article)
        if (article?.isSaved) {
            setBehavior(article, 'unsave');
            props.user.ref.update({
                bookmarks: firebase.firestore.FieldValue.arrayRemove(article.id)
            });
        } else {
            setBehavior(article, 'save');
            props.user.ref.update({
                bookmarks: firebase.firestore.FieldValue.arrayUnion(article.id)
            });
        }
        article.isSaved = !article.isSaved;
    }

    return <Card {...props}
        onPress={openArticle}
        onButtonPress={() => toggleSaveArticle(props.item)}
    />;
}