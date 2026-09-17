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

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import Cadastro from './src/telasCadastro/Cadastro';
import Entrar from './src/telasLogin/Entrar';
import PesoScreen from './src/conversoes/peso';
import AlturaScreen from './src/conversoes/altura';

import TreinoHub from './src/telasTreino/TreinoHub';
import PlanoSemanal from './src/telasTreino/PlanoSemanal';
import SessaoExercicios from './src/telasTreino/SessaoExercicios';
import NovaSessao from './src/telasTreino/NovaSessao';
import CalendarioMensal from './src/telasTreino/CalendarioMensal';
import NovaSessaoComExercicio from './src/telasTreino/NovaSessaoComExercicio';
import SessaoAtiva from './src/telasTreino/SessaoAtiva';

import Mensal from './src/telasPlanos/mensal';
import Anual from './src/telasPlanos/anual';
import Eterno from './src/telasPlanos/eterno';
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
        source={require('./assets/FundoPretoRestoBranco.jpeg')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
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
          name="Planos"
          component={Mensal}
        />

        <Stack.Screen
          name="Mensal"
          component={Mensal}
        />

        <Stack.Screen
          name="Anual"
          component={Anual}
        />

        <Stack.Screen
          name="Eterno"
          component={Eterno}
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
    width: 250,
    height: 250,
  },
});