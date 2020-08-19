import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  Alert,
  ActivityIndicator,
  AppState,
  Text,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-community/async-storage';
import BackgroundTimer from 'react-native-background-timer';

import {
  IPADDRESS,
  PORT,
  HTTPS,
  FEEDBACK_SERVER_ENDPOINT,
  INTERVAL_BETWEEN_SENDING_FEEDBACK_DATA,
  SPLASHSCREEN_VISIBLE_TIME,
} from './macros';
import getTimeoutSignal from './commonApis';

export default class connectScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      splashScreenVisible: true,
      isLoading: false,
      isBackgroundTimerOn: false,
    };
  }

  async componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    setTimeout(async () => {
      this.setState({
        splashScreenVisible: false,
      });
    }, SPLASHSCREEN_VISIBLE_TIME);
  }

  async componentWillUnmount() {
    AppState.removeEventListener('change');
  }

  // Sending collected Feedback data to remote server
  // when mobile gets internet connection
  sendFeedbackData = async (feedbackData) => {
    const netInfo = await NetInfo.fetch();
    console.log('Internet Connection :', netInfo.isInternetReachable);
    if (netInfo.isInternetReachable) {
      fetch(FEEDBACK_SERVER_ENDPOINT, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: (await getTimeoutSignal(5000)).signal,
        body: JSON.stringify(feedbackData),
      })
        .then((response) => response.json())
        .then(async (resultData) => {
          if (resultData.status === 'Success') {
            console.log('data send');
            BackgroundTimer.stopBackgroundTimer(this.intervalId);
            this.setState({isBackgroundTimerOn: false});
            AsyncStorage.removeItem('feedbackData');
          }
        })
        .catch(async (e) => {
          console.log(e);
        });
    } else {
      console.log('no internet connection');
    }
  };

  handleAppStateChange = async (state) => {
    try {
      if (state === 'inactive') {
        console.log('background');
        var feedbackData = JSON.parse(
          await AsyncStorage.getItem('feedbackData'),
        );
        if (feedbackData === null) {
          console.log('null data');
        } else {
          console.log(feedbackData);
          this.intervalId = BackgroundTimer.runBackgroundTimer(async () => {
            console.log(feedbackData);
            await this.sendFeedbackData(feedbackData);
          }, INTERVAL_BETWEEN_SENDING_FEEDBACK_DATA);
          this.setState({isBackgroundTimerOn: true});
        }
      } else if (state === 'active') {
        console.log('active');
        if (this.state.isbackgroundTimerOn === true) {
          BackgroundTimer.stopBackgroundTimer(this.intervalId);
          this.setState({isBackgroundTimerOn: false});
        }
      }
    } catch (error) {
      console.log('Background error', error);
    }
  };

  onConnect = async () => {
    this.setState({isLoading: true});
    console.log('get Product Info');
    console.log(HTTPS, PORT, IPADDRESS);
    fetch(HTTPS + '://' + IPADDRESS + ':' + PORT + '/productInfo', {
      headers: {
        tokenId: 'secret',
      },
      signal: (await getTimeoutSignal(5000)).signal,
    })
      .then((response) => response.json())
      .then(async (resultData) => {
        console.log(resultData);
        if (resultData.status === 'Success') {
          this.props.navigation.navigate('dispenseScreen', {
            productList: resultData.data,
            machineName: resultData.machineName,
            machineId: resultData.machineId,
          });
        } else {
          Alert.alert('', 'Something Went Wrong...Please reconnect', [
            {text: 'Ok'},
          ]);
        }
        this.setState({isLoading: false});
      })
      .catch(async (e) => {
        Alert.alert(
          '',
          'Please check your connection with the lavazza caffè machine',
          [{text: 'ok'}],
        );
        console.log(e);
        this.setState({isLoading: false});
      });
  };

  render() {
    return (
      <View style={styles.mainContainer}>
        {this.state.splashScreenVisible ? (
          <View style={styles.splashScreenLogoContainer}>
            <Image
              style={styles.splashScreenLogo}
              source={require('../assets/lavazza_logo_with_year.png')}
            />
          </View>
        ) : (
          <View style={styles.centeredViewContainer}>
            <Image
              style={styles.logo}
              source={require('../assets/lavazza_logo_with_year.png')}
            />

            <View style={styles.gifContainer}>
              <Image
                style={styles.gif}
                source={require('../assets/connect.gif')}
              />
            </View>
            {this.state.isLoading ? (
              <View style={styles.loadingActivityContainer}>
                <ActivityIndicator size="small" color="#100A45" />
                <Text style={styles.loadingActivityTextStyle}>
                  Connecting...!
                </Text>
              </View>
            ) : (
              <View style={styles.connectButtonContainer}>
                <TouchableHighlight
                  underlayColor="#100A45"
                  style={styles.connectButtonStyle}
                  onPress={() => {
                    this.onConnect();
                  }}>
                  <Text style={styles.connectButtonTextStyle}>Connect</Text>
                </TouchableHighlight>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  splashScreenLogoContainer: {
    height: 200,
    justifyContent: 'center',
    marginTop: '50%',
    alignItems: 'center',
  },
  splashScreenLogo: {
    width: '50%',
    height: '75%',
    resizeMode: 'contain',
  },
  centeredViewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 100,
    resizeMode: 'contain',
  },
  gifContainer: {
    borderRadius: 115,
    overflow: 'hidden',
  },
  gif: {
    width: 230,
    height: 230,
  },
  loadingActivityContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  loadingActivityTextStyle: {
    color: '#100A45',
    fontWeight: 'bold',
  },
  connectButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  connectButtonStyle: {
    width: 100,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#100A45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButtonTextStyle: {
    color: 'white',
  },
});
