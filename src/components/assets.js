import React, { useState } from 'react'
import { Image, Pressable, StyleSheet } from 'react-native'
import { Color, stylesheet } from '../styles'

export default function Asset(name) {
    if (!name) return null
    if (name == 'bg-login.jpg') return require('../../assets/bg-login.jpg')
    // bg-profile
    if (name == 'bg-profile.jpg') return require('../../assets/bg-profile.jpg')
    // default-propic.png
    if (name == 'default-propic.png') return require('../../assets/default-propic.png')
    // icon.png
    if (name == 'icon.png') return require('../../assets/icon.png')
    // lock.png
    if (name == 'lock.png') return require('../../assets/lock.png')
    // logo_with_text.png
    if (name == 'logo_with_text.png') return require('../../assets/logo_with_text.png')
    // profile-image-0.png
    if (name == 'profile-image-0.png') return require('../../assets/profile-image-0.png')
    // profile-image-1.png
    if (name == 'profile-image-1.png') return require('../../assets/profile-image-1.png')
    // profile-image-2.png
    if (name == 'profile-image-2.png') return require('../../assets/profile-image-2.png')
    // tick-large.png
    if (name == 'tick-large.png') return require('../../assets/tick-large.png')

    /* Icons */
    if (name == 'add') return require('../../assets/icons/add.png')
    if (name == 'add-circle') return require('../../assets/icons/add-circle.png')
    if (name == 'bookmark') return require('../../assets/icons/bookmark.png')
    if (name == 'bookmark-active') return require('../../assets/icons/bookmark-active.png')
    if (name == 'chat') return require('../../assets/icons/chat.png')
    if (name == 'circle-cross') return require('../../assets/icons/circle-cross.png')
    if (name == 'circle-left') return require('../../assets/icons/circle-left.png')
    if (name == 'delete') return require('../../assets/icons/delete.png')
    if (name == 'down') return require('../../assets/icons/down.png')
    if (name == 'drag') return require('../../assets/icons/drag.png')
    if (name == 'eye') return require('../../assets/icons/eye.png')
    if (name == 'home') return require('../../assets/icons/home.png')
    if (name == 'icon') return require('../../assets/icons/icon.png')
    if (name == 'info') return require('../../assets/icons/info.png')
    if (name == 'item-large') return require('../../assets/icons/item-large.png')
    if (name == 'item-small') return require('../../assets/icons/item-small.png')
    if (name == 'left') return require('../../assets/icons/left.png')
    if (name == 'mail') return require('../../assets/icons/mail.png')
    if (name == 'notification') return require('../../assets/icons/notification.png')
    if (name == 'open') return require('../../assets/icons/open.png')
    if (name == 'option') return require('../../assets/icons/option.png')
    if (name == 'profile') return require('../../assets/icons/profile.png')
    if (name == 'report') return require('../../assets/icons/report.png')
    if (name == 'right') return require('../../assets/icons/right.png')
    if (name == 'search') return require('../../assets/icons/search.png')
    if (name == 'send') return require('../../assets/icons/send.png')
    if (name == 'share') return require('../../assets/icons/share.png')
    if (name == 'shortcut-announcement') return require('../../assets/icons/shortcut-announcement.png')
    if (name == 'shortcut-bus') return require('../../assets/icons/shortcut-bus.png')
    if (name == 'shortcut-library') return require('../../assets/icons/shortcut-library.png')
    if (name == 'shortcut-lims') return require('../../assets/icons/shortcut-lims.png')
    if (name == 'star') return require('../../assets/icons/star.png')
    if (name == 'tick') return require('../../assets/icons/tick.png')
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