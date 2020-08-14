/* eslint-disable react-native/no-inline-styles */
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
	intervalBetweenSendingFeedbackData
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

		// Sending collected Feedback data to remote server when mobile gets internet connection
		sendFeedbackData = async feedbackData => {
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
					.then(response => response.json())
					.then(async resultData => {
					if (resultData.status === 'Success') {
						console.log('data send');
						BackgroundTimer.stopBackgroundTimer(this.intervalId);
						this.setState({isBackgroundTimerOn: false});
						AsyncStorage.removeItem('feedbackData');
					}
					})
					.catch(async e => {
						console.log(e);
					});
			}
			else{
				console.log("no internet connection");
			}
		};

		handleAppStateChange = async state => {
			try {
				if (state === 'inactive') {
					console.log('background');
					var feedbackData = JSON.parse(
						await AsyncStorage.getItem('feedbackData'),
					);
					if (feedbackData === null) {
						console.log('null data');
					} else {
						console.log(feedbackData)
						this.intervalId = BackgroundTimer.runBackgroundTimer(async () => {
							console.log(feedbackData)
							await this.sendFeedbackData(feedbackData);
						}, intervalBetweenSendingFeedbackData);
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

		async componentDidMount() {
			AppState.addEventListener('change', this.handleAppStateChange);
			setTimeout(async () => {
				this.setState({
					splashScreenVisible: false,
				});
			}, 3000);
		}
		
		async componentWillUnmount() {
			AppState.removeEventListener('change');
		}

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
				.then(response => response.json())
				.then(async resultData => {
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
				.catch(async e => {
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
				<View style={{flex: 1, backgroundColor: '#ffffff'}}>
					{this.state.splashScreenVisible ? (
						<View style={styles.logoContainer}>
							<Image
								style={styles.logo}
								source={require('../assets/lavazza_logo_with_year.png')}
							/>
						</View>
					) : (
					<View style={styles.centeredView}>
						<Image
							style={{height: 100, resizeMode: 'contain'}}
							source={require('../assets/lavazza_logo_with_year.png')}
						/>

						<View style={{borderRadius: 115, overflow: 'hidden'}}>
							<Image
								style={{width: 230, height: 230}}
								source={require('../assets/connect.gif')}
							/>
						</View>
						{this.state.isLoading ? (
							<View style={{flexDirection: 'row', marginTop: 20}}>
								<ActivityIndicator size="small" color="#100A45" />
								<Text style={{color: '#100A45', fontWeight: 'bold'}}>
									Connecting...!
								</Text>
							</View>
						) : (
							<View style={{alignItems: 'center', marginTop: 20}}>
								<TouchableHighlight
									underlayColor="#100A45"
									style={{
										width: 100,
										height: 40,
										borderRadius: 5,
										backgroundColor: '#100A45',
										alignItems: 'center',
										justifyContent: 'center',
									}}
									onPress={() => {
										this.onConnect();
									}}>
									<Text style={{color: 'white'}}>Connect</Text>
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
		logo: {
			width: '50%',
			height: '75%',
			resizeMode: 'contain',
		},
		logoContainer: {
			height: 200,
			justifyContent: 'center',
			marginTop: '50%',
			alignItems: 'center',
		},
		centeredView: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
		},
	});
	