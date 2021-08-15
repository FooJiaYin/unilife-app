import { StyleSheet } from 'react-native'
import { styles } from './styles'

export default StyleSheet.create({
    container: {
        // alignItems: 'center',
        width: '100%',
        padding: 16,
    },
    title: {
        
    },
    green:{
        backgroundColor: '#00aebb',
        width:'100%'
    },
    headerRight: {
        ...styles.textWhite
    },
    propic: {
        height: 100,
        width: 100,
        alignSelf: "center",
        resizeMode:'cover',
        borderRadius: 100/2,
        borderColor: 'white',
        borderWidth: 2,
        marginTop:16,
    },
    editButton:{
        height: 40,
        paddingHorizontal:32,
        borderWidth: 2,
        width: 200,
        margin: 16,
        alignSelf: "center",
    },
    input: {
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#f2f3f3',
        marginTop: 8,
        marginBottom: 8,
        width: '100%',
        paddingLeft: 16
    },
    footerView: {
        flex: 1,
        alignItems: "center",
        marginTop: 20
    },
    footerText: {
        fontSize: 16,
        color: '#2e2e2d'
    },
    footerLink: {
        color: "#0F355C",
        fontWeight: "bold",
        fontSize: 16,
        borderBottomColor: "#0F355C",
        borderBottomWidth: 2
    },
    bg: {
        justifyContent: "center",
        resizeMode:'cover',
        margin: 0
    }
})
