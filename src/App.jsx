import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Clock, Calendar, MapPin, Phone, 
  ChevronRight, BookOpen, Users, Image as ImageIcon, 
  Bell, Heart, Search, Mail, ExternalLink, Quote,
  ChevronDown, Church, ArrowUp, Edit3, ChevronLeft,
  User, Star, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Send,
  MessageSquare, CheckCircle2
} from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

// Thiết lập mật khẩu quản trị viên từ biến môi trường (hỗ trợ cả Vite và Create React App).
const ADMIN_PASSWORD = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PASSWORD) 
  || (typeof process !== 'undefined' && process.env?.REACT_APP_ADMIN_PASSWORD) 
  || "admin";

import { auth, db, storage, appId } from './utils/firebase';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { getImgStyle, navLinks, litColors, formatDateString, getDaysArray, getStatusStyles } from './utils/helpers';
import { FacebookIcon, Logo, editorContentClasses, RichTextEditor, ImageAdjuster } from './components/Shared';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Liturgy from './pages/Liturgy';
import { Pilgrimage, PilgrimageDetail } from './pages/Pilgrimage';
import { News, NewsDetail } from './pages/News';

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

  // --- States Admin & Auth ---
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('isAdmin') === 'true');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- States Firebase User ---
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Đồng bộ trạng thái Admin vào Session Storage để không bị mất khi F5
  useEffect(() => {
    sessionStorage.setItem('isAdmin', isAdmin);
  }, [isAdmin]);

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


  // ==========================================
  // FIREBASE INITIALIZATION & SYNC
  // ==========================================
  
  // 1. Authenticate FIRST
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Lỗi xác thực Firebase:", err);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Synchronization (Bọc Try-Catch chống Crash)
  useEffect(() => {
    // TỐI ƯU 2: Xóa check !firebaseUser để Web tải dữ liệu đồng thời với lúc Auth, cắt giảm 50% thời gian chờ
    if (!db) {
      return;
    }

    let unsubNews, unsubPilgrimages, unsubLiturgy, unsubConfig;

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
    } catch (err) {
      console.error("Lỗi khi thiết lập listeners Firebase:", err);
    }

    return () => {
      if(unsubNews) unsubNews();
      if(unsubPilgrimages) unsubPilgrimages();
      if(unsubLiturgy) unsubLiturgy();
      if(unsubConfig) unsubConfig();
    };
  // TỐI ƯU 4: Xóa [firebaseUser] khỏi dependency array, tránh việc useEffect bị kích hoạt 2 lần gây lag
  }, []);

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
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', docId), { [key]: value }, { merge: true });
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

  // ==========================================
  // HANDLERS
  // ==========================================

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 50); setShowTopBtn(window.scrollY > 400); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLoginSubmit = () => {
    if (password === ADMIN_PASSWORD) { setIsAdmin(true); setShowLoginModal(false); setPassword(''); setLoginError(''); }
    else setLoginError('Mật khẩu không chính xác!');
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormStatus('success');
    setTimeout(() => setFormStatus(''), 4000);
    e.target.reset();
  };

  const getTodayFormattedStr = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  };

  const handleImagePaste = (e, setterFunction) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
      const item = items[index];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => setterFunction(prev => ({ ...prev, image: event.target.result }));
        reader.readAsDataURL(item.getAsFile());
        e.preventDefault();
        break;
      }
    }
  };

  const handleImageUpload = (e, setterFunction) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setterFunction(prev => ({ ...prev, image: event.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const prevMonth = () => { setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1)); };
  const nextMonth = () => { setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1)); };

  const isSolidHeader = scrolled || location.pathname !== '/';

  return (
    <div className="min-h-screen bg-white font-serif selection:bg-pink-100 antialiased relative overflow-x-hidden">
      <Toaster position="bottom-right" toastOptions={{ style: { fontSize: '12px', fontWeight: 'bold', fontFamily: 'sans-serif' } }} />
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(236, 72, 153, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(219, 39, 119, 0.6); }
      `}} />

      {/* ========================================== */}
      {/* TRÌNH ĐIỀU HƯỚNG (HEADER) */}
      {/* ========================================== */}
      <Header 
        isAdmin={isAdmin}
        isSolidHeader={isSolidHeader}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        logoConfig={logoConfig}
        setTempLogoConfig={setTempLogoConfig}
        setEditingLogo={setEditingLogo}
      />

      {/* NỘI DUNG CHÍNH */}
      <main className="pt-0 min-h-[70vh] bg-white">
        <Routes>
          <Route path="/" element={<Home isAdmin={isAdmin} heroData={heroData} setTempHero={setTempHero} setEditingHero={setEditingHero} quote={quote} setTempQuote={setTempQuote} setEditingQuote={setEditingQuote} massSchedules={massSchedules} setTempMass={setTempMass} setEditingMass={setEditingMass} contactInfo={contactInfo} setTempContact={setTempContact} setEditingQuickPhone={setEditingQuickPhone} newsItems={newsItems} setSelectedNews={setSelectedNews} />} />
          <Route path="/gioi-thieu" element={<About isAdmin={isAdmin} parishStats={parishStats} setTempStats={setTempStats} setEditingStats={setEditingStats} historyData={historyData} setTempHistory={setTempHistory} setEditingHistory={setEditingHistory} heritageTitle={heritageTitle} setTempHeritageTitle={setTempHeritageTitle} setEditingHeritageTitle={setEditingHeritageTitle} heritageList={heritageList} setTempHeritageItem={setTempHeritageItem} setEditingHeritageItem={setEditingHeritageItem} pastoralData={pastoralData} setTempPastoral={setTempPastoral} setEditingPastoral={setEditingPastoral} />} />
          <Route path="/phung-vu" element={<Liturgy isAdmin={isAdmin} selectedDate={selectedDate} setSelectedDate={setSelectedDate} calendarDate={calendarDate} prevMonth={prevMonth} nextMonth={nextMonth} liturgyEvents={liturgyEvents} massSchedules={massSchedules} setTempMass={setTempMass} setEditingMass={setEditingMass} confessionData={confessionData} setTempConfession={setTempConfession} setEditingConfession={setEditingConfession} adorationData={adorationData} setTempAdoration={setTempAdoration} setEditingAdoration={setEditingAdoration} setTempLiturgyEvent={setTempLiturgyEvent} setEditingLiturgyEvent={setEditingLiturgyEvent} />} />
          <Route path="/hanh-huong" element={<Pilgrimage isAdmin={isAdmin} pilgrimagePlans={pilgrimagePlans} pilgrimagePage={pilgrimagePage} setPilgrimagePage={setPilgrimagePage} itemsPerPage={itemsPerPage} setSelectedPilgrimage={setSelectedPilgrimage} setTempPilgrimage={setTempPilgrimage} setEditingPilgrimage={setEditingPilgrimage} receptionInfo={receptionInfo} setTempReception={setTempReception} setEditingReception={setEditingReception} />} />
          <Route path="/hanh-huong/chi-tiet" element={<PilgrimageDetail isAdmin={isAdmin} selectedPilgrimage={selectedPilgrimage} setTempPilgrimage={setTempPilgrimage} setEditingPilgrimage={setEditingPilgrimage} />} />
          <Route path="/tin-tuc" element={<News isAdmin={isAdmin} newsItems={newsItems} newsPage={newsPage} setNewsPage={setNewsPage} newsPerPage={newsPerPage} setSelectedNews={setSelectedNews} setTempNews={setTempNews} setEditingNews={setEditingNews} getTodayFormattedStr={getTodayFormattedStr} />} />
          <Route path="/tin-tuc/chi-tiet" element={<NewsDetail isAdmin={isAdmin} selectedNews={selectedNews} setTempNews={setTempNews} setEditingNews={setEditingNews} />} />
          <Route path="/lien-he" element={<Contact isAdmin={isAdmin} contactInfo={contactInfo} setTempContact={setTempContact} setEditingContact={setEditingContact} formStatus={formStatus} handleContactSubmit={handleContactSubmit} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* CHÂN TRANG (FOOTER) */}
      <Footer 
        isAdmin={isAdmin}
        footerData={footerData}
        contactInfo={contactInfo}
        logoConfig={logoConfig}
        setTempFooter={setTempFooter}
        setTempContact={setTempContact}
        setEditingFooter={setEditingFooter}
        setShowLoginModal={setShowLoginModal}
        setIsAdmin={setIsAdmin}
      />

      {showTopBtn && <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 p-2.5 bg-pink-700 text-white rounded-full shadow-xl z-50 active:scale-90 transition-all hover:bg-pink-800"><ArrowUp size={20} /></button>}

      {/* ========================================== */}
      {/* MODALS QUẢN TRỊ (ADMIN) */}
      {/* ========================================== */}

      {showLoginModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border-t-4 border-pink-600 relative">
             <button onClick={() => {setShowLoginModal(false); setLoginError(''); setPassword('');}} className="absolute top-3 right-3 text-stone-400 hover:text-stone-600"><X size={18}/></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase tracking-tight">Đăng Nhập Admin</h3>
            <input type="password" placeholder="Nhập mật khẩu" className={`w-full border p-3 mb-2 text-center text-sm outline-none focus:border-pink-500 font-serif rounded ${loginError ? 'border-red-400' : 'border-pink-200'}`} value={password} onChange={(e) => {setPassword(e.target.value); setLoginError('');}} onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit()} />
            <div className="h-6 mb-2">{loginError && <p className="text-red-500 text-xs font-bold animate-in slide-in-from-top-1">{loginError}</p>}</div>
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => {setShowLoginModal(false); setLoginError(''); setPassword('');}}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={handleLoginSubmit}>Xác Nhận</button></div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div><label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Ngày đăng</label><input className="w-full border border-pink-200 p-3 rounded text-sm bg-stone-50 outline-none focus:border-pink-500" value={tempNews.date || ''} onChange={(e) => setTempNews({...tempNews, date: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Chuyên mục</label><select className="w-full border border-pink-200 p-3 rounded text-sm bg-white outline-none cursor-pointer focus:border-pink-500" value={tempNews.category || 'Tin Tức'} onChange={(e) => setTempNews({...tempNews, category: e.target.value})}><option value="Tin Tức">Tin Tức</option><option value="Sự kiện">Sự kiện</option><option value="Giáo lý">Giáo lý</option><option value="Thông báo">Thông báo</option></select></div>
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
                } catch(e) { alert("Lỗi khi xóa bài: Không có quyền truy cập.") }
              }}>Xóa Bản Tin</button>}
              <div className="flex-1"></div>
              <button className="bg-stone-100 px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingNews(null)}>Hủy Bỏ</button>
              <button className="bg-pink-700 text-white px-10 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={async () => { 
                if (!tempNews.title) return alert('Vui lòng nhập tiêu đề'); 
                if (!db) return alert('Chưa kết nối CSDL');
                try {
                  const id = tempNews.id || Date.now();
                  const d = { ...tempNews, id };
                  await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'news', id.toString()), d);
                  if (selectedNews?.id === id) setSelectedNews(d); 
                  setEditingNews(null); 
                } catch(e) { alert("Lỗi khi lưu bài: Không có quyền truy cập.") }
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
              {editingHeritageItem !== 'new' && <button className="text-red-600 px-6 py-3 font-bold text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-50 transition-all rounded" onClick={() => { const nl = heritageList.filter(item => item.id !== tempHeritageItem.id); saveConfigToDB('heritageList', nl); setEditingHeritageItem(null); }}>Xóa Vị Thánh</button>}
              <div className="flex-1"></div>
              <button className="bg-stone-100 px-6 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingHeritageItem(null)}>Hủy</button>
              <button className="bg-pink-700 text-white px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { 
                if (!tempHeritageItem.name) return alert('Vui lòng nhập tên'); 
                let nl;
                if (editingHeritageItem === 'new') nl = [tempHeritageItem, ...heritageList]; 
                else nl = heritageList.map(item => item.id === tempHeritageItem.id ? tempHeritageItem : item); 
                saveConfigToDB('heritageList', nl); 
                setEditingHeritageItem(null); 
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
                } catch(e) { alert("Lỗi xóa: Không có quyền truy cập.") }
              }}>Xóa Kế Hoạch</button>}
              <div className="flex-1"></div>
              <button className="bg-stone-100 px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingPilgrimage(null)}>Hủy Bỏ</button>
              <button className="bg-pink-700 text-white px-10 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={async () => { 
                if (!tempPilgrimage.title || tempPilgrimage.title.trim() === '') return alert('Vui lòng nhập tên chương trình');
                if(!db) return alert("Chưa kết nối CSDL");
                try {
                  const id = tempPilgrimage.id || Date.now();
                  const d = { ...tempPilgrimage, id };
                  await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pilgrimages', id.toString()), d);
                  if (selectedPilgrimage?.id === id) setSelectedPilgrimage(d); 
                  setEditingPilgrimage(null); 
                } catch(e) { alert("Lỗi lưu: Không có quyền truy cập.") }
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Màu Áo Lễ</label>
            <select className="w-full border border-pink-200 p-3 rounded mb-4 text-sm font-bold bg-white outline-none cursor-pointer focus:border-pink-500" value={tempLiturgyEvent.colorType || 'white'} onChange={e => setTempLiturgyEvent({...tempLiturgyEvent, colorType: e.target.value})}>{Object.keys(litColors).map(k => <option key={k} value={k}>{litColors[k].name}</option>)}</select>
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Chi tiết sự kiện (Giờ rước kiệu, lưu ý...)</label>
            <textarea className="w-full border border-pink-200 p-3 rounded h-24 text-sm font-serif leading-relaxed outline-none focus:border-pink-500 custom-scrollbar" value={tempLiturgyEvent.desc || ''} onChange={e => setTempLiturgyEvent({...tempLiturgyEvent, desc: e.target.value})} placeholder="Thêm mô tả chi tiết nếu có..." />
            <div className="flex gap-3 pt-6 border-t mt-4">
              <button className="text-red-600 px-4 py-3 font-bold text-[10px] uppercase border border-red-100 hover:bg-red-50 transition-all rounded tracking-widest" onClick={async () => { 
                if(!db) return;
                try {
                  await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'liturgy', tempLiturgyEvent.date)); 
                  setEditingLiturgyEvent(false); 
                } catch(e) { alert("Lỗi xóa: Không có quyền truy cập.") }
              }}>Xóa</button>
              <div className="flex-1"></div>
              <button className="bg-stone-100 px-6 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingLiturgyEvent(false)}>Hủy</button>
              <button className="bg-pink-700 text-white px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={async () => {
                if (!tempLiturgyEvent.title || tempLiturgyEvent.title.trim() === '') return alert('Vui lòng nhập tên sự kiện');
                if(!db) return alert("Chưa kết nối CSDL");
                try {
                  await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'liturgy', tempLiturgyEvent.date), tempLiturgyEvent);
                  setEditingLiturgyEvent(false);
                } catch(e) { alert("Lỗi lưu: Không có quyền truy cập.") }
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
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-t-4 border-pink-600 custom-scrollbar relative">
             <button onClick={() => setEditingMass(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-8 uppercase text-center tracking-tight">Sửa Giờ Lễ</h3>
            <div className="space-y-6">{tempMass.map((item, idx) => (<div key={idx} className="p-4 border border-pink-100 bg-pink-50/30 rounded-lg"><label className="block text-[10px] font-bold text-pink-800 uppercase mb-2 tracking-widest">{item.day}</label><input className="w-full border border-pink-200 p-2.5 rounded text-sm font-bold focus:border-pink-500 outline-none" value={item.times.join(', ')} onChange={(e) => { const n = [...tempMass]; n[idx].times = e.target.value.split(',').map(t => t.trim()); setTempMass(n); }}/></div>))}</div>
            <div className="flex gap-4 pt-8 border-t mt-8"><button className="flex-1 bg-stone-100 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingMass(false)}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow active:scale-95 transition-all hover:bg-pink-800" onClick={() => { saveConfigToDB('massSchedules', tempMass); setEditingMass(false); }}>Lưu Giờ Lễ</button></div>
          </div>
        </div>
      )}

      {editingStats && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-pink-600 relative">
             <button onClick={() => setEditingStats(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Sửa Thông Tin Chung</h3>
            <div className="space-y-4 mb-8">
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