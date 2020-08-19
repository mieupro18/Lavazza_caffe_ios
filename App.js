/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler'; 
import React from 'react';

import dispenseScreen from './src/dispenseScreen';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import connectScreen from './src/connectScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="connectScreen" headerMode="none">
        <Stack.Screen
          name="connectScreen"
          component={connectScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="dispenseScreen"
          component={dispenseScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
