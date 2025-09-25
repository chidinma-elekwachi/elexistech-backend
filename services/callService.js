// services/callService.js
import { db } from '../firebase';
import { doc, setDoc, getDoc, collection, addDoc, onSnapshot, updateDoc } from 'firebase/firestore';

/**
 * Call doc shape:
 * calls/{callId} = { id, caller, callee, status: 'ringing'|'accepted'|'ended', createdAt }
 * calls/{callId}/signals/{autoId} -> { from, type: 'offer'|'answer'|'ice', payload, ts }
 */

// create a call doc and return callId
export async function createCall(callerUid, calleeUid) {
  const callId = `${callerUid}_${calleeUid}_${Date.now()}`;
  await setDoc(doc(db, 'calls', callId), {
    id: callId,
    caller: callerUid,
    callee: calleeUid,
    status: 'ringing',
    createdAt: Date.now()
  });
  return callId;
}

export async function updateCallStatus(callId, status) {
  await updateDoc(doc(db, 'calls', callId), { status });
}

export async function sendSignal(callId, fromUid, type, payload) {
  const signalsRef = collection(db, 'calls', callId, 'signals');
  await addDoc(signalsRef, { from: fromUid, type, payload, ts: Date.now() });
}

export function subscribeToSignals(callId, cb /* (signalDoc) */) {
  const signalsRef = collection(db, 'calls', callId, 'signals');
  return onSnapshot(signalsRef, snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        cb({ id: change.doc.id, ...change.doc.data() });
      }
    });
  });
}

export function onCallDoc(callId, cb) {
  const callRef = doc(db, 'calls', callId);
  return onSnapshot(callRef, snap => {
    cb(snap.exists() ? snap.data() : null);
  });
}
