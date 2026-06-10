import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { S3Client } from '@aws-sdk/client-s3';

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
  
  // TỐI ƯU PERFORMANCE: Bật bộ nhớ đệm (Offline Cache) an toàn
  // Giúp lấy dữ liệu ngay lập tức (0ms) từ trình duyệt mà không cần chờ tải từ mạng.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache()
  });

  // Cấu hình Cloudflare R2
  const R2_ACCOUNT_ID = 'eef3fc90fcbf9d39a64a021475959f36'; // Dán Account ID của bạn vào đây
  const R2_ACCESS_KEY_ID = 'e982775321db13376285c3092126f7cf'; // Dán Access Key ID vào đây
  const R2_SECRET_ACCESS_KEY = '6c4ade49e50951764cf1642d45b6b1b4bd97bff9e1473c2c15483592ac9ebbac'; // Dán Secret Access Key vào đây

  storage = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

} catch (error) { console.error("Lỗi khởi tạo Firebase:", error); }

const rawAppId = typeof __app_id !== 'undefined' ? String(__app_id) : 'giao-xu-hoang-yen-app';
const appId = rawAppId.replace(/[\/\.]/g, '-');

export { auth, db, storage, appId };