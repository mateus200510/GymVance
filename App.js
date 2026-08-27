import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EscolherLogin from './src/telasLogin/escolherLogin';
import Entrar from './src/telasLogin/Entrar';
import Google from './src/telasLogin/Google';
import Facebook from './src/telasLogin/Facebook';
import Apple from './src/telasLogin/Apple';
import Telefone from './src/telasLogin/Telefone';
import Email from './src/telasLogin/Email';

const Stack = createNativeStackNavigator();

function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '700' }}>Home</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="EscolherLogin"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="EscolherLogin" component={EscolherLogin} />
        <Stack.Screen name="Entrar" component={Entrar} />
        <Stack.Screen name="Google" component={Google} />
        <Stack.Screen name="Facebook" component={Facebook} />
        <Stack.Screen name="Apple" component={Apple} />
        <Stack.Screen name="Telefone" component={Telefone} />
        <Stack.Screen name="Email" component={Email} />
        <Stack.Screen name="Cadastro" component={EscolherLogin} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
