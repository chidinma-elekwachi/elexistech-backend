// screens/CallScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Modal } from 'react-native';
import { auth } from '../firebase';
import { createCall, onCallDoc, updateCallStatus } from '../services/callService';
import { WebView } from 'react-native-webview';
import { doc, onSnapshot, query, collection, where } from 'firebase/firestore';
import { db } from '../firebase';

// NOTE: you must host a small webrtc-client.html that reads ?callId=...&role=caller|callee
// and uses the same Firebase config to exchange signaling data under calls/{callId}/signals.
// For demo, set WEBRTC_CLIENT_URL below to your hosted page.
const WEBRTC_CLIENT_URL = 'https://your-hosted/webrtc-client.html'; // <<-- HOST THIS

export default function CallScreen() {
  const [incoming, setIncoming] = useState(null);
  const [webviewVisible, setWebviewVisible] = useState(false);
  const [callId, setCallId] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    // listen for calls where callee === current uid and status === 'ringing'
    const q = query(collection(db, 'calls'), where('callee', '==', user.uid));
    const unsub = onSnapshot(q, snap => {
      snap.docs.forEach(docSnap => {
        const data = docSnap.data();
        if (data.status === 'ringing') {
          setIncoming(data);
        }
      });
    });
    return unsub;
  }, [user]);

  const handleCallUser = async (calleeUid) => {
    if (!user) return alert('Sign in first');
    const id = await createCall(user.uid, calleeUid);
    setCallId(id);
    // open webview as caller
    setWebviewVisible(true);
  };

  const acceptIncoming = async () => {
    if (!incoming) return;
    // set status accepted
    await updateCallStatus(incoming.id, 'accepted');
    setCallId(incoming.id);
    setIncoming(null);
    setWebviewVisible(true); // open webview as callee
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h}>Call demo</Text>
      <Button title="Call demo user (paste their UID below in code)" onPress={() => handleCallUser('PASTE_REMOTE_UID_HERE')} />
      {incoming && (
        <View style={{ marginTop:20 }}>
          <Text>Incoming call from: {incoming.caller}</Text>
          <Button title="Accept" onPress={acceptIncoming} />
        </View>
      )}

      <Modal visible={webviewVisible} animationType="slide">
        <View style={{ flex:1 }}>
          <View style={{ height:56, justifyContent:'center', padding:8 }}>
            <Button title="End call" onPress={() => { setWebviewVisible(false); setCallId(null); }} />
          </View>
          {/* role param: if caller open webrtc-client.html?callId=...&role=caller else role=callee */}
          <WebView source={{ uri: `${WEBRTC_CLIENT_URL}?callId=${callId}&role=${incoming ? 'callee' : 'caller'}` }} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor:'#fff' },
  h: { fontSize:18, fontWeight:'700', marginBottom:12 }
});
