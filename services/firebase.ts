
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, onValue, get } from "firebase/database";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDXMrjnzIf3hNpcZAvgOW-oSHyxqEATy8E",
  authDomain: "jhku-a9239.firebaseapp.com",
  projectId: "jhku-a9239",
  storageBucket: "jhku-a9239.firebasestorage.app",
  messagingSenderId: "1069430661221",
  appId: "1:1069430661221:web:62fcd9f0136cff9040e68c",
  measurementId: "G-97HB850G62",
  databaseURL: "https://jhku-a9239-default-rtdb.firebaseio.com"
};

let db: any = null;
let isFirebaseActive = false;
const QUEUE_KEY = 'sip_gym_sync_queue'; // Key lưu hàng đợi khi mất mạng

// Hàm xử lý hàng đợi (Retry mechanism)
const processSyncQueue = async () => {
  if (!db || !isFirebaseActive) return;

  const queueStr = localStorage.getItem(QUEUE_KEY);
  if (!queueStr) return;

  try {
    const queue = JSON.parse(queueStr);
    if (Object.keys(queue).length === 0) return;

    console.log("🔄 Đang đồng bộ dữ liệu offline lên Server...", queue);
    
    // Duyệt qua từng path đang chờ và gửi lại
    for (const path in queue) {
      const data = queue[path];
      try {
        await set(ref(db, path), data);
        delete queue[path];
      } catch (err) {
        console.error(`Vẫn chưa thể đồng bộ ${path}, sẽ thử lại sau.`);
      }
    }

    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    
  } catch (e) {
    console.error("Lỗi xử lý hàng đợi:", e);
  }
};

try {
  const app = initializeApp(firebaseConfig);
  try {
    const analytics = getAnalytics(app);
  } catch (err) {
    console.warn("Analytics skipped");
  }
  db = getDatabase(app);
  isFirebaseActive = true;
  console.log("🔥 Firebase Connected");

  // --- KÍCH HOẠT DATABASE ---
  // Ghi ngay một dòng dữ liệu test để Admin thấy trên màn hình Firebase
  set(ref(db, 'connection_status'), {
    status: 'ONLINE',
    message: 'App Sip Gym đã kết nối thành công!',
    last_login: new Date().toLocaleString('vi-VN')
  }).then(() => {
    console.log("✅ Đã ghi test connection lên Firebase");
  }).catch((err) => {
    console.error("❌ Lỗi ghi test connection (Kiểm tra lại Rules):", err);
  });
  // ---------------------------

  // Lắng nghe trạng thái kết nối mạng
  const connectedRef = ref(db, ".info/connected");
  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      console.log("kết nối mạng ổn định - Bắt đầu đồng bộ...");
      processSyncQueue();
    } else {
      console.log("Mất kết nối với Server - Chuyển sang chế độ Offline Queue");
    }
  });

} catch (error) {
  console.error("Firebase Init Error:", error);
  isFirebaseActive = false;
}

export const dbService = {
  // 1. Lưu dữ liệu (Cơ chế an toàn tuyệt đối)
  saveAll: (path: string, data: any) => {
    // Luôn lưu LocalStorage trước
    localStorage.setItem(`sip_gym_${path}_db`, JSON.stringify(data));

    // Thử gửi lên Firebase
    if (isFirebaseActive && db) {
      set(ref(db, path), data)
        .then(() => {
           // Gửi thành công -> Xóa khỏi hàng đợi nếu có
           const queueStr = localStorage.getItem(QUEUE_KEY);
           if (queueStr) {
             const queue = JSON.parse(queueStr);
             if (queue[path]) {
               delete queue[path];
               localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
             }
           }
        })
        .catch((err) => {
          console.warn("Mất mạng khi lưu! Đang thêm vào hàng đợi...", err);
          dbService.addToQueue(path, data);
        });
    } else {
      dbService.addToQueue(path, data);
    }
  },

  // Hàm phụ: Thêm vào hàng đợi
  addToQueue: (path: string, data: any) => {
    try {
      const queueStr = localStorage.getItem(QUEUE_KEY);
      let queue = queueStr ? JSON.parse(queueStr) : {};
      queue[path] = data;
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error("Lỗi lưu Queue:", e);
    }
  },

  // 2. Đọc dữ liệu: Hybrid (Local trước -> Cloud sau)
  subscribe: (path: string, callback: (data: any) => void) => {
    // Load Local
    const localData = localStorage.getItem(`sip_gym_${path}_db`);
    if (localData) {
      try {
        callback(JSON.parse(localData));
      } catch (e) {
        callback([]);
      }
    } else {
      callback([]);
    }

    // Load Cloud
    if (isFirebaseActive && db) {
      const dataRef = ref(db, path);
      onValue(dataRef, (snapshot) => {
        const cloudData = snapshot.val();
        if (cloudData) {
          localStorage.setItem(`sip_gym_${path}_db`, JSON.stringify(cloudData));
          callback(cloudData);
        }
      }, (error) => {
        console.warn("Đang dùng dữ liệu Offline do lỗi mạng:", error);
      });
    }
  },

  isActive: isFirebaseActive
};
