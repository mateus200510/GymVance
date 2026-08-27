import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';

// Tela: Entrar.js
// Hub central de autenticação — reúne todas as formas de entrar no Gymvance.
// Cada botão redireciona para a tela correspondente (Google.js, Facebook.js,
// Telefone.js, Apple.js, Email.js) quando o usuário já possui conta.

export default function Entrar({ navigation }) {
  const opcoes = [
    { nome: 'Continuar com o Google', tela: 'Google', icone: 'G', cor: '#FFFFFF', corTexto: '#1F1F1F' },
    { nome: 'Continuar com o Facebook', tela: 'Facebook', icone: 'f', cor: '#1877F2', corTexto: '#FFFFFF' },
    { nome: 'Continuar com a Apple', tela: 'Apple', icone: '', cor: '#000000', corTexto: '#FFFFFF' },
    { nome: 'Continuar com telefone', tela: 'Telefone', icone: '📱', cor: '#1E1E1E', corTexto: '#FFFFFF' },
    { nome: 'Continuar com e-mail', tela: 'Email', icone: '✉️', cor: '#1E1E1E', corTexto: '#FFFFFF' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoTexto}>G</Text>
        </View>
        <Text style={styles.titulo}>Bem-vindo de volta</Text>
        <Text style={styles.subtitulo}>Escolha como deseja entrar na sua conta</Text>
      </View>

      <View style={styles.opcoesContainer}>
        {opcoes.map((opcao) => (
          <TouchableOpacity
            key={opcao.tela}
            style={[styles.botao, { backgroundColor: opcao.cor }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(opcao.tela)}
          >
            <Text style={[styles.icone, { color: opcao.corTexto }]}>{opcao.icone}</Text>
            <Text style={[styles.botaoTexto, { color: opcao.corTexto }]}>{opcao.nome}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.rodape}>
        <Text style={styles.rodapeTexto}>Ainda não tem conta?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
          <Text style={styles.rodapeLink}> Criar conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 48,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#3DDC5C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoTexto: {
    fontSize: 32,
    fontWeight: '800',
    color: '#121212',
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  opcoesContainer: {
    marginTop: 24,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  icone: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
  },
  botaoTexto: {
    fontSize: 15,
    fontWeight: '600',
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  rodapeTexto: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  rodapeLink: {
    color: '#3DDC5C',
    fontSize: 14,
    fontWeight: '700',
  },
});