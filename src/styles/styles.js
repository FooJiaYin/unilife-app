import { StyleSheet } from 'react-native'
import { color, Color } from './color'
import RNPickerSelect from 'react-native-picker-select';

export const styles = {
    ...color,
    text: {
        ...color.textDark,
        flexWrap: "wrap",
        fontSize: 16,
        textAlign: 'justify',
        lineHeight: 20,
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
        fontSize: 24,
        fontWeight: "900",
        marginVertical: 8,
        lineHeight: 30,
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
    iconColor: {
        aspectRatio: 1,
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    footerView: {
        // flex: 1,
        alignItems: "center",
        marginTop: 60,
        marginBottom: 60,
    },
    footerText: {
        fontSize: 16,
        color: '#2e2e2d'
    },
    footerLink: {
        color: Color.blue,
        fontWeight: "bold",
        fontSize: 16,
        borderBottomColor: Color.blue,
        borderBottomWidth: 2
    },
    modal: {
        marginHorizontal: 20,
        marginTop: 60,
        marginBottom: 100,
        backgroundColor: "white",
        borderRadius: 10,
        paddingVertical: 30,
        paddingHorizontal: 0,
        // alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    borderBottom: {
        borderBottomWidth: 1, 
        borderBottomColor: Color.grey2
    },
    borderTop: {
        borderTopWidth: 1, 
        borderTopColor: Color.grey2
    },
    bg: {
        justifyContent: "center",
        resizeMode:'cover',
        margin: 0,
        // alignItems: 'center',
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
        flexDirection: 'column',
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
    input: {
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#f2f3f3',
        // flex: 1,
        marginTop: 8,
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 14,
    },
    inputText: {
        overflow: 'scroll',
        flexShrink: 1,
        flexGrow: 1,
    },
    inputRow: {
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#f2f3f3',
        flex: 1,
        marginTop: 8,
        marginBottom: 8,
        paddingHorizontal: 16,
        fontSize: 14,
        display: 'flex', 
        flexDirection: 'row',  
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    inputBar: {
        backgroundColor: 'white',
        flexDirection: 'row',
        // position: 'absolute',
        zIndex: 1,
        // height: 80,
        // marginTop: 40,
        // bottom: 0,
        // flex: 1,
        paddingTop: 2,
        paddingBottom: 4,
        paddingLeft: 16,
        // justifyContent: 'center',
        alignItems: 'center'
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
    centerSelf: {
        marginTop: 'auto',
        marginBottom: 'auto',
        // marginLeft: 'auto',
        // marginRight: 'auto',
    },
    row:{
        paddingHorizontal: 16,
        flexDirection: 'row',
        width: '100%',
        alignItems:'flex-start',
        justifyContent:'flex-start',
        // boxSizing: 'paddingBox',
    },
    headerText:{
        ...color.textDark,
        fontWeight: '700',
        fontSize: 20,
        lineHeight: 30,
        textAlign: 'center',
        alignItems: 'center',
        flex:1,
        justifyContent: 'center',
    }
}

export const htmlStyles = {
    b: {
        fontWeight: 'bold'
    },
    h2: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 18,
        marginBottom: 4,
    },
    p: {
        fontSize: 16,
        lineHeight: 28,
        marginBottom: 8,
        textAlign: 'justify',
    },
    ul: {
        marginBottom: 8
    },
    li: {
        fontSize: 16,
        lineHeight: 28,
        marginLeft: 8
    },
    img: {
        enableExperimentalPercentWidth: true,
        width: '100%',
        justifyContent: 'center',
        alignText: 'center',
        marginVertical: 8
      }
}

export const pickerSelectStyles = {
    inputIOS: {
        ...styles.input,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0,
        paddingRight: 30
    },
    inputAndroid: {
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#f2f3f3',
        marginTop: 8,
        marginBottom: 8,
        paddingLeft: 16,
        fontSize: 14,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0,
        paddingRight: 30, // to ensure the text is never behind the icon
    },
}

export const stylesheet = StyleSheet.create(styles)
