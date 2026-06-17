import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  enableIndexedDbPersistence,
  onSnapshot 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Detect if we are in local sandbox offline-mode (e.g., config keys are empty/not populated yet)
export const isOfflineMode = !firebaseConfig.apiKey;

let dbInstance: any = null;
let authInstance: any = null;

if (!isOfflineMode) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // CRITICAL: Must use firestoreDatabaseId database parameter
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    authInstance = getAuth(app);
    
    // Enable offline persistence for seamless local client support
    try {
      enableIndexedDbPersistence(dbInstance).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore offline persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          console.warn('Firestore offline persistence is not supported by this browser');
        }
      });
    } catch {
      // Ignore persistence setup errors
    }
  } catch (error) {
    console.error('Firebase initialization failed, falling back to local sandbox', error);
  }
}

export const db = dbInstance;
export const auth = authInstance;

export interface VisitorMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: any; // Firestore timestamp or ISO string
  sourceWebsite: string;
  status: 'read' | 'unread';
  browserInfo: string;
}

// Security error wrappers as required by rules
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Local storage fallback helper key
const LOCAL_STORAGE_KEY = 'sauvik_portfolio_ai_messages';

// Predefined creative sample database records to make the sandbox interactive
const MOCK_MESSAGES_DUMMY: VisitorMessage[] = [
  {
    id: 'msg-mock-1',
    name: 'Siddhartha Ganguly',
    email: 'siddhartha.g@techcorp.in',
    message: 'Hello Sauvik, I love the incredible portfolio designs that you build. I am looking for a full-stack portfolio and blog website for my consultancy agency. Let me know if you are free next week for a discussion.',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    sourceWebsite: 'sauvikdev.in',
    status: 'unread',
    browserInfo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  },
  {
    id: 'msg-mock-2',
    name: 'Rebecca Miller',
    email: 'rebecca.miller@creativeagency.com',
    message: 'Hi Sauvik, we are highly impressed by your cinematic video editing skills and video reels. We want to recruit a talented remote editor for our social media content campaign. Are you open to contractual freelance work?',
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    sourceWebsite: 'sauvikdev.in',
    status: 'unread',
    browserInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0'
  },
  {
    id: 'msg-mock-3',
    name: 'Biplab Mondal',
    email: 'biplab.mondal@startupbengal.io',
    message: 'চমৎকার পোর্টফোলিও ওয়েবসাইট ভাই! আমরা আমাদের স্টার্টআপের জন্য একটি রেসপন্সিভ ল্যান্ডিং পেজ কাস্টমাইজ করতে চাই। আপনার অফার এবং চার্জ কেমন হবে দয়া করে জানাবেন। ধন্যবাদ!',
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    sourceWebsite: 'sauvikdev.in',
    status: 'read',
    browserInfo: 'Mozilla/5.0 (Linux; Android 13; SM-G998B)'
  }
];

// Initialize local messages if not present
const getLocalMessages = (): VisitorMessage[] => {
  const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!localData) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_MESSAGES_DUMMY));
    return MOCK_MESSAGES_DUMMY;
  }
  try {
    return JSON.parse(localData);
  } catch {
    return MOCK_MESSAGES_DUMMY;
  }
};

const saveLocalMessages = (msgs: VisitorMessage[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(msgs));
};

/**
 * Adds a new contact/feedback message submitted by visitors
 */
export async function addMessageToFirestore(
  name: string,
  email: string,
  message: string,
  browserInfo: string
): Promise<boolean> {
  const sourceWebsite = 'sauvikdev.in';
  const path = 'messages';
  
  if (!isOfflineMode && db) {
    try {
      await addDoc(collection(db, path), {
        name,
        email,
        message,
        timestamp: serverTimestamp(),
        sourceWebsite,
        status: 'unread',
        browserInfo
      });
      return true;
    } catch (e) {
      console.warn('Firestore write rejected/failed, falling back to local cache storage.', e);
    }
  }

  // Fallback to LocalStorage
  const msgs = getLocalMessages();
  const newMsg: VisitorMessage = {
    id: 'local-' + Math.random().toString(36).substring(2, 9),
    name,
    email,
    message,
    timestamp: new Date().toISOString(),
    sourceWebsite,
    status: 'unread',
    browserInfo
  };
  msgs.unshift(newMsg); // Put newest first
  saveLocalMessages(msgs);
  return true;
}

/**
 * Fetches all contact messages from database (ordered by descending timestamp)
 */
export async function fetchMessagesFromFirestore(): Promise<VisitorMessage[]> {
  const path = 'messages';
  if (!isOfflineMode && db) {
    try {
      const q = query(collection(db, path), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const list: VisitorMessage[] = [];
      querySnapshot.forEach((docRef) => {
        const data = docRef.data();
        // Convert firestore timestamp or fallback
        const formattedTime = data.timestamp?.toDate 
          ? data.timestamp.toDate().toISOString() 
          : (data.timestamp || new Date().toISOString());
        list.push({
          id: docRef.id,
          name: data.name || '',
          email: data.email || '',
          message: data.message || '',
          timestamp: formattedTime,
          sourceWebsite: data.sourceWebsite || 'sauvikdev.in',
          status: data.status || 'unread',
          browserInfo: data.browserInfo || ''
        });
      });
      return list;
    } catch (e: any) {
      if (e.message && e.message.includes('permission')) {
        handleFirestoreError(e, OperationType.LIST, path);
      }
      console.warn('Firestore fetch blocked or failed: check permissions or connection.', e);
    }
  }

  // Fallback to LocalStorage
  return getLocalMessages();
}

/**
 * Subscribes to contact messages in real-time
 */
export function subscribeToMessagesFromFirestore(
  onUpdate: (messages: VisitorMessage[]) => void,
  onFailed: (error: any) => void
): () => void {
  const path = 'messages';
  if (!isOfflineMode && db) {
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const list: VisitorMessage[] = [];
      snapshot.forEach((docRef) => {
        const data = docRef.data();
        const formattedTime = data.timestamp?.toDate 
          ? data.timestamp.toDate().toISOString() 
          : (data.timestamp || new Date().toISOString());
        list.push({
          id: docRef.id,
          name: data.name || '',
          email: data.email || '',
          message: data.message || '',
          timestamp: formattedTime,
          sourceWebsite: data.sourceWebsite || 'sauvikdev.in',
          status: data.status || 'unread',
          browserInfo: data.browserInfo || ''
        });
      });
      onUpdate(list);
    }, (error) => {
      if (error.message && error.message.includes('permission')) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
      onFailed(error);
    });
  }

  // Fallback direct update
  onUpdate(getLocalMessages());
  return () => {};
}

/**
 * Marks a message read/unread status in database
 */
export async function markMessageAsReadInFirestore(id: string, status: 'read' | 'unread'): Promise<boolean> {
  const path = `messages/${id}`;
  if (!isOfflineMode && db && !id.startsWith('local-')) {
    try {
      const docRef = doc(db, 'messages', id);
      await updateDoc(docRef, { status });
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  }

  // Local storage update
  const msgs = getLocalMessages();
  const updated = msgs.map(m => m.id === id ? { ...m, status } : m);
  saveLocalMessages(updated);
  return true;
}

/**
 * Deletes a message from database
 */
export async function deleteMessageInFirestore(id: string): Promise<boolean> {
  const path = `messages/${id}`;
  if (!isOfflineMode && db && !id.startsWith('local-')) {
    try {
      const docRef = doc(db, 'messages', id);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  }

  // Local storage delete
  const msgs = getLocalMessages();
  const filtered = msgs.filter(m => m.id !== id);
  saveLocalMessages(filtered);
  return true;
}

/**
 * Authenticates Admin user securely via Google Popup sign in
 */
export async function signInAdminWithGoogle(): Promise<any> {
  if (isOfflineMode || !auth) {
    throw new Error('OAuth is unavailable during offline sandbox mode.');
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/**
 * Logs out authentication session
 */
export async function logoutAdmin(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Listen to auth state transitions
 */
export function onAdminAuthStateChanged(callback: (user: any) => void) {
  if (auth) {
    return onAuthStateChanged(auth, callback);
  }
  return () => {};
}
