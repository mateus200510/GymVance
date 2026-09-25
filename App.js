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
import Evolucao from './src/Perfil/Evolucao';
import EditarPerfil from './src/Perfil/EditarPerfil';
import Calendario from './src/Perfil/Calendario';
import Configuracoes from './src/configuracoes/configuracoes';
import Idioma from './src/configuracoes/Idioma';
import Unidade from './src/configuracoes/Unidade';
import FAQ from './src/configuracoes/FAQ';
import AvaliarApp from './src/configuracoes/AvaliarApp';
import Conta from './src/configuracoes/Conta';
import CatalogoExercicios from './src/configuracoes/CatalogoExercicios';
import Cadastro from './src/telasCadastro/Cadastro';
import Entrar from './src/telasLogin/Entrar';
import PesoScreen from './src/conversoes/peso';
import AlturaScreen from './src/conversoes/altura';

import TreinoHub from './src/telasTreino/TreinoHub';
import NovaSessao from './src/telasTreino/NovaSessao';
import SessaoAtiva from './src/telasTreino/SessaoAtiva';

import Mensal from './src/telasPlanos/mensal';
import Alimentacao from './src/alimentacao/alimentacao';
import ChatIA from './src/alimentacao/chatIA';
import CalendarioCompleto from './src/calendario/calendario';
import Batimento from './src/Relogio/batimento';
import Calorias from './src/Relogio/calorias';
import Genero from './src/genero/genero';
import Ranking from './src/ranking/ranking';
import { getSession, getOnboardingComplete, migrarUsuarioLegado, getUserProfile } from './src/services/storage';
import { IdiomaProvider } from './src/services/idioma';
import { UserProvider } from './src/services/UserContext';

const Stack = createNativeStackNavigator();

function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(async () => {
      let destino = 'Cadastro';

      try {
        const migracao = await migrarUsuarioLegado();
        const sessao = await getSession();
        const onboarding = await getOnboardingComplete();

        if (sessao) {
          if (onboarding) {
            destino = 'TreinoHub';
          } else {
            const perfil = await getUserProfile();
            if (!perfil?.peso) {
              destino = 'Peso';
            } else if (!perfil?.altura) {
              destino = 'Altura';
            } else if (!perfil?.genero || !perfil?.dataNascimento) {
              destino = 'Genero';
            } else {
              destino = 'TreinoHub';
            }
          }
        } else if (migracao.migrado) {
          const perfil = await getUserProfile();
          if (!perfil?.peso) {
            destino = 'Peso';
          } else if (!perfil?.altura) {
            destino = 'Altura';
          } else if (!perfil?.genero || !perfil?.dataNascimento) {
            destino = 'Genero';
          } else {
            destino = 'TreinoHub';
          }
        }
      } catch (error) {
        console.warn('Erro ao restaurar sessão:', error);
      }

      navigation.replace(destino);
    }, 0);

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
      <IdiomaProvider>
        <UserProvider>
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
          name="EditarPerfil"
          component={EditarPerfil}
        />

        <Stack.Screen
          name="Evolucao"
          component={Evolucao}
        />

        <Stack.Screen
          name="Calendario"
          component={Calendario}
        />

        <Stack.Screen
          name="Configuracoes"
          component={Configuracoes}
        />

        <Stack.Screen
          name="Idioma"
          component={Idioma}
        />

        <Stack.Screen
          name="Unidade"
          component={Unidade}
        />

        <Stack.Screen
          name="FAQ"
          component={FAQ}
        />

        <Stack.Screen
          name="AvaliarApp"
          component={AvaliarApp}
        />

        <Stack.Screen
          name="Conta"
          component={Conta}
        />

        <Stack.Screen
          name="CatalogoExercicios"
          component={CatalogoExercicios}
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
          name="ChatIA"
          component={ChatIA}
        />

        <Stack.Screen
          name="CalendarioCompleto"
          component={CalendarioCompleto}
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
      </UserProvider>
      </IdiomaProvider>
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