import { StyleSheet } from 'react-native'
import { color, Color } from './color'

export const styles = {
    ...color,
    text: {
        ...color.textDark,
        fontSize: 16,
        textAlign: 'justify'
    },
    textCenter: {
        textAlign: 'center',
        alignSelf: 'center'
    },
    textS: {
        fontSize: 12,
    },      
    textXS: {
        fontSize: 10,
    },      
    textBubble: {
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16
    },
    articleTitle: {
        fontSize: 20,
        fontWeight: 900,
        marginVertical: 8,
    },
    button: {
        marginVertical: 8,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: 'center'
    },
    icon: {
        aspectRatio: 1,
        width: 16, 
        height: 16,
        margin: 16,
        resizeMode: 'contain',
        alignSelf: 'center',
        tintColor: Color.grey0
    },
    container: {
        flex: 1,
        // alignItems: 'center',
        backgroundColor: 'white',
    },
    articleContainer: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    articleListItem: {
        flex: 1,
        flexDirection: 'row',
        height: 90,
        marginVertical: 8,
        overflow: 'hidden',
        paddingHorizontal: 16,
    },
    listItemImage: {
        width: 90,
        height: 90,
        borderRadius: 6,
    },
    listItemText: {
        flex: 'column',
        flexShrink: 1,
    },
    listItemTitle: {
        flexWrap: 'wrap',
    },
    listItemDescription: {
        height: 40,
        flexWrap: 'wrap',
        overflow: 'hidden',
    },
    formContainer: {
        flexDirection: 'row',
        position: 'absolute',
        height: 80,
        marginTop: 40,
        marginBottom: 20,
        flex: 1,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 30,
        paddingRight: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    input: {
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#f2f3f3',
        marginTop: 8,
        marginBottom: 8,
        paddingLeft: 16
    },
    disabledButton: {
        backgroundColor: "#e2e3e4",
        height: 40,
        borderRadius: 20,
        shadowRadius: 44,
        shadowOffset:{width:0, height:8},
        shadowColor: '#0f355c',
        shadowOpacity: 0.15,
        alignItems:'center',
        justifyContent:'center',
    },
    button: {
        backgroundColor: "#00aebb",
        height: 40,
        borderRadius: 20,
        shadowRadius: 44,
        shadowOffset:{width:0, height:8},
        shadowColor: '#0f355c',
        shadowOpacity: 0.15,
        alignItems:'center',
        justifyContent:'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16
    },
    footerView: {
        flex: 1,
        justifyContent:'bottom',
        alignItems: "center",
        marginBottom: 20,
        marginTop: "auto"
    },
    footerText: {
        fontSize: 12,
        color: '#2e2e2d'
    },
    footerLink: {
        fontSize: 12,
        color: "#0F355C",
        fontWeight: 'bold',
        borderBottomColor: "#0F355C",
        borderBottomWidth: 1,
    }
}

export const stylesheet = StyleSheet.create(styles)
