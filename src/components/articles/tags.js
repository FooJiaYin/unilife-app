import React from 'react'
import { View, ScrollView } from 'react-native'
import { Color } from '../../styles'
import { tagNames } from '../../firebase/functions'
import { Chip } from '../chip'

export const ScrollTags = ({tags}) => <ScrollView horizontal showsHorizontalScrollIndicator={false} 
    style={{flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 5, height: 56}}>
    {tags.map(tag => <Chip 
        label={'#' + (tagNames[tag] || tag)} 
        color={Color.green} 
        size={'large'} focused 
        action={()=>props.navigation.navigate('Filter', {type: 'tag', data: tag}) }
    />)}
</ScrollView>

export const SmallTags = ({tags, action}) => <View
    style={{flexDirection: 'row'}}>
    {tags.map(tag => <Chip 
        label={tagNames[tag] || tag} 
        type={'tag'} 
        action={action}
    />)}
</View>
