import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, CalendarDays, Map, Settings, LogOut, Menu, X, Users, Eye, Star, Globe, Plus, Search, Edit3, ChevronLeft, ChevronRight, Clock, Heart, BookOpen, MapPin, Phone, Image, AlignLeft, Inbox, Mail, MailOpen, Trash2, CheckCircle2, TrendingUp, FolderOpen, Copy, RefreshCw, HardDrive } from 'lucide-react';
import { formatDateString, getDaysArray, litColors, expandMassSchedules, normalizeMassSchedules, getStatusStyles } from '../utils/helpers';
import { db, appId } from '../utils/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function AdminDashboard({ isAdmin, setShowLoginModal, setIsAdmin, parishStats, newsItems, pilgrimagePlans, liturgyEvents, setTempNews, setEditingNews, massSchedules, setTempMass, setEditingMass, confessionData, setTempConfession, setEditingConfession, adorationData, setTempAdoration, setEditingAdoration, setTempLiturgyEvent, setEditingLiturgyEvent, setTempPilgrimage, setEditingPilgrimage, receptionInfo, setTempReception, setEditingReception, logoConfig, setTempLogoConfig, setEditingLogo, heroData, setTempHero, setEditingHero, footerData, setTempFooter, setEditingFooter, contactInfo, setTempContact, setEditingContact, setTempStats, setEditingStats, messages, setAppConfirm, dailyVisits }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Chặn người dùng lạ (Yêu cầu đăng nhập)
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center border-t-4 border-pink-600">
          <h2 className="text-xl font-bold text-pink-950 mb-4 uppercase tracking-widest">Khu Vực Quản Trị</h2>
          <p className="mb-6 text-sm font-serif text-stone-500">Vui lòng đăng nhập để truy cập Bảng điều khiển (Dashboard).</p>
          <button onClick={() => { navigate('/'); setShowLoginModal(true); }} className="w-full bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md transition-all active:scale-95">Quay về & Đăng nhập</button>
        </div>
      </div>
    );
  }

  const unreadCount = messages?.filter(m => m.status === 'new').length || 0;
  const menuItems = [
    { name: 'Tổng Quan', path: '/admin', icon: LayoutDashboard },
    { name: 'Tin Tức', path: '/admin/tin-tuc', icon: FileText },
    { name: 'Phụng Vụ', path: '/admin/phung-vu', icon: CalendarDays },
    { name: 'Hành Hương', path: '/admin/hanh-huong', icon: Map },
    { name: 'Hộp Thư', path: '/admin/hop-thu', icon: Inbox, badge: unreadCount },
    { name: 'Thư Viện', path: '/admin/thu-vien', icon: FolderOpen },
    { name: 'Cài Đặt', path: '/admin/cai-dat', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex font-serif w-full absolute top-0 left-0 z-[200] bg-stone-50">
      {/* Sidebar (Thanh menu bên trái) */}
      <aside className={`fixed inset-y-0 left-0 bg-pink-950 text-pink-100 w-64 transform transition-transform duration-300 z-[250] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col shadow-2xl`}>
         <div className="h-16 px-6 border-b border-pink-900/50 flex justify-between items-center">
            <h2 className="text-lg font-bold uppercase tracking-widest text-white">Quản Trị Viên</h2>
            <button className="md:hidden text-pink-300 hover:text-white" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>
         </div>
         <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map(item => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <button key={item.name} onClick={() => { navigate(item.path); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive ? 'bg-pink-800 text-white shadow-inner font-bold' : 'hover:bg-pink-900/50 hover:text-white font-medium'}`}>
                   <item.icon size={18} className={isActive ? 'text-pink-300' : 'text-pink-400'} />
                   <span className="text-sm tracking-wide flex-1 text-left">{item.name}</span>
                   {item.badge > 0 && <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{item.badge}</span>}
                </button>
              );
            })}
         </nav>
         <div className="p-4 border-t border-pink-900/50 space-y-2">
            <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-pink-200 hover:bg-white/10 hover:text-white transition-colors">
               <Globe size={18} />
               <span className="font-bold text-xs uppercase tracking-widest">Xem Trang Web</span>
            </button>
            <button onClick={() => { setIsAdmin(false); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-pink-300 bg-pink-900/40 hover:bg-pink-900 hover:text-white transition-colors border border-pink-800/50">
               <LogOut size={18} />
               <span className="font-bold text-xs uppercase tracking-widest">Đăng Xuất</span>
            </button>
         </div>
      </aside>

      {/* Lớp phủ màn đen trên Mobile khi mở Sidebar */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-[240] md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Khu vực Nội dung chính (Main Content) */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen max-w-full">
         {/* Top Header */}
         <header className="bg-white border-b border-stone-200 h-16 flex items-center justify-between px-4 md:px-8 shadow-sm flex-shrink-0">
            <button className="md:hidden p-2 text-stone-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition" onClick={() => setIsSidebarOpen(true)}>
               <Menu size={24} />
            </button>
            <div className="flex-1 md:hidden text-center font-bold text-pink-950 uppercase tracking-widest">Dashboard</div>
            <div className="flex-1 hidden md:block"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-stone-50 p-1.5 pr-4 rounded-full transition border border-transparent hover:border-stone-200">
               <div className="w-8 h-8 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center font-bold text-xs">AD</div>
               <span className="text-xs font-bold text-stone-700 uppercase tracking-widest hidden sm:block">Xin chào, Admin!</span>
            </div>
         </header>

         {/* Content Area */}
         <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
            <Routes>
               <Route path="/" element={<Overview parishStats={parishStats} newsItems={newsItems} pilgrimagePlans={pilgrimagePlans} liturgyEvents={liturgyEvents} messages={messages} dailyVisits={dailyVisits} />} />
               <Route path="/tin-tuc" element={<NewsManager newsItems={newsItems} setTempNews={setTempNews} setEditingNews={setEditingNews} />} />
               <Route path="/phung-vu" element={<LiturgyManager liturgyEvents={liturgyEvents} massSchedules={massSchedules} setTempMass={setTempMass} setEditingMass={setEditingMass} confessionData={confessionData} setTempConfession={setTempConfession} setEditingConfession={setEditingConfession} adorationData={adorationData} setTempAdoration={setTempAdoration} setEditingAdoration={setEditingAdoration} setTempLiturgyEvent={setTempLiturgyEvent} setEditingLiturgyEvent={setEditingLiturgyEvent} />} />
               <Route path="/hanh-huong" element={<PilgrimageManager pilgrimagePlans={pilgrimagePlans} setTempPilgrimage={setTempPilgrimage} setEditingPilgrimage={setEditingPilgrimage} receptionInfo={receptionInfo} setTempReception={setTempReception} setEditingReception={setEditingReception} />} />
               <Route path="/hop-thu" element={<InboxManager messages={messages} setAppConfirm={setAppConfirm} />} />
               <Route path="/thu-vien" element={<MediaManager setAppConfirm={setAppConfirm} />} />
               <Route path="/cai-dat" element={<SettingsManager parishStats={parishStats} setTempStats={setTempStats} setEditingStats={setEditingStats} logoConfig={logoConfig} setTempLogoConfig={setTempLogoConfig} setEditingLogo={setEditingLogo} heroData={heroData} setTempHero={setTempHero} setEditingHero={setEditingHero} contactInfo={contactInfo} setTempContact={setTempContact} setEditingContact={setEditingContact} footerData={footerData} setTempFooter={setTempFooter} setEditingFooter={setEditingFooter} />} />
            </Routes>
         </div>
      </main>
    </div>
  );
}

function MediaManager({ setAppConfirm }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState('images');

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/r2?action=list&prefix=${activeFolder === 'images' ? 'images/' : 'documents/'}`);
      if (!res.ok) throw new Error('Không thể tải file');
      const data = await res.json();
      setFiles(data.files.sort((a, b) => new Date(b.timeCreated) - new Date(a.timeCreated)));
    } catch (error) {
      console.error("Lỗi lấy danh sách file:", error);
      toast.error('Không lấy được dữ liệu. Hãy kiểm tra lại CORS!');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, [activeFolder]);

  const handleDelete = (file) => {
    setAppConfirm({
      isOpen: true, title: 'Xóa File vĩnh viễn', message: `Bạn có chắc muốn xóa file "${file.name}" không?`, isDanger: true,
      onConfirm: async () => {
        setAppConfirm(prev => ({ ...prev, isOpen: false }));
        const toastId = toast.loading('Đang xóa file...');
        try {
          const res = await fetch(`/api/r2?action=delete&key=${encodeURIComponent(file.fullPath)}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Lỗi từ Server');
          
          setFiles(prev => prev.filter(f => f.fullPath !== file.fullPath));
          toast.success('Đã xóa thành công!', { id: toastId });
        } catch (error) { toast.error('Lỗi khi xóa file: ' + error.message, { id: toastId }); }
      }
    });
  };

  const copyToClipboard = (url) => { navigator.clipboard.writeText(url); toast.success('Đã copy đường dẫn!'); };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-pink-950 mb-2 uppercase tracking-tight">Thư Viện Media</h1>
          <p className="text-stone-500 font-serif text-sm md:text-base">Quản lý và dọn dẹp các hình ảnh, tài liệu đính kèm trên hệ thống.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-stone-200 text-sm font-bold text-stone-600 flex items-center gap-2"><HardDrive size={16} className="text-pink-500" /> Tổng: {formatBytes(totalSize)}</div>
           <button onClick={fetchFiles} className="bg-white p-2 text-stone-500 hover:text-pink-600 rounded-xl shadow-sm border border-stone-200 hover:border-pink-200 transition-colors" title="Tải lại"><RefreshCw size={18} className={loading ? "animate-spin" : ""} /></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-8">
        <div className="flex gap-4 border-b border-stone-100 mb-6 pb-2 overflow-x-auto custom-scrollbar">
          <button onClick={() => setActiveFolder('images')} className={`flex items-center gap-2 px-4 py-2 font-bold text-sm uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${activeFolder === 'images' ? 'border-pink-500 text-pink-600' : 'border-transparent text-stone-400 hover:text-stone-600'}`}><Image size={18} /> Hình Ảnh</button>
          <button onClick={() => setActiveFolder('documents')} className={`flex items-center gap-2 px-4 py-2 font-bold text-sm uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${activeFolder === 'documents' ? 'border-pink-500 text-pink-600' : 'border-transparent text-stone-400 hover:text-stone-600'}`}><FileText size={18} /> Tài Liệu Đính Kèm</button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{[...Array(10)].map((_, i) => <div key={i} className="aspect-square bg-stone-100 rounded-xl animate-pulse"></div>)}</div>
        ) : files.length === 0 ? (
          <div className="text-center py-20 bg-stone-50 rounded-xl border border-stone-100 border-dashed"><FolderOpen className="mx-auto text-stone-300 mb-4" size={48} /><p className="text-stone-500 font-serif">Thư mục trống. Chưa có tệp nào được tải lên.</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {files.map(file => (
              <div key={file.fullPath} className="group flex flex-col bg-stone-50 rounded-xl border border-stone-200 overflow-hidden hover:border-pink-300 hover:shadow-md transition-all relative">
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={() => copyToClipboard(file.url)} className="p-1.5 bg-white/90 backdrop-blur text-stone-600 hover:text-pink-600 rounded-lg shadow-sm border border-stone-200" title="Copy Link"><Copy size={14} /></button>
                  <button onClick={() => handleDelete(file)} className="p-1.5 bg-white/90 backdrop-blur text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg shadow-sm border border-stone-200" title="Xóa file"><Trash2 size={14} /></button>
                </div>
                <div className="aspect-square relative flex items-center justify-center bg-stone-100 border-b border-stone-200 overflow-hidden">
                  {activeFolder === 'images' ? <img src={file.url} className="w-full h-full object-cover" alt={file.name} loading="lazy" /> : <FileText size={40} className="text-stone-300" />}
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-stone-700 truncate mb-1" title={file.name}>{file.name}</p>
                  <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono"><span>{formatBytes(file.size)}</span><span>{new Date(file.timeCreated).toLocaleDateString('vi-VN')}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsManager({ parishStats, setTempStats, setEditingStats, logoConfig, setTempLogoConfig, setEditingLogo, heroData, setTempHero, setEditingHero, contactInfo, setTempContact, setEditingContact, footerData, setTempFooter, setEditingFooter }) {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-pink-950 mb-2 uppercase tracking-tight">Cài Đặt Hệ Thống</h1>
        <p className="text-stone-500 font-serif text-sm md:text-base">Quản lý giao diện, thông tin liên hệ và các thông số chung của website.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Thẻ Cấu hình chung */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col relative group hover:border-pink-200 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center shadow-sm"><Settings size={20} /></div>
            <h3 className="font-bold text-stone-800 uppercase tracking-widest text-sm">Cấu Hình Chung</h3>
          </div>
          <div className="flex-1 space-y-4 mb-8">
            <div className="flex justify-between items-center text-sm border-b border-stone-50 pb-3"><span className="text-stone-500">Mùa Phụng vụ:</span><span className="font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded uppercase tracking-wider text-[10px]">{parishStats.seasonTheme === 'default' ? 'Mặc định' : parishStats.seasonTheme}</span></div>
            <div className="flex justify-between items-center text-sm border-b border-stone-50 pb-3"><span className="text-stone-500">Giáo dân:</span><span className="font-bold text-stone-700">{parishStats.population || '0'}</span></div>
            <div className="flex justify-between items-center text-sm"><span className="text-stone-500">Linh mục:</span><span className="font-bold text-stone-700 truncate max-w-[140px] text-right">{parishStats.priest || '...'}</span></div>
          </div>
          <button onClick={() => { setTempStats(parishStats); setEditingStats(true); }} className="w-full py-3 bg-stone-50 hover:bg-pink-600 text-stone-600 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shadow-sm">Chỉnh Sửa</button>
        </div>

        {/* Thẻ Logo */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col relative group hover:border-pink-200 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shadow-sm"><Image size={20} /></div>
            <h3 className="font-bold text-stone-800 uppercase tracking-widest text-sm">Logo Giáo Xứ</h3>
          </div>
          <div className="flex-1 flex items-center justify-center mb-8 bg-stone-50 rounded-xl p-4 border border-stone-100 border-dashed">
            <img src={logoConfig.image || '/logo.svg'} className="h-20 w-20 object-contain drop-shadow-md" alt="Logo" />
          </div>
          <button onClick={() => { setTempLogoConfig(logoConfig); setEditingLogo(true); }} className="w-full py-3 bg-stone-50 hover:bg-pink-600 text-stone-600 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shadow-sm">Đổi Logo</button>
        </div>

        {/* Thẻ Ảnh Nền */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col relative group hover:border-pink-200 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm"><Image size={20} /></div>
            <h3 className="font-bold text-stone-800 uppercase tracking-widest text-sm">Ảnh Nền Trang Chủ</h3>
          </div>
          <div className="flex-1 mb-8 bg-stone-50 rounded-xl overflow-hidden border border-stone-100 relative">
            <img src={heroData.image || '/logo.svg'} onError={(e) => { e.target.src = '/logo.svg'; e.target.onerror = null; }} className="w-full h-24 object-cover opacity-90 bg-white" alt="Hero" />
          </div>
          <button onClick={() => { setTempHero(heroData); setEditingHero(true); }} className="w-full py-3 bg-stone-50 hover:bg-pink-600 text-stone-600 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shadow-sm">Đổi Ảnh Nền</button>
        </div>
        
        {/* Thẻ Liên hệ */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col relative group hover:border-pink-200 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm"><Phone size={20} /></div>
            <h3 className="font-bold text-stone-800 uppercase tracking-widest text-sm">Thông Tin Liên Hệ</h3>
          </div>
          <div className="flex-1 space-y-4 mb-8 text-sm">
            <p className="flex gap-3 items-start"><Phone size={16} className="text-emerald-500 shrink-0 mt-0.5" /><span className="font-bold text-stone-700 truncate">{contactInfo.phone || '...'}</span></p>
            <p className="flex gap-3 items-start"><MapPin size={16} className="text-emerald-500 shrink-0 mt-0.5" /><span className="text-stone-600 line-clamp-2 leading-relaxed font-serif">{contactInfo.address || '...'}</span></p>
          </div>
          <button onClick={() => { setTempContact(contactInfo); setEditingContact(true); }} className="w-full py-3 bg-stone-50 hover:bg-pink-600 text-stone-600 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shadow-sm">Sửa Liên Hệ</button>
        </div>
        
        {/* Thẻ Chân trang */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col relative group hover:border-pink-200 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm"><AlignLeft size={20} /></div>
            <h3 className="font-bold text-stone-800 uppercase tracking-widest text-sm">Chân Trang (Footer)</h3>
          </div>
          <div className="flex-1 space-y-4 mb-8 text-sm">
            <p className="text-stone-600 line-clamp-2 italic font-serif leading-relaxed">"{footerData.aboutText || '...'}"</p>
            <p className="text-blue-600 truncate text-[11px] bg-blue-50 px-2 py-1 rounded border border-blue-100">{footerData.facebookLink || 'Chưa có link FB'}</p>
          </div>
          <button onClick={() => { setTempFooter(footerData); setTempContact(contactInfo); setEditingFooter(true); }} className="w-full py-3 bg-stone-50 hover:bg-pink-600 text-stone-600 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shadow-sm">Sửa Chân Trang</button>
        </div>
      </div>
    </div>
  );
}

function PilgrimageManager({ pilgrimagePlans, setTempPilgrimage, setEditingPilgrimage, receptionInfo, setTempReception, setEditingReception }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredPlans = pilgrimagePlans.filter(plan => 
    plan.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 max-w-6xl mx-auto">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div>
           <h1 className="text-2xl md:text-3xl font-bold text-pink-950 mb-2 uppercase tracking-tight">Quản Lý Hành Hương</h1>
           <p className="text-stone-500 font-serif text-sm md:text-base">Tổ chức các chuyến hành hương và cài đặt thông tin đón tiếp.</p>
         </div>
         <button onClick={() => {
           setTempPilgrimage({ id: Date.now(), title: '', date: '', duration: '', status: 'Sắp diễn ra', desc: '', image: '', content: '' });
           setEditingPilgrimage('new');
         }} className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center gap-2">
           <Plus size={16} /> Thêm Kế Hoạch
         </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type="text" placeholder="Tìm kiếm chương trình hành hương..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:border-pink-500 outline-none transition-colors shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-100 text-[10px] uppercase tracking-widest text-stone-500 border-b border-stone-200">
                      <th className="p-4 font-bold w-16 text-center">Ảnh</th>
                      <th className="p-4 font-bold min-w-[200px]">Tên Chương Trình</th>
                      <th className="p-4 font-bold">Lịch Trình</th>
                      <th className="p-4 font-bold text-center">Trạng Thái</th>
                      <th className="p-4 font-bold text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredPlans.map(item => (
                      <tr key={item.id} className="border-b border-stone-100 hover:bg-pink-50/30 transition-colors group">
                        <td className="p-4 text-center"><div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 mx-auto shadow-sm border border-stone-200"><img src={item.image || '/logo.svg'} onError={(e) => { e.target.src = '/logo.svg'; e.target.onerror = null; }} className="w-full h-full object-cover bg-white" alt="" /></div></td>
                        <td className="p-4"><p className="font-bold text-stone-800 font-serif leading-snug line-clamp-2 max-w-sm mb-1">{item.title}</p></td>
                        <td className="p-4"><p className="text-[11px] text-stone-500 font-bold mb-1 flex items-center gap-1.5"><Calendar size={12}/>{item.date}</p><p className="text-[11px] text-stone-500 font-bold flex items-center gap-1.5"><Clock size={12}/>{item.duration}</p></td>
                        <td className="p-4 text-center"><span className={`text-[9px] font-bold px-2.5 py-1 rounded-full shadow-sm border uppercase tracking-wider whitespace-nowrap ${getStatusStyles(item.status)}`}>{item.status}</span></td>
                        <td className="p-4 text-right"><button onClick={() => { setTempPilgrimage(item); setEditingPilgrimage(item.id); }} className="p-2 text-stone-500 hover:text-pink-600 hover:bg-pink-100 rounded-lg transition-colors border border-transparent hover:border-pink-200 shadow-sm" title="Sửa kế hoạch"><Edit3 size={16} /></button></td>
                      </tr>
                    ))}
                    {filteredPlans.length === 0 && (<tr><td colSpan="5" className="p-8 text-center text-stone-500 font-serif italic">Không tìm thấy kế hoạch hành hương nào.</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 relative group">
              <button onClick={() => { setTempReception(receptionInfo); setEditingReception(true); }} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"><Edit3 size={16} /></button>
              <h3 className="text-sm font-bold text-stone-800 mb-6 flex items-center gap-2 uppercase tracking-widest"><Heart className="text-pink-500" size={18} /> Liên Hệ Đón Tiếp</h3>
              <div className="space-y-5">
                <div className="border-b border-stone-50 pb-4">
                   <h4 className="text-xs font-bold text-pink-700 uppercase tracking-widest flex items-center gap-2 mb-2"><Users size={14} /> {receptionInfo.item1Title}</h4>
                   <p className="text-sm font-serif text-stone-600 leading-relaxed">{receptionInfo.item1Desc}</p>
                </div>
                <div className="border-b border-stone-50 pb-4">
                   <h4 className="text-xs font-bold text-pink-700 uppercase tracking-widest flex items-center gap-2 mb-2"><MapPin size={14} /> {receptionInfo.item2Title}</h4>
                   <p className="text-sm font-serif text-stone-600 leading-relaxed">{receptionInfo.item2Desc}</p>
                </div>
                <div>
                   <h4 className="text-xs font-bold text-pink-700 uppercase tracking-widest flex items-center gap-2 mb-2"><Phone size={14} /> {receptionInfo.item3Title}</h4>
                   <p className="text-sm font-serif text-stone-600 leading-relaxed mb-2">{receptionInfo.item3Desc}</p>
                   <span className="inline-block bg-pink-50 text-pink-700 font-bold px-3 py-1.5 rounded-lg text-sm border border-pink-100">{receptionInfo.item3Phone}</span>
                </div>
              </div>
            </div>
         </div>
       </div>
    </div>
  );
}

function LiturgyManager({ liturgyEvents, massSchedules, setTempMass, setEditingMass, confessionData, setTempConfession, setEditingConfession, adorationData, setTempAdoration, setEditingAdoration, setTempLiturgyEvent, setEditingLiturgyEvent }) {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const prevMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-pink-950 mb-2 uppercase tracking-tight">Quản Lý Phụng Vụ</h1>
        <p className="text-stone-500 font-serif text-sm md:text-base">Thiết lập Lịch Công giáo, Giờ Lễ và các Hoạt động thiêng liêng.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Lịch Tháng (Cột lớn) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
            <button onClick={prevMonth} className="p-2 text-stone-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition"><ChevronLeft size={20}/></button>
            <h3 className="text-lg md:text-xl font-bold font-serif text-pink-950 uppercase tracking-widest">Tháng {calendarDate.getMonth() + 1} / {calendarDate.getFullYear()}</h3>
            <button onClick={nextMonth} className="p-2 text-stone-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition"><ChevronRight size={20}/></button>
          </div>
          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {['T2','T3','T4','T5','T6','T7','CN'].map((d, i) => <div key={d} className={`text-center font-bold text-xs uppercase py-2 ${i === 6 ? 'text-red-500' : 'text-stone-400'}`}>{d}</div>)}
            {getDaysArray(calendarDate.getFullYear(), calendarDate.getMonth()).map((d, idx) => {
              if (d === null) return <div key={`empty-${idx}`}></div>;
              const dateStr = formatDateString(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), d));
              const evt = liturgyEvents.find(e => e.date === dateStr);
              const isToday = dateStr === formatDateString(new Date());

              return (
                <div key={idx} onClick={() => { setTempLiturgyEvent(evt || { date: dateStr, title: '', colorType: 'white', desc: '', quoteRef: '', quoteText: '' }); setEditingLiturgyEvent(true); }} className={`min-h-[90px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col hover:border-pink-300 hover:shadow-md relative group ${isToday ? 'bg-pink-50/50 border-pink-300 ring-1 ring-pink-100' : 'bg-white border-stone-100'}`}>
                  <span className={`text-xs font-bold mb-1.5 ${idx % 7 === 6 ? 'text-red-600' : (isToday ? 'text-pink-600' : 'text-stone-700')}`}>{d}</span>
                  {evt ? (
                    <div className={`text-[9px] p-1.5 rounded-lg border leading-tight line-clamp-3 font-medium shadow-sm ${litColors[evt.colorType]?.bg} ${litColors[evt.colorType]?.text} ${litColors[evt.colorType]?.border}`}>
                      {evt.title}
                    </div>
                  ) : (
                    <div className="flex-1 border-2 border-dashed border-transparent group-hover:border-pink-200 rounded-lg flex items-center justify-center transition-colors">
                      <Plus size={16} className="text-pink-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cột Phải (Các thẻ cài đặt nhanh) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 relative group">
            <button onClick={() => { const expanded = expandMassSchedules(normalizeMassSchedules(massSchedules)); setTempMass(expanded.map(d => ({ day: d.label, times: d.times }))); setEditingMass(true); }} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"><Edit3 size={16} /></button>
            <h3 className="text-sm font-bold text-stone-800 mb-4 flex items-center gap-2 uppercase tracking-widest"><Clock className="text-pink-500" size={18} /> Giờ Lễ Chung</h3>
            <div className="space-y-3">{expandMassSchedules(massSchedules).slice(0, 3).map((item, idx) => (<div key={idx} className="flex justify-between items-center text-sm border-b border-stone-50 pb-2"><span className="font-bold text-stone-600">{item.label}</span><span className="text-pink-600 font-bold">{item.times.length} lễ</span></div>))}<div className="text-center pt-2"><span className="text-xs text-stone-400 font-serif italic">...và các ngày khác</span></div></div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 relative group">
            <button onClick={() => { setTempConfession(confessionData); setEditingConfession(true); }} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"><Edit3 size={16} /></button>
            <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2 uppercase tracking-widest"><Heart className="text-purple-500" size={18} /> {confessionData.title || 'Bí Tích'}</h3>
            <p className="text-sm font-serif text-stone-500 line-clamp-3 leading-relaxed">{confessionData.desc || 'Chưa cập nhật'}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 relative group">
            <button onClick={() => { setTempAdoration(adorationData); setEditingAdoration(true); }} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"><Edit3 size={16} /></button>
            <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2 uppercase tracking-widest"><BookOpen className="text-amber-500" size={18} /> {adorationData.title || 'Chầu Thánh Thể'}</h3>
            <p className="text-sm font-serif text-stone-500 line-clamp-3 leading-relaxed">{adorationData.desc || 'Chưa cập nhật'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsManager({ newsItems, setTempNews, setEditingNews }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', ...new Set(newsItems.map(n => n.category))];

  const filteredNews = newsItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 max-w-6xl mx-auto">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div>
           <h1 className="text-2xl md:text-3xl font-bold text-pink-950 mb-2 uppercase tracking-tight">Quản Lý Tin Tức</h1>
           <p className="text-stone-500 font-serif text-sm md:text-base">Quản lý các bản tin, thông báo và sự kiện của Giáo xứ.</p>
         </div>
         <button onClick={() => {
           const today = new Date();
           const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
           setTempNews({ id: Date.now(), title: '', date: dateStr, category: 'Tin Tức', desc: '', image: '', content: '', isFeatured: false, imgFit: 'cover', views: 0, status: 'published' });
           setEditingNews('new');
         }} className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center gap-2">
           <Plus size={16} /> Thêm Bản Tin
         </button>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
         <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-4 bg-stone-50/50">
           <div className="relative flex-1">
             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
             <input type="text" placeholder="Tìm kiếm tiêu đề bài viết..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:border-pink-500 outline-none transition-colors shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
           <select className="px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:border-pink-500 outline-none transition-colors font-bold text-stone-600 cursor-pointer shadow-sm" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
             {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'Tất cả chuyên mục' : c}</option>)}
           </select>
         </div>

         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-stone-100 text-[10px] uppercase tracking-widest text-stone-500 border-b border-stone-200">
                 <th className="p-4 font-bold w-16 text-center">Ảnh</th>
                 <th className="p-4 font-bold min-w-[200px]">Tiêu Đề</th>
                 <th className="p-4 font-bold">Chuyên Mục</th>
                 <th className="p-4 font-bold text-center">Lượt Xem</th>
                 <th className="p-4 font-bold text-center">Nổi Bật</th>
                 <th className="p-4 font-bold text-right">Thao Tác</th>
               </tr>
             </thead>
             <tbody className="text-sm">
               {filteredNews.map(item => (
                 <tr key={item.id} className="border-b border-stone-100 hover:bg-pink-50/30 transition-colors group">
                   <td className="p-4 text-center"><div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 mx-auto shadow-sm border border-stone-200"><img src={item.image || '/logo.svg'} onError={(e) => { e.target.src = '/logo.svg'; e.target.onerror = null; }} className="w-full h-full object-cover bg-white" alt="" /></div></td>
                   <td className="p-4"><p className="font-bold text-stone-800 font-serif leading-snug line-clamp-2 max-w-sm mb-1">{item.status === 'draft' && <span className="bg-stone-500 text-white text-[9px] px-2 py-0.5 rounded shadow-sm mr-2 uppercase tracking-widest">Nháp</span>}{item.title}</p><p className="text-[10px] text-stone-400 font-bold tracking-widest uppercase">{item.date}</p></td>
                   <td className="p-4"><span className="bg-stone-100 border border-stone-200 text-stone-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">{item.category}</span></td>
                   <td className="p-4 text-center text-stone-600 font-bold"><div className="flex justify-center items-center gap-1.5 bg-pink-50 text-pink-600 px-3 py-1 rounded-full w-fit mx-auto border border-pink-100"><Eye size={14}/> {item.views || 0}</div></td>
                   <td className="p-4 text-center">{item.isFeatured ? <Star size={18} className="text-amber-500 fill-amber-500 mx-auto drop-shadow-sm" /> : <Star size={18} className="text-stone-300 mx-auto" />}</td>
                   <td className="p-4 text-right"><button onClick={() => { setTempNews(item); setEditingNews(item.id); }} className="p-2 text-stone-500 hover:text-pink-600 hover:bg-pink-100 rounded-lg transition-colors border border-transparent hover:border-pink-200 shadow-sm" title="Sửa bài viết"><Edit3 size={16} /></button></td>
                 </tr>
               ))}
               {filteredNews.length === 0 && (<tr><td colSpan="7" className="p-8 text-center text-stone-500 font-serif italic">Không tìm thấy bài viết nào phù hợp.</td></tr>)}
             </tbody>
           </table>
         </div>
       </div>
    </div>
  );
}

function Overview({ parishStats, newsItems, pilgrimagePlans, liturgyEvents, messages, dailyVisits }) {
  const publishedNews = newsItems.filter(n => n.status !== 'draft');
  const totalViews = publishedNews.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const upcomingPilgrimages = pilgrimagePlans.filter(p => p.status === 'Sắp diễn ra' || p.status === 'Đang mở đăng ký');
  
  // Tính toán biểu đồ dữ liệu thực tế
  const past7Days = Array.from({length: 7}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const chartData = past7Days.map(d => {
    const dateStr = formatDateString(d);
    const dayName = d.getDay() === 0 ? 'CN' : `T${d.getDay() + 1}`;
    return { day: dayName, dateStr, views: dailyVisits?.[dateStr] || 0 };
  });
  const maxView = Math.max(...chartData.map(d => d.views), 10); // Đảm bảo cột không bị lỗi khi max view = 0

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 max-w-5xl mx-auto">
       <h1 className="text-2xl md:text-3xl font-bold text-pink-950 mb-2 uppercase tracking-tight">Tổng Quan Hệ Thống</h1>
       <p className="text-stone-500 font-serif mb-8 text-sm md:text-base">Theo dõi tình hình hoạt động và tương tác của trang web Giáo xứ.</p>
       
       {/* Thẻ Thống Kê (Stat Cards) */}
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-center relative overflow-hidden group"><div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all"><FileText size={100}/></div><div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm"><FileText size={20}/></div><p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest hidden sm:block">Tin Tức</p></div><p className="text-3xl font-bold text-stone-800">{publishedNews.length}</p><p className="text-xs text-stone-400 font-serif mt-2">Bản tin đã đăng</p></div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-center relative overflow-hidden group"><div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all"><Eye size={100}/></div><div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center shadow-sm"><Eye size={20}/></div><p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Lượt Xem</p></div><p className="text-3xl font-bold text-stone-800">{totalViews}</p><p className="text-xs text-stone-400 font-serif mt-2">Tổng lượt đọc bài viết</p></div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-center relative overflow-hidden group"><div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all"><Map size={100}/></div><div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shadow-sm"><Map size={20}/></div><p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Hành Hương</p></div><p className="text-3xl font-bold text-stone-800">{upcomingPilgrimages.length}</p><p className="text-xs text-stone-400 font-serif mt-2">Kế hoạch đang mở/sắp tới</p></div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-center relative overflow-hidden group"><div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all"><Inbox size={100}/></div><div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shadow-sm"><Inbox size={20}/></div><p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest hidden sm:block">Hộp Thư</p></div><p className="text-3xl font-bold text-stone-800">{messages?.filter(m => m.status === 'new').length || 0}</p><p className="text-xs text-stone-400 font-serif mt-2">Ý nguyện mới</p></div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-center relative overflow-hidden group"><div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all"><Users size={100}/></div><div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-sm"><Users size={20}/></div><p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Giáo Dân</p></div><p className="text-3xl font-bold text-stone-800">{parishStats.population || '0'}</p><p className="text-xs text-stone-400 font-serif mt-2">Tổng số giáo dân</p></div>
       </div>

       {/* Biểu đồ Truy Cập Thực Tế */}
       <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-8 mb-6 md:mb-8 flex flex-col relative group">
          <h3 className="text-sm font-bold text-stone-800 mb-2 flex items-center gap-2 uppercase tracking-widest"><TrendingUp className="text-blue-500" size={18} /> Thống Kê Lượt Truy Cập (7 Ngày Qua)</h3>
          <p className="text-xs text-stone-400 font-serif mb-6">Dữ liệu được cập nhật tự động theo thời gian thực (Realtime)</p>
          <div className="h-48 flex items-end gap-2 md:gap-6 pt-6 border-b border-stone-100 pb-2">
            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar h-full justify-end animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-full relative flex justify-center items-end flex-1">
                  <div className="w-full max-w-[3rem] bg-blue-50 rounded-t-lg transition-all duration-500 group-hover/bar:bg-blue-500 relative" style={{ height: `${(d.views / maxView) * 100}%` }}>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] font-bold px-2.5 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none shadow-sm whitespace-nowrap">{d.views} người</span>
                  </div>
                </div>
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${i === 6 ? 'text-blue-600' : 'text-stone-400'}`}>{d.day}</span>
              </div>
            ))}
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
         {/* Bảng Xếp Hạng Bài Viết */}
         <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-8 flex flex-col h-[400px]">
            <h3 className="text-sm font-bold text-stone-800 mb-6 flex items-center gap-2 uppercase tracking-widest"><Star className="text-amber-500" size={18} /> Top Bài Viết</h3>
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
               {publishedNews.slice().sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((item, idx) => (<div key={item.id} className="flex items-center gap-4 p-3 hover:bg-stone-50 rounded-xl transition border border-transparent hover:border-stone-200"><div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-stone-200 text-stone-600' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'text-stone-400'}`}>{idx + 1}</div><div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 shadow-sm"><img src={item.image || '/logo.svg'} onError={(e) => { e.target.src = '/logo.svg'; e.target.onerror = null; }} className="w-full h-full object-cover bg-white" alt=""/></div><div className="flex-1"><p className="font-bold text-sm text-stone-800 line-clamp-2 leading-snug mb-1">{item.title}</p><p className="text-[10px] text-stone-400 uppercase tracking-widest">{item.category}</p></div><div className="flex items-center gap-1.5 text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100"><Eye size={12}/> {item.views || 0}</div></div>))}
               {newsItems.length === 0 && <div className="h-full flex items-center justify-center text-sm text-stone-400 font-serif italic">Chưa có dữ liệu bài viết.</div>}
            </div>
         </div>
         {/* Lịch Phụng Vụ Tóm Tắt */}
         <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-8 flex flex-col h-[400px]">
            <h3 className="text-sm font-bold text-stone-800 mb-6 flex items-center gap-2 uppercase tracking-widest"><CalendarDays className="text-pink-500" size={18} /> Phụng Vụ Gần Đây</h3>
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
               {liturgyEvents.slice().sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map((evt, idx) => (<div key={idx} className="flex gap-4 p-4 rounded-xl border border-stone-100 bg-stone-50/50"><div className="bg-white border border-stone-200 rounded-lg w-14 h-14 flex flex-col items-center justify-center flex-shrink-0 shadow-sm"><span className="text-[9px] uppercase font-bold text-pink-600">{new Date(evt.date).toLocaleDateString('vi-VN', { month: 'short' })}</span><span className="text-lg font-bold text-stone-800 leading-none mt-0.5">{new Date(evt.date).getDate()}</span></div><div><p className="font-bold text-sm text-stone-800 mb-1">{evt.title}</p><p className="text-xs font-serif text-stone-500 line-clamp-2 leading-relaxed">{evt.desc || 'Không có mô tả'}</p></div></div>))}
               {liturgyEvents.length === 0 && <div className="h-full flex items-center justify-center text-sm text-stone-400 font-serif italic">Chưa có sự kiện phụng vụ.</div>}
            </div>
         </div>
       </div>
    </div>
  );
}

function InboxManager({ messages, setAppConfirm }) {
  const [filter, setFilter] = useState('all'); // all, new, processed
  
  const filteredMessages = messages.filter(m => filter === 'all' ? true : m.status === filter);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'new' ? 'processed' : 'new';
    try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'messages', id.toString()), { status: newStatus }); }
    catch(e) { toast.error('Lỗi cập nhật trạng thái'); }
  };

  const handleDelete = (id) => {
    setAppConfirm({
      isOpen: true, title: 'Xóa Thư', message: 'Bạn có chắc chắn muốn xóa vĩnh viễn thư này không?', isDanger: true,
      onConfirm: async () => {
         setAppConfirm(prev => ({...prev, isOpen: false}));
         try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'messages', id.toString())); toast.success('Đã xóa thành công!'); }
         catch(e) { toast.error('Lỗi khi xóa thư'); }
      }
    });
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-pink-950 mb-2 uppercase tracking-tight">Hộp Thư Ý Nguyện</h1>
          <p className="text-stone-500 font-serif text-sm md:text-base">Quản lý các lời xin lễ, góp ý và liên hệ từ cộng đoàn giáo xứ.</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-stone-200 shadow-sm">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 text-xs font-bold rounded uppercase tracking-wider transition-colors ${filter === 'all' ? 'bg-pink-100 text-pink-700' : 'text-stone-500 hover:bg-stone-50'}`}>Tất cả</button>
          <button onClick={() => setFilter('new')} className={`px-4 py-2 text-xs font-bold rounded uppercase tracking-wider transition-colors ${filter === 'new' ? 'bg-pink-100 text-pink-700' : 'text-stone-500 hover:bg-stone-50'}`}>Thư Mới</button>
          <button onClick={() => setFilter('processed')} className={`px-4 py-2 text-xs font-bold rounded uppercase tracking-wider transition-colors ${filter === 'processed' ? 'bg-pink-100 text-pink-700' : 'text-stone-500 hover:bg-stone-50'}`}>Đã xử lý</button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredMessages.map(msg => {
          const isNew = msg.status === 'new';
          return (
            <div key={msg.id} className={`p-5 md:p-6 rounded-2xl border transition-all ${isNew ? 'bg-white shadow-md border-pink-200 ring-1 ring-pink-50' : 'bg-stone-50 border-stone-200 opacity-80'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isNew ? 'bg-pink-100 text-pink-600' : 'bg-stone-200 text-stone-500'}`}>
                    {isNew ? <Mail size={20} /> : <MailOpen size={20} />}
                  </div>
                  <div>
                    <h4 className={`text-base font-bold ${isNew ? 'text-pink-950' : 'text-stone-700'}`}>{msg.topic}</h4>
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-widest flex flex-wrap gap-2 mt-1">
                      <span>{msg.sender}</span> • <span>{msg.phone}</span> • <span>{msg.dateStr}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => handleToggleStatus(msg.id, msg.status)} className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border font-bold text-[10px] uppercase tracking-wider transition ${isNew ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-stone-200 text-stone-600 border-stone-300 hover:bg-stone-300'}`}>
                    <CheckCircle2 size={14} /> {isNew ? 'Đánh dấu đã xem' : 'Chưa xử lý'}
                  </button>
                  <button onClick={() => handleDelete(msg.id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-100" title="Xóa thư"><Trash2 size={18} /></button>
                </div>
              </div>
              
              <div className={`p-4 rounded-xl font-serif text-sm leading-relaxed whitespace-pre-wrap ${isNew ? 'bg-pink-50/50 text-stone-800' : 'bg-white text-stone-600 border border-stone-100'}`}>
                "{msg.content}"
              </div>
            </div>
          );
        })}
        
        {filteredMessages.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-100"><Inbox className="mx-auto text-stone-300 mb-4" size={48} /><p className="text-stone-500 font-serif">Không có thư nào trong mục này.</p></div>
        )}
      </div>
    </div>
  );
}