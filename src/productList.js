
/*import React, {Component} from 'react';
import {ScrollView, StyleSheet, Image, View, Text, Modal} from 'react-native';
export default class productList extends Component {
    constructor(props) {
      super(props);
      this.state = {
        splashScreenVisible: true,
        isConnecting: false,
        isbackgroundTimerOn: false,
      };
    }

    render() {
        return (
            <Text>Jaskar</Text>
        );
    }
}*/

/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {ScrollView,SafeAreaView, StyleSheet, Image, View, Text, Modal} from 'react-native';
import {Card, CardItem} from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
import BackgroundTimer from 'react-native-background-timer';
import StarRating from 'react-native-star-rating';
import Icon from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
//import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  IPADDRESS,
  HTTPS,
  PORT,
  BEFORE_PLACING_ORDER,
  ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE,
  ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE,
  PLACE_THE_CUP,
  DISPENSING,
  ORDER_DISPENSED,
  SOMETHING_WENT_WRONG,
  TIMEOUT_EXPIRED,
  MACHINE_NOT_READY,
  orderStatus,
  initialFeedbackInterval,
  routineFeedbackInterval,
} from './macros';

Icon.loadFont();
Feather.loadFont();
MaterialCommunityIcons.loadFont();

class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
      modalVisible: false,
      feedbackVisible: false,
      orderNumberVisible: false,
      waitTimeVisible: false,
      orderStatusCode: null,
      starCount: 0,
      deviceProductList: [],
      orderId: null,
      orderNumber: null,
      waitTime: null,
      timer: 30,
      machineName: null,
      machineId: null,
      allProductListURL: [
        {
          productName: 'Cappuccino',
          src: require('../assets/cappuccino.jpg'),
        },
        {
          productName: 'Espresso',
          src: require('../assets/espresso.jpg'),
        },
        {
          productName: 'Milk',
          src: require('../assets/milk.jpg'),
        },
        {
          productName: 'South Indian Coffee Light',
          src: require('../assets/SIC_light.jpg'),
        },
        {
          productName: 'South Indian Coffee Strong',
          src: require('../assets/SIC_strong.jpg'),
        },
        {
          productName: 'Tea Milk',
          src: require('../assets/tea_milk.jpg'),
        },
        {
          productName: 'Tea Water',
          src: require('../assets/tea_water.jpg'),
        },
        {
          productName: 'Lemon Tea',
          src: require('../assets/lemon_tea.png'),
        },
      ],
    };
  }

  async componentDidMount() {
    this.showProductList(this.props.route.params.productList);
  }

  async componentWillUnmount() {}

  showProductList = async produtList => {
    console.log('show Product list');
    let deviceProductList = [];
    await produtList.map(async product => {
      let filterProduct = this.state.allProductListURL.find(
        allproduct => allproduct.productName === product.productName,
      );
      filterProduct.productId = product.productId;
      deviceProductList.push(filterProduct);
    });
    this.setState({
      deviceProductList: deviceProductList,
    });
    this.setState({
      machineName: this.props.route.params.machineName,
      machineId: this.props.route.params.machineId,
    });
  };

  checkForFeedbackVisibility = async productName => {
    var feedbackTimeDetails = JSON.parse(
      await AsyncStorage.getItem(productName),
    );
    console.log(feedbackTimeDetails);
    const currentTime = Date.parse(new Date());
    console.log(currentTime);
    if (feedbackTimeDetails === null) {
      feedbackTimeDetails = {
        lastFeedbackDisplayedTime: currentTime,
        nextFeedbackInterval: initialFeedbackInterval,
      };
      await AsyncStorage.setItem(
        productName,
        JSON.stringify(feedbackTimeDetails),
      );
      console.log(await AsyncStorage.getItem(productName));
      return false;
    }
    if (
      currentTime - feedbackTimeDetails.lastFeedbackDisplayedTime >
      feedbackTimeDetails.nextFeedbackInterval
    ) {
      feedbackTimeDetails.lastFeedbackDisplayedTime = currentTime;
      feedbackTimeDetails.nextFeedbackInterval = routineFeedbackInterval;
      await AsyncStorage.setItem(
        productName,
        JSON.stringify(feedbackTimeDetails),
      );
      console.log(await AsyncStorage.getItem(productName));
      return true;
    } else {
      return false;
    }
  };

  getTimeoutSignal = async () => {
    // eslint-disable-next-line no-undef
    const controller = new AbortController();
    setTimeout(() => {
      controller.abort();
    }, 10000);
    return controller;
  };

  stopPollForOrderStatus = async () => {
    clearInterval(this.pollingIntervalId);
    //BackgroundTimer.stop();
  };

  startPollForOrderStatus = async (productName, interval) => {
    //BackgroundTimer.start();
    this.pollingIntervalId = setInterval(async () => {
      fetch(
        HTTPS +
          '://' +
          IPADDRESS +
          ':' +
          PORT +
          '/orderStatus?orderId=' +
          this.state.orderId,
        {
          headers: {
            tokenId: 'secret',
          },
          signal: (await this.getTimeoutSignal()).signal,
        },
      )
        .then(response => response.json())
        .then(async resultData => {
          console.log(resultData);
          if (resultData.status === 'Success') {
            if (resultData.orderStatus === 'InQueue') {
              console.log('In-Queue');
              console.log('Continue poll');
            } else if (resultData.orderStatus === 'WaitingToDispense') {
              this.stopPollForOrderStatus();
              console.log('WaitingToDispense');
              console.log('Stopped poll for user to place the cup');
              this.setState({
                orderStatusCode: PLACE_THE_CUP,
                waitTimeVisible: false,
                waitTime: null,
              });
              //BackgroundTimer.start();
              this.timer = setInterval(async () => {
                this.setState({timer: this.state.timer - 1});
                console.log(this.state.timer);
                if (this.state.timer === 0) {
                  clearInterval(this.timer);
                  //BackgroundTimer.stop();
                  this.setState({timer: 30});
                  this.setState({
                    orderStatusCode: TIMEOUT_EXPIRED,
                    orderId: null,
                    orderNumberVisible: false,
                    waitTimeVisible: false,
                    orderNumber: null,
                    waitTime: null,
                  });
                }
              }, 1000);
            } else if (resultData.orderStatus === 'Dispensing') {
              this.setState({waitTimeVisible: false});
              console.log('Dispensing');
              console.log('Continue poll');
            } else if (resultData.orderStatus === 'Dispensed') {
              console.log('Dispensed');
              this.stopPollForOrderStatus();
              if (await this.checkForFeedbackVisibility(productName)) {
                console.log('feedback visible');
                this.setState({
                  feedbackVisible: true,
                });
              }
              this.setState({
                orderStatusCode: ORDER_DISPENSED,
                orderId: null,
              });
            } else if (resultData.orderStatus === 'Machine is not Ready') {
              console.log('not ready');
              this.stopPollForOrderStatus();
              this.setState({
                orderStatusCode: MACHINE_NOT_READY,
                orderId: null,
              });
            }
          } else {
            this.stopPollForOrderStatus();
            this.setState({
              orderStatusCode: SOMETHING_WENT_WRONG,
              orderId: null,
              orderNumberVisible: false,
              waitTimeVisible: false,
              orderNumber: null,
              waitTime: null,
            });
          }
          //console.log(this.state.orderStatusCode);
        })
        .catch(async e => {
          this.stopPollForOrderStatus();
          this.setState({
            orderStatusCode: SOMETHING_WENT_WRONG,
            orderId: null,
            orderNumberVisible: false,
            waitTimeVisible: false,
            orderNumber: null,
            waitTime: null,
          });
        });
    }, interval);
  };

  placeOrder = async (productId, productName) => {
    this.setState({
      orderStatusCode: ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE,
    });
    console.log(productId);
    fetch(
      HTTPS + '://' + IPADDRESS + ':' + PORT + '/order?productId=' + productId,
      {
        headers: {
          tokenId: 'secret',
        },
        signal: (await this.getTimeoutSignal()).signal,
      },
    )
      .then(response => response.json())
      .then(async resultData => {
        console.log(resultData);
        if (resultData.status === 'Success') {
          this.setState({
            orderStatusCode: ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE,
            orderNumberVisible: true,
            waitTimeVisible: true,
            orderNumber: resultData.orderNo,
            waitTime: resultData.approxWaitTime,
          });
          console.log(resultData);
          console.log('ack');
          this.state.orderId = resultData.orderId;
          console.log(this.state.orderNumber, this.state.waitTime);
          await this.startPollForOrderStatus(productName, 5000);
        } else {
          if (resultData.infoText === 'Machine is not Ready') {
            this.setState({orderStatusCode: MACHINE_NOT_READY});
          } else {
            this.setState({orderStatusCode: SOMETHING_WENT_WRONG});
          }
        }
      })
      .catch(async e => {
        console.log(e);
        this.setState({
          orderStatusCode: SOMETHING_WENT_WRONG,
          orderNumberVisible: false,
          waitTimeVisible: false,
          orderNumber: null,
          waitTime: null,
        });
      });
  };

  startDispense = async productName => {
    clearInterval(this.timer);
    //BackgroundTimer.stop();
    this.setState({timer: 30});
    this.setState({orderStatusCode: DISPENSING});
    fetch(
      HTTPS +
        '://' +
        IPADDRESS +
        ':' +
        PORT +
        '/dispense?orderId=' +
        this.state.orderId,
      {
        headers: {
          tokenId: 'secret',
        },
        signal: (await this.getTimeoutSignal()).signal,
      },
    )
      .then(response => response.json())
      .then(async resultData => {
        console.log(resultData);
        if (resultData.status === 'Success') {
          console.log('Dispense Starts');
          this.startPollForOrderStatus(productName, 3000);
        } else {
          if (resultData.infoText === 'Machine is not Ready ') {
            this.setState({orderStatusCode: MACHINE_NOT_READY, orderId: null});
          } else {
            this.setState({
              orderStatusCode: SOMETHING_WENT_WRONG,
              orderId: null,
              orderNumberVisible: false,
              waitTimeVisible: false,
              orderNumber: null,
              waitTime: null,
            });
          }
        }
      })
      .catch(async e => {
        this.setState({
          orderStatusCode: SOMETHING_WENT_WRONG,
          orderId: null,
          orderNumberVisible: false,
          waitTimeVisible: false,
          orderNumber: null,
          waitTime: null,
        });
      });
  };

  async onStarRatingPress(rating, productName) {
    console.log(rating);
    this.setState({
      starCount: rating,
    });
    var feedbackData = JSON.parse(await AsyncStorage.getItem('feedbackData'));
    if (feedbackData === null) {
      console.log('null');
      feedbackData = {};
    }
    feedbackData[productName] = {
      machineId: this.state.machineId,
      machineName: this.state.machineName,
      rating: rating,
      timeStamp: new Date(),
    };
    AsyncStorage.setItem('feedbackData', JSON.stringify(feedbackData));
    console.log(await AsyncStorage.getItem('feedbackData'));
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <View
          style={{
            backgroundColor: '#100A45',
            height: 50,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            style={{width: '50%', height: '65%', resizeMode: 'contain'}}
            source={require('../assets/Lavazza-White-Logo-No-Background-.png')}
          />
        </View>
        <ScrollView>
          {this.state.deviceProductList.map((product, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  this.setState({
                    modalVisible: !this.state.modalVisible,
                    selectedIndex: index,
                    orderStatusCode: BEFORE_PLACING_ORDER,
                    starCount: 0,
                  });
                }}>
                <Card key={index}>
                  <CardItem>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}>
                      <View>
                        <Image
                          style={{width: 75, height: 75, borderRadius: 20}}
                          source={product.src}
                        />
                      </View>
                      <View
                        style={{
                          justifyContent: 'center',
                          width: '50%',
                        }}>
                        <Text style={styles.productName}>
                          {product.productName}
                        </Text>
                      </View>
                      <View style={{justifyContent: 'center'}}>
                        <Icon
                          name="circle-with-plus"
                          size={35}
                          style={{color: '#100A45'}}
                    />
                      </View>
                    </View>
                  </CardItem>
                </Card>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {this.state.deviceProductList.length > 0 ? (
            <Modal
              animationType="slide"
              visible={this.state.modalVisible}
              onRequestClose={async () => {
                if (
                  this.state.orderStatusCode >=
                    ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE &&
                  this.state.orderStatusCode <= DISPENSING
                ) {
                  console.log('Please dont go back');
                } else if (this.state.orderStatusCode === ORDER_DISPENSED) {
                  this.props.navigation.goBack();
                } else {
                  this.setState({modalVisible: false, feedbackVisible: false});
                }
              }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  {this.state.orderStatusCode === BEFORE_PLACING_ORDER ||
                  this.state.orderStatusCode >= SOMETHING_WENT_WRONG ? (
                    <Icon
                      name="circle-with-cross"
                      onPress={() => {
                        this.setState({
                          modalVisible: !this.state.modalVisible,
                        });
                      }}
                      size={30}
                      style={{color: '#100A45', left: '95%'}}
                    />
                  ) : null}

                  <View style={{marginTop: 10, alignItems: 'center'}}>
                    <Image
                      style={{width: 100, height: 25}}
                      source={require('../assets/lavazza_logo_without_year.png')}
                    />
                  </View>
                  <View
                    style={{
                      marginTop: 10,
                      marginBottom: 'auto',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.productName}>
                      {
                        this.state.deviceProductList[this.state.selectedIndex]
                          .productName
                      }
                    </Text>
                  </View>
                  {this.state.orderStatusCode === DISPENSING ? (
                    <View style={{marginTop: 10, alignItems: 'center'}}>
                      <Image
                        style={{width: 150, height: 150}}
                        source={require('../assets/dispensing.gif')}
                      />
                    </View>
                  ) : (
                    <View style={{marginTop: 10, alignItems: 'center'}}>
                      <Image
                        style={{width: 75, height: 75, borderRadius: 75 / 2}}
                        source={
                          this.state.deviceProductList[this.state.selectedIndex]
                            .src
                        }
                      />
                    </View>
                  )}
                  {this.state.orderNumberVisible ? (
                    <View
                      style={{
                        marginTop: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: 'bold',
                          color: '#100A45',
                        }}>
                        Order No {this.state.orderNumber}
                      </Text>
                    </View>
                  ) : null}

                  <View
                    style={{
                      marginTop: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text style={{color: '#6F6D6D', fontSize: 10}}>Status</Text>
                    <Text
                      style={{marginTop: 5, color: '#100A45', fontSize: 12}}>
                      {orderStatus[this.state.orderStatusCode]}
                    </Text>
                  </View>

                  {this.state.waitTimeVisible ? (
                    <View
                      style={{
                        marginTop: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: 'bold',
                          color: '#100A45',
                        }}>
                        Approx Wait Time - {this.state.waitTime}min
                      </Text>
                    </View>
                  ) : null}

                  {/* visible when feedback time arrives  */}
                  {this.state.feedbackVisible ? (
                    <View
                      style={{
                        marginTop: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: '#6F6D6D', fontSize: 10}}>
                        Feedback
                      </Text>
                      <View style={{marginTop: 5}}>
                        <StarRating
                          maxStars={5}
                          starSize={35}
                          emptyStar='star-outlined'
                          fullStar='star'
                          iconSet='Entypo'
                          emptyStarColor="#6F6D6D"
                          fullStarColor="#100A45"
                          halfStarEnabled={false}
                          rating={this.state.starCount}
                          selectedStar={rating =>
                            this.onStarRatingPress(
                              rating,
                              this.state.deviceProductList[
                                this.state.selectedIndex
                              ].productName,
                            )
                          }
                        />
                      </View>
                    </View>
                  ) : null}
                  {this.state.orderStatusCode === ORDER_DISPENSED ? (
                    <View
                      style={{
                        alignItems: 'center',
                        marginTop: 20,
                      }}>
                      <MaterialCommunityIcons.Button
                        name="check-circle"
                        size={25}
                        color="white"
                        backgroundColor="#100A45"
                        onPress={async () => {
                          this.props.navigation.goBack();
                        }}>
                        <Text style={{fontSize: 15, color: '#ffffff'}}>
                          Done
                        </Text>
                      </MaterialCommunityIcons.Button>
                    </View>
                  ) : null}

                  {this.state.orderStatusCode === PLACE_THE_CUP ? (
                    <View style={{}}>
                      <View
                        style={{
                          marginTop: 20,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Feather.Button
                          name="coffee"
                          size={25}
                          color="white"
                          backgroundColor="#100A45"
                          onPress={async () => {
                            this.startDispense(
                              this.state.deviceProductList[
                                this.state.selectedIndex
                              ].productName,
                            );
                          }}>
                          <Text style={{fontSize: 15, color: '#ffffff'}}>
                            Dispense
                          </Text>
                        </Feather.Button>
                      </View>
                      <View
                        style={{
                          marginTop: 10,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: 'bold',
                            color: '#100A45',
                          }}>
                          Timeout: {this.state.timer}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {this.state.orderStatusCode === BEFORE_PLACING_ORDER ||
                  this.state.orderStatusCode >= SOMETHING_WENT_WRONG ? (
                    <View
                      style={{
                        alignItems: 'center',
                        marginTop: 20,
                      }}>
                      <Feather.Button
                        name="coffee"
                        size={25}
                        color="white"
                        backgroundColor="#100A45"
                        onPress={async () => {
                          await this.placeOrder(
                            this.state.deviceProductList[
                              this.state.selectedIndex
                            ].productId,
                            this.state.deviceProductList[
                              this.state.selectedIndex
                            ].productName,
                          );
                        }}>
                        <Text style={{fontSize: 15, color: '#ffffff'}}>
                          Order
                        </Text>
                      </Feather.Button>
                    </View>
                  ) : null}
                </View>
              </View>
            </Modal>
          ) : null}
    </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 100,
  },
  logoContainer: {
    justifyContent: 'center',
    marginTop: '50%',
    alignItems: 'center',
  },
  header: {
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#b85400',
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 50,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 50,
  },
  restrictedAccessButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 30,
    backgroundColor: 'white',
    borderRadius: 20,
    borderColor: '#100A45',
    borderWidth: 1.5,
    paddingLeft: 35,
    paddingRight: 35,
    paddingBottom: 35,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productName: {
    textShadowColor: '#100A45',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#100A45',
  },
});

export default ProductList;
