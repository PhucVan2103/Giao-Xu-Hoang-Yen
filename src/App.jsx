import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  X, ArrowUp, Edit3
} from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import { auth, db, appId } from './utils/firebase';
import { signInWithCustomToken, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, increment } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';

import { litColors, formatDateString } from './utils/helpers';
import { RichTextEditor, ImageAdjuster, ConfirmModal, PromptModal, Lightbox } from './components/Shared';
import Header from './components/Header';
import Footer from './components/Footer';

// Khắc phục lỗi "Failed to fetch dynamically imported module" khi deploy bản mới
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        // Ép trình duyệt tải bản mới nhất bằng cách gắn thêm query parameters thời gian thực
        const url = new URL(window.location.href);
        url.searchParams.set('v', Date.now().toString());
        return window.location.href = url.href;
      }
      throw error;
    }
  });

const Home = lazyWithRetry(() => import('./pages/Home'));
const About = lazyWithRetry(() => import('./pages/About'));
const Contact = lazyWithRetry(() => import('./pages/Contact'));
const Liturgy = lazyWithRetry(() => import('./pages/Liturgy'));
const Pilgrimage = lazyWithRetry(() => import('./pages/Pilgrimage').then(module => ({ default: module.Pilgrimage })));
const PilgrimageDetail = lazyWithRetry(() => import('./pages/Pilgrimage').then(module => ({ default: module.PilgrimageDetail })));
const News = lazyWithRetry(() => import('./pages/News').then(module => ({ default: module.News })));
const NewsDetail = lazyWithRetry(() => import('./pages/News').then(module => ({ default: module.NewsDetail })));
const AdminDashboard = lazyWithRetry(() => import('./pages/AdminDashboard'));

// ==========================================
// BẢNG MÀU GIAO DIỆN THEO MÙA PHỤNG VỤ
// ==========================================
const THEME_COLORS = {
  'thuong-nien': { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' }, // Xanh lá
  'mua-chay': { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764' }, // Tím
  'phuc-sinh': { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' }, // Vàng (Gold)
  'giang-sinh': { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' }, // Vàng (Giáng sinh)
  'le-do': { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a' } // Đỏ
};

const getThemeCSS = (season) => {
  if (!season || season === 'default' || !THEME_COLORS[season]) return '';
  const c = THEME_COLORS[season];
  return `
    :root {
      ${Object.keys(c).map(shade => `--color-pink-${shade}: ${c[shade]} !important;`).join('\n      ')}
    }
  `;
};

// ==========================================
// COMPONENT TẠO HIỆU ỨNG THEO MÙA (TUYẾT, HÀO QUANG...)
// ==========================================
const SeasonalEffects = ({ season }) => {
  const [elements, setElements] = useState([]);
  useEffect(() => {
    if (season === 'giang-sinh' || season === 'phuc-sinh') {
      setElements([...Array(25)].map(() => ({
        left: Math.random() * 100,
        duration: Math.random() * 5 + 5,
        delay: Math.random() * 5,
        size: Math.random() * 10 + 10,
        opacity: Math.random() * 0.5 + 0.3
      })));
    } else {
      setElements([]);
    }
  }, [season]);

  if (season === 'giang-sinh') return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
      {elements.map((p, i) => <div key={i} className="absolute text-white drop-shadow-md animate-snowfall" style={{ left: `${p.left}vw`, top: '-5vh', animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`, opacity: p.opacity, fontSize: `${p.size}px` }}>❄</div>)}
    </div>
  );
  if (season === 'phuc-sinh') return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
      {elements.map((p, i) => <div key={i} className="absolute text-yellow-300 drop-shadow-lg animate-float-up" style={{ left: `${p.left}vw`, bottom: '-5vh', animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`, opacity: p.opacity, fontSize: `${p.size}px` }}>✨</div>)}
    </div>
  );
  return null;
};

// ==========================================
// 3. MAIN APP COMPONENT
// ==========================================

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const itemsPerPage = 4;
  const newsPerPage = 6;
  
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingProgress, setLoadingProgress] = useState(0);

  // --- States Admin & Auth ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- States Firebase User ---
  const [firebaseUser, setFirebaseUser] = useState(null);

  // --- States Tùy chỉnh Giao diện ---
  const [logoConfig, setLogoConfig] = useState({ image: './logo.svg', imgFit: 'contain', imgScale: 1, imgPosX: 50, imgPosY: 50 });
  const [editingLogo, setEditingLogo] = useState(false);
  const [tempLogoConfig, setTempLogoConfig] = useState({});

  const [heroData, setHeroData] = useState({ image: '', imgFit: 'cover', imgScale: 1, imgPosX: 50, imgPosY: 50 });
  const [editingHero, setEditingHero] = useState(false);
  const [tempHero, setTempHero] = useState({});

  const [footerData, setFooterData] = useState({});
  const [editingFooter, setEditingFooter] = useState(false);
  const [tempFooter, setTempFooter] = useState({});
  const [editingQuickPhone, setEditingQuickPhone] = useState(false);

  // --- States Dữ Liệu Chung ---
  const [parishStats, setParishStats] = useState({});
  const [quote, setQuote] = useState({});
  const [massSchedules, setMassSchedules] = useState([]);
  
  // --- States Tab Liên Hệ ---
  const [contactInfo, setContactInfo] = useState({});
  const [formStatus, setFormStatus] = useState('');

  // --- States Tab Phụng Vụ ---
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [liturgyEvents, setLiturgyEvents] = useState([]);
  const [confessionData, setConfessionData] = useState({});
  const [adorationData, setAdorationData] = useState({});

  // --- States Tab Giới Thiệu ---
  const [historyData, setHistoryData] = useState({});
  const [heritageTitle, setHeritageTitle] = useState("");
  const [heritageList, setHeritageList] = useState([]);
  const [pastoralData, setPastoralData] = useState({});

  // --- States Tab Hành Hương ---
  const [pilgrimagePlans, setPilgrimagePlans] = useState([]);
  const [receptionInfo, setReceptionInfo] = useState({});

  // --- States Tab Tin Tức ---
  const [newsItems, setNewsItems] = useState([]);
  const [newsCategories, setNewsCategories] = useState(['Tin Tức', 'Sự kiện', 'Giáo lý', 'Thông báo']);
  const [messages, setMessages] = useState([]);
  const [dailyVisits, setDailyVisits] = useState({});

  // --- States View Detail & Pagination ---
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedPilgrimage, setSelectedPilgrimage] = useState(null);
  const [newsPage, setNewsPage] = useState(1);
  const [pilgrimagePage, setPilgrimagePage] = useState(1);

  // --- States Quản lý Modals Edit (Temp Data) ---
  const [editingQuote, setEditingQuote] = useState(false);
  const [tempQuote, setTempQuote] = useState({});
  const [editingStats, setEditingStats] = useState(false);
  const [tempStats, setTempStats] = useState({});
  const [editingMass, setEditingMass] = useState(false);
  const [tempMass, setTempMass] = useState([]);
  const [editingContact, setEditingContact] = useState(false);
  const [tempContact, setTempContact] = useState({});
  const [editingHistory, setEditingHistory] = useState(false);
  const [tempHistory, setTempHistory] = useState({});
  const [editingHeritageTitle, setEditingHeritageTitle] = useState(false);
  const [tempHeritageTitle, setTempHeritageTitle] = useState("");
  const [editingHeritageItem, setEditingHeritageItem] = useState(null);
  const [tempHeritageItem, setTempHeritageItem] = useState(null);
  const [editingPastoral, setEditingPastoral] = useState(false);
  const [tempPastoral, setTempPastoral] = useState({});
  const [editingNews, setEditingNews] = useState(null);
  const [tempNews, setTempNews] = useState(null);
  const [editingPilgrimage, setEditingPilgrimage] = useState(null);
  const [tempPilgrimage, setTempPilgrimage] = useState(null);
  const [editingReception, setEditingReception] = useState(false);
  const [tempReception, setTempReception] = useState({});
  const [editingLiturgyEvent, setEditingLiturgyEvent] = useState(false);
  const [tempLiturgyEvent, setTempLiturgyEvent] = useState(null);
  const [editingConfession, setEditingConfession] = useState(false);
  const [tempConfession, setTempConfession] = useState({});
  const [editingAdoration, setEditingAdoration] = useState(false);
  const [tempAdoration, setTempAdoration] = useState({});

  // --- States Modals Chuyên Nghiệp ---
  const [appConfirm, setAppConfirm] = useState({ isOpen: false, title: '', message: '', isDanger: false, onConfirm: null });
  const [appPrompt, setAppPrompt] = useState({ isOpen: false, title: '', desc: '', defaultValue: '', onConfirm: null });
  const [lightboxImg, setLightboxImg] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ==========================================
  // FIREBASE INITIALIZATION & SYNC
  // ==========================================
  
  // 1. Authenticate FIRST
  useEffect(() => {
    // Xoá cờ reload nếu tải trang thành công
    sessionStorage.removeItem('vite-chunk-reloaded');
    // Xoá param ?v= khỏi URL để thanh địa chỉ sạch sẽ
    const url = new URL(window.location.href);
    if (url.searchParams.has('v')) {
      url.searchParams.delete('v');
      window.history.replaceState({}, '', url.toString());
    }

    if (!auth) return;

    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      signInWithCustomToken(auth, __initial_auth_token).catch(console.error);
    }

    // Xử lý kết quả trả về sau khi chuyển hướng Google (Redirect Login)
    getRedirectResult(auth).then((result) => {
      if (result) {
        toast.success('Đăng nhập Google thành công!');
        setShowLoginModal(false);
        navigate('/admin');
      }
    }).catch(console.error);
    
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setFirebaseUser(u);
        // BẢO MẬT: Chỉ cấp quyền Admin cho các email được chỉ định
        const adminEmails = ['admin@giaoxuhoangyen.vn', 'denthanhgiaoxuhoangyen@gmail.com']; 
        const hasAdminRole = u.email && adminEmails.includes(u.email.toLowerCase());
        setIsAdmin(hasAdminRole);
      } else {
        setFirebaseUser(null);
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Synchronization (Bọc Try-Catch chống Crash)
  useEffect(() => {
    // TỐI ƯU 2: Xóa check !firebaseUser để Web tải dữ liệu đồng thời với lúc Auth, cắt giảm 50% thời gian chờ
    if (!db) {
      return;
    }

    let unsubNews, unsubPilgrimages, unsubLiturgy, unsubConfig, unsubMessages, unsubAnalytics;

    try {
      unsubNews = onSnapshot(
        collection(db, 'artifacts', appId, 'public', 'data', 'news'),
        (snapshot) => {
          const items = [];
          snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
          setNewsItems(items.sort((a,b) => b.id - a.id));
        },
        (err) => console.error("Firebase lỗi lấy News:", err)
      );

      unsubPilgrimages = onSnapshot(
        collection(db, 'artifacts', appId, 'public', 'data', 'pilgrimages'),
        (snapshot) => {
          const items = [];
          snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
          setPilgrimagePlans(items);
        },
        (err) => console.error("Firebase lỗi lấy Pilgrimage:", err)
      );

      unsubLiturgy = onSnapshot(
        collection(db, 'artifacts', appId, 'public', 'data', 'liturgy'),
        (snapshot) => {
          const items = [];
          snapshot.forEach(doc => items.push(doc.data()));
          setLiturgyEvents(items);
        },
        (err) => console.error("Firebase lỗi lấy Liturgy:", err)
      );

      unsubConfig = onSnapshot(
        collection(db, 'artifacts', appId, 'public', 'data', 'config'),
        (snapshot) => {
          let updatedLogo = null;
          let updatedHero = null;

          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            if (docSnap.id === 'main') {
              if (d.parishStats) setParishStats(d.parishStats);
              if (d.massSchedules) setMassSchedules(d.massSchedules);
              if (d.quote) setQuote(d.quote);
              if (d.contactInfo) setContactInfo(d.contactInfo);
              if (d.confessionData) setConfessionData(d.confessionData);
              if (d.adorationData) setAdorationData(d.adorationData);
              if (d.historyData) setHistoryData(d.historyData);
              if (d.heritageTitle) setHeritageTitle(d.heritageTitle);
              if (d.heritageList) setHeritageList(d.heritageList);
              if (d.pastoralData) setPastoralData(d.pastoralData);
              if (d.receptionInfo) setReceptionInfo(d.receptionInfo);
              if (d.footerData) setFooterData(d.footerData);
              if (d.newsCategories) setNewsCategories(d.newsCategories);
              
              // Tương thích ngược: Vẫn đọc từ main nếu chưa từng tách ra doc riêng
              if (d.logoConfig && !updatedLogo) updatedLogo = d.logoConfig;
              if (d.heroData && !updatedHero) updatedHero = d.heroData;
            } else if (docSnap.id === 'logo') {
              if (d.logoConfig) updatedLogo = d.logoConfig;
            } else if (docSnap.id === 'hero') {
              if (d.heroData) updatedHero = d.heroData;
            }
          });
          
          if (updatedLogo) setLogoConfig(updatedLogo);
          if (updatedHero) setHeroData(updatedHero);
        },
        (err) => console.error("Firebase lỗi lấy Config:", err)
      );

      unsubMessages = onSnapshot(
        collection(db, 'artifacts', appId, 'public', 'data', 'messages'),
        (snapshot) => {
          const items = [];
          snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
          setMessages(items.sort((a,b) => b.createdAt - a.createdAt));
        },
        (err) => console.error("Firebase lỗi lấy Messages:", err)
      );

      unsubAnalytics = onSnapshot(
        doc(db, 'artifacts', appId, 'public', 'data', 'analytics', 'visits'),
        (docSnap) => {
          if (docSnap.exists()) setDailyVisits(docSnap.data());
        },
        (err) => console.error("Firebase lỗi lấy Analytics:", err)
      );

    } catch (err) {
      console.error("Lỗi khi thiết lập listeners Firebase:", err);
    }

    return () => {
      if(unsubNews) unsubNews();
      if(unsubPilgrimages) unsubPilgrimages();
      if(unsubLiturgy) unsubLiturgy();
      if(unsubConfig) unsubConfig();
      if(unsubMessages) unsubMessages();
      if(unsubAnalytics) unsubAnalytics();
    };
  // TỐI ƯU 4: Xóa [firebaseUser] khỏi dependency array, tránh việc useEffect bị kích hoạt 2 lần gây lag
  }, []);

  // --- THEO DÕI LƯỢT TRUY CẬP (VISITS TRACKING) ---
  useEffect(() => {
    if (db) {
      const todayStr = formatDateString(new Date());
      const lastVisited = localStorage.getItem('last_visit_date');
      if (lastVisited !== todayStr) {
        localStorage.setItem('last_visit_date', todayStr);
        const visitsRef = doc(db, 'artifacts', appId, 'public', 'data', 'analytics', 'visits');
        setDoc(visitsRef, { [todayStr]: increment(1) }, { merge: true }).catch(console.error);
      }
    }
  }, [db]);

  // --- Lắng nghe sự kiện Phóng to ảnh (Lightbox) ---
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (e.target.tagName === 'IMG' && e.target.closest('.lightbox-container')) {
        setLightboxImg(e.target.src);
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // --- Kéo thả sắp xếp Vị Thánh ---
  const handleReorderHeritage = (dragId, dropId) => {
    if (String(dragId) === String(dropId)) return;
    setHeritageList(prevList => {
      const dragIndex = prevList.findIndex(item => String(item.id) === String(dragId));
      const dropIndex = prevList.findIndex(item => String(item.id) === String(dropId));
      if (dragIndex === -1 || dropIndex === -1) return prevList;

      const newList = [...prevList];
      const [draggedItem] = newList.splice(dragIndex, 1);
      newList.splice(dropIndex, 0, draggedItem);
      
      // Lọc bỏ các bản ghi bị trùng ID hoặc trùng Tên
      const getCleanName = (name) => name ? name.replace(/^\d+[\.\-\s]+/, '').trim() : '';
      const uniqueList = newList.filter((saint, index, self) => index === self.findIndex((t) => String(t.id) === String(saint.id) || getCleanName(t.name) === getCleanName(saint.name)));

      saveConfigToDB('heritageList', uniqueList).then(() => {
        toast.success('Đã cập nhật thứ tự Vị Thánh!');
      }).catch(() => toast.error('Lỗi khi lưu thứ tự'));
      
      return uniqueList;
    });
  };

  // --- Hàm hỗ trợ ghi dữ liệu lên Firebase ---
  const saveConfigToDB = async (key, value) => {
    // Cập nhật state local ngay lập tức để giao diện không bị giật lag hoặc trong trường hợp tải ảnh lớn
    switch(key) {
      case 'contactInfo': setContactInfo(value); break;
      case 'quote': setQuote(value); break;
      case 'historyData': setHistoryData(value); break;
      case 'heritageTitle': setHeritageTitle(value); break;
      case 'heritageList': setHeritageList(value); break;
      case 'pastoralData': setPastoralData(value); break;
      case 'receptionInfo': setReceptionInfo(value); break;
      case 'logoConfig': setLogoConfig(value); break;
      case 'heroData': setHeroData(value); break;
      case 'footerData': setFooterData(value); break;
      case 'parishStats': setParishStats(value); break;
      case 'massSchedules': setMassSchedules(value); break;
      case 'confessionData': setConfessionData(value); break;
      case 'adorationData': setAdorationData(value); break;
      case 'newsCategories': setNewsCategories(value); break;
      default: break;
    }

    if (!db || !firebaseUser) {
      toast.error('Chưa kết nối CSDL Firebase. Dữ liệu chỉnh sửa chỉ lưu tạm.');
      return;
    }

    // Phân luồng dữ liệu nặng ra các Document riêng biệt để tránh lỗi 1MB Limit
    let docId = 'main';
    if (key === 'logoConfig') docId = 'logo';
    else if (key === 'heroData') docId = 'hero';

    const loadingToast = toast.loading('Đang lưu cấu hình...');
    try {
      // Loại bỏ các giá trị undefined, NaN hoặc object không hợp lệ (như File/Event)
      const cleanValue = JSON.parse(JSON.stringify(value));
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', docId), { [key]: cleanValue }, { merge: true });
      toast.success('Lưu thành công!', { id: loadingToast });
    } catch (err) {
      console.error("Lỗi khi lưu DB:", err);
      if (err.code === 'permission-denied') {
        toast.error("Không có quyền ghi vào Database. Hãy mở Rules.", { id: loadingToast });
      } else if (err.code === 'resource-exhausted' || err.message?.includes('exceeds the maximum')) {
        toast.error("Hình ảnh quá lớn (Vượt quá 1MB).", { id: loadingToast });
      } else {
        toast.error("Lưu thất bại: " + err.message, { id: loadingToast });
      }
    }
  };

  // --- KHỞI TẠO DỮ LIỆU MẪU (MOCK DATA) ---
  const handleInitMockData = async () => {
    if (!db) return toast.error('Chưa kết nối CSDL');
    setAppConfirm({
      isOpen: true,
      title: 'Khởi tạo dữ liệu mẫu',
      message: 'Hành động này sẽ ghi đè và khởi tạo các dữ liệu mẫu lên CSDL của bạn. Bạn có chắc chắn không?',
      isDanger: true,
      onConfirm: async () => {
        setAppConfirm(prev => ({ ...prev, isOpen: false }));
        const toastId = toast.loading('Đang khởi tạo dữ liệu mẫu...');
        try {
      const mockConfig = {
        parishStats: { population: '5,420', priest: 'Lm. Giuse Nguyễn Văn A', patron: 'Các Thánh Tử Đạo VN', address: '123 Các Thánh Tử Đạo, TP.HCM', seasonTheme: 'default' },
        quote: { text: "<p>Ta là bánh hằng sống từ trời xuống. Ai ăn bánh này, sẽ được sống muôn đời.</p>", ref: "Ga 6, 51" },
        massSchedules: [
          { day: 'Thứ Hai', times: [{time: '05:00', location: 'Đền Thánh'}] },
          { day: 'Thứ Ba', times: [{time: '05:00', location: 'Đền Thánh'}, {time: '17:30', location: 'Giáo họ Phaolô'}] },
          { day: 'Thứ Tư', times: [{time: '05:00', location: 'Đền Thánh'}] },
          { day: 'Thứ Năm', times: [{time: '05:00', location: 'Đền Thánh'}, {time: '17:30', location: 'Giáo họ Giuse'}] },
          { day: 'Thứ Sáu', times: [{time: '05:00', location: 'Đền Thánh'}] },
          { day: 'Thứ Bảy', times: [{time: '05:00', location: 'Đền Thánh'}, {time: '17:30', location: 'Đền Thánh (Lễ thay Chúa Nhật)'}] },
          { day: 'Chúa Nhật', times: [{time: '05:30', location: 'Đền Thánh'}, {time: '07:30', location: 'Đền Thánh (Lễ Thiếu Nhi)'}, {time: '16:30', location: 'Giáo họ Mân Côi'}, {time: '18:30', location: 'Đền Thánh'}] },
        ],
        contactInfo: {
          title: "Liên Hệ Văn Phòng Giáo Xứ",
          address: "123 Các Thánh Tử Đạo, Phường Hoàng Yên, Quận 1, TP. HCM",
          phone: "(028) 1234 5678",
          email: "vanphong@giaoxuhoangyen.vn",
          hours: "Sáng: 08:00 - 11:30 | Chiều: 14:00 - 17:00 (Nghỉ Thứ Hai)"
        },
        confessionData: { title: "Bí Tích Giao Hòa", desc: "Trước các Thánh lễ ngày thường 30 phút và vào các giờ cố định chiều Thứ Bảy hằng tuần." },
        adorationData: { title: "Chầu Thánh Thể", desc: "Thứ Năm hằng tuần từ 19:00 - 20:00 và Thứ Sáu đầu tháng sau lễ chiều." },
        historyData: {
          title: "Dấu Ấn Lịch Sử",
          content: "<img src='https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=800&auto=format&fit=crop' style='float: left; margin: 0.5rem 1.5rem 1rem 0; width: 40%; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);' /><p>Giáo xứ Hoàng Yên được hình thành từ những hạt giống tin mừng đầu tiên gieo rắc vào cuối thế kỷ 19.</p>"
        },
        heritageTitle: "Gia Sản Thiêng Liêng",
        heritageList: [
          { id: 1, name: 'Thánh Anrê Trần An Dũng Lạc', brief: 'Linh mục, tử đạo năm 1839. Mẫu gương sáng ngời về lòng trung kiên.', image: 'https://images.unsplash.com/photo-1550404618-c2b61f879685?q=80&w=800&auto=format&fit=crop', imgFit: 'cover', imgScale: 1 },
          { id: 2, name: 'Thánh nữ Anê Lê Thị Thành', brief: 'Giáo dân, mẹ của 6 người con. Tử đạo năm 1841 vì che giấu các linh mục.', image: 'https://images.unsplash.com/photo-1544627056-a4c330f3050c?q=80&w=800&auto=format&fit=crop', imgFit: 'cover', imgScale: 1 },
          { id: 17, name: 'Thánh Vincentê Nguyễn Thế Điểm', brief: 'Linh mục, sinh năm 1761 tại Quảng Trị, bị xử giảo ngày 24/11/1838 tại Đồng Hới dưới đời vua Minh Mạng. Ngài được phong Chân Phước ngày 27/05/1900 bởi Đức Lêô XIII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 24/11.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 18, name: 'Thánh Stêphanô Nguyễn Văn Vinh', brief: 'Linh mục dòng Đa Minh, sinh năm 1814 tại Nam Định, bị xử giảo ngày 19/12/1839 tại Cổ Mê dưới đời vua Minh Mạng. Ngài được phong Chân Phước ngày 27/05/1900 bởi Đức Lêô XIII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 19/12.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 19, name: 'Thánh Giuse Vũ Duy Hiển', brief: 'Linh mục dòng Đa Minh, sinh năm 1769 tại Nam Định, bị xử trảm ngày 09/05/1840 tại Nam Định dưới thời vua Minh Mạng. Ngài được phong Chân Phước ngày 27/05/1900 bởi Đức Lêô XIII, lễ kính ngày 09/05.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 20, name: 'Thánh Bênađô Vũ Văn Duệ', brief: 'Linh mục triều, sinh năm 1755 tại Nam Định, bị xử trảm ngày 01/08/1838 tại Ba Tòa dưới đời vua Minh Mạng. Ngài được phong Chân Phước ngày 27/05/1900 bởi Đức Lêô XIII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 01/08.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 21, name: 'Thánh Anrê Nguyễn Kim Thông (Năm Thuông)', brief: 'Thầy giảng, sinh năm 1790 tại Bình Định, chết rũ tù ngày 15/07/1855 tại Mỹ Tho dưới thời vua Tự Đức. Ngài được phong Chân Phước ngày 02/05/1909 bởi Đức Piô X và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 15/07.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 22, name: 'Thánh Phêrô Nguyễn Khắc Tự', brief: 'Thầy giảng, sinh năm 1808 tại Ninh Bình, bị xử trảm ngày 10/07/1840 tại Đồng Hới dưới thời vua Minh Mạng. Ngài được phong Chân Phước ngày 27/05/1900 bởi Đức Lêô XIII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 10/07.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 23, name: 'Thánh Giuse Nguyễn Duy Khang', brief: 'Thầy giảng dòng ba Đa Minh, sinh năm 1832 tại Nam Định, bị xử trảm ngày 06/12/1861 tại Hải Dương dưới đời vua Thiệu Trị. Ngài được phong Chân Phước ngày 02/05/1909 bởi Đức Piô X và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 06/12.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 24, name: 'Thánh Phanxicô Đỗ Văn Chiểu', brief: 'Thầy giảng, sinh năm 1797 tại Nam Định, bị xử trảm ngày 25/06/1838 tại Nam Định dưới đời vua Minh Mạng. Ngài được phong Chân Phước ngày 27/05/1900 bởi Đức Lêô XIII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 25/06.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 25, name: 'Thánh Tôma Trần Văn Thiện', brief: 'Chủng sinh, sinh năm 1820 tại Quảng Bình, bị xử giảo ngày 21/09/1838 tại Nhan Biều dưới đời vua Minh Mạng. Ngài được phong Chân Phước ngày 27/05/1900 bởi Đức Lêô XIII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 21/09.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 26, name: 'Thánh Anê Lê Thị Thành', brief: 'Giáo dân, sinh năm 1781 tại Thanh Hóa, chết trong tù ngày 12/07/1841 tại Nam Định dưới đời vua Thiệu Trị. Ngài được phong Chân Phước ngày 11/04/1909 bởi Đức Piô X và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 12/07.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 27, name: 'Thánh Phêrô Thuần', brief: 'Giáo dân, sinh năm 1802 tại Thái Bình, bị thiêu sống ngày 06/06/1862 tại Nam Định dưới đời vua Tự Đức. Ngài được phong Chân Phước ngày 29/04/1951 bởi Đức Piô XII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 06/06.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 28, name: 'Thánh Giuse Trần Văn Tuấn', brief: 'Giáo dân, sinh năm 1842 tại Nam Định, bị xử trảm ngày 07/01/1862 tại Nam Định dưới thời vua Tự Đức. Ngài được phong Chân Phước ngày 29/04/1951 bởi Đức Piô XII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 07/01.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 29, name: 'Thánh Matthêô Lê Văn Gẫm', brief: 'Giáo dân (thương gia), sinh năm 1813 tại Biên Hòa, bị xử trảm ngày 11/05/1847 tại Chợ Đũi dưới đời vua Thiệu Trị. Ngài được phong Chân Phước ngày 27/05/1900 bởi Đức Lêô XIII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 11/05.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 30, name: 'Thánh Giuse Nguyễn Văn Lựu', brief: 'Trùm họ, sinh năm 1790 tại Vĩnh Long, chết rũ tù ngày 02/05/1854 tại Vĩnh Long dưới đời vua Tự Đức. Ngài được phong Chân Phước ngày 02/05/1909 bởi Đức Piô X và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 02/05.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 31, name: 'Thánh Đaminh Nguyễn Đức Mạo', brief: 'Giáo dân, sinh năm 1818 tại Phú Yên, bị xử trảm ngày 16/06/1862 tại Làng Cốc dưới đời vua Tự Đức. Ngài được phong Chân Phước ngày 29/04/1951 bởi Đức Piô XII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 16/06.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 32, name: 'Thánh Phêrô Dũng', brief: 'Giáo dân, sinh năm 1800 tại Thái Bình, bị thiêu sống ngày 06/06/1862 tại Nam Định dưới đời vua Tự Đức. Ngài được phong Chân Phước ngày 29/04/1951 bởi Đức Piô XII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 06/06.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 33, name: 'Thánh Emmanuel Lê Văn Phụng', brief: 'Giáo dân (trùm họ), sinh năm 1796 tại Cù Lao Giêng, bị xử trảm ngày 31/07/1859 tại Châu Đốc dưới đời vua Tự Đức. Ngài được phong Chân Phước ngày 11/04/1909 bởi Đức Piô X và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 31/07.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 34, name: 'Thánh Luca Phạm Viết Thìn', brief: 'Giáo dân (cai tổng), sinh năm 1820 tại Nam Định, bị xử giảo ngày 13/01/1859 tại Nam Định dưới đời vua Tự Đức. Ngài được phong Chân Phước ngày 29/04/1951 bởi Đức Piô XII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 13/01.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 35, name: 'Thánh Lôrensô Ngôn', brief: 'Giáo dân, sinh năm 1840 tại Nam Định, bị xử trảm ngày 22/05/1862 tại Nam Định dưới đời vua Tự Đức. Ngài được phong Chân Phước ngày 29/04/1951 bởi Đức Piô XII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 22/05.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 36, name: 'Thánh Đaminh Nhi', brief: 'Giáo dân, sinh năm 1822 tại Nam Định, bị xử trảm ngày 15/06/1862 tại Làng Cốc dưới thời vua Tự Đức. Ngài được phong Chân Phước ngày 29/04/1951 bởi Đức Piô XII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 16/06.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 37, name: 'Thánh Đaminh Phạm Viết Khảm', brief: 'Quan án, giáo dân dòng Ba Đa Minh, sinh năm 1780 tại Nam Định, bị xử giảo ngày 13/01/1859 tại Nam Định dưới đời vua Tự Đức. Ngài được phong Chân Phước ngày 29/04/1951 bởi Đức Piô XII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 13/01.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 38, name: 'Thánh Đaminh Ninh', brief: 'Giáo dân, sinh năm 1841 tại Nam Định, bị xử trảm ngày 02/06/1862 tại An Triêm dưới đời vua Tự Đức. Ngài được phong Chân Phước ngày 29/04/1951 bởi Đức Piô XII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 02/06.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 39, name: 'Thánh Simon Phan Đắc Hòa', brief: 'Giáo dân (y sĩ), sinh năm 1774 tại Thừa Thiên, bị xử trảm ngày 12/12/1840 tại An Hòa dưới đời vua Minh Mạng. Ngài được phong Chân Phước ngày 27/05/1900 bởi Đức Lêô XIII và được Đức Giáo Hoàng Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/1988, lễ kính ngày 12/12.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 40, name: 'Thánh Phaolô Phạm Khắc Khoan', brief: 'Linh mục, sinh năm 1771 tại Ninh Bình, bị xử trảm ngày 28/04/1840 tại Ninh Bình dưới thời vua Minh Mạng. Ngài được phong chân phước ngày 27/05/1900 bởi Đức Lêô XIII, lễ kính ngày 28/04.', image: '', imgFit: 'cover', imgScale: 1 },
          { id: 41, name: 'Thánh Phanxicô Xaviê Cần', brief: 'Thầy giảng, sinh năm 1803 tại Hà Đông, bị xử giảo ngày 20/11/1837 tại Ô Cầu Giấy dưới thời vua Minh Mạng. Ngài được phong chân phước ngày 27/05/1900 bởi Đức Lêô XIII, lễ kính ngày 20/11.', image: '', imgFit: 'cover', imgScale: 1 }
        ],
        pastoralData: {
          title: "Định Hướng Mục Vụ",
          content: "<h4>01. Đào Tạo Đức Tin Giới Trẻ</h4><p>Chú trọng sâu sát vào việc giáo dục nhân bản và giáo lý cho thiếu nhi, thanh giới trẻ.</p>"
        },
        receptionInfo: {
          item1Title: "Đăng ký đoàn", item1Desc: "Quý đoàn vui lòng báo trước 3 ngày để Giáo xứ sắp xếp.",
          item2Title: "Cơ sở vật chất", item2Desc: "Khuôn viên có bãi đỗ xe rộng rãi cho xe khách 45 chỗ.",
          item3Title: "Hỗ trợ trực tiếp", item3Desc: "Liên hệ Văn phòng Đền Thánh để được hỗ trợ tốt nhất.", item3Phone: "090.123.4567"
        },
        footerData: {
          aboutText: 'Lạy Chúa, xin cho chúng con được hiệp nhất trong tình yêu và sự phục vụ.',
          facebookLink: '#'
        }
      };

      const mockHero = { image: 'https://travelplusvn.com/public/uploads/images/Bai_Viet/11_mon_do_khong_the_thieu/Nha-tho-Duc-Ba-1.jpg', imgFit: 'cover', imgScale: 1, imgPosX: 50, imgPosY: 50 };

      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), mockConfig, { merge: true });
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'hero'), { heroData: mockHero }, { merge: true });

      const initialNewsData = [
        { id: 1, title: 'Đại lễ Kính Các Thánh Tử Đạo Việt Nam', date: '14/11/2023', category: 'Sự kiện', isFeatured: true, views: 156, desc: '<p>Chương trình hành hương và đại lễ mừng kính tại Giáo xứ Hoàng Yên diễn ra trọng thể...</p>', image: 'https://images.unsplash.com/photo-1548625361-903df390453d?q=80&w=800&auto=format&fit=crop', content: '<p>Chương trình hành hương trang trọng diễn ra trong 3 ngày...</p>' },
        { id: 2, title: 'Thông báo Giáo lý niên khóa mới', date: '10/11/2023', category: 'Giáo lý', isFeatured: true, views: 42, desc: '<p>Giáo xứ bắt đầu nhận hồ sơ đăng ký cho các lớp Đồng cỏ non, Khai tâm...</p>', image: 'https://images.unsplash.com/photo-1437603562860-1950e3ca6eab?q=80&w=800&auto=format&fit=crop', content: '<p>Văn phòng Giáo lý xin thông báo chi tiết về thời gian đăng ký...</p>' }
      ];
      for (const item of initialNewsData) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'news', item.id.toString()), item);
      }

      const initialPilgrimageData = [
        { id: 1, title: 'Hành Hương Đức Mẹ La Vang', date: '15/06/2024', duration: '3 Ngày 2 Đêm', status: 'Đang mở đăng ký', desc: 'Hành trình thiêng liêng về với Đức Mẹ.', image: 'https://images.unsplash.com/photo-1548625361-903df390453d?q=80&w=800&auto=format&fit=crop', content: '<p>Chương trình chi tiết...</p>' }
      ];
      for (const item of initialPilgrimageData) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pilgrimages', item.id.toString()), item);
      }

      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const initialLiturgy = [
        { date: `${y}-${m}-01`, title: 'Thứ Sáu Đầu Tháng', colorType: 'red', desc: 'Thánh lễ lúc 18h30.' },
        { date: `${y}-${m}-15`, title: 'Lễ Bổn Mạng', colorType: 'white', desc: 'Thánh lễ tạ ơn.' }
      ];
      for (const item of initialLiturgy) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'liturgy', item.date), item);
      }

      toast.success('Đã khởi tạo dữ liệu mẫu thành công!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi khởi tạo dữ liệu: ' + err.message, { id: toastId });
    }
      }
    });
  };

  // ==========================================
  // HANDLERS
  // ==========================================

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 50); setShowTopBtn(window.scrollY > 400); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Hiệu ứng thanh tiến trình (Progress bar) & Smooth Scroll khi chuyển trang
    setLoadingProgress(30);
    const timer1 = setTimeout(() => setLoadingProgress(70), 150);
    const timer2 = setTimeout(() => setLoadingProgress(100), 400);
    const timer3 = setTimeout(() => setLoadingProgress(0), 700);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, [location.pathname]);

  const handleLoginSubmit = async (redirectToAdmin = false) => {
    if (!email || !password) {
      setLoginError('Vui lòng nhập email và mật khẩu!');
      return;
    }
    const toastId = toast.loading('Đang đăng nhập...');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLoginModal(false); 
      setEmail('');
      setPassword(''); 
      setLoginError(''); 
      toast.success('Đăng nhập thành công!', { id: toastId });
      if (redirectToAdmin === true) navigate('/admin');
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setLoginError('Email hoặc mật khẩu không chính xác!');
      toast.error('Đăng nhập thất bại', { id: toastId });
    }
  };

  const handleGoogleLogin = async (redirectToAdmin = false) => {
    const provider = new GoogleAuthProvider();
    const toastId = toast.loading('Đang đăng nhập bằng Google...');
    try {
      await signInWithPopup(auth, provider);
      setShowLoginModal(false);
      setEmail('');
      setPassword('');
      setLoginError('');
      toast.success('Đăng nhập thành công!', { id: toastId });
      if (redirectToAdmin) navigate('/admin');
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
      // Nếu trình duyệt chặn Popup -> Chuyển sang Redirect để không bị lỗi
      if (error.code === 'auth/popup-blocked' || error.message.includes('Cross-Origin-Opener-Policy') || error.message.includes('popup')) {
        toast.loading('Trình duyệt chặn Popup, đang chuyển hướng trang...', { id: toastId });
        signInWithRedirect(auth, provider).catch(err => {
          toast.error('Lỗi chuyển hướng: ' + err.message, { id: toastId });
        });
      } else {
        setLoginError('Đăng nhập Google thất bại!');
        toast.error('Đăng nhập thất bại: ' + error.message, { id: toastId });
      }
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!db) {
      toast.error('Chưa kết nối CSDL, không thể gửi!');
      return;
    }
    const toastId = toast.loading('Đang gửi thông tin...');
    try {
      const formData = new FormData(e.target);
      const newMsg = {
        sender: formData.get('sender'), phone: formData.get('phone'),
        topic: formData.get('topic'), content: formData.get('content'),
        status: 'new', createdAt: Date.now(), dateStr: getTodayFormattedStr()
      };
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'messages', newMsg.createdAt.toString()), newMsg);
      toast.success('Gửi thông tin thành công!', { id: toastId });
      setFormStatus('success');
      setTimeout(() => setFormStatus(''), 4000);
      e.target.reset();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi gửi. Vui lòng thử lại!', { id: toastId });
    }
  };

  const getTodayFormattedStr = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  };

  const handleImagePaste = async (e, setterFunction) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
      const item = items[index];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        const localUrl = URL.createObjectURL(file);
        setterFunction(prev => ({ ...prev, image: localUrl }));
        e.preventDefault();
        
        const toastId = toast.loading('Đang tải ảnh lên Storage...');
        setIsUploading(true);
        try {
          const fileName = `images/paste_${Date.now()}.png`;
          const fileData = new Uint8Array(await file.arrayBuffer());
          
          const res = await fetch(`/api/r2?action=presign&key=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(file.type)}`);
          const { uploadUrl, publicUrl } = await res.json();
          
          const uploadRes = await fetch(uploadUrl, { method: 'PUT', body: fileData, headers: { 'Content-Type': file.type } });
          if (!uploadRes.ok) throw new Error('Upload không thành công');
          
          setterFunction(prev => ({ ...prev, image: publicUrl }));
          toast.success('Tải ảnh thành công!', { id: toastId });
        } catch (error) {
            console.error("Lỗi upload ảnh:", error);
            toast.error('Lỗi upload: Vui lòng kiểm tra cấu hình CORS của R2!', { id: toastId });
            setterFunction(prev => ({ ...prev, image: prev?.image === localUrl ? '' : prev?.image }));
          } finally {
            setIsUploading(false);
          }
        break;
      }
    }
  };

  const handleImageUpload = async (e, setterFunction) => {
    const file = e.target.files[0];
    if (file) {
      // Hiển thị ảnh preview ngay lập tức
      setterFunction(prev => ({ ...prev, image: URL.createObjectURL(file) }));

      const toastId = toast.loading('Đang nén và tối ưu ảnh...');
      setIsUploading(true);
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.8
        }
        
        const compressedFile = await imageCompression(file, options);
        const fileData = new Uint8Array(await compressedFile.arrayBuffer());
        const fileName = `images/upload_${Date.now()}_${compressedFile.name}`;
        
        const res = await fetch(`/api/r2?action=presign&key=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(compressedFile.type)}`);
        const { uploadUrl, publicUrl } = await res.json();
        
        const uploadRes = await fetch(uploadUrl, { method: 'PUT', body: fileData, headers: { 'Content-Type': compressedFile.type } });
        if (!uploadRes.ok) throw new Error('Upload không thành công');
        
        setterFunction(prev => ({ ...prev, image: publicUrl }));
        toast.success('Tải ảnh thành công!', { id: toastId });
      } catch (error) {
          console.error("Lỗi upload ảnh:", error);
          toast.error('Lỗi upload: Vui lòng kiểm tra cấu hình CORS của R2!', { id: toastId });
          setterFunction(prev => ({ ...prev, image: prev?.image === localUrl ? '' : prev?.image }));
        } finally {
          setIsUploading(false);
        }
    }
  };

  const prevMonth = () => { setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1)); };
  const nextMonth = () => { setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1)); };

  const isSolidHeader = scrolled || location.pathname !== '/';
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Đọc Mùa Phụng Vụ đang được cấu hình
  const currentSeason = parishStats.seasonTheme || 'default';

  return (
    <div className="min-h-screen bg-white font-serif selection:bg-pink-100 antialiased relative overflow-x-hidden">
      <Toaster position="bottom-right" toastOptions={{ style: { fontSize: '12px', fontWeight: 'bold', fontFamily: 'sans-serif' } }} />
      
      {/* Thanh Tiến trình Tải trang */}
      {loadingProgress > 0 && (
        <div 
          className="fixed top-0 left-0 h-1 bg-pink-500 z-[200] transition-all duration-300 ease-out"
          style={{ width: `${loadingProgress}%`, opacity: loadingProgress === 100 ? 0 : 1 }}
        ></div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-pink-300, #f9a8d4); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: var(--color-pink-400, #f472b6); }
        @keyframes snowfall { 0% { transform: translateY(0) translateX(0) rotate(0deg); } 100% { transform: translateY(105vh) translateX(20px) rotate(360deg); } }
        .animate-snowfall { animation: snowfall linear infinite; }
        @keyframes float-up { 0% { transform: translateY(0) scale(0.8); opacity: 0; } 20% { opacity: var(--tw-opacity, 1); } 80% { opacity: var(--tw-opacity, 1); } 100% { transform: translateY(-105vh) scale(1.2); opacity: 0; } }
        .animate-float-up { animation: float-up ease-in-out infinite; }
        ${getThemeCSS(currentSeason)}
      `}} />

      <SeasonalEffects season={currentSeason} />

      {/* ========================================== */}
      {/* TRÌNH ĐIỀU HƯỚNG (HEADER) */}
      {/* ========================================== */}
      {!isAdminRoute && <Header 
        isAdmin={isAdmin}
        isSolidHeader={isSolidHeader}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        logoConfig={logoConfig}
        setTempLogoConfig={setTempLogoConfig}
        setEditingLogo={setEditingLogo}
      />}

      {/* NỘI DUNG CHÍNH */}
      <main className={`pt-0 min-h-[70vh] ${isAdminRoute ? 'bg-stone-50' : 'bg-white'}`}>
          <Routes>
            <Route path="/" element={<Home isAdmin={isAdmin} heroData={heroData} setTempHero={setTempHero} setEditingHero={setEditingHero} quote={quote} setTempQuote={setTempQuote} setEditingQuote={setEditingQuote} massSchedules={massSchedules} setTempMass={setTempMass} setEditingMass={setEditingMass} contactInfo={contactInfo} setTempContact={setTempContact} setEditingQuickPhone={setEditingQuickPhone} newsItems={newsItems} setSelectedNews={setSelectedNews} liturgyEvents={liturgyEvents} />} />
            <Route path="/gioi-thieu" element={<About isAdmin={isAdmin} parishStats={parishStats} setTempStats={setTempStats} setEditingStats={setEditingStats} historyData={historyData} setTempHistory={setTempHistory} setEditingHistory={setEditingHistory} heritageTitle={heritageTitle} setTempHeritageTitle={setTempHeritageTitle} setEditingHeritageTitle={setEditingHeritageTitle} heritageList={heritageList} setTempHeritageItem={setTempHeritageItem} setEditingHeritageItem={setEditingHeritageItem} pastoralData={pastoralData} setTempPastoral={setTempPastoral} setEditingPastoral={setEditingPastoral} handleReorderHeritage={handleReorderHeritage} />} />
            <Route path="/phung-vu" element={<Liturgy isAdmin={isAdmin} selectedDate={selectedDate} setSelectedDate={setSelectedDate} calendarDate={calendarDate} prevMonth={prevMonth} nextMonth={nextMonth} liturgyEvents={liturgyEvents} massSchedules={massSchedules} setTempMass={setTempMass} setEditingMass={setEditingMass} confessionData={confessionData} setTempConfession={setTempConfession} setEditingConfession={setEditingConfession} adorationData={adorationData} setTempAdoration={setTempAdoration} setEditingAdoration={setEditingAdoration} setTempLiturgyEvent={setTempLiturgyEvent} setEditingLiturgyEvent={setEditingLiturgyEvent} />} />
            <Route path="/hanh-huong" element={<Pilgrimage isAdmin={isAdmin} pilgrimagePlans={pilgrimagePlans} pilgrimagePage={pilgrimagePage} setPilgrimagePage={setPilgrimagePage} itemsPerPage={itemsPerPage} setSelectedPilgrimage={setSelectedPilgrimage} setTempPilgrimage={setTempPilgrimage} setEditingPilgrimage={setEditingPilgrimage} receptionInfo={receptionInfo} setTempReception={setTempReception} setEditingReception={setEditingReception} />} />
            <Route path="/hanh-huong/:id" element={<PilgrimageDetail isAdmin={isAdmin} pilgrimagePlans={pilgrimagePlans} setTempPilgrimage={setTempPilgrimage} setEditingPilgrimage={setEditingPilgrimage} />} />
            <Route path="/tin-tuc" element={<News isAdmin={isAdmin} newsItems={newsItems} newsPage={newsPage} setNewsPage={setNewsPage} newsPerPage={newsPerPage} setSelectedNews={setSelectedNews} setTempNews={setTempNews} setEditingNews={setEditingNews} getTodayFormattedStr={getTodayFormattedStr} />} />
            <Route path="/tin-tuc/:id" element={<NewsDetail isAdmin={isAdmin} newsItems={newsItems} setTempNews={setTempNews} setEditingNews={setEditingNews} />} />
            <Route path="/lien-he" element={<Contact isAdmin={isAdmin} contactInfo={contactInfo} setTempContact={setTempContact} setEditingContact={setEditingContact} formStatus={formStatus} handleContactSubmit={handleContactSubmit} />} />
            <Route path="/admin/*" element={<AdminDashboard 
              isAdmin={isAdmin} setShowLoginModal={setShowLoginModal} setIsAdmin={setIsAdmin} parishStats={parishStats} newsItems={newsItems} pilgrimagePlans={pilgrimagePlans} liturgyEvents={liturgyEvents} 
              setTempNews={setTempNews} setEditingNews={setEditingNews} massSchedules={massSchedules} setTempMass={setTempMass} setEditingMass={setEditingMass} 
              confessionData={confessionData} setTempConfession={setTempConfession} setEditingConfession={setEditingConfession} adorationData={adorationData} setTempAdoration={setTempAdoration} setEditingAdoration={setEditingAdoration} 
              setTempLiturgyEvent={setTempLiturgyEvent} setEditingLiturgyEvent={setEditingLiturgyEvent} setTempPilgrimage={setTempPilgrimage} setEditingPilgrimage={setEditingPilgrimage} 
              receptionInfo={receptionInfo} setTempReception={setTempReception} setEditingReception={setEditingReception} 
              logoConfig={logoConfig} setTempLogoConfig={setTempLogoConfig} setEditingLogo={setEditingLogo} heroData={heroData} setTempHero={setTempHero} setEditingHero={setEditingHero}
              footerData={footerData} setTempFooter={setTempFooter} setEditingFooter={setEditingFooter} contactInfo={contactInfo} setTempContact={setTempContact} setEditingContact={setEditingContact} setTempStats={setTempStats} setEditingStats={setEditingStats}
              messages={messages} setAppConfirm={setAppConfirm} dailyVisits={dailyVisits}
            />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </main>

      {/* CHÂN TRANG (FOOTER) */}
      {!isAdminRoute && <Footer 
        isAdmin={isAdmin}
        footerData={footerData}
        contactInfo={contactInfo}
        logoConfig={logoConfig}
        setTempFooter={setTempFooter}
        setTempContact={setTempContact}
        setEditingFooter={setEditingFooter}
        setShowLoginModal={setShowLoginModal}
        setIsAdmin={setIsAdmin}
      />}

      {!isAdminRoute && showTopBtn && <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 p-2.5 bg-pink-700 text-white rounded-full shadow-xl z-50 active:scale-90 transition-all hover:bg-pink-800"><ArrowUp size={20} /></button>}

      {/* ========================================== */}
      {/* MODALS QUẢN TRỊ (ADMIN) */}
      {/* ========================================== */}

      {showLoginModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border-t-4 border-pink-600 relative">
             <button onClick={() => {setShowLoginModal(false); setLoginError(''); setEmail(''); setPassword('');}} className="absolute top-3 right-3 text-stone-400 hover:text-stone-600"><X size={18}/></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase tracking-tight">Đăng Nhập Admin</h3>
            <input type="email" placeholder="Email Admin" className={`w-full border p-3 mb-2 text-center text-sm outline-none focus:border-pink-500 font-serif rounded ${loginError ? 'border-red-400' : 'border-pink-200'}`} value={email} onChange={(e) => {setEmail(e.target.value); setLoginError('');}} onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit(false)} />
            <input type="password" placeholder="Nhập mật khẩu" className={`w-full border p-3 mb-2 text-center text-sm outline-none focus:border-pink-500 font-serif rounded ${loginError ? 'border-red-400' : 'border-pink-200'}`} value={password} onChange={(e) => {setPassword(e.target.value); setLoginError('');}} onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit(false)} />
            <div className="h-6 mb-4">{loginError && <p className="text-red-500 text-xs font-bold animate-in slide-in-from-top-1">{loginError}</p>}</div>
            <div className="flex flex-col gap-3">
              <button className="w-full bg-white border border-stone-200 text-stone-700 py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-sm active:scale-95 transition-all hover:bg-stone-50 flex items-center justify-center gap-2" onClick={() => handleGoogleLogin(true)}>
                <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google (Vào Dashboard)
              </button>
              <button className="w-full bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => handleLoginSubmit(true)}>Đăng Nhập Email & Vào Dashboard</button>
              <div className="flex gap-3">
                <button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => {setShowLoginModal(false); setLoginError(''); setEmail(''); setPassword('');}}>Hủy</button>
                <button className="flex-1 bg-pink-100 text-pink-700 py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-sm active:scale-95 transition-all hover:bg-pink-200" onClick={() => handleLoginSubmit(false)}>Sửa Trực Tiếp</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingContact && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-t-4 border-pink-600 custom-scrollbar relative">
             <button onClick={() => setEditingContact(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600"><X size={20}/></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Sửa Thông Tin Liên Hệ</h3>
            <div className="space-y-4 mb-8">
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Tiêu đề</label><input className="w-full border border-pink-200 p-2.5 rounded outline-none text-sm font-bold focus:border-pink-500" value={tempContact.title || ''} onChange={e => setTempContact({...tempContact, title: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Địa chỉ</label><input className="w-full border border-pink-200 p-2.5 rounded outline-none text-sm focus:border-pink-500" value={tempContact.address || ''} onChange={e => setTempContact({...tempContact, address: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Điện thoại</label><input className="w-full border border-pink-200 p-2.5 rounded outline-none text-sm focus:border-pink-500" value={tempContact.phone || ''} onChange={e => setTempContact({...tempContact, phone: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Email</label><input className="w-full border border-pink-200 p-2.5 rounded outline-none text-sm focus:border-pink-500" value={tempContact.email || ''} onChange={e => setTempContact({...tempContact, email: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Giờ làm việc</label><input className="w-full border border-pink-200 p-2.5 rounded outline-none text-sm font-serif focus:border-pink-500" value={tempContact.hours || ''} onChange={e => setTempContact({...tempContact, hours: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Link Nhúng Bản Đồ (Google Maps Embed src)</label><textarea className="w-full border border-pink-200 p-2.5 rounded outline-none text-[11px] h-20 font-mono focus:border-pink-500 custom-scrollbar" value={tempContact.mapUrl || ''} onChange={e => setTempContact({...tempContact, mapUrl: e.target.value})} placeholder="https://www.google.com/maps/embed?..." /></div>
            </div>
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingContact(false)}>Hủy</button><button className="flex-[2] bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow active:scale-95 transition-all hover:bg-pink-800" onClick={() => { saveConfigToDB('contactInfo', tempContact); setEditingContact(false); }}>Lưu Lại</button></div>
          </div>
        </div>
      )}

      {editingQuote && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-t-4 border-pink-600 custom-scrollbar relative">
            <button onClick={() => setEditingQuote(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600"><X size={20}/></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Sửa Lời Chúa</h3>
            <div className="mb-5"><RichTextEditor value={tempQuote.text || ''} onChange={(val) => setTempQuote({...tempQuote, text: val})} /></div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1 tracking-widest">Nguồn (Ví dụ: Ga 1, 1)</label>
            <input className="w-full border border-pink-200 p-3 mb-6 text-sm font-bold text-pink-800 rounded focus:border-pink-500 outline-none" value={tempQuote.ref || ''} onChange={(e) => setTempQuote({...tempQuote, ref: e.target.value})} />
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingQuote(false)}>Hủy</button><button className="flex-[2] bg-pink-700 text-white rounded py-3 font-bold uppercase text-[10px] tracking-widest shadow active:scale-95 transition-all hover:bg-pink-800" onClick={() => { saveConfigToDB('quote', tempQuote); setEditingQuote(false); }}>Lưu Lại</button></div>
          </div>
        </div>
      )}

      {!!editingNews && tempNews && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-t-4 border-pink-600 custom-scrollbar relative">
            <button onClick={() => setEditingNews(null)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase tracking-tight">{editingNews === 'new' ? 'Tạo Bản Tin Mới' : 'Chỉnh Sửa Bản Tin'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
              <div><label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Ngày đăng</label><input className="w-full border border-pink-200 p-3 rounded text-sm bg-stone-50 outline-none focus:border-pink-500" value={tempNews.date || ''} onChange={(e) => setTempNews({...tempNews, date: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Lượt Xem Hiện Tại</label><input type="number" className="w-full border border-pink-200 p-3 rounded text-sm bg-white outline-none focus:border-pink-500" value={tempNews.views || 0} onChange={(e) => setTempNews({...tempNews, views: parseInt(e.target.value) || 0})} /></div>
              <div><label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Chuyên mục</label><div className="flex gap-2"><select className="w-full border border-pink-200 p-3 rounded text-sm bg-white outline-none cursor-pointer focus:border-pink-500 flex-1" value={tempNews.category || newsCategories[0]} onChange={(e) => setTempNews({...tempNews, category: e.target.value})}>{newsCategories?.map(c => <option key={c} value={c}>{c}</option>)}</select><button type="button" onClick={() => { 
                setAppPrompt({
                  isOpen: true, title: 'Chỉnh sửa chuyên mục', desc: 'Nhập các chuyên mục mới, cách nhau bằng dấu phẩy (,):', defaultValue: newsCategories?.join(", ") || '',
                  onConfirm: (res) => {
                    setAppPrompt({ ...appPrompt, isOpen: false });
                    if (res && res.trim() !== '') {
                      const arr = res.split(",").map(s => s.trim()).filter(Boolean);
                      if (arr.length) saveConfigToDB('newsCategories', arr);
                    }
                  }
                });
              }} className="px-3 bg-pink-50 text-pink-700 rounded border border-pink-200 hover:bg-pink-100 transition" title="Chỉnh sửa danh sách chuyên mục"><Edit3 size={16} /></button></div></div>
              <div><label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Trạng thái</label><select className="w-full border border-pink-200 p-3 rounded text-sm bg-white outline-none cursor-pointer focus:border-pink-500 font-bold" value={tempNews.status || 'published'} onChange={(e) => setTempNews({...tempNews, status: e.target.value})}><option value="published" className="text-emerald-600">Đã xuất bản</option><option value="draft" className="text-stone-500">Lưu nháp (Ẩn)</option></select></div>
            </div>
            <div className="mb-6 flex items-center">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={tempNews.isFeatured || false} onChange={e => setTempNews({...tempNews, isFeatured: e.target.checked})} className="w-4 h-4 text-pink-600 accent-pink-600 cursor-pointer" />
                <span className="text-sm font-bold text-pink-900 group-hover:text-pink-700 transition">Ghim làm Tin Nổi Bật (Hiển thị to ở trang Tin Tức)</span>
              </label>
            </div>
            
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Hình ảnh đại diện (Link URL hoặc Chọn tệp)</label>
            <div className="flex flex-col gap-2 mb-2">
               <input className="w-full border border-pink-200 p-3 rounded text-sm bg-white outline-none focus:border-pink-500" value={tempNews.image || ''} onChange={(e) => setTempNews({...tempNews, image: e.target.value})} onPaste={(e) => handleImagePaste(e, setTempNews)} placeholder="Dán link ảnh tại đây..." />
               <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setTempNews)} className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer" />
            </div>
            <ImageAdjuster data={tempNews} setData={setTempNews} aspectClass="aspect-[21/9] w-full rounded-lg" />

            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 mt-6 block">Tiêu đề bài viết</label>
            <input className="w-full border border-pink-200 p-3 rounded mb-6 font-bold text-lg outline-none focus:border-pink-600" value={tempNews.title || ''} onChange={(e) => setTempNews({...tempNews, title: e.target.value})} placeholder="Nhập tiêu đề..." />
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div><label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Mô tả ngắn</label><RichTextEditor value={tempNews.desc || ''} onChange={(val) => setTempNews({...tempNews, desc: val})} minHeight="100px" /></div>
              <div><label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Nội dung chi tiết</label><RichTextEditor value={tempNews.content || ''} onChange={(val) => setTempNews({...tempNews, content: val})} minHeight="250px" /></div>
            </div>
            <div className="flex gap-4 border-t pt-5 mt-6">
              {editingNews !== 'new' && <button type="button" className="text-red-600 px-6 py-3 font-bold text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-50 transition-all rounded" onClick={async () => { 
                if(!db) return;
                try {
                  await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'news', tempNews.id.toString())); 
                  if (selectedNews?.id === tempNews.id) { setSelectedNews(null); navigate('/tin-tuc'); } 
                  setEditingNews(null); 
                  toast.success('Đã xóa bản tin!');
                } catch(e) { 
                  console.error("Lỗi xóa tin tức:", e);
                  toast.error("Lỗi khi xóa bài: " + e.message); 
                }
              }}>Xóa Bản Tin</button>}
              <div className="flex-1"></div>
              <button className="bg-stone-100 px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingNews(null)}>Hủy Bỏ</button>
              <button className="bg-pink-700 text-white px-10 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={async () => { 
                if (isUploading) return toast.error('Vui lòng chờ ảnh tải lên hoàn tất!');
                if (!tempNews.title) return alert('Vui lòng nhập tiêu đề'); 
                if (!db) return alert('Chưa kết nối CSDL');
                try {
                  const id = tempNews.id || Date.now();
          // Làm sạch dữ liệu trước khi lưu Firebase
          const d = JSON.parse(JSON.stringify({ ...tempNews, id, views: tempNews.views || 0, status: tempNews.status || 'published' }));
                  await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'news', id.toString()), d);
                  if (selectedNews?.id === id) setSelectedNews(d); 
                  setEditingNews(null); 
                  toast.success('Đã lưu bài viết thành công!');
                } catch(e) { 
                  console.error("Lỗi lưu tin tức:", e);
                  toast.error("Lỗi khi lưu bài: " + e.message); 
                }
              }}>Lưu Bài Viết</button>
            </div>
          </div>
        </div>
      )}

      {editingHistory && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-t-4 border-pink-600 custom-scrollbar relative">
             <button onClick={() => setEditingHistory(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Sửa Lịch Sử Hình Thành</h3>
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Tiêu đề Lịch Sử</label>
            <input className="w-full border border-pink-200 p-3 rounded mb-5 text-base font-serif font-bold bg-white outline-none focus:border-pink-500" value={tempHistory.title || ''} onChange={(e) => setTempHistory({...tempHistory, title: e.target.value})} />
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Nội dung Lịch Sử (Chọn ảnh và bấm các nút Căn trái/phải trên thanh công cụ để sắp xếp ảnh dọc theo văn bản)</label>
            <RichTextEditor value={tempHistory.content || ''} onChange={(val) => setTempHistory({...tempHistory, content: val})} minHeight="400px" />
            <div className="flex gap-4 pt-6 border-t mt-6"><div className="flex-1"></div><button className="bg-stone-100 px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingHistory(false)}>Hủy</button><button className="bg-pink-700 text-white px-10 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { saveConfigToDB('historyData', tempHistory); setEditingHistory(false); }}>Cập Nhật Lịch Sử</button></div>
          </div>
        </div>
      )}

      {editingHeritageTitle && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-pink-600 relative">
            <h3 className="text-lg font-bold text-pink-950 mb-5 uppercase text-center tracking-tight">Sửa Tiêu Đề Gia Sản</h3>
            <input className="w-full border border-pink-200 p-3 mb-6 rounded text-center text-base font-serif outline-none focus:border-pink-500 font-bold text-pink-950" value={tempHeritageTitle || ''} onChange={(e) => setTempHeritageTitle(e.target.value)} />
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] hover:bg-stone-200 transition" onClick={() => setEditingHeritageTitle(false)}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] shadow hover:bg-pink-800 transition" onClick={() => { saveConfigToDB('heritageTitle', tempHeritageTitle); setEditingHeritageTitle(false); }}>Lưu Lại</button></div>
          </div>
        </div>
      )}

      {editingHeritageItem !== null && tempHeritageItem && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border-t-4 border-pink-600 custom-scrollbar relative">
            <button onClick={() => setEditingHeritageItem(null)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">{editingHeritageItem === 'new' ? 'Thêm Vị Thánh' : 'Sửa Thông Tin Thánh'}</h3>
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Tên Vị Thánh</label>
            <input className="w-full border border-pink-200 p-3 rounded mb-5 text-base font-serif font-bold bg-stone-50 outline-none focus:border-pink-500" value={tempHeritageItem.name || ''} onChange={(e) => setTempHeritageItem({...tempHeritageItem, name: e.target.value})} placeholder="VD: Thánh Anrê Trần An Dũng Lạc" />
            
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Hình Ảnh Đại Diện (Link URL hoặc Chọn tệp)</label>
            <div className="flex flex-col gap-2 mb-2">
               <input className="flex-1 w-full border border-pink-200 p-3 rounded text-sm bg-white outline-none focus:border-pink-500" value={tempHeritageItem.image || ''} onChange={(e) => setTempHeritageItem({...tempHeritageItem, image: e.target.value})} onPaste={(e) => handleImagePaste(e, setTempHeritageItem)} placeholder="Dán link ảnh tại đây..." />
               <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setTempHeritageItem)} className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer" />
            </div>
            <ImageAdjuster data={tempHeritageItem} setData={setTempHeritageItem} aspectClass="aspect-square w-40 rounded-full" />

            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 mt-6 block">Tiểu sử sơ lược</label>
            <textarea className="w-full border border-pink-200 p-3 rounded h-28 text-sm font-serif leading-relaxed outline-none focus:border-pink-500 custom-scrollbar" value={tempHeritageItem.brief || ''} onChange={(e) => setTempHeritageItem({...tempHeritageItem, brief: e.target.value})} placeholder="Nhập sơ lược tiểu sử..." />
            <div className="flex gap-4 pt-6 border-t mt-6">
              {editingHeritageItem !== 'new' && <button className="text-red-600 px-6 py-3 font-bold text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-50 transition-all rounded" onClick={() => { 
                const targetId = tempHeritageItem.id;
                const targetName = tempHeritageItem.name;
                setAppConfirm({
                  isOpen: true, title: 'Xóa Vị Thánh', message: `Bạn có chắc chắn muốn xóa "${targetName}" khỏi danh sách không?`, isDanger: true,
                  onConfirm: () => {
                    setAppConfirm(prev => ({ ...prev, isOpen: false }));
                    setHeritageList(prevList => {
                      const nl = prevList.filter(item => String(item.id) !== String(targetId)); 
                      saveConfigToDB('heritageList', nl).then(() => {
                        setEditingHeritageItem(null); 
                        toast.success('Đã xóa Vị Thánh!');
                      });
                      return nl;
                    });
                  }
                });
              }}>Xóa Vị Thánh</button>}
              <div className="flex-1"></div>
              <button className="bg-stone-100 px-6 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingHeritageItem(null)}>Hủy</button>
              <button className="bg-pink-700 text-white px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { 
                if (isUploading) return toast.error('Vui lòng chờ ảnh tải lên hoàn tất!');
                if (tempHeritageItem.image && tempHeritageItem.image.startsWith('data:image')) return toast.error('Lỗi: Ảnh quá nặng. Vui lòng chọn ảnh khác!');
                if (!tempHeritageItem.name) return toast.error('Vui lòng nhập tên Vị Thánh!'); 
                setHeritageList(prevList => {
                  let nl;
                  if (editingHeritageItem === 'new') nl = [...prevList, tempHeritageItem]; 
                  else nl = prevList.map(item => String(item.id) === String(tempHeritageItem.id) ? tempHeritageItem : item); 
                  saveConfigToDB('heritageList', nl).then(() => {
                    setEditingHeritageItem(null); 
                    toast.success('Đã lưu Vị Thánh!');
                  });
                  return nl;
                });
              }}>Lưu Lại</button>
            </div>
          </div>
        </div>
      )}

      {editingPastoral && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-t-4 border-pink-600 custom-scrollbar relative">
             <button onClick={() => setEditingPastoral(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Sửa Định Hướng Mục Vụ</h3>
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Tiêu đề</label>
            <input className="w-full border border-pink-200 p-3 rounded mb-5 text-base font-serif font-bold bg-white outline-none focus:border-pink-500" value={tempPastoral.title || ''} onChange={(e) => setTempPastoral({...tempPastoral, title: e.target.value})} />
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Nội dung Định Hướng</label>
            <RichTextEditor value={tempPastoral.content || ''} onChange={(val) => setTempPastoral({...tempPastoral, content: val})} minHeight="300px" />
            <div className="flex gap-4 pt-6 border-t mt-6"><div className="flex-1"></div><button className="bg-stone-100 px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingPastoral(false)}>Hủy</button><button className="bg-pink-700 text-white px-10 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { saveConfigToDB('pastoralData', tempPastoral); setEditingPastoral(false); }}>Lưu Định Hướng</button></div>
          </div>
        </div>
      )}

      {editingPilgrimage !== null && tempPilgrimage && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-t-4 border-pink-600 custom-scrollbar relative">
            <button onClick={() => setEditingPilgrimage(null)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase tracking-tight">{editingPilgrimage === 'new' ? 'Thêm Kế Hoạch Hành Hương' : 'Sửa Kế Hoạch Hành Hương'}</h3>
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Tiêu đề chương trình</label>
            <input className="w-full border border-pink-200 p-3 rounded mb-5 font-bold text-lg outline-none focus:border-pink-600" value={tempPilgrimage.title || ''} onChange={(e) => setTempPilgrimage({...tempPilgrimage, title: e.target.value})} placeholder="Nhập tiêu đề..." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              <div><label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Ngày diễn ra</label><input className="w-full border border-pink-200 p-3 rounded text-sm bg-stone-50 outline-none focus:border-pink-500" value={tempPilgrimage.date || ''} onChange={(e) => setTempPilgrimage({...tempPilgrimage, date: e.target.value})} placeholder="VD: 15/06/2024" /></div>
              <div><label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Thời lượng</label><input className="w-full border border-pink-200 p-3 rounded text-sm bg-stone-50 outline-none focus:border-pink-500" value={tempPilgrimage.duration || ''} onChange={(e) => setTempPilgrimage({...tempPilgrimage, duration: e.target.value})} placeholder="VD: 3 Ngày 2 Đêm" /></div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Trạng Thái</label>
                <select className="w-full border border-pink-200 p-3 rounded text-sm font-bold bg-white outline-none cursor-pointer focus:border-pink-500" value={tempPilgrimage.status || 'Đang mở đăng ký'} onChange={(e) => setTempPilgrimage({...tempPilgrimage, status: e.target.value})}>
                  <option value="Đang mở đăng ký">Đang mở đăng ký</option><option value="Sắp diễn ra">Sắp diễn ra</option><option value="Đã kết thúc">Đã kết thúc</option>
                </select>
              </div>
            </div>
            
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Hình ảnh đại diện (Link URL hoặc Chọn tệp)</label>
            <div className="flex flex-col gap-2 mb-2">
               <input className="flex-1 w-full border border-pink-200 p-3 rounded text-sm bg-white outline-none focus:border-pink-500" value={tempPilgrimage.image || ''} onChange={(e) => setTempPilgrimage({...tempPilgrimage, image: e.target.value})} onPaste={(e) => handleImagePaste(e, setTempPilgrimage)} placeholder="Dán link ảnh tại đây..." />
               <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setTempPilgrimage)} className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer" />
            </div>
            <ImageAdjuster data={tempPilgrimage} setData={setTempPilgrimage} aspectClass="aspect-[21/9] w-full rounded-lg" />

            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 mt-6 block">Mô tả ngắn gọn (Hiển thị bên ngoài thẻ)</label>
            <textarea className="w-full border border-pink-200 p-3 rounded mb-5 h-20 text-sm font-serif outline-none focus:border-pink-600 custom-scrollbar" value={tempPilgrimage.desc || ''} onChange={(e) => setTempPilgrimage({...tempPilgrimage, desc: e.target.value})} placeholder="Nhập mô tả ngắn..." />
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Nội dung chương trình chi tiết</label>
            <div className="mb-6"><RichTextEditor value={tempPilgrimage.content || ''} onChange={(val) => setTempPilgrimage({...tempPilgrimage, content: val})} minHeight="250px" /></div>
            <div className="flex gap-4 border-t pt-5 mt-6">
              {editingPilgrimage !== 'new' && <button type="button" className="text-red-600 px-6 py-3 font-bold text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-50 transition-all rounded" onClick={async () => { 
                if(!db) return;
                try {
                  await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pilgrimages', tempPilgrimage.id.toString())); 
                  if (selectedPilgrimage?.id === tempPilgrimage.id) { setSelectedPilgrimage(null); navigate('/hanh-huong'); } 
                  setEditingPilgrimage(null); 
                  toast.success('Đã xóa kế hoạch!');
                } catch(e) { 
                  console.error("Lỗi xóa hành hương:", e);
                  toast.error("Lỗi xóa kế hoạch: " + e.message); 
                }
              }}>Xóa Kế Hoạch</button>}
              <div className="flex-1"></div>
              <button className="bg-stone-100 px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingPilgrimage(null)}>Hủy Bỏ</button>
              <button className="bg-pink-700 text-white px-10 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={async () => { 
                if (isUploading) return toast.error('Vui lòng chờ ảnh tải lên hoàn tất!');
                if (!tempPilgrimage.title || tempPilgrimage.title.trim() === '') return alert('Vui lòng nhập tên chương trình');
                if(!db) return alert("Chưa kết nối CSDL");
                try {
                  const id = tempPilgrimage.id || Date.now();
          // Làm sạch dữ liệu trước khi lưu Firebase
          const d = JSON.parse(JSON.stringify({ ...tempPilgrimage, id }));
                  await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pilgrimages', id.toString()), d);
                  if (selectedPilgrimage?.id === id) setSelectedPilgrimage(d); 
                  setEditingPilgrimage(null); 
                  toast.success('Đã lưu kế hoạch thành công!');
                } catch(e) { 
                  console.error("Lỗi lưu hành hương:", e);
                  toast.error("Lỗi lưu kế hoạch: " + e.message); 
                }
              }}>Lưu Kế Hoạch</button>
            </div>
          </div>
        </div>
      )}

      {editingLiturgyEvent && tempLiturgyEvent && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-pink-600 relative">
             <button onClick={() => setEditingLiturgyEvent(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Sửa Phụng Vụ Ngày {tempLiturgyEvent.date.split('-').reverse().join('/')}</h3>
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Tên sự kiện / Tên Lễ</label>
            <input className="w-full border border-pink-200 p-3 rounded mb-4 text-base font-serif font-bold bg-white outline-none focus:border-pink-500" value={tempLiturgyEvent.title || ''} onChange={e => setTempLiturgyEvent({...tempLiturgyEvent, title: e.target.value})} placeholder="VD: Chúa Nhật X Thường Niên" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Màu Áo Lễ</label>
                  <select className="w-full border border-pink-200 p-3 rounded text-sm font-bold bg-white outline-none cursor-pointer focus:border-pink-500" value={tempLiturgyEvent.colorType || 'white'} onChange={e => setTempLiturgyEvent({...tempLiturgyEvent, colorType: e.target.value})}>{Object.keys(litColors).map(k => <option key={k} value={k}>{litColors[k].name}</option>)}</select>
               </div>
               <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Nguồn Lời Chúa</label>
                  <input className="w-full border border-pink-200 p-3 rounded text-sm font-bold bg-white outline-none focus:border-pink-500" value={tempLiturgyEvent.quoteRef || ''} onChange={e => setTempLiturgyEvent({...tempLiturgyEvent, quoteRef: e.target.value})} placeholder="VD: Ga 6, 51" />
               </div>
            </div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Nội dung Lời Chúa (Sẽ tự động chiếu lên Trang Chủ)</label>
            <textarea className="w-full border border-pink-200 p-3 rounded h-20 text-sm font-serif leading-relaxed outline-none focus:border-pink-500 custom-scrollbar mb-4" value={tempLiturgyEvent.quoteText || ''} onChange={e => setTempLiturgyEvent({...tempLiturgyEvent, quoteText: e.target.value})} placeholder="Nhập câu Lời Chúa của ngày lễ này..." />
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Chi tiết sự kiện (Giờ rước kiệu, lưu ý...)</label>
            <textarea className="w-full border border-pink-200 p-3 rounded h-24 text-sm font-serif leading-relaxed outline-none focus:border-pink-500 custom-scrollbar" value={tempLiturgyEvent.desc || ''} onChange={e => setTempLiturgyEvent({...tempLiturgyEvent, desc: e.target.value})} placeholder="Thêm mô tả chi tiết nếu có..." />
            <div className="flex gap-3 pt-6 border-t mt-4">
              <button type="button" className="text-red-600 px-4 py-3 font-bold text-[10px] uppercase border border-red-100 hover:bg-red-50 transition-all rounded tracking-widest" onClick={() => { 
                setAppConfirm({
                  isOpen: true, title: 'Xóa Lịch Phụng Vụ', message: 'Bạn có chắc chắn muốn xóa lịch phụng vụ của ngày này không?', isDanger: true,
                  onConfirm: async () => {
                    setAppConfirm(prev => ({ ...prev, isOpen: false }));
                    if(!db) return;
                    const toastId = toast.loading('Đang xóa lịch phụng vụ...');
                    try {
                      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'liturgy', tempLiturgyEvent.date)); 
                      setEditingLiturgyEvent(false); 
                      toast.success('Xóa thành công!', { id: toastId });
                    } catch(e) { 
                      console.error("Lỗi xóa phụng vụ:", e);
                      toast.error("Lỗi xóa: " + e.message, { id: toastId }); 
                    }
                  }
                });
              }}>Xóa</button>
              <div className="flex-1"></div>
              <button className="bg-stone-100 px-6 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingLiturgyEvent(false)}>Hủy</button>
              <button className="bg-pink-700 text-white px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={async () => {
                if (!tempLiturgyEvent.title || tempLiturgyEvent.title.trim() === '') return alert('Vui lòng nhập tên sự kiện');
                if(!db) return alert("Chưa kết nối CSDL");
                try {
                  const cleanEvent = JSON.parse(JSON.stringify(tempLiturgyEvent));
                  await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'liturgy', tempLiturgyEvent.date), cleanEvent);
                  setEditingLiturgyEvent(false);
                  toast.success('Đã lưu lịch phụng vụ!');
                } catch(e) { 
                  console.error("Lỗi lưu phụng vụ:", e);
                  toast.error("Lỗi lưu: " + e.message); 
                }
              }}>Lưu Lại</button>
            </div>
          </div>
        </div>
      )}

      {editingReception && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-t-4 border-pink-600 custom-scrollbar relative">
            <button onClick={() => setEditingReception(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Sửa Liên Hệ Đón Tiếp</h3>
            <div className="space-y-6">
              <div className="p-4 bg-stone-50 rounded-lg border border-stone-100">
                <h4 className="text-xs font-bold text-pink-800 uppercase tracking-widest mb-3 flex items-center"><Users size={14} className="mr-2"/> Cột 1 (Đăng ký đoàn)</h4>
                <input className="w-full border border-pink-200 p-2.5 rounded text-sm mb-2 font-bold outline-none focus:border-pink-500" value={tempReception.item1Title || ''} onChange={e => setTempReception({...tempReception, item1Title: e.target.value})} placeholder="Tiêu đề..." />
                <textarea className="w-full border border-pink-200 p-2.5 rounded text-sm font-serif h-20 outline-none focus:border-pink-500 custom-scrollbar leading-relaxed" value={tempReception.item1Desc || ''} onChange={e => setTempReception({...tempReception, item1Desc: e.target.value})} placeholder="Nội dung chi tiết..." />
              </div>
              <div className="p-4 bg-stone-50 rounded-lg border border-stone-100">
                <h4 className="text-xs font-bold text-pink-800 uppercase tracking-widest mb-3 flex items-center"><MapPin size={14} className="mr-2"/> Cột 2 (Cơ sở vật chất)</h4>
                <input className="w-full border border-pink-200 p-2.5 rounded text-sm mb-2 font-bold outline-none focus:border-pink-500" value={tempReception.item2Title || ''} onChange={e => setTempReception({...tempReception, item2Title: e.target.value})} placeholder="Tiêu đề..." />
                <textarea className="w-full border border-pink-200 p-2.5 rounded text-sm font-serif h-20 outline-none focus:border-pink-500 custom-scrollbar leading-relaxed" value={tempReception.item2Desc || ''} onChange={e => setTempReception({...tempReception, item2Desc: e.target.value})} placeholder="Nội dung chi tiết..." />
              </div>
              <div className="p-4 bg-stone-50 rounded-lg border border-stone-100">
                <h4 className="text-xs font-bold text-pink-800 uppercase tracking-widest mb-3 flex items-center"><Phone size={14} className="mr-2"/> Cột 3 (Hỗ trợ trực tiếp)</h4>
                <input className="w-full border border-pink-200 p-2.5 rounded text-sm mb-2 font-bold outline-none focus:border-pink-500" value={tempReception.item3Title || ''} onChange={e => setTempReception({...tempReception, item3Title: e.target.value})} placeholder="Tiêu đề..." />
                <textarea className="w-full border border-pink-200 p-2.5 rounded text-sm font-serif h-20 outline-none focus:border-pink-500 custom-scrollbar leading-relaxed mb-2" value={tempReception.item3Desc || ''} onChange={e => setTempReception({...tempReception, item3Desc: e.target.value})} placeholder="Nội dung chi tiết..." />
                <input className="w-full border border-pink-200 p-2.5 rounded text-sm font-bold text-pink-600 outline-none focus:border-pink-500" value={tempReception.item3Phone || ''} onChange={e => setTempReception({...tempReception, item3Phone: e.target.value})} placeholder="Số điện thoại Hotline..." />
              </div>
            </div>
            <div className="flex gap-4 pt-6 border-t mt-6"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingReception(false)}>Hủy Bỏ</button><button className="flex-[2] bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { saveConfigToDB('receptionInfo', tempReception); setEditingReception(false); }}>Lưu Lại</button></div>
          </div>
        </div>
      )}

      {editingConfession && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-pink-600 relative">
             <button onClick={() => setEditingConfession(false)} className="absolute top-3 right-3 text-stone-400 hover:text-stone-600"><X size={18}/></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Sửa Bí Tích</h3>
            <div className="space-y-4 mb-8">
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Tiêu đề</label><input className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 font-bold text-sm" value={tempConfession.title || ''} onChange={(e) => setTempConfession({...tempConfession, title: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Nội dung</label><textarea className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 text-sm font-serif h-24 custom-scrollbar leading-relaxed" value={tempConfession.desc || ''} onChange={(e) => setTempConfession({...tempConfession, desc: e.target.value})} /></div>
            </div>
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingConfession(false)}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { saveConfigToDB('confessionData', tempConfession); setEditingConfession(false); }}>Lưu Lại</button></div>
          </div>
        </div>
      )}

      {editingAdoration && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-pink-600 relative">
             <button onClick={() => setEditingAdoration(false)} className="absolute top-3 right-3 text-stone-400 hover:text-stone-600"><X size={18}/></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Sửa Hoạt Động</h3>
            <div className="space-y-4 mb-8">
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Tiêu đề</label><input className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 font-bold text-sm" value={tempAdoration.title || ''} onChange={(e) => setTempAdoration({...tempAdoration, title: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Nội dung</label><textarea className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 text-sm font-serif h-24 custom-scrollbar leading-relaxed" value={tempAdoration.desc || ''} onChange={(e) => setTempAdoration({...tempAdoration, desc: e.target.value})} /></div>
            </div>
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingAdoration(false)}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { saveConfigToDB('adorationData', tempAdoration); setEditingAdoration(false); }}>Lưu Lại</button></div>
          </div>
        </div>
      )}

      {editingMass && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-t-4 border-pink-600 custom-scrollbar relative">
             <button onClick={() => setEditingMass(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-2 uppercase text-center tracking-tight">Sửa Giờ Lễ Từng Ngày</h3>
            <p className="text-center text-sm font-serif text-stone-500 mb-6">Thiết lập giờ lễ và giáo họ riêng biệt cho 7 ngày trong tuần.</p>
            <div className="space-y-4">
              {tempMass.map((item, dayIdx) => (
                <div key={dayIdx} className="p-4 border border-pink-100 bg-pink-50/30 rounded-xl relative">
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-pink-200/50">
                    <h4 className="font-bold text-pink-800 uppercase tracking-widest text-[13px]">{item.day}</h4>
                  </div>
                  <div className="space-y-2 mb-3">
                    {item.times.map((t, timeIdx) => {
                      const timeVal = typeof t === 'object' ? t.time : t;
                      const locVal = typeof t === 'object' ? (t.location || '') : '';
                      return (
                        <div key={timeIdx} className="flex gap-2 items-center bg-white p-2 rounded-lg shadow-sm border border-pink-100">
                          <input type="time" className="border border-pink-100 p-1.5 rounded text-sm font-bold outline-none focus:border-pink-500" value={timeVal} onChange={(e) => { const n = [...tempMass]; n[dayIdx].times[timeIdx] = { time: e.target.value, location: locVal }; setTempMass(n); }} />
                          <input type="text" placeholder="Địa điểm / Giáo họ..." className="flex-1 border border-pink-100 p-1.5 rounded text-sm outline-none focus:border-pink-500 font-serif" value={locVal} onChange={(e) => { const n = [...tempMass]; n[dayIdx].times[timeIdx] = { time: timeVal, location: e.target.value }; setTempMass(n); }} />
                          <button onClick={() => { const n = [...tempMass]; n[dayIdx].times.splice(timeIdx, 1); setTempMass(n); }} className="text-stone-400 hover:text-red-500 p-1.5 bg-stone-50 rounded hover:bg-red-50 transition-colors"><X size={16}/></button>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => { const n = [...tempMass]; n[dayIdx].times.push({time: '05:00', location: ''}); setTempMass(n); }} className="text-[10px] font-bold uppercase text-pink-600 bg-pink-100 px-3 py-1.5 rounded-lg hover:bg-pink-200 transition-colors">+ Thêm giờ lễ</button>
                </div>
              ))}
            </div>
            <div className="flex gap-4 pt-6 border-t mt-6"><button className="flex-1 bg-stone-100 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingMass(false)}>Hủy Bỏ</button><button className="flex-[2] bg-pink-700 text-white py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow active:scale-95 transition-all hover:bg-pink-800" onClick={() => { saveConfigToDB('massSchedules', tempMass); setEditingMass(false); }}>Lưu Giờ Lễ</button></div>
          </div>
        </div>
      )}

      {editingStats && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar border-t-4 border-pink-600 relative">
             <button onClick={() => setEditingStats(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Sửa Thông Tin Chung</h3>
            <div className="space-y-4 mb-8">
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Màu Giao Diện (Mùa Phụng Vụ)</label><select className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 font-bold text-sm bg-white cursor-pointer" value={tempStats.seasonTheme || 'default'} onChange={(e) => setTempStats({...tempStats, seasonTheme: e.target.value})}><option value="default">Mùa Lễ Hội (Hồng - Mặc định)</option><option value="thuong-nien">Mùa Thường Niên (Xanh Lá)</option><option value="mua-chay">Mùa Chay / Mùa Vọng (Tím)</option><option value="phuc-sinh">Mùa Phục Sinh (Vàng + Hào quang)</option><option value="giang-sinh">Mùa Giáng Sinh (Vàng + Tuyết rơi)</option><option value="le-do">Lễ Tử Đạo / Thánh Thần (Đỏ)</option></select></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Số lượng giáo dân</label><input className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 font-bold text-sm" value={tempStats.population || ''} onChange={(e) => setTempStats({...tempStats, population: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Linh mục Chánh xứ</label><input className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 font-bold text-sm" value={tempStats.priest || ''} onChange={(e) => setTempStats({...tempStats, priest: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Bổn mạng</label><input className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 font-bold text-sm" value={tempStats.patron || ''} onChange={(e) => setTempStats({...tempStats, patron: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Địa chỉ</label><input className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 font-bold text-sm" value={tempStats.address || ''} onChange={(e) => setTempStats({...tempStats, address: e.target.value})} /></div>
            </div>
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingStats(false)}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { saveConfigToDB('parishStats', tempStats); setEditingStats(false); }}>Lưu Lại</button></div>
          </div>
        </div>
      )}

      {editingHero && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full border-t-4 border-pink-600 relative">
             <button onClick={() => setEditingHero(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Đổi Ảnh Nền Trang Chủ</h3>
            
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Đường dẫn Hình ảnh (URL hoặc Tải ảnh lên)</label>
            <div className="flex flex-col gap-2 mb-2">
               <input className="w-full border border-pink-200 p-3 rounded text-sm bg-white outline-none focus:border-pink-500" value={tempHero.image || ''} onChange={(e) => setTempHero({...tempHero, image: e.target.value})} onPaste={(e) => handleImagePaste(e, setTempHero)} placeholder="Dán link ảnh tại đây..." />
               <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setTempHero)} className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer" />
            </div>
            <ImageAdjuster data={tempHero} setData={setTempHero} aspectClass="aspect-[21/9] w-full rounded-lg" />

            <div className="flex gap-3 mt-6"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingHero(false)}>Hủy</button><button className="flex-[2] bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { saveConfigToDB('heroData', tempHero); setEditingHero(false); }}>Lưu Hình Nền</button></div>
          </div>
        </div>
      )}

      {editingQuickPhone && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-pink-600 relative">
             <button onClick={() => setEditingQuickPhone(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Sửa Số Điện Thoại Nhanh</h3>
            <div className="mb-6">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Số điện thoại Hotline</label>
              <input className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 font-bold text-lg text-center" value={tempContact.phone || ''} onChange={(e) => setTempContact({...tempContact, phone: e.target.value})} placeholder="Nhập số điện thoại..." />
            </div>
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingQuickPhone(false)}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { saveConfigToDB('contactInfo', {...contactInfo, phone: tempContact.phone}); setEditingQuickPhone(false); }}>Lưu Lại</button></div>
          </div>
        </div>
      )}

      {editingFooter && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-t-4 border-pink-600 custom-scrollbar relative">
             <button onClick={() => setEditingFooter(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Cấu Hình Chân Trang (Footer)</h3>
            <div className="space-y-5 mb-8">
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Đoạn giới thiệu ngắn (Quote)</label><textarea className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 text-sm font-serif h-20 custom-scrollbar" value={tempFooter.aboutText || ''} onChange={(e) => setTempFooter({...tempFooter, aboutText: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Địa chỉ Giáo xứ</label><input className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 text-sm" value={tempContact.address || ''} onChange={(e) => setTempContact({...tempContact, address: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Số điện thoại</label><input className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 text-sm" value={tempContact.phone || ''} onChange={(e) => setTempContact({...tempContact, phone: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Email liên hệ</label><input className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 text-sm" value={tempContact.email || ''} onChange={(e) => setTempContact({...tempContact, email: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Link Fanpage Facebook</label><input className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 text-sm text-blue-600" value={tempFooter.facebookLink || ''} onChange={(e) => setTempFooter({...tempFooter, facebookLink: e.target.value})} placeholder="https://facebook.com/..." /></div>
            </div>
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingFooter(false)}>Hủy</button><button className="flex-[2] bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { saveConfigToDB('footerData', tempFooter); saveConfigToDB('contactInfo', tempContact); setEditingFooter(false); }}>Lưu Thay Đổi</button></div>
          </div>
        </div>
      )}

      {editingLogo && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-xl w-full border-t-4 border-pink-600 relative">
             <button onClick={() => setEditingLogo(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Đổi Logo Giáo Xứ</h3>
            
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Đường dẫn Logo (URL) hoặc Tải ảnh lên</label>
            <div className="flex flex-col gap-2 mb-2">
               <input className="w-full border border-pink-200 p-3 rounded text-sm bg-white outline-none focus:border-pink-500" value={tempLogoConfig.image || ''} onChange={(e) => setTempLogoConfig({...tempLogoConfig, image: e.target.value})} onPaste={(e) => handleImagePaste(e, setTempLogoConfig)} placeholder="Nhập link ảnh hoặc dán ảnh..." />
               <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setTempLogoConfig)} className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer" />
            </div>
            <ImageAdjuster data={tempLogoConfig} setData={setTempLogoConfig} aspectClass="w-40 h-40 rounded-full" />

            <div className="flex gap-3 mt-6"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingLogo(false)}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { saveConfigToDB('logoConfig', tempLogoConfig); setEditingLogo(false); }}>Lưu Logo</button></div>
          </div>
        </div>
      )}

    </div>
  );
}