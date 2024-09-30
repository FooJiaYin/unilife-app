import React from 'react';
import { FlatList } from 'react-native';
import { ArticleCard } from './card';

export const ArticleList = React.memo(
    ({articles, maxToRenderPerBatch, renderItem, ...props}) => <FlatList
        data={articles}
        renderItem={renderItem ?? (({ item }) => <ArticleCard item={item} {...props} />)}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={true}
        initialNumToRender={7}
        maxToRenderPerBatch={maxToRenderPerBatch || 3}
        // windowSize={3}
        removeClippedSubExpandCards={true}
        nestedScrollEnabled={true}
        contentContainerStyle={{ marginBottom: 0, paddingBottom: 150 }}
    />, 
    (prevProps, nextProps) => nextProps.articles && 
        (prevProps.articles && prevProps.articles[0]?.id) === nextProps.articles[0]?.id && 
        (prevProps.articles[prevProps.articles.length-1]?.id === nextProps.articles[nextProps.articles.length-1]?.id && 
        prevProps.articles.length === nextProps.articles.length)
);