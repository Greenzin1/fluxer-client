import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import fluxer from '../services/fluxer';

export default function ChannelsScreen({ route, navigation }) {
  const { guild } = route.params;
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fluxer.fetchChannels(guild.id)
      .then(data => setChannels(data.filter(c => c.type === 0)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={s.c}><ActivityIndicator size="large" color="#5865f2" /></View>;

  return (
    <View style={s.c}>
      <View style={s.hdr}>
        <Text style={s.guildName}>{guild.name}</Text>
      </View>
      <FlatList data={channels} keyExtractor={i => i.id} renderItem={({ item }) => (
        <TouchableOpacity style={s.ch} onPress={() => navigation.navigate('Chat', { channel: item, guild })}>
          <Text style={s.hash}>#</Text>
          <Text style={s.chName} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
      )} />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#313338' },
  hdr: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#2b2d31', borderBottomWidth: 1, borderBottomColor: '#1e1f22' },
  guildName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  ch: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: '#1e1f2230' },
  hash: { fontSize: 18, color: '#72767d', marginRight: 10, width: 24, textAlign: 'center' },
  chName: { fontSize: 16, color: '#949ba4', flex: 1 },
});
