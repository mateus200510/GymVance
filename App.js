import React, { useEffect } from 'react';

import {
  View,
  Image,
  StyleSheet,
} from 'react-native';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import Cadastro from './src/telasCadastro/Cadastro';
import Entrar from './src/telasLogin/Entrar';

import TreinoHub from './src/telasTreino/TreinoHub';
import PlanoSemanal from './src/telasTreino/PlanoSemanal';
import SessaoExercicios from './src/telasTreino/SessaoExercicios';
import NovaSessao from './src/telasTreino/NovaSessao';
import CalendarioMensal from './src/telasTreino/CalendarioMensal';
import NovaSessaoComExercicio from './src/telasTreino/NovaSessaoComExercicio';
import SessaoAtiva from './src/telasTreino/SessaoAtiva';

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
        source={require('./assets/FundoPretoRestoBranco.jpeg')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

export default function App() {
  return (
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

        {/* TELAS DE TREINO */}
        <Stack.Screen
          name="TreinoHub"
          component={TreinoHub}
        />

        <Stack.Screen
          name="PlanoSemanal"
          component={PlanoSemanal}
        />

        <Stack.Screen
          name="SessaoExercicios"
          component={SessaoExercicios}
        />

        <Stack.Screen
          name="NovaSessao"
          component={NovaSessao}
        />

        <Stack.Screen
          name="CalendarioMensal"
          component={CalendarioMensal}
        />

        <Stack.Screen
          name="NovaSessaoComExercicio"
          component={NovaSessaoComExercicio}
        />

        <Stack.Screen
          name="SessaoAtiva"
          component={SessaoAtiva}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 250,
    height: 250,
  },
});