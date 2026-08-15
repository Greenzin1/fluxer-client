import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import fluxer from '../services/fluxer';

export default function GuildsScreen({ route, navigation }) {
  const { user } = route.params;
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fluxer.fetchGuilds().then(setGuilds).catch(console.error).finally(() => setLoading(false)); }, []);

  const initials = (n) => n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  if (loading) return <View style={s.c}><ActivityIndicator size="large" color="#5865f2" /></View>;

  return (
    <View style={s.c}>
      <View style={s.hdr}>
        <Text style={s.hdrTitle}>Servidores</Text>
        <Text style={s.user}>{user.username}</Text>
      </View>
      <FlatList data={guilds} keyExtractor={i => i.id} renderItem={({ item }) => (
        <TouchableOpacity style={s.item} onPress={() => navigation.navigate('Channels', { guild: item })}>
          <View style={s.icon}>
            <Text style={s.ini}>{initials(item.name)}</Text>
          </View>
          <Text style={s.name} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
      )} />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#313338' },
  hdr: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#2b2d31', borderBottomWidth: 1, borderBottomColor: '#1e1f22' },
  hdrTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  user: { fontSize: 14, color: '#b5bac1', marginTop: 4 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#1e1f22' },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#5865f2', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  ini: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  name: { fontSize: 16, color: '#dbdee1', flex: 1 },
});
