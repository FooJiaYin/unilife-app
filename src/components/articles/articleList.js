import React from 'react';
import { FlatList } from 'react-native';
import { ArticleListItem } from './listsItem';

export const ArticleList = React.memo(
    ({articles, maxToRenderPerBatch, ...props}) => <FlatList
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
    />, 
    (prevProps, nextProps) => nextProps.articles && (prevProps.articles && prevProps.articles[4]?.id) === nextProps.articles[4]?.id
);