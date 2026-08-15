import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import fluxer from '../services/fluxer';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Erro', 'Preencha email e senha');
    setLoading(true);
    try {
      await fluxer.login(email, password);
      const user = await fluxer.fetchUser();
      navigation.replace('Guilds', { user });
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.c}>
      <StatusBar barStyle="light-content" />
      <Text style={s.title}>Fluxer</Text>
      <Text style={s.sub}>Entre na sua conta</Text>
      <TextInput style={s.input} placeholder="Email" placeholderTextColor="#72767d" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={s.input} placeholder="Senha" placeholderTextColor="#72767d" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Entrar</Text>}
      </TouchableOpacity>
      <Text style={s.hint}>ou cole seu token</Text>
      <TextInput style={s.input} placeholder="Token" placeholderTextColor="#72767d" value={password} onChangeText={setPassword} />
      <TouchableOpacity style={[s.btn, s.btnAlt]} onPress={handleLogin} disabled={loading}>
        <Text style={s.btnTxt}>Entrar com Token</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#313338', justifyContent: 'center', padding: 24 },
  title: { fontSize: 42, fontWeight: 'bold', color: '#5865f2', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 16, color: '#b5bac1', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#1e1f22', borderRadius: 8, padding: 14, fontSize: 16, color: '#fff', marginBottom: 12, borderWidth: 1, borderColor: '#232428' },
  btn: { backgroundColor: '#5865f2', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 4 },
  btnAlt: { backgroundColor: '#232428', borderWidth: 1, borderColor: '#5865f2' },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  hint: { color: '#72767d', textAlign: 'center', marginVertical: 12 },
});
