import { StyleSheet } from 'react-native'

export const stylesheet = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    title: {

    },
    logo: {
        flex: 1,
        height: 150,
        width: 200,
        alignSelf: "center",
        margin: 30,
        resizeMode:'contain',
        marginVertical: 48
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
    button: {
        backgroundColor: '#00aebb',
        marginVertical: 8,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: 'center'
    },
    buttonTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: "bold"
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
        flex: 1,
        justifyContent: "center",
        resizeMode:'cover',
        margin: 0
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor:'#0F355C',
        shadowOpacity: 0.17,
        shadowOffset: {width: 0, height: 8},
        shadowRadius: 20,
        elevation: 16,
        zIndex:999,
        marginVertical: 8,
        marginHorizontal: 16,
        padding:16
    }
})
