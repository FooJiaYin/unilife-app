// import _ from 'lodash';
// import React, {Component} from 'react';
// import {StyleSheet, ScrollView, View, Text} from 'react-native';
// import Constants  from 'react-native-ui-lib/Constants'
// import Spacings  from 'react-native-ui-lib/Spacings'
// import View  from 'react-native-ui-lib/View'
// import Text  from 'react-native-ui-lib/Text'
import Carousel  from 'react-native-ui-lib/Carousel'
// import Image  from 'react-native-ui-lib/Image'
// import Color  from 'react-native-ui-lib/Color'

const INITIAL_PAGE = 2;
const IMAGES = [
  'https://images.pexels.com/photos/2529159/pexels-photo-2529159.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
  'https://images.pexels.com/photos/2529146/pexels-photo-2529146.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
  'https://images.pexels.com/photos/2529158/pexels-photo-2529158.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
];
// const BACKGROUND_COLORS = [
//   Colors.red50,
//   Colors.yellow20,
//   Colors.purple50,
//   Colors.green50,
//   Colors.cyan50,
//   Colors.purple20,
//   Colors.blue60,
//   Colors.red10,
//   Colors.green20,
//   Colors.purple60
// ];

class CarouselScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    //   orientation: Constants.orientation,
      width: this.getWidth(),
      limitShownPages: false,
      numberOfPagesShown: 7,
      currentPage: INITIAL_PAGE,
      autoplay: false
    };
  }

  getWidth = () => {
    return 300;
  };

  onChangePage = (currentPage) => {
    this.setState({currentPage});
  };

  onPagePress = (index) => {
    if (this.carousel && this.carousel.current) {
      this.carousel.current.goToPage(index, true);
    }
  };

  render() {
    const {limitShownPages, numberOfPagesShown, autoplay, width} = this.state;

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text h1 margin-20>
          Carousel
        </Text>

        <Carousel
          key={numberOfPagesShown}
          ref={this.carousel}
          //loop
          autoplay={autoplay}
          onChangePage={this.onChangePage}
          pageWidth={width}
          itemSpacings={20}
          containerMarginHorizontal={20}
          initialPage={INITIAL_PAGE}
          containerStyle={{height: 160}}
          pageControlPosition={Carousel.pageControlPositions.UNDER}
          pageControlProps={{onPagePress: this.onPagePress, limitShownPages}}
          // showCounter
          allowAccessibleLayout
        >
          {_.map([...Array(numberOfPagesShown)], (item, index) => (
            <Page
              style={{backgroundColor: '#777345'}}
              key={index}
            >
              <Text margin-15>CARD {index}</Text>
            </Page>
          ))}
        </Carousel>

        <View pointerEvents="none">
          <Text text10>{this.state.currentPage}</Text>
        </View>

        <View paddingH-page>
          <Text h3 marginB-s4>
            Looping Carousel
          </Text>
          <Carousel
            containerStyle={{
              height: 200
            }}
            loop
            pageControlProps={{
              size: 10,
              containerStyle: styles.loopCarousel
            }}
            pageControlPosition={Carousel.pageControlPositions.OVER}
          >
            {IMAGES.map((image, i) => {
              return (
                <View flex centerV key={i}>
                  <Image
                    overlayType={Image.overlayTypes.BOTTOM}
                    style={{flex: 1}}
                    source={{
                      uri: image
                    }}
                  />
                </View>
              );
            })}
          </Carousel>
        </View>
      </ScrollView>
    );
  }
}

// @ts-ignore
const Page = ({children, style, ...others}) => {
  return (
    <View {...others} style={[styles.page, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  picker: {
    marginHorizontal: 20
  },
  page: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8
  },
  loopCarousel: {
    position: 'absolute',
    bottom: 15,
    left: 10
  }
});