import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function Evolucao({ navigation }) {
  const [fotoAntes, setFotoAntes] = useState(null);
  const [fotoDepois, setFotoDepois] = useState(null);

  const medidas = [
    { label: 'Peso', valor: '78.5 kg', variacao: '-1.2 kg', positiva: true },
    { label: 'Cintura', valor: '82 cm', variacao: '-2.5 cm', positiva: true },
    { label: 'Braço', valor: '35 cm', variacao: '+0.8 cm', positiva: true },
    { label: 'Peito', valor: '98 cm', variacao: '+1.5 cm', positiva: true },
  ];

  const historico = [
    { uri: null, tipo: 'foto' },
    { uri: null, tipo: 'vazio' },
    { uri: null, tipo: 'mais', quantidade: 3 },
  ];

  const escolherFoto = async (setter) => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) return;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setter(resultado.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarMini}>
              <Ionicons name="person" size={18} color="#3DDC5C" />
            </View>
            <View>
              <Text style={styles.headerCaption}>Evolução diária</Text>
              <Text style={styles.headerName}>Lucas Miyashiro</Text>
            </View>
          </View>
          <Text style={styles.logo}>
            Gym<Text style={styles.logoAccent}>vance</Text>
          </Text>
        </View>

        <Text style={styles.titulo}>Minha Evolução</Text>
        <Text style={styles.subtitulo}>Acompanhe suas fotos e medidas corporais</Text>

        {/* Fotos Antes/Depois */}
        <View style={styles.fotosRow}>
          <View style={styles.fotoBlock}>
            <View style={styles.fotoCard}>
              {fotoAntes ? (
                <Image source={{ uri: fotoAntes }} style={styles.fotoImage} />
              ) : (
                <Ionicons name="person-outline" size={40} color="#555" />
              )}
              <TouchableOpacity
                style={styles.cameraBadgeSmall}
                onPress={() => escolherFoto(setFotoAntes)}
              >
                <Ionicons name="camera" size={14} color="#121212" />
              </TouchableOpacity>
            </View>
            <Text style={styles.fotoLabel}>ANTES</Text>
            <Text style={styles.fotoData}>15 Jul 2026</Text>
          </View>

          <View style={styles.fotoBlock}>
            <View style={[styles.fotoCard, styles.fotoCardDepois]}>
              {fotoDepois ? (
                <Image source={{ uri: fotoDepois }} style={styles.fotoImage} />
              ) : (
                <Ionicons name="person-outline" size={40} color="#555" />
              )}
              <TouchableOpacity
                style={styles.cameraBadgeSmall}
                onPress={() => escolherFoto(setFotoDepois)}
              >
                <Ionicons name="camera" size={14} color="#121212" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.fotoLabel, styles.fotoLabelDepois]}>DEPOIS</Text>
            <Text style={styles.fotoData}>13 Ago 2026</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={18} color="#3DDC5C" />
          <Text style={styles.addButtonText}>Adicionar Foto</Text>
        </TouchableOpacity>

        {/* Medidas Recentes */}
        <Text style={styles.secaoTitulo}>Medidas Recentes</Text>
        <View style={styles.medidasGrid}>
          {medidas.map((item) => (
            <View key={item.label} style={styles.medidaCard}>
              <Text style={styles.medidaLabel}>{item.label}</Text>
              <Text style={styles.medidaValor}>{item.valor}</Text>
              <View style={styles.medidaVariacaoRow}>
                <Ionicons
                  name={item.variacao.startsWith('-') ? 'arrow-down' : 'arrow-up'}
                  size={12}
                  color="#3DDC5C"
                />
                <Text style={styles.medidaVariacao}>{item.variacao}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={18} color="#3DDC5C" />
          <Text style={styles.addButtonText}>Adicionar Medidas</Text>
        </TouchableOpacity>

        {/* Histórico */}
        <Text style={styles.secaoTitulo}>Histórico</Text>
        <Text style={styles.historicoMes}>Agosto 2026</Text>
        <View style={styles.historicoRow}>
          {historico.map((item, index) => (
            <View
              key={index}
              style={[
                styles.historicoThumb,
                item.tipo === 'vazio' && styles.historicoThumbVazio,
                item.tipo === 'mais' && styles.historicoThumbMais,
              ]}
            >
              {item.tipo === 'foto' && (
                <Ionicons name="person-outline" size={22} color="#555" />
              )}
              {item.tipo === 'mais' && (
                <Text style={styles.historicoMaisText}>+{item.quantidade}</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="dumbbell" size={22} color="#fff" />
          <Text style={styles.navLabel}>Treino</Text>
        </View>
        <View style={styles.navItem}>
          <Ionicons name="heart-outline" size={22} color="#fff" />
          <Text style={styles.navLabel}>Alimentação</Text>
        </View>
        <View style={styles.navItem}>
          <Ionicons name="watch-outline" size={22} color="#fff" />
          <Text style={styles.navLabel}>Relógio</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarMini: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#3DDC5C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerCaption: { color: '#888', fontSize: 11 },
  headerName: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  logo: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  logoAccent: { color: '#3DDC5C' },
  titulo: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitulo: { color: '#999', fontSize: 13, marginBottom: 20 },
  fotosRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  fotoBlock: { flex: 1 },
  fotoCard: {
    height: 190,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fotoCardDepois: { borderColor: '#3DDC5C', borderWidth: 2 },
  fotoImage: { width: '100%', height: '100%' },
  cameraBadgeSmall: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#3DDC5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoLabel: { color: '#999', fontSize: 12, fontWeight: 'bold', marginTop: 6 },
  fotoLabelDepois: { color: '#3DDC5C' },
  fotoData: { color: '#777', fontSize: 11, marginTop: 2 },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3DDC5C',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 24,
  },
  addButtonText: { color: '#3DDC5C', fontWeight: 'bold', marginLeft: 6, fontSize: 14 },
  secaoTitulo: { color: '#fff', fontSize: 17, fontWeight: 'bold', marginBottom: 12 },
  medidasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 4 },
  medidaCard: {
    width: '47%',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 14,
  },
  medidaLabel: { color: '#999', fontSize: 12, marginBottom: 6 },
  medidaValor: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  medidaVariacaoRow: { flexDirection: 'row', alignItems: 'center' },
  medidaVariacao: { color: '#3DDC5C', fontSize: 12, marginLeft: 4 },
  historicoMes: { color: '#888', fontSize: 12, marginBottom: 10 },
  historicoRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  historicoThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historicoThumbVazio: { backgroundColor: '#fff' },
  historicoThumbMais: { backgroundColor: '#222' },
  historicoMaisText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingVertical: 12,
    backgroundColor: '#121212',
  },
  navItem: { alignItems: 'center' },
  navLabel: { color: '#fff', fontSize: 11, marginTop: 4 },
});