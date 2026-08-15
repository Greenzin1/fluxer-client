import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import fluxer from '../services/fluxer';

export default function ChatScreen({ route }) {
  const { channel } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatRef = useRef();

  useEffect(() => {
    fluxer.fetchMessages(channel.id).then(d => setMessages(Array.isArray(d) ? d.reverse() : [])).catch(console.error);
    const handler = (msg) => {
      if (msg.channel_id === channel.id) setMessages(prev => [...prev, msg]);
    };
    fluxer.on('MESSAGE_CREATE', handler);
    fluxer.connectGateway().catch(console.error);
    return () => { fluxer.listeners['MESSAGE_CREATE'] = []; };
  }, []);

  const send = async () => {
    const c = input.trim();
    if (!c) return;
    setInput('');
    try { await fluxer.sendMessage(channel.id, c); } catch (e) { console.error(e); }
  };

  const fmt = (ts) => { const d = new Date(ts); return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`; };

  return (
    <KeyboardAvoidingView style={s.c} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={s.hdr}>
        <Text style={s.hash}>#</Text>
        <Text style={s.chName}>{channel.name}</Text>
      </View>
      <FlatList ref={flatRef} style={s.msgs} data={messages} keyExtractor={i => i.id}
        onContentSizeChange={() => flatRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View style={s.msg}>
            <View style={s.msgHdr}>
              <Text style={s.author}>{item.author?.global_name || item.author?.username || '???'}</Text>
              <Text style={s.time}>{fmt(item.timestamp)}</Text>
            </View>
            <Text style={s.content}>{item.content}</Text>
          </View>
        )}
      />
      <View style={s.inputC}>
        <TextInput style={s.input} placeholder={`Enviar em #${channel.name}`} placeholderTextColor="#72767d" value={input} onChangeText={setInput} onSubmitEditing={send} returnKeyType="send" />
        <TouchableOpacity style={s.send} onPress={send}>
          <Text style={s.sendTxt}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#313338' },
  hdr: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: '#2b2d31', borderBottomWidth: 1, borderBottomColor: '#1e1f22' },
  hash: { fontSize: 22, color: '#72767d', marginRight: 8 },
  chName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  msgs: { flex: 1, paddingHorizontal: 16 },
  msg: { paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#1e1f2230' },
  msgHdr: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  author: { fontSize: 15, fontWeight: 'bold', color: '#f2f3f5', marginRight: 8 },
  time: { fontSize: 12, color: '#72767d' },
  content: { fontSize: 15, color: '#dbdee1', lineHeight: 20 },
  inputC: { flexDirection: 'row', padding: 12, backgroundColor: '#383a40', marginHorizontal: 12, marginBottom: 12, borderRadius: 12, alignItems: 'center' },
  input: { flex: 1, fontSize: 15, color: '#fff', paddingVertical: 8 },
  send: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#5865f2', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendTxt: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
