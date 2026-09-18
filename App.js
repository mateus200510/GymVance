import React, { useEffect } from 'react';

import {
  View,
  Image,
  StyleSheet,
} from 'react-native';

import {
  NavigationContainer,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import Perfil from './src/Perfil/Perfil';
import Cadastro from './src/telasCadastro/Cadastro';
import Entrar from './src/telasLogin/Entrar';
import PesoScreen from './src/conversoes/peso';
import AlturaScreen from './src/conversoes/altura';

import TreinoHub from './src/telasTreino/TreinoHub';
import NovaSessao from './src/telasTreino/NovaSessao';
import SessaoAtiva from './src/telasTreino/SessaoAtiva';

import Mensal from './src/telasPlanos/mensal';
import Alimentacao from './src/alimentacao/alimentacao';
import Batimento from './src/Relogio/batimento';
import Calorias from './src/Relogio/calorias';
import Genero from './src/genero/genero';
import Ranking from './src/ranking/ranking';

const Stack = createNativeStackNavigator();

function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Cadastro');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.splash}>
      <Image
        source={require('./assets/FundoPretoRestoBranco-removebg-preview.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
          }}
        >

        {/* TELA INICIAL */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />

        {/* LOGIN / CADASTRO */}
        <Stack.Screen
          name="Cadastro"
          component={Cadastro}
        />

        <Stack.Screen
          name="Entrar"
          component={Entrar}
        />

        <Stack.Screen
          name="Peso"
          component={PesoScreen}
        />

        <Stack.Screen
          name="Altura"
          component={AlturaScreen}
        />

        {/* TELAS DE TREINO */}
        <Stack.Screen
          name="TreinoHub"
          component={TreinoHub}
        />

        <Stack.Screen
          name="Perfil"
          component={Perfil}
        />

        <Stack.Screen
          name="Planos"
          component={Mensal}
        />

        <Stack.Screen
          name="Alimentacao"
          component={Alimentacao}
        />

        <Stack.Screen
          name="Batimento"
          component={Batimento}
        />

        <Stack.Screen
          name="Calorias"
          component={Calorias}
        />

        <Stack.Screen
          name="Genero"
          component={Genero}
        />

        <Stack.Screen
          name="Ranking"
          component={Ranking}
        />

        <Stack.Screen
          name="NovaSessao"
          component={NovaSessao}
        />

        <Stack.Screen
          name="SessaoAtiva"
          component={SessaoAtiva}
        />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 280,
    height: 180,
  },
});