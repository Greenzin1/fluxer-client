import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import GuildsScreen from './src/screens/GuildsScreen';
import ChannelsScreen from './src/screens/ChannelsScreen';
import ChatScreen from './src/screens/ChatScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#313338' } }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Guilds" component={GuildsScreen} />
        <Stack.Screen name="Channels" component={ChannelsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
