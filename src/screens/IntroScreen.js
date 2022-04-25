import React, { useEffect, useState } from 'react'
import { View, useWindowDimensions, Image, Text, TouchableOpacity } from 'react-native'
import { Asset } from '../components/assets'
import { setHeaderOptions } from '../components/navigation'
import { stylesheet, Color, styles } from '../styles'
import { firebase } from '../firebase/config'
import Carousel, { Pagination } from 'react-native-snap-carousel'

export default function IntroScreen(props) {

    const [images, setImages] = useState([])
    const [activeSlide, setActiveSlide] = useState(0)
    const window = useWindowDimensions()

    setHeaderOptions(props.navigation, { headerShown: false })

    async function loadImages() {
        let snapshot = await props.user.ref.get()
        let userData = snapshot.data()
        firebase.firestore().doc('config/userGuide').get().then(snapshot => {
            setImages(snapshot.data().images)
        })
    }

    useEffect(() => {
        props.user.ref.update({
            guide: {
                intro: true,
                home: false
            }
        })
        loadImages()
    }, [])

    const guideStyles = {
        pagination: {
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            display: 'flex', 
            flexDirection: 'row',
            justifyContent: 'space-between', 
            alignItems: 'center', 
            paddingHorizontal: 20,
            zIndex: 1,
        },
        buttonText: {
            ...styles.textWhite,
            fontSize: 18,
            fontWeight: 'bold',
        }
    }

    const carouselItem = ({item}) => 
        <View style={[stylesheet.bgGreen, {flex: 1}]} key={item}>
            <Image source={{uri: item}} style={{flex: 1}} />
        </View>

    return (
        <View style={{ flex: 1 }}>
            <Carousel
                layout={'default'}
                style={{ position: 'absolute', flex: 1 }}
                data={images}
                renderItem={carouselItem} 
                sliderWidth={window.width}
                itemWidth={window.width}
                itemHeight={window.height}
                sliderHeight={window.height}
                inactiveSlideScale={1}
                onSnapToItem={(index) => setActiveSlide(index)}
                keyExtractor={item => item}
                enableSnap={true}
            />
            <View style={guideStyles.pagination}>
                <TouchableOpacity style={{ flexShrink: 1, opacity: 0 }} onPress={()=>{}}>
                    <Text style={guideStyles.buttonText}>結束</Text>
                </TouchableOpacity>
                <Pagination
                    containerStyle={{
                        flexShrink: 1, 
                        flexGrow: 1,
                    }}
                    dotsLength={images.length}
                    activeDotIndex={activeSlide}
                    // containerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
                    dotStyle={{
                        width: 8,
                        height: 8,
                        borderRadius: 5,
                        marginHorizontal: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.92)'
                    }}
                    inactiveDotStyle={{
                        // Define styles for inactive dots here
                    }}
                    inactiveDotOpacity={0.4}
                    inactiveDotScale={0.6}
                />
                <TouchableOpacity style={{ flexShrink: 0 }} onPress={ () => props.navigation.navigate('Tabs', {user: props.user}) }>
                    <Text style={guideStyles.buttonText}>結束</Text>
                </TouchableOpacity>
            </View>
            {/* <FlatList
                style={{ flex: 1 }}
                data={chatrooms}
                renderItem={chatroomItem}
                keyExtractor={(item) => item.id}
                removeClippedSubviews={true}
                horizontal={true}
                inverted={true}
                getItemLayout={(data, index) => (
                    {length: 300, offset: 300 * index, index}
                )}
            /> */}
        </View>
    )
}
