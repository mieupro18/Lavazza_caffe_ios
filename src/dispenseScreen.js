import React, {Component} from 'react';
import {
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Image,
  View,
  Text,
  Modal,
  AppState,
} from 'react-native';
import {Card, CardItem} from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
import StarRating from 'react-native-star-rating';
import Icon from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  IPADDRESS,
  HTTPS,
  PORT,
  BEFORE_PLACING_ORDER,
  PLEASE_WAIT,
  ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE,
  PLACE_THE_CUP,
  DISPENSING,
  ORDER_DISPENSED,
  SOMETHING_WENT_WRONG,
  TIMEOUT_EXPIRED,
  MACHINE_NOT_READY,
  FOAMER_OFF,
  RINSING,
  MILK_NOT_READY,
  orderStatus,
  INITIAL_FEEDBACK_INTERVAL,
  ROUTINE_FEEDBACK_INTERVAL,
  HTTP_POLLING_INTERVAL,
  timeoutForDispense,
  productList,
} from './macros';
import getTimeoutSignal from './commonApis';

Icon.loadFont();
Feather.loadFont();
MaterialCommunityIcons.loadFont();

class dispenseScreen extends Component {
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
      timer: timeoutForDispense,
      machineName: null,
      machineId: null,
    };
  }

  async componentDidMount() {
    this.showProductList(this.props.route.params.productList);
  }

  async componentWillUnmount() {
    AppState.removeEventListener('change');
  }

  showProductList = async (produtList) => {
    console.log('show Product list');
    let deviceProductList = [];
    await produtList.map(async (product) => {
      let filterProduct = productList.find(
        (allproduct) => allproduct.productName === product.productName,
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

  checkForFeedbackVisibility = async (productName) => {
    var feedbackTimeDetails = JSON.parse(
      await AsyncStorage.getItem(productName),
    );
    console.log(feedbackTimeDetails);
    const currentTime = Date.parse(new Date());
    console.log(currentTime);
    if (feedbackTimeDetails === null) {
      feedbackTimeDetails = {
        lastFeedbackDisplayedTime: currentTime,
        nextFeedbackInterval: INITIAL_FEEDBACK_INTERVAL,
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
      feedbackTimeDetails.nextFeedbackInterval = ROUTINE_FEEDBACK_INTERVAL;
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

  setStateVariablesToInitialState = async () => {
    this.setState({
      orderId: null,
      orderNumberVisible: false,
      waitTimeVisible: false,
      orderNumber: null,
      waitTime: null,
    });
  };

  stopPollForOrderStatus = async () => {
    clearInterval(this.pollingIntervalId);
  };

  startPollForOrderStatus = async (productName) => {
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
          signal: (await getTimeoutSignal(10000)).signal,
        },
      )
        .then((response) => response.json())
        .then(async (resultData) => {
          console.log(resultData);
          if (resultData.status === 'Success') {
            if (
              resultData.orderStatus === 'InQueue' ||
              resultData.orderStatus === 'Dispensing'
            ) {
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
              this.timer = setInterval(async () => {
                this.setState({timer: this.state.timer - 1});
                console.log(this.state.timer);
                if (this.state.timer === 0) {
                  clearInterval(this.timer);
                  this.setState({timer: timeoutForDispense});
                  this.setState({
                    orderStatusCode: TIMEOUT_EXPIRED,
                  });
                  this.setStateVariablesToInitialState();
                }
              }, 1000);
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
            });
            this.setStateVariablesToInitialState();
          }
          //console.log(this.state.orderStatusCode);
        })
        .catch(async (e) => {
          this.stopPollForOrderStatus();
          this.setState({
            orderStatusCode: SOMETHING_WENT_WRONG,
          });
          this.setStateVariablesToInitialState();
        });
    }, HTTP_POLLING_INTERVAL);
  };

  placeOrder = async (productId, productName) => {
    this.setState({
      orderStatusCode: PLEASE_WAIT,
    });
    console.log(productId);
    fetch(
      HTTPS + '://' + IPADDRESS + ':' + PORT + '/order?productId=' + productId,
      {
        headers: {
          tokenId: 'secret',
        },
        signal: (await getTimeoutSignal(10000)).signal,
      },
    )
      .then((response) => response.json())
      .then(async (resultData) => {
        console.log(resultData);
        if (resultData.status === 'Success') {
          this.setState({
            orderStatusCode: ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE,
            orderNumberVisible: true,
            waitTimeVisible: true,
            orderNumber: resultData.orderNo,
            waitTime: resultData.approxWaitTime * 30,
          });
          this.state.orderId = resultData.orderId;
          await this.startPollForOrderStatus(productName);
        } else {
          if (resultData.infoText === 'Machine is not Ready') {
            this.setState({orderStatusCode: MACHINE_NOT_READY});
          } else {
            this.setState({orderStatusCode: SOMETHING_WENT_WRONG});
          }
        }
      })
      .catch(async (e) => {
        console.log(e);
        this.setState({
          orderStatusCode: SOMETHING_WENT_WRONG,
        });
        this.setStateVariablesToInitialState();
      });
  };

  startDispense = async (productName) => {
    clearInterval(this.timer);
    this.setState({timer: timeoutForDispense});
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
        signal: (await getTimeoutSignal(10000)).signal,
      },
    )
      .then((response) => response.json())
      .then(async (resultData) => {
        console.log(resultData);
        if (resultData.status === 'Success') {
          console.log('Dispense Starts');
          this.startPollForOrderStatus(productName);
        } else {
          if (resultData.infoText === 'Machine is not Ready') {
            this.setState({orderStatusCode: MACHINE_NOT_READY});
          } else if (resultData.infoText === 'Foamer off') {
            this.setState({orderStatusCode: FOAMER_OFF});
          } else if (resultData.infoText === 'Rinsing') {
            this.setState({orderStatusCode: RINSING});
          } else if (resultData.infoText === 'Milk not Ready') {
            this.setState({orderStatusCode: MILK_NOT_READY});
          } else {
            this.setState({orderStatusCode: SOMETHING_WENT_WRONG});
          }
          this.setStateVariablesToInitialState();
        }
      })
      .catch(async (e) => {
        this.setState({
          orderStatusCode: SOMETHING_WENT_WRONG,
        });
        this.setStateVariablesToInitialState();
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
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.headerContainer}>
          <Image
            style={styles.logoStyleInHeader}
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
                <Card>
                  <CardItem>
                    <View style={styles.cardContainer}>
                      <View>
                        <Image
                          style={styles.productImageStyleInCard}
                          source={product.src}
                        />
                      </View>
                      <View style={styles.productNameContainerInCard}>
                        <Text style={styles.productNameTextStyle}>
                          {product.productName}
                        </Text>
                      </View>
                      <View style={styles.plusIconContainerInCard}>
                        <Icon
                          name="circle-with-plus"
                          size={35}
                          style={styles.plusIconStyleInCard}
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
            transparent={true}
            animationType="slide"
            visible={this.state.modalVisible}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                {this.state.orderStatusCode === BEFORE_PLACING_ORDER ||
                this.state.orderStatusCode >= SOMETHING_WENT_WRONG ? (
                  <Icon
                    name="circle-with-cross"
                    style={styles.modalExitIconStyle}
                    onPress={() => {
                      this.setState({
                        modalVisible: !this.state.modalVisible,
                      });
                    }}
                    size={30}
                  />
                ) : null}

                <View style={styles.modalItemContainer}>
                  <Image
                    style={styles.logoStyleInModal}
                    source={require('../assets/lavazza_logo_without_year.png')}
                  />
                </View>
                <View style={styles.modalItemContainer}>
                  <Text style={styles.productNameTextStyle}>
                    {
                      this.state.deviceProductList[this.state.selectedIndex]
                        .productName
                    }
                  </Text>
                </View>
                {this.state.orderStatusCode === DISPENSING ? (
                  <View style={styles.modalItemContainer}>
                    <Image
                      style={styles.dispensingGifStyleInModal}
                      source={require('../assets/dispensing.gif')}
                    />
                  </View>
                ) : (
                  <View style={styles.modalItemContainer}>
                    <Image
                      style={styles.productImageStyleInModal}
                      source={
                        this.state.deviceProductList[this.state.selectedIndex]
                          .src
                      }
                    />
                  </View>
                )}
                {this.state.orderNumberVisible ? (
                  <View style={styles.modalItemContainer}>
                    <Text style={styles.orderNumberTextStyle}>
                      Order No {this.state.orderNumber}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.modalItemContainer}>
                  <Text style={styles.statusTextStyle}>Status</Text>
                  <Text style={styles.orderStatusTextStyle}>
                    {orderStatus[this.state.orderStatusCode]}
                  </Text>
                </View>

                {this.state.waitTimeVisible ? (
                  <View style={styles.modalItemContainer}>
                    <Text style={styles.timeoutTextStyle}>
                      Approx Wait Time - {this.state.waitTime} Sec
                    </Text>
                  </View>
                ) : null}

                {/* visible when feedback time arrives  */}
                {this.state.feedbackVisible ? (
                  <View style={styles.modalItemContainer}>
                    <Text style={styles.feedbackTextStyle}>Feedback</Text>
                    <View style={styles.modalItemContainer}>
                      <StarRating
                        maxStars={5}
                        starSize={35}
                        emptyStar="star-outlined"
                        fullStar="star"
                        iconSet="Entypo"
                        emptyStarColor="#6F6D6D"
                        fullStarColor="#100A45"
                        halfStarEnabled={false}
                        rating={this.state.starCount}
                        selectedStar={(rating) =>
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
                  <View style={styles.modalItemContainer}>
                    <MaterialCommunityIcons.Button
                      name="check-circle"
                      size={25}
                      color="white"
                      backgroundColor="#100A45"
                      onPress={async () => {
                        this.setState({modalVisible: false});
                        this.props.navigation.goBack();
                      }}>
                      <Text style={styles.buttonTextStyle}>Done</Text>
                    </MaterialCommunityIcons.Button>
                  </View>
                ) : null}

                {this.state.orderStatusCode === PLACE_THE_CUP ? (
                  <View style={{}}>
                    <View style={styles.modalItemContainer}>
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
                        <Text style={styles.buttonTextStyle}>Dispense</Text>
                      </Feather.Button>
                    </View>
                    <View style={styles.modalItemContainer}>
                      <Text style={styles.timeoutTextStyle}>
                        Timeout: {this.state.timer}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {this.state.orderStatusCode === BEFORE_PLACING_ORDER ||
                this.state.orderStatusCode >= SOMETHING_WENT_WRONG ? (
                  <View style={styles.modalItemContainer}>
                    <Feather.Button
                      name="coffee"
                      size={25}
                      color="white"
                      backgroundColor="#100A45"
                      onPress={async () => {
                        await this.placeOrder(
                          this.state.deviceProductList[this.state.selectedIndex]
                            .productId,
                          this.state.deviceProductList[this.state.selectedIndex]
                            .productName,
                        );
                      }}>
                      <Text style={styles.buttonTextStyle}>Order</Text>
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
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#100A45',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoStyleInHeader: {
    width: '50%',
    height: '65%',
    resizeMode: 'contain',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  productImageStyleInCard: {
    width: 75,
    height: 75,
    borderRadius: 20,
  },
  productNameContainerInCard: {
    justifyContent: 'center',
    width: '50%',
  },
  productNameTextStyle: {
    textShadowColor: '#100A45',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#100A45',
  },
  plusIconContainerInCard: {
    justifyContent: 'center',
  },
  plusIconStyleInCard: {
    color: '#100A45',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
  },
  modalView: {
    margin: '5%',
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
  modalExitIconStyle: {
    color: '#100A45',
    left: '95%',
  },
  modalItemContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  logoStyleInModal: {
    width: 100,
    height: 25,
  },
  dispensingGifStyleInModal: {
    width: 150,
    height: 150,
  },
  productImageStyleInModal: {
    width: 75,
    height: 75,
    borderRadius: 75 / 2,
  },
  orderNumberTextStyle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#100A45',
  },
  statusTextStyle: {
    color: '#6F6D6D',
    fontSize: 10,
  },
  orderStatusTextStyle: {
    marginTop: 5,
    color: '#100A45',
    fontSize: 12,
  },
  feedbackTextStyle: {
    color: '#6F6D6D',
    fontSize: 10,
  },
  buttonTextStyle: {
    fontSize: 15,
    color: '#ffffff',
  },
  timeoutTextStyle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#100A45',
  },
});

export default dispenseScreen;
