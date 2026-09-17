import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function Foto({ navigation }) {
  const [nome, setNome] = useState('Lucas Eiji Rodrigues Miyashiro');
  const [email, setEmail] = useState('Lucasbentao12@gmail.com');
  const [foto, setFoto] = useState(null);

  const escolherFoto = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) return;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.streak}>
            <MaterialCommunityIcons name="fire" size={22} color="#3DDC5C" />
            <Text style={styles.streakText}>5</Text>
          </View>
          <Text style={styles.logo}>
            Gym<Text style={styles.logoAccent}>vance</Text>
          </Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <TouchableOpacity onPress={escolherFoto} style={styles.avatarCircle}>
            {foto ? (
              <Image source={{ uri: foto }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={48} color="#3DDC5C" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={escolherFoto} style={styles.cameraBadge}>
            <Ionicons name="camera" size={16} color="#121212" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={escolherFoto}>
          <Text style={styles.alterarFoto}>Alterar Foto</Text>
        </TouchableOpacity>

        {/* Título / PRO */}
        <TouchableOpacity
          style={styles.tituloPill}
          onPress={() => navigation.navigate('Evolucao')}
        >
          <Text style={styles.tituloPillText}>Evolução diária</Text>
        </TouchableOpacity>
        <Text style={styles.alterarTitulo}>Alterar título</Text>
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>PRO</Text>
        </View>

        {/* Nome */}
        <View style={styles.campo}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholderTextColor="#666"
          />
        </View>

        {/* Email */}
        <View style={styles.campo}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Botão Evolução */}
        <TouchableOpacity
          style={styles.evolucaoButton}
          onPress={() => navigation.navigate('Evolucao')}
        >
          <Ionicons name="trending-up" size={18} color="#3DDC5C" />
          <Text style={styles.evolucaoButtonText}>Evolução</Text>
        </TouchableOpacity>
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
  scroll: { paddingHorizontal: 24, paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  streak: { flexDirection: 'row', alignItems: 'center' },
  streakText: { color: '#3DDC5C', fontSize: 20, fontWeight: 'bold', marginLeft: 4 },
  logo: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  logoAccent: { color: '#3DDC5C' },
  avatarWrapper: { alignSelf: 'center', marginBottom: 12 },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#3DDC5C',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3DDC5C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#121212',
  },
  alterarFoto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  tituloPill: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 6,
  },
  tituloPillText: { color: '#888' },
  alterarTitulo: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  proBadge: {
    alignSelf: 'center',
    backgroundColor: '#3DDC5C',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 3,
    marginBottom: 24,
  },
  proBadgeText: { color: '#121212', fontWeight: 'bold', fontSize: 12 },
  campo: { marginBottom: 18 },
  label: { color: '#fff', fontWeight: '600', marginBottom: 8, fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    backgroundColor: '#1A1A1A',
  },
  evolucaoButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B3B24',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 8,
  },
  evolucaoButtonText: { color: '#3DDC5C', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
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