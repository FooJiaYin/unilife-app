import React from 'react';
import { FlatList } from 'react-native';
import { ArticleListItem } from './listsItem';

export const ArticleList = ({articles, maxToRenderPerBatch, ...props}) => <FlatList
        data={articles}
        renderItem={({ item }) => <ArticleListItem item={item} {...props} />}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={true}
        initialNumToRender={7}
        maxToRenderPerBatch={maxToRenderPerBatch || 3}
        // windowSize={3}
        removeClippedSubExpandCards={true}
        nestedScrollEnabled={true}
        contentContainerStyle={{ marginBottom: 0, paddingBottom: 150 }}
    />;