import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

let app, auth, db, storage;

try {
  let firebaseConfig = null;
  if (typeof __firebase_config !== 'undefined') {
    firebaseConfig = typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config;
  } else {
    // TẠI ĐÂY: Thay bằng cấu hình từ Firebase Console của bạn
    firebaseConfig = {
      apiKey: "AIzaSyDzl8FQDegLV3LVx2qTa4dLFF_3esa67XA",
      authDomain: "giao-xu-hoang-yen.firebaseapp.com",
      projectId: "giao-xu-hoang-yen",
      storageBucket: "giao-xu-hoang-yen.firebasestorage.app",
      messagingSenderId: "896647028768",
      appId: "1:896647028768:web:5a9c6f6b7638a15a30dc45"
    };
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  db = getFirestore(app);

  storage = getStorage(app);
} catch (error) { console.error("Lỗi khởi tạo Firebase:", error); }

const rawAppId = typeof __app_id !== 'undefined' ? String(__app_id) : 'giao-xu-hoang-yen-app';
const appId = rawAppId.replace(/[\/\.]/g, '-');

export { auth, db, storage, appId };