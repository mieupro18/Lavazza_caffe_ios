/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React from 'react';

import DispenseScreen from './src/dispenseScreen';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import ConnectScreen from './src/connectScreen';
import SplashScreen from './src/splashScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="splashScreen" headerMode="none">
        <Stack.Screen
          name="splashScreen"
          component={SplashScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="connectScreen"
          component={ConnectScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="dispenseScreen"
          component={DispenseScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
