import React, { useState } from 'react'
import { Image, Pressable, StyleSheet } from 'react-native'
import { Color, stylesheet } from '../styles'

export default function Asset(name) {
    if (!name) return null
    if (name == 'bg-login.jpg') return require('../../assets/bg-login.jpg')
    if (name == 'bg-profile.jpg') return require('../../assets/bg-profile.jpg')
    if (name == 'default-propic.png') return require('../../assets/default-propic.png')
    if (name == 'home.jpg') return require('../../assets/home.jpg')
    if (name == 'icon.png') return require('../../assets/icon.png')
    if (name == 'lock.png') return require('../../assets/lock.png')
    if (name == 'logo_with_text.png') return require('../../assets/logo_with_text.png')
    if (name == 'profile-image-0.png') return require('../../assets/profile-image-0.png')
    if (name == 'profile-image-1.png') return require('../../assets/profile-image-1.png')
    if (name == 'profile-image-2.png') return require('../../assets/profile-image-2.png')
    if (name == 'tick-large.png') return require('../../assets/tick-large.png')
    if (name == 'Uni') return require('../../assets/Uni.png')

    /* Icons */
    if (name == 'add') return require('../../assets/icons/add.png')
    if (name == 'add-circle') return require('../../assets/icons/add-circle.png')
    if (name == 'bookmark') return require('../../assets/icons/bookmark.png')
    if (name == 'bookmark-active') return require('../../assets/icons/bookmark-active.png')
    if (name == 'chat') return require('../../assets/icons/chat.png')
    if (name == 'circle-cross') return require('../../assets/icons/circle-cross.png')
    if (name == 'circle-left') return require('../../assets/icons/circle-left.png')
    if (name == 'community') return require('../../assets/icons/community.png')
    if (name == 'delete') return require('../../assets/icons/delete.png')
    if (name == 'down') return require('../../assets/icons/down.png')
    if (name == 'drag') return require('../../assets/icons/drag.png')
    if (name == 'eye') return require('../../assets/icons/eye.png')
    if (name == 'flag') return require('../../assets/icons/flag.png')
    if (name == 'hide') return require('../../assets/icons/hide.png')
    if (name == 'hide-user') return require('../../assets/icons/hide-user.png')
    if (name == 'home') return require('../../assets/icons/home.png')
    if (name == 'icon') return require('../../assets/icons/icon.png')
    if (name == 'info') return require('../../assets/icons/info.png')
    if (name == 'item-large') return require('../../assets/icons/item-large.png')
    if (name == 'item-small') return require('../../assets/icons/item-small.png')
    if (name == 'left') return require('../../assets/icons/left.png')
    if (name == 'mail') return require('../../assets/icons/mail.png')
    if (name == 'news') return require('../../assets/icons/news.png')
    if (name == 'notification') return require('../../assets/icons/notification.png')
    if (name == 'open') return require('../../assets/icons/open.png')
    if (name == 'option') return require('../../assets/icons/option.png')
    if (name == 'profile') return require('../../assets/icons/profile.png')
    if (name == 'report') return require('../../assets/icons/report.png')
    if (name == 'right') return require('../../assets/icons/right.png')
    if (name == 'search') return require('../../assets/icons/search.png')
    if (name == 'send') return require('../../assets/icons/send.png')
    if (name == 'share') return require('../../assets/icons/share.png')
    if (name == 'trash') return require('../../assets/icons/trash.png')
    if (name == 'ic-announce') return require('../../assets/icons/ic-announce.png')
    if (name == 'ic-bus') return require('../../assets/icons/ic-bus.png')
    if (name == 'ic-book') return require('../../assets/icons/ic-book.png')
    if (name == 'ic-class') return require('../../assets/icons/ic-class.png')
    if (name == 'star') return require('../../assets/icons/star.png')
    if (name == 'tick') return require('../../assets/icons/tick.png')
    if (name == 'refresh') return require('../../assets/icons/refresh.png')
    if (name == 'info') return require('../../assets/icons/info.png')
    if (name == 'question') return require('../../assets/icons/question.png')
    if (name == 'guide') return require('../../assets/icons/guide.png')
    if (name == 'like') return require('../../assets/icons/like.png')
    if (name == 'like-active') return require('../../assets/icons/like-active.png')
    if (name == 'love') return require('../../assets/icons/love.png')
    if (name == 'love-active') return require('../../assets/icons/love-active.png')
    if (name == 'edit') return require('../../assets/icons/edit.png')
    if (name == 'history') return require('../../assets/icons/history.png')
    if (name == 'save-list') return require('../../assets/icons/save-list.png')
    if (name == 'notification-list') return require('../../assets/icons/notification-list.png')
    if (name == 'shop') return require('../../assets/icons/shop.png')

    /* Topics */
    if (name == 'topic-1') return require('../../assets/topics/cover_1.jpg')
    if (name == 'topic-2') return require('../../assets/topics/cover_2.jpg')
    if (name == 'topic-3') return require('../../assets/topics/cover_3.jpg')
    if (name == 'topic-4') return require('../../assets/topics/cover_4.jpg')
    if (name == 'topic-5') return require('../../assets/topics/cover_5.jpg')
    if (name == 'topic-6') return require('../../assets/topics/cover_6.jpg')
    if (name == 'topic-7') return require('../../assets/topics/cover_7.jpg')
    if (name == 'topic-8') return require('../../assets/topics/cover_8.jpg')
    if (name == 'topic-9') return require('../../assets/topics/cover_9.jpg')
    if (name == 'topic-10') return require('../../assets/topics/cover_10.jpg')
    if (name == 'topic-11') return require('../../assets/topics/cover_11.jpg')
    if (name == 'topic-12') return require('../../assets/topics/cover_12.jpg')
    if (name == 'topic-13') return require('../../assets/topics/cover_13.jpg')
    if (name == 'topic-14') return require('../../assets/topics/cover_14.jpg')
    if (name == 'topic-15') return require('../../assets/topics/cover_15.jpg')
    if (name == 'overlay') return require('../../assets/topics/overlay.png')
    if (name == 'overlay_selected') return require('../../assets/topics/overlay_selected.png')

    /* Announcement */
    if (name == 'activity') return require('../../assets/announcement/activity.png')
    if (name == 'announcement') return require('../../assets/announcement/announcement.png')
    if (name == 'important') return require('../../assets/announcement/important.png')
    if (name == 'job') return require('../../assets/announcement/job.png')
    if (name == 'resource') return require('../../assets/announcement/resource.png')
    if (name == 'scholarship') return require('../../assets/announcement/scholarship.png')

}

export function Icon({ name, size, color, style, onPress }) {
    const iconStyle = StyleSheet.create({
        aspectRatio: 1,
        width: size || 16, 
        height: size || 16,
        margin: 16,
        resizeMode: 'contain',
        alignSelf: 'center',
        tintColor: color || Color.grey0
    })
    return (
        // onPress? (
        //     <TouchableOpacity onPress={onPress}>
        //         <Image source={Asset(`icons/${name}.png`)} style={style? [style] : iconStyle} />
        //     </TouchableOpacity>
        // ) : <Image source={Asset(`icons/${name}.png`)} style={style? [style] : iconStyle} />
        <Image source={Asset(name)} style={[iconStyle, style? style : {}]} />
    )
}