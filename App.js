/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React, {Component} from 'react';

import ProductList from './src/productList';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import connectingScreen from './src/connectingScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="connectingScreen" headerMode="none">
        <Stack.Screen
          name="connectingScreen"
          component={connectingScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="productList"
          component={ProductList}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
