import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// Medidas ficam vazias (sem valores/variações de exemplo) até o usuário registrar.
const MEDIDAS = [
  { label: 'Peso', unidade: 'kg' },
  { label: 'Cintura', unidade: 'cm' },
  { label: 'Braço', unidade: 'cm' },
  { label: 'Peito', unidade: 'cm' },
];

function TelaEvolucao({ nomeUsuario, onEditar }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.perfilRow}>
          <View style={styles.avatarPequeno}>
            <Feather name="user" size={16} color="#8E8E93" />
          </View>
          <Text style={styles.headerNome}>{nomeUsuario}</Text>
        </View>
        <Text style={styles.logo}>Gymvance</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Minha Evolução</Text>
        <Text style={styles.subtitulo}>Acompanhe suas fotos e evolução corporal</Text>

        <View style={styles.fotosRow}>
          <View style={styles.fotoCard}>
            <View style={styles.fotoVazia}>
              <Feather name="image" size={24} color="#3A3A3C" />
            </View>
            <Text style={styles.fotoLabel}>ANTES</Text>
          </View>
          <View style={styles.fotoCard}>
            <View style={styles.fotoVazia}>
              <Feather name="image" size={24} color="#3A3A3C" />
            </View>
            <Text style={styles.fotoLabel}>DEPOIS</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.botaoVerde} onPress={onEditar}>
          <Feather name="plus" size={14} color="#000" />
          <Text style={styles.botaoVerdeTexto}>Adicionar Foto</Text>
        </TouchableOpacity>

        <Text style={styles.secaoTitulo}>Medidas Recentes</Text>
        <View style={styles.medidasGrid}>
          {MEDIDAS.map((medida) => (
            <View key={medida.label} style={styles.medidaCard}>
              <Text style={styles.medidaLabel}>{medida.label}</Text>
              <Text style={styles.medidaValor}>-- {medida.unidade}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.botaoVerde}>
          <Feather name="plus" size={14} color="#000" />
          <Text style={styles.botaoVerdeTexto}>Adicionar Medidas</Text>
        </TouchableOpacity>

        <Text style={styles.secaoTitulo}>Histórico</Text>
        <Text style={styles.historicoMes}>--</Text>
        <View style={styles.historicoRow}>
          <View style={styles.historicoFotoVazia}>
            <Feather name="image" size={18} color="#3A3A3C" />
          </View>
          <View style={styles.historicoFotoVazia}>
            <Feather name="image" size={18} color="#3A3A3C" />
          </View>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
}

function TelaEditarPerfil({ onSalvar }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [modoAtivo, setModoAtivo] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onSalvar}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.logo}>Gymvance</Text>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingTop: 20 }}>
        <View style={styles.avatarGrande}>
          <Feather name="user" size={36} color="#8E8E93" />
        </View>
        <Text style={styles.alterarFotoLabel}>Alterar Foto</Text>

        <View style={styles.modoBox}>
          <Text style={styles.modoTexto}>Evolução diária</Text>
          <TouchableOpacity
            style={[styles.modoBadge, modoAtivo && styles.modoBadgeAtivo]}
            onPress={() => setModoAtivo(!modoAtivo)}
          >
            <Text style={styles.modoBadgeTexto}>
              {modoAtivo ? 'Ativado' : 'Ativar Modo'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.campoBox}>
          <Text style={styles.campoLabel}>Nome</Text>
          <TextInput
            style={styles.campoInput}
            placeholder="Digite seu nome"
            placeholderTextColor="#6E6E73"
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.campoBox}>
          <Text style={styles.campoLabel}>Email</Text>
          <TextInput
            style={styles.campoInput}
            placeholder="Digite seu email"
            placeholderTextColor="#6E6E73"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity style={[styles.botaoVerde, { alignSelf: 'stretch', justifyContent: 'center' }]} onPress={onSalvar}>
          <Text style={styles.botaoVerdeTexto}>Salvar Evolução</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default function Perfil() {
  const [tela, setTela] = useState('evolucao'); // 'evolucao' | 'editar'

  return (
    <SafeAreaView style={styles.safeArea}>
      {tela === 'evolucao' ? (
        <TelaEvolucao nomeUsuario="Nome" onEditar={() => setTela('editar')} />
      ) : (
        <TelaEditarPerfil onSalvar={() => setTela('evolucao')} />
      )}

      <View style={styles.navBar}>
        <View style={styles.navItem}>
          <Feather name="activity" size={20} color="#8E8E93" />
          <Text style={styles.navLabel}>Treino</Text>
        </View>
        <View style={styles.navItem}>
          <Feather name="heart" size={20} color="#8E8E93" />
          <Text style={styles.navLabel}>Alimentação</Text>
        </View>
        <View style={styles.navItem}>
          <Feather name="watch" size={20} color="#8E8E93" />
          <Text style={styles.navLabel}>Relógio</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginBottom: 16 },
  perfilRow: { flexDirection: 'row', alignItems: 'center' },
  avatarPequeno: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  headerNome: { color: '#fff', fontSize: 13 },
  logo: { color: '#3DDC5C', fontWeight: '700', fontSize: 15 },
  titulo: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitulo: { color: '#8E8E93', fontSize: 13, marginBottom: 16 },
  fotosRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  fotoCard: { width: '48%' },
  fotoVazia: { width: '100%', aspectRatio: 0.85, backgroundColor: '#1C1C1E', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2C2C2E', borderStyle: 'dashed', marginBottom: 6 },
  fotoLabel: { color: '#8E8E93', fontSize: 11, textAlign: 'center' },
  botaoVerde: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3DDC5C', borderRadius: 24, paddingVertical: 12, marginBottom: 20 },
  botaoVerdeTexto: { color: '#000', fontSize: 13, fontWeight: '700', marginLeft: 6 },
  secaoTitulo: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 12 },
  medidasGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  medidaCard: { width: '48%', backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14, marginBottom: 10 },
  medidaLabel: { color: '#8E8E93', fontSize: 12, marginBottom: 4 },
  medidaValor: { color: '#fff', fontSize: 16, fontWeight: '700' },
  historicoMes: { color: '#8E8E93', fontSize: 12, marginBottom: 8 },
  historicoRow: { flexDirection: 'row' },
  historicoFotoVazia: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#1C1C1E', borderWidth: 1, borderColor: '#2C2C2E', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  avatarGrande: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  alterarFotoLabel: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 16 },
  modoBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  modoTexto: { color: '#D1D1D6', fontSize: 13, marginRight: 10 },
  modoBadge: { borderWidth: 1, borderColor: '#3DDC5C', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 4 },
  modoBadgeAtivo: { backgroundColor: '#3DDC5C' },
  modoBadgeTexto: { color: '#3DDC5C', fontSize: 11, fontWeight: '600' },
  campoBox: { alignSelf: 'stretch', marginBottom: 14 },
  campoLabel: { color: '#8E8E93', fontSize: 12, marginBottom: 6 },
  campoInput: { backgroundColor: '#1C1C1E', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#2C2C2E' },
  navBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1C1C1E', backgroundColor: '#000' },
  navItem: { alignItems: 'center' },
  navLabel: { color: '#8E8E93', fontSize: 10, marginTop: 2 },
});