import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Clock, Calendar, MapPin, Phone, 
  ChevronRight, BookOpen, Users, Image as ImageIcon, 
  Bell, Heart, Search, Mail, ExternalLink, Quote,
  ChevronDown, Church, ArrowUp, Edit3, ChevronLeft,
  User, Star, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Send,
  MessageSquare, CheckCircle2
} from 'lucide-react';

// ==========================================
// 1. COMPONENT DÙNG CHUNG (GLOBAL COMPONENTS)
// ==========================================

const FacebookIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Logo = ({ sizeClass = "w-12 h-12", isSolid, src = "./logo.svg" }) => (
  <div className={`${sizeClass} border-2 rounded-full flex items-center justify-center transition-all duration-700 shadow-sm overflow-hidden bg-white flex-shrink-0 ${isSolid ? 'border-pink-500 shadow-pink-100' : 'border-white/50 shadow-black/20'}`}>
    <img 
      src={src} 
      alt="Logo Giáo Xứ" 
      className="w-full h-full object-contain p-1" 
      onError={(e) => {
        e.target.style.display = 'none';
        const fallback = e.target.nextSibling;
        if (fallback) fallback.style.display = 'flex';
      }}
    />
    <div style={{ display: 'none' }} className="w-full h-full items-center justify-center text-pink-600 bg-pink-50">
      <Church size={24} />
    </div>
  </div>
);

const editorContentClasses = "font-serif text-stone-700 text-sm md:text-base leading-relaxed text-justify flow-root [&_img]:max-w-[90%] md:[&_img]:max-w-[45%] [&_img]:h-auto [&_img]:rounded-md [&_img]:shadow-sm [&_p]:mb-4 [&_h3]:text-xl md:[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-pink-900 [&_h3]:mt-6 [&_h3]:mb-3 [&_h4]:text-lg md:[&_h4]:text-xl [&_h4]:font-bold [&_h4]:text-pink-700 [&_h4]:mt-5 [&_h4]:mb-2 [&_blockquote]:border-l-3 [&_blockquote]:border-pink-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-stone-500 [&_blockquote]:my-4";

const RichTextEditor = ({ value, onChange, minHeight = "150px" }) => {
  const editorRef = useRef(null);
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.contains(document.activeElement) && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => { if (editorRef.current) onChange(editorRef.current.innerHTML); };
  const execCmd = (command, val = null) => { document.execCommand(command, false, val); handleInput(); };

  const handleAlign = (alignType) => {
    if (selectedImg) {
      if (alignType === 'left') { selectedImg.style.display = 'inline-block'; selectedImg.style.float = 'left'; selectedImg.style.margin = '0.5rem 1.5rem 1rem 0'; }
      else if (alignType === 'right') { selectedImg.style.display = 'inline-block'; selectedImg.style.float = 'right'; selectedImg.style.margin = '0.5rem 0 1rem 1.5rem'; }
      else { selectedImg.style.display = 'block'; selectedImg.style.float = 'none'; selectedImg.style.margin = '1.5rem auto'; }
      selectedImg.style.outline = 'none'; setSelectedImg(null); handleInput();
    } else {
      const cmd = alignType === 'left' ? 'justifyLeft' : alignType === 'right' ? 'justifyRight' : 'justifyCenter';
      document.execCommand(cmd, false, null); handleInput();
    }
  };

  const handleInsertImage = (e) => {
    e.preventDefault();
    const url = prompt('Nhập đường dẫn (URL) của hình ảnh:');
    if (url) execCmd('insertHTML', `<img src="${url}" style="display: inline-block; float: left; margin: 0.5rem 1.5rem 1rem 0;" />&nbsp;`);
  };

  const handlePaste = (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
      const item = items[index];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (event) => execCmd('insertHTML', `<img src="${event.target.result}" style="display: inline-block; float: left; margin: 0.5rem 1.5rem 1rem 0;" />&nbsp;`);
        reader.readAsDataURL(item.getAsFile());
        return;
      }
    }
  };

  return (
    <div className="border border-pink-200 rounded-sm flex flex-col bg-white overflow-hidden shadow-sm">
      <div className="bg-pink-50 p-2 flex flex-wrap gap-1 border-b border-pink-200 items-center">
        <select onMouseDown={e => e.preventDefault()} onChange={(e) => execCmd('formatBlock', e.target.value)} className="text-xs p-1 border border-pink-200 rounded bg-white font-bold outline-none"><option value="P">Đoạn văn</option><option value="H3">Tiêu đề Lớn</option><option value="H4">Tiêu đề Nhỏ</option></select>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => execCmd('bold')} className="p-1.5 hover:bg-pink-200 rounded"><Bold size={14}/></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => execCmd('italic')} className="p-1.5 hover:bg-pink-200 rounded"><Italic size={14}/></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => execCmd('underline')} className="p-1.5 hover:bg-pink-200 rounded"><Underline size={14}/></button>
        <div className="w-px h-4 bg-pink-200 mx-1"></div>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleAlign('left')} className="p-1.5 hover:bg-pink-200 rounded ml-2"><AlignLeft size={14}/></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleAlign('center')} className="p-1.5 hover:bg-pink-200 rounded"><AlignCenter size={14}/></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleAlign('right')} className="p-1.5 hover:bg-pink-200 rounded"><AlignRight size={14}/></button>
        <div className="w-px h-4 bg-pink-200 mx-1"></div>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={handleInsertImage} className="p-1.5 hover:bg-pink-200 rounded"><ImageIcon size={14}/></button>
      </div>
      <div ref={editorRef} contentEditable onInput={handleInput} onPaste={handlePaste} onClick={(e) => { if (e.target.tagName === 'IMG') { e.target.style.outline = '3px solid #ec4899'; setSelectedImg(e.target); } else { if (selectedImg) selectedImg.style.outline='none'; setSelectedImg(null); } }} className={`p-4 focus:outline-none overflow-y-auto ${editorContentClasses}`} style={{ minHeight }} />
    </div>
  );
};


// ==========================================
// 2. DỮ LIỆU TĨNH & HELPERS (STATIC DATA)
// ==========================================

const navLinks = [
  { name: 'Trang Chủ', id: 'Home' },
  { name: 'Giới Thiệu', id: 'About' },
  { name: 'Phụng Vụ', id: 'Liturgy' },
  { name: 'Hành Hương', id: 'Pilgrimage' },
  { name: 'Tin Tức', id: 'News' },
  { name: 'Liên Hệ', id: 'Contact' },
];

const initialMassSchedules = [
  { day: 'Ngày Thường', times: ['05:00', '17:30'] },
  { day: 'Thứ Bảy', times: ['05:00', '17:30 (Lễ Chúa Nhật)'] },
  { day: 'Chúa Nhật', times: ['05:30', '07:30 (Thiếu Nhi)', '16:30', '18:30'] },
];

const initialNewsData = [
  { 
    id: 1, title: 'Đại lễ Kính Các Thánh Tử Đạo Việt Nam', date: '14/11/2023', category: 'Sự kiện', isFeatured: true,
    desc: '<p>Chương trình hành hương và đại lễ mừng kính tại Giáo xứ Hoàng Yên diễn ra trọng thể...</p>',
    image: 'https://images.unsplash.com/photo-1548625361-903df390453d?q=80&w=800&auto=format&fit=crop',
    content: '<p>Chương trình hành hương trang trọng diễn ra trong 3 ngày với sự tham gia của hàng nghìn giáo dân từ khắp nơi đổ về Đền Thánh.</p>'
  },
  { 
    id: 2, title: 'Thông báo Giáo lý niên khóa mới', date: '10/11/2023', category: 'Giáo lý', isFeatured: true,
    desc: '<p>Giáo xứ bắt đầu nhận hồ sơ đăng ký cho các lớp Đồng cỏ non, Khai tâm...</p>',
    image: 'https://images.unsplash.com/photo-1437603562860-1950e3ca6eab?q=80&w=800&auto=format&fit=crop',
    content: '<p>Văn phòng Giáo lý xin thông báo chi tiết về thời gian đăng ký và khai giảng niên khóa mới cho các em thiếu nhi.</p>'
  },
  { 
    id: 3, title: 'Bản tin Bác ái: Chuyến đi thăm mái ấm tình thương', date: '05/11/2023', category: 'Bác ái', isFeatured: false,
    desc: '<p>Hành trình mang yêu thương đến với các cụ già neo đơn tại cơ sở xã hội...</p>',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=800&auto=format&fit=crop',
    content: '<p>Hành trình mang yêu thương đến với các cụ già neo đơn tại cơ sở xã hội do Ban Bác Ái giáo xứ tổ chức đã thành công tốt đẹp.</p>'
  },
  { 
    id: 4, title: 'Thư ngỏ: Đóng góp xây dựng nhà giáo lý', date: '01/11/2023', category: 'Thông báo', isFeatured: false,
    desc: '<p>Kính gửi quý ân nhân và toàn thể cộng đoàn giáo xứ Hoàng Yên...</p>',
    image: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?q=80&w=800&auto=format&fit=crop',
    content: '<p>Để đáp ứng nhu cầu học giáo lý ngày càng tăng của các em thiếu nhi, giáo xứ kêu gọi sự chung tay đóng góp để xây dựng dãy phòng học mới.</p>'
  },
  { 
    id: 5, title: 'Thánh lễ ban Bí tích Thêm Sức năm 2023', date: '25/10/2023', category: 'Tin Tức', isFeatured: false,
    desc: '<p>Đức Giám mục Giáo phận đã về thăm mục vụ và ban Bí tích Thêm Sức cho 120 em...</p>',
    image: 'https://images.unsplash.com/photo-1544627056-a4c330f3050c?q=80&w=800&auto=format&fit=crop',
    content: '<p>Vào sáng Chúa Nhật vừa qua, Đức Giám mục Giáo phận đã cử hành Thánh lễ ban Bí tích Thêm Sức cho 120 em thiếu nhi trong giáo xứ.</p>'
  },
  { 
    id: 6, title: 'Lịch tĩnh tâm Mùa Vọng 2023 dành cho các giới', date: '20/10/2023', category: 'Sự kiện', isFeatured: false,
    desc: '<p>Chương trình tĩnh tâm Mùa Vọng dành cho các giới trong giáo xứ sẽ bắt đầu từ...</p>',
    image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=800&auto=format&fit=crop',
    content: '<p>Giáo xứ thông báo lịch tĩnh tâm Mùa Vọng năm 2023. Kính mời cộng đoàn sắp xếp thời gian tham dự để dọn mình đón Chúa Hài Đồng.</p>'
  }
];

const initialPilgrimageData = [
  {
    id: 1, title: 'Hành Hương Đức Mẹ La Vang - Thánh Địa Trà Kiệu', date: '15/06/2024', duration: '3 Ngày 2 Đêm', status: 'Đang mở đăng ký',
    desc: 'Hành trình thiêng liêng về với Đức Mẹ, kết hợp tham quan các di tích lịch sử Công giáo miền Trung.',
    image: 'https://images.unsplash.com/photo-1548625361-903df390453d?q=80&w=800&auto=format&fit=crop',
    content: '<h3>Chương trình chi tiết</h3><p><strong>Ngày 1:</strong> Khởi hành từ Giáo xứ lúc 5h00 sáng. Dừng chân nghỉ ngơi và dùng bữa trưa tại đèo Hải Vân...</p><p><strong>Ngày 2:</strong> Viếng Trung Tâm Hành Hương Thánh Mẫu La Vang. Tham dự Thánh Lễ chung...</p>'
  },
  {
    id: 2, title: 'Chương Trình Đón Tiếp Đoàn Hành Hương Giáo Phận', date: '24/11/2024', duration: '1 Ngày', status: 'Sắp diễn ra',
    desc: 'Đền Thánh hân hoan chuẩn bị chương trình đón tiếp các phái đoàn hành hương từ khắp nơi đổ về trong dịp đại lễ Bổn mạng.',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=800&auto=format&fit=crop',
    content: '<h3>Thông báo dành cho các Trưởng đoàn</h3><p>Ban Hành Giáo xin thông báo lịch trình đón tiếp như sau...</p><ul><li>Đăng ký vị trí đỗ xe trước 3 ngày.</li><li>Nhận phiếu ăn trưa tại Văn phòng Đền Thánh.</li></ul>'
  }
];

const getInitialLiturgyEvents = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  return [
    { date: `${y}-${m}-01`, title: 'Thứ Sáu Đầu Tháng - Kính Thánh Tâm', colorType: 'red', desc: 'Kính mời cộng đoàn tham dự Thánh lễ và Chầu Thánh Thể lúc 18h30.' },
    { date: `${y}-${m}-15`, title: 'Thánh Lễ Bổn Mạng Giáo Khu', colorType: 'white', desc: 'Thánh lễ tạ ơn và cầu nguyện cho các gia đình trong giáo khu.' },
    { date: `${y}-${m}-24`, title: 'Đại Lễ Các Thánh Tử Đạo VN', colorType: 'red', desc: 'Lễ Trọng. Kính mời cộng đoàn tham dự rước kiệu lúc 17h00.' }
  ];
};

const litColors = {
  white: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', name: 'Trắng/Vàng' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', name: 'Đỏ' },
  green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', name: 'Xanh Lá' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', name: 'Tím' },
  rose: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800', name: 'Hồng' }
};

const formatDateString = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDaysArray = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startingDayIndex = firstDay === 0 ? 6 : firstDay - 1; 
  const days = [];
  for (let i = 0; i < startingDayIndex; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
};

const getStatusStyles = (status) => {
  switch(status) {
    case 'Đang mở đăng ký': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Đã kết thúc': return 'bg-stone-100 text-stone-500 border-stone-200';
    case 'Sắp diễn ra':
    default: return 'bg-blue-100 text-blue-700 border-blue-200';
  }
};


// ==========================================
// 3. MAIN APP COMPONENT
// ==========================================

export default function App() {
  // --- States Cơ Bản ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [scrolled, setScrolled] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const itemsPerPage = 4;
  const newsPerPage = 6;
  
  // --- States Admin & Auth ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- States Tùy chỉnh Giao diện ---
  const [logoUrl, setLogoUrl] = useState('./logo.svg');
  const [editingLogo, setEditingLogo] = useState(false);
  const [tempLogoUrl, setTempLogoUrl] = useState('');

  // --- States Dữ Liệu (Trang Chủ & Chung) ---
  const [parishStats, setParishStats] = useState({ population: '5,420', priest: 'Lm. Giuse Nguyễn Văn A', patron: 'Các Thánh Tử Đạo VN', address: '123 Các Thánh Tử Đạo, TP.HCM' });
  const [quote, setQuote] = useState({ text: "<p>Ta là bánh hằng sống từ trời xuống. Ai ăn bánh này, sẽ được sống muôn đời.</p>", ref: "Ga 6, 51" });
  const [massSchedules, setMassSchedules] = useState(initialMassSchedules);
  
  // --- States Tab Liên Hệ ---
  const [contactInfo, setContactInfo] = useState({
    title: "Liên Hệ Văn Phòng Giáo Xứ",
    address: "123 Các Thánh Tử Đạo, Phường Hoàng Yên, Quận 1, TP. HCM",
    phone: "(028) 1234 5678",
    email: "vanphong@giaoxuhoangyen.vn",
    hours: "Sáng: 08:00 - 11:30 | Chiều: 14:00 - 17:00 (Nghỉ Thứ Hai)"
  });
  const [formStatus, setFormStatus] = useState('');

  // --- States Tùy chỉnh Giao diện ---
  const [heroData, setHeroData] = useState({ bgImage: 'https://travelplusvn.com/public/uploads/images/Bai_Viet/11_mon_do_khong_the_thieu/Nha-tho-Duc-Ba-1.jpg' });
  const [editingHero, setEditingHero] = useState(false);
  const [tempHero, setTempHero] = useState({});

  const [footerData, setFooterData] = useState({
    aboutText: 'Lạy Chúa, xin cho chúng con được hiệp nhất trong tình yêu và sự phục vụ.',
    facebookLink: '#'
  });
  const [editingFooter, setEditingFooter] = useState(false);
  const [tempFooter, setTempFooter] = useState({});
  const [editingQuickPhone, setEditingQuickPhone] = useState(false);

  // --- States Tab Phụng Vụ ---
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [liturgyEvents, setLiturgyEvents] = useState(getInitialLiturgyEvents());
  const [confessionData, setConfessionData] = useState({ title: "Bí Tích Giao Hòa", desc: "Trước các Thánh lễ ngày thường 30 phút và vào các giờ cố định chiều Thứ Bảy hằng tuần." });
  const [adorationData, setAdorationData] = useState({ title: "Chầu Thánh Thể", desc: "Thứ Năm hằng tuần từ 19:00 - 20:00 và Thứ Sáu đầu tháng sau lễ chiều." });

  // --- States Tab Giới Thiệu ---
  const [historyData, setHistoryData] = useState({
    title: "Dấu Ấn Lịch Sử",
    content: "<img src='https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=800&auto=format&fit=crop' style='float: left; margin: 0.5rem 1.5rem 1rem 0; width: 40%; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);' /><p>Giáo xứ Hoàng Yên được hình thành từ những hạt giống tin mừng đầu tiên gieo rắc vào cuối thế kỷ 19. Trải qua bao thăng trầm của thời cuộc, nay đã trở thành trung tâm đức tin kiên trung của vùng đất này.</p><p>Sự trưởng thành của Giáo xứ gắn liền với sự hy sinh thầm lặng của các bậc tiền nhân. Bằng mồ hôi, nước mắt và cả máu đào, các ngài đã dọn đường cho một thế hệ đức tin vững mạnh.</p><h4>Ngôi Đền Thánh Hiện Tại</h4><p>Ngôi nhà thờ mang đậm lối kiến trúc cổ điển Gothic hòa quyện với văn hóa truyền thống, khởi công xây dựng vào đầu thế kỷ 20. Không chỉ là nơi cử hành các mầu nhiệm thánh, Đền Thánh còn là biểu tượng vượt thời gian của lòng mến Chúa, nơi quy tụ hàng ngàn con tim chung nhịp đập yêu thương mỗi dịp thánh lễ lớn.</p>"
  });
  const [heritageTitle, setHeritageTitle] = useState("Gia Sản Thiêng Liêng");
  const [heritageList, setHeritageList] = useState([
    { id: 1, name: 'Thánh Anrê Trần An Dũng Lạc', brief: 'Linh mục, tử đạo năm 1839. Mẫu gương sáng ngời về lòng trung kiên.', image: 'https://images.unsplash.com/photo-1550404618-c2b61f879685?q=80&w=800&auto=format&fit=crop' },
    { id: 2, name: 'Thánh nữ Anê Lê Thị Thành', brief: 'Giáo dân, mẹ của 6 người con. Tử đạo năm 1841 vì che giấu các linh mục.', image: 'https://images.unsplash.com/photo-1544627056-a4c330f3050c?q=80&w=800&auto=format&fit=crop' },
    { id: 3, name: 'Thánh Phaolô Lê Bảo Tịnh', brief: 'Linh mục, tử đạo năm 1857. Nổi tiếng với bức thư gửi từ ngục tù.', image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=800&auto=format&fit=crop' },
    { id: 4, name: 'Thánh Giuse Nguyễn Duy Khang', brief: 'Thầy giảng, tử đạo năm 1861. Người đồng hành trung kiên của Đức cha Hermosilla.', image: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?q=80&w=800&auto=format&fit=crop' }
  ]);
  const [pastoralData, setPastoralData] = useState({
    title: "Định Hướng Mục Vụ",
    content: `<h4>01. Đào Tạo Đức Tin Giới Trẻ</h4><p>Chú trọng sâu sát vào việc giáo dục nhân bản và giáo lý cho thiếu nhi, thanh giới trẻ.</p><h4>02. Thực Thi Bác Ái Xã Hội</h4><p>Mở rộng vòng tay yêu thương đến những người có hoàn cảnh khó khăn, ốm đau.</p><h4>03. Đồng Hành Cùng Gia Đình</h4><p>Đồng hành và nâng đỡ các gia đình trẻ, biến mỗi gia đình thành một "Hội Thánh tại gia" đúng nghĩa.</p>`
  });

  // --- States Tab Hành Hương ---
  const [pilgrimagePlans, setPilgrimagePlans] = useState(initialPilgrimageData);
  const [receptionInfo, setReceptionInfo] = useState({
    item1Title: "Đăng ký đoàn", item1Desc: "Quý đoàn vui lòng báo trước 3 ngày để Giáo xứ sắp xếp giờ lễ riêng và không gian sinh hoạt.",
    item2Title: "Cơ sở vật chất", item2Desc: "Khuôn viên có bãi đỗ xe rộng rãi cho xe khách 45 chỗ. Có nhà ăn và khu vệ sinh chung.",
    item3Title: "Hỗ trợ trực tiếp", item3Desc: "Liên hệ Văn phòng Đền Thánh để được hỗ trợ tốt nhất.", item3Phone: "090.123.4567"
  });

  // --- States Tab Tin Tức ---
  const [newsItems, setNewsItems] = useState(initialNewsData);

  // --- States View Detail & Pagination ---
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedPilgrimage, setSelectedPilgrimage] = useState(null);
  const [lastTab, setLastTab] = useState('Home');
  const [newsPage, setNewsPage] = useState(1);
  const [pilgrimagePage, setPilgrimagePage] = useState(1);
  const [returnToNews, setReturnToNews] = useState(false);

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

  // --- Effects & Handlers ---
  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 50); setShowTopBtn(window.scrollY > 400); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (activeTab === 'Home' && returnToNews) {
      setTimeout(() => {
        const el = document.getElementById('news-section');
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
      setReturnToNews(false);
    } else {
      window.scrollTo(0, 0);
    }
  }, [activeTab, returnToNews]);

  const handleLoginSubmit = () => {
    if (password === 'admin') { setIsAdmin(true); setShowLoginModal(false); setPassword(''); setLoginError(''); }
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

  const prevMonth = () => { setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1)); };
  const nextMonth = () => { setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1)); };

  const isSolidHeader = scrolled || activeTab !== 'Home';

  // --- RENDER CONTENT THÔNG MINH ---
  const renderContent = () => {
    switch (activeTab) {
      
      // ==========================================
      // TAB: LIÊN HỆ
      // ==========================================
      case 'Contact': {
        return (
          <div className="py-20 md:py-24 bg-[#fffcfd] min-h-screen text-stone-900 animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto px-4 lg:px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-pink-950 mb-4 uppercase tracking-widest leading-tight">Liên Hệ</h2>
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <div className="h-[1px] w-16 bg-pink-200"></div><div className="text-pink-300 text-lg">❦</div><div className="h-[1px] w-16 bg-pink-200"></div>
                </div>
                <p className="text-stone-500 font-serif text-sm md:text-base max-w-2xl mx-auto italic text-center">"Hãy gõ, cửa sẽ mở cho anh em." (Mt 7, 7)</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-pink-50 relative group">
                    {isAdmin && <button onClick={() => { setTempContact(contactInfo); setEditingContact(true); }} className="absolute top-4 right-4 p-2 bg-pink-600 text-white rounded-full shadow-md transition active:scale-90 hover:bg-pink-700"><Edit3 size={14}/></button>}
                    <h3 className="text-xl font-bold text-pink-950 uppercase mb-8 pb-4 border-b border-pink-50 flex items-center gap-3"><Mail className="text-pink-600" /> {contactInfo.title || ''}</h3>
                    <ul className="space-y-6">
                      <li className="flex gap-4">
                        <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center flex-shrink-0"><MapPin size={18} className="text-pink-600"/></div>
                        <div><span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Địa chỉ</span><p className="text-sm font-serif text-stone-700 leading-relaxed">{contactInfo.address || ''}</p></div>
                      </li>
                      <li className="flex gap-4">
                        <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center flex-shrink-0"><Phone size={18} className="text-pink-600"/></div>
                        <div><span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Điện thoại</span><p className="text-lg font-bold text-pink-900">{contactInfo.phone || ''}</p></div>
                      </li>
                      <li className="flex gap-4">
                        <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center flex-shrink-0"><Mail size={18} className="text-pink-600"/></div>
                        <div><span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Email</span><p className="text-sm font-serif text-stone-700">{contactInfo.email || ''}</p></div>
                      </li>
                      <li className="flex gap-4">
                        <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center flex-shrink-0"><Clock size={18} className="text-pink-600"/></div>
                        <div><span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Giờ làm việc</span><p className="text-sm font-serif text-stone-700 italic">{contactInfo.hours || ''}</p></div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-stone-200 rounded-2xl h-64 shadow-inner overflow-hidden relative border border-stone-300 flex items-center justify-center">
                    <div className="text-center opacity-40"><MapPin size={48} className="mx-auto mb-2"/><p className="text-xs font-bold uppercase tracking-widest">Bản đồ Đền Thánh</p></div>
                    <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded shadow-sm text-[9px] font-bold uppercase tracking-widest">123 Các Thánh Tử Đạo, TP. HCM</div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg border border-pink-50">
                  <h3 className="text-xl font-bold text-pink-950 uppercase mb-6 pb-4 border-b border-pink-50 flex items-center gap-3"><MessageSquare className="text-pink-600" /> Gửi Ý Nguyện & Góp Ý</h3>
                  {formStatus === 'success' && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <CheckCircle2 size={20} className="text-emerald-500" />
                      <span className="text-sm font-bold">Gửi thông tin thành công! Xin cảm ơn bạn.</span>
                    </div>
                  )}
                  <form className="space-y-5" onSubmit={handleContactSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div><label className="text-[10px] font-bold uppercase text-stone-400 mb-2 block tracking-widest">Họ và tên</label><input type="text" required className="w-full border border-stone-200 bg-stone-50 p-3 rounded text-sm focus:border-pink-500 focus:bg-white outline-none transition" placeholder="Tên của bạn..." /></div>
                      <div><label className="text-[10px] font-bold uppercase text-stone-400 mb-2 block tracking-widest">Số điện thoại</label><input type="text" required className="w-full border border-stone-200 bg-stone-50 p-3 rounded text-sm focus:border-pink-500 focus:bg-white outline-none transition" placeholder="Số liên lạc..." /></div>
                    </div>
                    <div><label className="text-[10px] font-bold uppercase text-stone-400 mb-2 block tracking-widest">Chủ đề</label>
                      <select className="w-full border border-stone-200 bg-stone-50 p-3 rounded text-sm focus:border-pink-500 focus:bg-white outline-none transition cursor-pointer">
                        <option>Gửi ý lễ / Xin ơn</option>
                        <option>Góp ý xây dựng Giáo xứ</option>
                        <option>Hỏi đáp thủ tục Bí tích</option>
                        <option>Liên hệ công việc khác</option>
                      </select>
                    </div>
                    <div><label className="text-[10px] font-bold uppercase text-stone-400 mb-2 block tracking-widest">Nội dung</label><textarea required className="w-full border border-stone-200 bg-stone-50 p-3 rounded text-sm h-32 focus:border-pink-500 focus:bg-white outline-none transition resize-none font-serif" placeholder="Nhập nội dung ý nguyện hoặc góp ý của bạn tại đây..."></textarea></div>
                    <button type="submit" className="w-full bg-pink-700 hover:bg-pink-800 text-white font-bold py-4 rounded-lg shadow-md active:scale-95 transition-all uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 mt-4">Gửi Thông Tin <Send size={14}/></button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // ==========================================
      // TAB: PHỤNG VỤ
      // ==========================================
      case 'Liturgy': {
        const selectedDateStr = formatDateString(selectedDate);
        const eventOfDay = liturgyEvents.find(e => e.date === selectedDateStr);
        const eventColor = eventOfDay ? (litColors[eventOfDay.colorType] || litColors.white) : litColors.white;
        
        return (
          <div className="py-20 bg-[#fffcfd] min-h-screen text-stone-900 animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto px-4 lg:px-6">
              <div className="text-center mb-12"><h2 className="text-3xl md:text-5xl font-serif font-bold text-pink-950 uppercase tracking-widest leading-tight">Lịch Phụng Vụ</h2></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="bg-white p-6 shadow-lg shadow-pink-100 border-t-4 border-pink-500 rounded-xl relative group col-span-1 md:col-span-2 lg:col-span-1">
                  {isAdmin && <button onClick={() => { setTempMass([...massSchedules]); setEditingMass(true); }} className="absolute top-3 right-3 p-1.5 bg-pink-600 text-white rounded-full shadow-md"><Edit3 size={14}/></button>}
                  <h3 className="text-lg font-bold mb-5 uppercase text-pink-700 flex items-center gap-2"><Clock size={18}/> Giờ Lễ Chung</h3>
                  <div className="space-y-3">
                    {massSchedules.map((item, idx) => (
                      <div key={idx} className="flex justify-between p-3 bg-stone-50 rounded-lg text-[10px] font-bold">
                        <span className="text-pink-800 uppercase">{item.day}</span>
                        <div className="flex gap-1">{item.times.map((t, i) => <span key={i} className="bg-white border px-1.5 py-0.5 rounded">{t}</span>)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-6 shadow-lg shadow-purple-100 border-t-4 border-purple-500 rounded-xl relative group">
                  {isAdmin && <button onClick={() => { setTempConfession(confessionData); setEditingConfession(true); }} className="absolute top-3 right-3 p-1.5 bg-purple-600 text-white rounded-full shadow-md"><Edit3 size={14}/></button>}
                  <h3 className="text-lg font-bold text-purple-700 mb-3 flex items-center gap-2"><Heart size={18}/> {confessionData.title || ''}</h3>
                  <p className="font-serif text-sm leading-relaxed text-stone-600 whitespace-pre-wrap">{confessionData.desc || ''}</p>
                </div>
                <div className="bg-white p-6 shadow-lg shadow-amber-100 border-t-4 border-amber-500 rounded-xl relative group">
                  {isAdmin && <button onClick={() => { setTempAdoration(adorationData); setEditingAdoration(true); }} className="absolute top-3 right-3 p-1.5 bg-amber-600 text-white rounded-full shadow-md"><Edit3 size={14}/></button>}
                  <h3 className="text-lg font-bold text-amber-700 mb-3 flex items-center gap-2"><BookOpen size={18}/> {adorationData.title || ''}</h3>
                  <p className="font-serif text-sm leading-relaxed text-stone-600 whitespace-pre-wrap">{adorationData.desc || ''}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-pink-100 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <button onClick={prevMonth} className="p-2 text-pink-700 hover:bg-pink-50 rounded-full transition"><ChevronLeft size={20}/></button>
                    <h3 className="text-xl font-bold font-serif text-pink-950 uppercase">Tháng {calendarDate.getMonth() + 1} / {calendarDate.getFullYear()}</h3>
                    <button onClick={nextMonth} className="p-2 text-pink-700 hover:bg-pink-50 rounded-full transition"><ChevronRight size={20}/></button>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {['T2','T3','T4','T5','T6','T7','CN'].map((d, i) => <div key={d} className={`text-center font-bold text-xs uppercase py-2 ${i === 6 ? 'text-red-600' : 'text-stone-400'}`}>{d}</div>)}
                    {getDaysArray(calendarDate.getFullYear(), calendarDate.getMonth()).map((d, idx) => {
                      if (!d) return <div key={idx}></div>;
                      const dateStr = formatDateString(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), d));
                      const isSel = dateStr === selectedDateStr;
                      const evt = liturgyEvents.find(e => e.date === dateStr);
                      return (
                        <div key={idx} onClick={() => setSelectedDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), d))} className={`min-h-[80px] p-1 rounded-xl border transition-all cursor-pointer flex flex-col ${isSel ? 'border-pink-500 bg-pink-50 shadow-md ring-2 ring-pink-100' : 'border-stone-50 bg-white hover:border-pink-200'}`}>
                          <span className={`text-xs font-bold mb-auto ${idx % 7 === 6 ? 'text-red-600' : 'text-stone-700'}`}>{d}</span>
                          {evt && <div className={`text-[8px] p-1 rounded border leading-tight ${litColors[evt.colorType] ? litColors[evt.colorType].bg : ''} ${litColors[evt.colorType] ? litColors[evt.colorType].text : ''} ${litColors[evt.colorType] ? litColors[evt.colorType].border : ''}`}>{evt.title}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={`rounded-2xl shadow-lg border p-6 flex flex-col transition-all duration-500 ${eventColor.bg} ${eventColor.border}`}>
                   <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-2"><Calendar size={14} className="text-pink-500"/> {selectedDate.toLocaleDateString('vi-VN')}</span>
                      {isAdmin && <button onClick={() => { setTempLiturgyEvent(eventOfDay || { date: selectedDateStr, title: '', colorType: 'white', desc: '' }); setEditingLiturgyEvent(true); }} className="p-1.5 bg-white/50 hover:bg-white rounded-full shadow-sm transition"><Edit3 size={12}/></button>}
                   </div>
                   {eventOfDay ? (
                     <div>
                      <h4 className={`text-xl font-serif font-bold mb-4 ${eventColor.text}`}>{eventOfDay.title}</h4>
                      <p className="font-serif text-sm leading-relaxed text-stone-700 whitespace-pre-wrap">{eventOfDay.desc}</p>
                     </div>
                   ) : <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-stone-500"><BookOpen size={32} className="mb-2"/><p className="text-xs text-center font-serif">Lịch cử hành theo ngày thường</p></div>}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // ==========================================
      // TAB: HÀNH HƯƠNG (PILGRIMAGE)
      // ==========================================
      case 'Pilgrimage': {
        const totalPilgrimagePages = Math.ceil(pilgrimagePlans.length / itemsPerPage);
        const currentPilgrimagePlans = pilgrimagePlans.slice((pilgrimagePage - 1) * itemsPerPage, pilgrimagePage * itemsPerPage);

        return (
          <div className="py-20 md:py-24 bg-[#fffcfd] min-h-screen text-stone-900 animate-in fade-in duration-500">
            <div className="max-w-5xl mx-auto px-4 lg:px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-pink-950 mb-4 uppercase tracking-widest leading-tight text-center">Trung Tâm Hành Hương</h2>
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <div className="h-[1px] w-16 bg-pink-200"></div><div className="text-pink-300 text-lg">❦</div><div className="h-[1px] w-16 bg-pink-200"></div>
                </div>
                <p className="text-stone-500 font-serif text-sm md:text-base max-w-2xl mx-auto italic text-center leading-relaxed">"Phúc thay ai lấy Chúa làm sức mạnh, quyết tâm tiến bước hành hương." (Tv 84, 6)</p>
              </div>

              <div className="mb-16">
                <div className="flex justify-between items-center mb-8 border-b border-pink-100 pb-4 relative">
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-pink-950 uppercase tracking-widest">Kế Hoạch Hành Hương</h3>
                  {isAdmin && (
                    <button onClick={() => { setTempPilgrimage({ id: Date.now(), title: '', date: '', duration: '', status: 'Sắp diễn ra', desc: '', image: '', content: '' }); setEditingPilgrimage('new'); }} className="px-4 py-2 bg-pink-600 text-white text-[11px] font-bold rounded shadow-md transition-all active:scale-95 flex items-center gap-1">
                      + Thêm Kế Hoạch
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {currentPilgrimagePlans.map(plan => (
                    <div 
                      key={plan.id} 
                      onClick={() => { setSelectedPilgrimage(plan); setActiveTab('PilgrimageDetail'); window.scrollTo(0,0); }}
                      className="group flex flex-col sm:flex-row bg-white rounded-xl shadow-md border border-pink-50 overflow-hidden cursor-pointer hover:shadow-lg hover:border-pink-300 transition-all relative"
                    >
                      {isAdmin && <button onClick={(e) => { e.stopPropagation(); setTempPilgrimage(plan); setEditingPilgrimage(plan.id); }} className="absolute top-3 right-3 z-20 p-1.5 bg-white/80 backdrop-blur-sm text-pink-700 rounded-full shadow-sm transition hover:bg-pink-600 hover:text-white"><Edit3 size={14} /></button>}
                      
                      <div className="sm:w-56 h-48 sm:h-auto flex-shrink-0 relative overflow-hidden bg-stone-100">
                        <img src={plan.image || 'https://via.placeholder.com/400x300/831843/fce7f3?text=Hành+Hương'} alt={plan.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute top-3 left-3">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded shadow-sm border ${getStatusStyles(plan.status)} uppercase tracking-wider`}>{plan.status}</span>
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col justify-center flex-1">
                        <h4 className="text-lg md:text-xl font-serif font-bold text-pink-950 mb-3 group-hover:text-pink-700 transition leading-snug line-clamp-2">{plan.title}</h4>
                        <div className="flex flex-wrap gap-4 mb-4">
                          <span className="flex items-center text-xs font-bold text-stone-500 uppercase tracking-widest"><Calendar size={14} className="mr-1.5 text-pink-500" /> {plan.date}</span>
                          <span className="flex items-center text-xs font-bold text-stone-500 uppercase tracking-widest"><Clock size={14} className="mr-1.5 text-pink-500" /> {plan.duration}</span>
                        </div>
                        <p className="text-sm font-serif text-stone-600 leading-relaxed line-clamp-2">{plan.desc || ''}</p>
                      </div>
                    </div>
                  ))}

                  {pilgrimagePlans.length === 0 && (
                    <div className="text-center py-12 bg-stone-50 rounded-xl border border-stone-100">
                      <MapPin className="mx-auto text-stone-300 mb-4" size={32} />
                      <p className="text-stone-500 font-serif">Hiện tại chưa có kế hoạch hành hương nào.</p>
                    </div>
                  )}
                </div>

                {totalPilgrimagePages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-10">
                    <button onClick={() => setPilgrimagePage(p => Math.max(1, p - 1))} disabled={pilgrimagePage === 1} className="p-2 rounded border border-pink-200 text-pink-600 hover:bg-pink-50 disabled:opacity-30 disabled:hover:bg-transparent transition"><ChevronLeft size={16}/></button>
                    {Array.from({length: totalPilgrimagePages}, (_, i) => (
                      <button 
                        key={i+1} 
                        onClick={() => setPilgrimagePage(i+1)} 
                        className={`w-8 h-8 rounded text-sm font-bold transition ${pilgrimagePage === i + 1 ? 'bg-pink-600 text-white shadow-md' : 'text-stone-600 hover:bg-pink-50 border border-transparent hover:border-pink-200'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button onClick={() => setPilgrimagePage(p => Math.min(totalPilgrimagePages, p + 1))} disabled={pilgrimagePage === totalPilgrimagePages} className="p-2 rounded border border-pink-200 text-pink-600 hover:bg-pink-50 disabled:opacity-30 disabled:hover:bg-transparent transition"><ChevronRight size={16}/></button>
                  </div>
                )}
              </div>

              <div className="mt-16 bg-pink-950 p-8 md:p-12 rounded-2xl shadow-xl text-pink-50 border-t-4 border-pink-400 relative group">
                {isAdmin && <button onClick={() => { setTempReception(receptionInfo); setEditingReception(true); }} className="absolute top-4 right-4 z-20 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full shadow-md transition hover:bg-pink-600 active:scale-90"><Edit3 size={16} /></button>}
                <div className="text-center mb-10">
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4 uppercase tracking-tight flex items-center justify-center"><Heart className="mr-3 text-pink-400" size={28}/> Liên Hệ Đón Tiếp</h3>
                  <div className="h-[2px] w-16 bg-pink-800 mx-auto"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                  <div className="flex flex-col items-center md:items-start p-4 bg-pink-900/50 rounded-xl border border-pink-800/50">
                    <Users className="text-pink-400 mb-3" size={24} />
                    <h4 className="font-bold text-pink-200 uppercase tracking-widest text-[10px] mb-2">{receptionInfo.item1Title || ''}</h4>
                    <p className="font-serif text-sm leading-relaxed opacity-90 whitespace-pre-wrap">{receptionInfo.item1Desc || ''}</p>
                  </div>
                  <div className="flex flex-col items-center md:items-start p-4 bg-pink-900/50 rounded-xl border border-pink-800/50">
                    <MapPin className="text-pink-400 mb-3" size={24} />
                    <h4 className="font-bold text-pink-200 uppercase tracking-widest text-[10px] mb-2">{receptionInfo.item2Title || ''}</h4>
                    <p className="font-serif text-sm leading-relaxed opacity-90 whitespace-pre-wrap">{receptionInfo.item2Desc || ''}</p>
                  </div>
                  <div className="flex flex-col items-center md:items-start p-4 bg-pink-900/50 rounded-xl border border-pink-800/50">
                    <Phone className="text-pink-400 mb-3" size={24} />
                    <h4 className="font-bold text-pink-200 uppercase tracking-widest text-[10px] mb-2">{receptionInfo.item3Title || ''}</h4>
                    <p className="font-serif text-sm leading-relaxed opacity-90 mb-3 whitespace-pre-wrap">{receptionInfo.item3Desc || ''}</p>
                    <strong className="text-xl text-white block mt-auto">{receptionInfo.item3Phone || ''}</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      }

      // ==========================================
      // TAB: CHI TIẾT HÀNH HƯƠNG
      // ==========================================
      case 'PilgrimageDetail': {
        if (!selectedPilgrimage) return null;
        return (
          <div className="py-24 bg-[#fffcfd] min-h-screen text-stone-900 animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto px-4 lg:px-6">
              <button onClick={() => { setActiveTab('Pilgrimage'); window.scrollTo(0,0); }} className="flex items-center text-pink-700 hover:text-pink-900 mb-8 font-bold text-[11px] uppercase tracking-widest transition-transform hover:-translate-x-1"><ChevronLeft size={14} className="mr-1" /> Quay lại Kế hoạch Hành Hương</button>
              
              <div className="bg-white rounded-2xl shadow-xl border border-pink-50 overflow-hidden relative">
                {isAdmin && <button onClick={() => { setTempPilgrimage(selectedPilgrimage); setEditingPilgrimage(selectedPilgrimage.id); }} className="absolute top-4 right-4 z-20 p-2.5 bg-white/80 backdrop-blur-sm text-pink-700 rounded-full shadow-md transition active:scale-90 hover:bg-pink-600 hover:text-white"><Edit3 size={16} /></button>}
                
                <img src={selectedPilgrimage.image} alt={selectedPilgrimage.title} className="w-full aspect-[21/9] md:aspect-[21/7] object-cover bg-stone-100" />
                
                <div className="p-8 md:p-12">
                  <div className="mb-4">
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded shadow-sm border ${getStatusStyles(selectedPilgrimage.status)} uppercase tracking-wider`}>{selectedPilgrimage.status}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-pink-950 leading-tight mb-6">{selectedPilgrimage.title}</h1>
                  
                  <div className="flex flex-wrap gap-6 mb-10 pb-6 border-b border-pink-100">
                    <span className="flex items-center text-xs font-bold text-stone-500 uppercase tracking-widest"><Calendar size={14} className="mr-2 text-pink-500" /> Ngày: {selectedPilgrimage.date}</span>
                    <span className="flex items-center text-xs font-bold text-stone-500 uppercase tracking-widest"><Clock size={14} className="mr-2 text-pink-500" /> Thời lượng: {selectedPilgrimage.duration}</span>
                  </div>

                  <p className="text-lg font-serif italic text-stone-600 mb-10 leading-relaxed border-l-4 border-pink-300 pl-4">{selectedPilgrimage.desc}</p>
                  <div className={editorContentClasses} dangerouslySetInnerHTML={{ __html: selectedPilgrimage.content || '' }} />
                </div>
              </div>
            </div>
          </div>
        );
      }

      // ==========================================
      // TAB: GIỚI THIỆU (ABOUT)
      // ==========================================
      case 'About': {
        return (
          <div className="py-20 md:py-24 bg-[#fffcfd] min-h-screen text-stone-900 animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto px-4 lg:px-6">
              
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-pink-950 mb-4 uppercase tracking-widest leading-tight text-center">Lịch Sử & Di Sản</h2>
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <div className="h-[1px] w-16 bg-pink-200"></div><div className="text-pink-300 text-lg">❦</div><div className="h-[1px] w-16 bg-pink-200"></div>
                </div>
                <p className="text-stone-500 font-serif text-sm md:text-base max-w-2xl mx-auto italic text-center leading-relaxed">"Anh em hãy nhớ đến những người lãnh đạo đã giảng Lời Chúa cho anh em. Hãy nhìn xem kết cuộc đời họ mà noi gương đức tin của họ." (Dt 13, 7)</p>
              </div>

              <div className="mb-16 bg-white shadow-lg rounded-xl border border-pink-50 p-6 md:p-8 relative group">
                {isAdmin && <button onClick={() => { setTempStats(parishStats); setEditingStats(true); }} className="absolute top-3 right-3 p-1.5 bg-pink-600 text-white rounded-full shadow-md"><Edit3 size={14} /></button>}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x-0 md:divide-x divide-pink-100">
                  <div className="text-center px-2"><Users className="mx-auto text-pink-500 mb-2" size={24} /><span className="block text-2xl font-serif font-bold text-pink-950 tracking-tight mb-1">{parishStats.population || ''}</span><span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">Giáo dân</span></div>
                  <div className="text-center px-2"><User className="mx-auto text-pink-500 mb-2" size={24} /><span className="block text-base md:text-lg font-serif font-bold text-pink-950 tracking-tight mb-1 line-clamp-1">{parishStats.priest || ''}</span><span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">Linh mục</span></div>
                  <div className="text-center px-2"><Star className="mx-auto text-pink-500 mb-2" size={24} /><span className="block text-base md:text-lg font-serif font-bold text-pink-950 tracking-tight mb-1 line-clamp-1">{parishStats.patron || ''}</span><span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">Bổn mạng</span></div>
                  <div className="text-center px-2"><MapPin className="mx-auto text-pink-500 mb-2" size={24} /><span className="block text-base md:text-lg font-serif font-bold text-pink-950 tracking-tight mb-1 line-clamp-1">{parishStats.address || ''}</span><span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">Địa chỉ</span></div>
                </div>
              </div>

              <div className="mb-16 relative group bg-white p-6 md:p-10 rounded-2xl border border-pink-50 shadow-md">
                {isAdmin && <button onClick={() => { setTempHistory(historyData); setEditingHistory(true); }} className="absolute top-4 right-4 z-20 p-2 bg-pink-600 text-white rounded-full shadow-md transition hover:bg-pink-700 active:scale-90"><Edit3 size={14} /></button>}
                <div className="text-center mb-8">
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-pink-950 uppercase tracking-widest">{historyData.title || ''}</h3>
                  <div className="h-[2px] w-16 bg-pink-200 mx-auto mt-4"></div>
                </div>
                <div className={`max-h-[1200px] overflow-y-auto custom-scrollbar pr-4 ${editorContentClasses}`} dangerouslySetInnerHTML={{ __html: historyData.content || '' }} />
              </div>

              <div className="mb-16 relative group bg-white p-6 md:p-10 rounded-2xl border border-pink-50 shadow-md">
                <div className="text-center mb-8 relative">
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-pink-950 uppercase tracking-widest inline-flex items-center">
                    {heritageTitle || ''}
                  </h3>
                  <div className="h-[2px] w-16 bg-pink-200 mx-auto mt-4"></div>
                  {isAdmin && (
                    <button onClick={() => { setTempHeritageTitle(heritageTitle); setEditingHeritageTitle(true); }} className="absolute top-0 right-10 md:right-14 p-2 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-600 hover:text-white transition shadow-sm">
                      <Edit3 size={14} />
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => { setTempHeritageItem({ id: Date.now(), name: '', brief: '', image: '' }); setEditingHeritageItem('new'); }} className="absolute top-0 right-0 p-2 bg-pink-600 text-white rounded-full shadow-sm hover:bg-pink-500 transition">
                      <span className="font-bold px-1">+</span>
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {heritageList.map(saint => (
                    <div key={saint.id} className="relative group/card flex flex-col sm:flex-row gap-4 bg-pink-50/40 p-5 rounded-xl border border-pink-100 hover:border-pink-300 hover:shadow-md transition-all duration-300 items-center sm:items-start">
                      {isAdmin && (
                        <button onClick={(e) => { e.stopPropagation(); setTempHeritageItem(saint); setEditingHeritageItem(saint.id); }} className="absolute top-3 right-3 z-20 p-1.5 bg-pink-100 text-pink-700 rounded-full shadow-sm transition hover:bg-pink-600 hover:text-white"><Edit3 size={12} /></button>
                      )}
                      <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 relative">
                        <img src={saint.image || 'https://via.placeholder.com/150/831843/fce7f3?text=Thánh'} alt={saint.name} className="w-full h-full object-cover rounded-full border-[3px] border-white shadow-sm group-hover/card:border-pink-200 transition-colors" />
                      </div>
                      <div className="flex flex-col justify-center text-center sm:text-left flex-1">
                        <h4 className="text-base md:text-lg font-bold text-pink-950 mb-2 font-serif tracking-wide">{saint.name || ''}</h4>
                        <p className="text-xs md:text-sm font-serif text-stone-600 leading-relaxed">{saint.brief || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-16 relative group bg-white p-6 md:p-10 rounded-2xl border border-pink-50 shadow-md">
                {isAdmin && <button onClick={() => { setTempPastoral(pastoralData); setEditingPastoral(true); }} className="absolute top-4 right-4 z-20 p-2 bg-pink-600 text-white rounded-full shadow-md transition hover:bg-pink-700 active:scale-90"><Edit3 size={14} /></button>}
                <div className="text-center mb-8">
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-pink-950 uppercase tracking-widest">{pastoralData.title || ''}</h3>
                  <div className="h-[2px] w-16 bg-pink-200 mx-auto mt-4"></div>
                </div>
                <div className={`max-h-[1200px] overflow-y-auto custom-scrollbar pr-4 ${editorContentClasses}`} dangerouslySetInnerHTML={{ __html: pastoralData.content || '' }} />
              </div>

            </div>
          </div>
        );
      }

      // ==========================================
      // TAB: TIN TỨC (NEWS)
      // ==========================================
      case 'News': {
        const featuredNews = newsItems.filter(n => n.isFeatured).slice(0, 2);
        const featuredIds = featuredNews.map(n => n.id);
        const regularNews = newsItems.filter(n => !featuredIds.includes(n.id));
        
        const totalNewsPages = Math.ceil(regularNews.length / newsPerPage);
        const currentRegularNews = regularNews.slice((newsPage - 1) * newsPerPage, newsPage * newsPerPage);

        return (
          <div className="py-20 md:py-24 bg-[#fffcfd] min-h-screen text-stone-900 animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto px-4 lg:px-6">
              
              <div className="text-center mb-12 relative">
                <h2 className="text-pink-600 font-bold uppercase tracking-widest text-[10px] mb-2">Truyền thông Công giáo</h2>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-pink-950 uppercase tracking-widest leading-tight">Tin Tức & Thông Báo</h3>
                <div className="flex items-center justify-center space-x-3 mt-6 mb-8">
                  <div className="h-[1px] w-16 bg-pink-200"></div><div className="text-pink-300 text-lg">❦</div><div className="h-[1px] w-16 bg-pink-200"></div>
                </div>
                {isAdmin && (
                  <button onClick={() => { setTempNews({ id: Date.now(), title: '', date: getTodayFormattedStr(), category: 'Tin Tức', desc: '', image: '', content: '', isFeatured: false }); setEditingNews('new'); }} className="absolute right-0 top-6 px-4 py-2 bg-pink-600 text-white text-[11px] font-bold rounded shadow-md transition-all active:scale-95 hidden md:flex items-center gap-1">
                    + Thêm Bản Tin
                  </button>
                )}
              </div>
              {isAdmin && (
                <button onClick={() => { setTempNews({ id: Date.now(), title: '', date: getTodayFormattedStr(), category: 'Tin Tức', desc: '', image: '', content: '', isFeatured: false }); setEditingNews('new'); }} className="mb-8 w-full py-3 bg-pink-600 text-white text-xs font-bold rounded shadow-md transition active:scale-95 flex md:hidden items-center justify-center gap-2">
                  + Thêm Bản Tin
                </button>
              )}

              {/* TIN NỔI BẬT */}
              {featuredNews.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center mb-6">
                    <span className="bg-pink-100 text-pink-700 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm border border-pink-200 flex items-center"><Star size={12} className="mr-1.5" /> Tin Nổi Bật</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {featuredNews.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => { setLastTab('News'); setSelectedNews(item); setActiveTab('NewsDetail'); window.scrollTo(0,0); }}
                        className="group cursor-pointer relative flex flex-col rounded-2xl overflow-hidden shadow-lg border border-pink-50 h-[380px] bg-white hover:shadow-xl hover:border-pink-200 transition-all duration-300"
                      >
                        {isAdmin && <button onClick={(e) => { e.stopPropagation(); setTempNews(item); setEditingNews(item.id); }} className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-sm text-pink-700 rounded-full shadow-md transition hover:bg-pink-600 hover:text-white"><Edit3 size={14} /></button>}
                        <div className="h-[220px] w-full overflow-hidden relative">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
                          <span className="absolute bottom-4 left-4 bg-pink-600 text-white text-[9px] font-bold px-2 py-1 rounded inline-block shadow-sm uppercase tracking-wider">{item.category}</span>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <h4 className="font-serif font-bold text-xl text-pink-950 mb-3 group-hover:text-pink-700 transition leading-snug line-clamp-2">{item.title}</h4>
                          <div className="text-stone-500 text-sm line-clamp-2 leading-relaxed font-serif mb-4 flex-1" dangerouslySetInnerHTML={{ __html: item.desc || '' }} />
                          <p className="text-[10px] font-bold text-stone-400 uppercase flex items-center tracking-widest mt-auto"><Calendar size={12} className="mr-1.5 text-pink-400" />{item.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DANH SÁCH TIN TỨC */}
              <div>
                <h3 className="text-xl font-serif font-bold text-pink-950 uppercase tracking-widest mb-6 pb-4 border-b border-pink-100">Điểm Tin Giáo Xứ</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentRegularNews.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => { setLastTab('News'); setSelectedNews(item); setActiveTab('NewsDetail'); window.scrollTo(0,0); }}
                      className="group cursor-pointer relative bg-white p-4 rounded-xl border border-pink-50 shadow-sm hover:border-pink-300 hover:shadow-md transition-all flex flex-col"
                    >
                      {isAdmin && <button onClick={(e) => { e.stopPropagation(); setTempNews(item); setEditingNews(item.id); }} className="absolute top-2 right-2 z-20 p-1.5 bg-pink-100 text-pink-700 rounded-full shadow-sm transition hover:bg-pink-600 hover:text-white"><Edit3 size={12} /></button>}
                      <div className="w-full h-48 mb-4 relative overflow-hidden rounded-lg shadow-sm">
                        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 bg-stone-100" />
                        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-pink-700 text-[9px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">{item.category}</span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center mb-2"><Calendar size={10} className="mr-1.5" />{item.date}</p>
                        <h4 className="font-serif font-bold text-lg text-pink-950 mb-2 group-hover:text-pink-700 transition leading-snug line-clamp-2">{item.title}</h4>
                        <div className="text-stone-500 text-sm line-clamp-3 leading-relaxed font-serif mt-auto" dangerouslySetInnerHTML={{ __html: item.desc || '' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {totalNewsPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-12">
                    <button onClick={() => setNewsPage(p => Math.max(1, p - 1))} disabled={newsPage === 1} className="p-2 rounded border border-pink-200 text-pink-600 hover:bg-pink-50 disabled:opacity-30 disabled:hover:bg-transparent transition"><ChevronLeft size={16}/></button>
                    {Array.from({length: totalNewsPages}, (_, i) => (
                      <button 
                        key={i+1} 
                        onClick={() => setNewsPage(i+1)} 
                        className={`w-8 h-8 rounded text-sm font-bold transition ${newsPage === i + 1 ? 'bg-pink-600 text-white shadow-md' : 'text-stone-600 hover:bg-pink-50 border border-transparent hover:border-pink-200'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button onClick={() => setNewsPage(p => Math.min(totalNewsPages, p + 1))} disabled={newsPage === totalNewsPages} className="p-2 rounded border border-pink-200 text-pink-600 hover:bg-pink-50 disabled:opacity-30 disabled:hover:bg-transparent transition"><ChevronRight size={16}/></button>
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      }

      // ==========================================
      // TAB: CHI TIẾT TIN TỨC
      // ==========================================
      case 'NewsDetail': {
        if (!selectedNews) return null;
        return (
          <div className="py-24 bg-[#fffcfd] min-h-screen text-stone-900 animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto px-4 lg:px-6">
              <button onClick={() => { setActiveTab(lastTab); if(lastTab === 'Home') setReturnToNews(true); window.scrollTo(0,0); }} className="flex items-center text-pink-700 hover:text-pink-900 mb-8 font-bold text-[11px] uppercase tracking-widest transition-transform hover:-translate-x-1"><ChevronLeft size={14} className="mr-1" /> Quay lại {lastTab === 'Home' ? 'Trang chủ' : 'Tin Tức'}</button>
              <div className="flex justify-between items-start mb-5 gap-4">
                <h1 className="text-2xl md:text-4xl font-serif font-bold text-pink-950 leading-tight">{selectedNews.title}</h1>
                {isAdmin && <button onClick={() => { setTempNews(selectedNews); setEditingNews(selectedNews.id); }} className="p-2.5 bg-pink-600 text-white rounded-full shadow-md flex-shrink-0 transition active:scale-90"><Edit3 size={16} /></button>}
              </div>
              <div className="flex items-center text-stone-500 mb-8 text-[11px] md:text-xs font-bold uppercase tracking-wider border-b border-pink-100 pb-4">
                <Calendar size={12} className="mr-1.5 text-pink-500" /> {selectedNews.date}
              </div>
              <img src={selectedNews.image} alt={selectedNews.title} className="w-full aspect-[21/9] object-cover rounded-lg mb-8 shadow-sm border border-pink-50" />
              <div className={editorContentClasses} dangerouslySetInnerHTML={{ __html: selectedNews.content || selectedNews.desc || '' }} />
            </div>
          </div>
        );
      }

      // ==========================================
      // TAB: TRANG CHỦ (HOME)
      // ==========================================
      case 'Home':
      default: {
        return (
          <div className="animate-in fade-in duration-500">
             <section className="relative h-[85vh] flex items-center justify-center text-white overflow-hidden group">
                {isAdmin && <button onClick={() => { setTempHero(heroData); setEditingHero(true); }} className="absolute top-24 right-4 z-50 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full shadow-md transition active:scale-90 hover:bg-pink-600"><Edit3 size={16}/></button>}
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[30000ms] scale-105" style={{ backgroundImage: `url("${heroData.bgImage}")` }}></div>
                <div className="relative z-20 max-w-5xl px-4 text-center">
                  <h2 className="text-pink-200 text-xs md:text-sm uppercase tracking-[0.6em] mb-4 font-bold">Chào mừng quý vị đến với</h2>
                  <h1 className="text-4xl md:text-7xl font-serif font-bold tracking-tight uppercase leading-tight">GIÁO XỨ HOÀNG YÊN</h1>
                  <p className="text-base md:text-xl font-serif font-light text-pink-50 mt-6 italic tracking-wider opacity-90 uppercase">ĐỀN THÁNH NỮ VƯƠNG CÁC THÁNH TỬ ĐẠO VIỆT NAM</p>
                  <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                    <button onClick={() => { setActiveTab('Liturgy'); window.scrollTo(0,0); }} className="px-10 py-3 bg-pink-700 hover:bg-pink-800 text-white rounded font-bold text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95">Lịch Phụng Vụ</button>
                    <button onClick={() => { setActiveTab('Pilgrimage'); window.scrollTo(0,0); }} className="px-10 py-3 bg-transparent hover:bg-white/10 text-white border border-white/50 rounded font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95">Hành Hương</button>
                  </div>
                </div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce text-pink-200/50"><ChevronDown size={32} /></div>
             </section>

             <section className="py-16 bg-[#fffcfd] relative z-20 border-b border-pink-50">
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
                   <div className="bg-white p-8 rounded-2xl shadow-md border border-pink-100 flex flex-col items-center text-center relative group">
                      <Quote size={40} className="text-pink-100 mb-4"/>
                      <h3 className="text-lg font-bold text-pink-900 uppercase border-b border-pink-50 pb-2 mb-6 tracking-tighter">Lời Chúa Hôm Nay</h3>
                      <div className="text-stone-700 font-serif italic text-base leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: quote.text || '' }} />
                      <p className="text-pink-800 font-bold text-[11px] uppercase tracking-widest mt-auto">{quote.ref || ''}</p>
                      {isAdmin && <button onClick={() => { setTempQuote({ text: quote.text, ref: quote.ref }); setEditingQuote(true); }} className="absolute top-4 right-4 p-1.5 bg-pink-600 text-white rounded-full shadow"><Edit3 size={12}/></button>}
                   </div>
                   <div className="bg-pink-950 p-8 rounded-2xl shadow-xl text-white flex flex-col items-center text-center border-t-4 border-pink-400 relative group">
                      <Clock size={32} className="text-pink-300 mb-4"/>
                      <h3 className="text-xl font-bold uppercase text-pink-100 tracking-tight mb-8">Giờ Thánh Lễ</h3>
                      <div className="w-full space-y-4">
                        {massSchedules.map((item, idx) => (<div key={idx} className="border-b border-pink-900/50 pb-2 last:border-0 flex justify-between items-center"><p className="font-bold text-pink-300 uppercase text-[9px] tracking-wider">{item.day}</p><div className="flex gap-2">{item.times.slice(0,2).map((t, i) => <span key={i} className="text-[9px] bg-pink-900/50 px-1.5 py-0.5 rounded border border-pink-800">{t}</span>)}</div></div>))}
                      </div>
                      {isAdmin && <button onClick={() => { setTempMass([...massSchedules]); setEditingMass(true); }} className="absolute top-4 right-4 p-1.5 bg-pink-600 text-white rounded-full shadow"><Edit3 size={12}/></button>}
                   </div>
                   <div className="bg-white p-8 rounded-2xl shadow-md border border-pink-100 flex flex-col">
                      <h3 className="text-lg font-bold text-pink-900 uppercase border-b border-pink-50 pb-2 mb-6 tracking-tighter">Thông Báo Mới</h3>
                      <div className="space-y-4 cursor-pointer" onClick={() => { if(newsItems[0]) { setLastTab('Home'); setSelectedNews(newsItems[0]); setActiveTab('NewsDetail'); window.scrollTo(0,0); } }}>
                        <p className="text-[9px] font-bold text-pink-600 uppercase tracking-widest">Tin nổi bật</p>
                        <p className="font-serif font-bold text-base line-clamp-3 text-pink-950">{newsItems[0]?.title || 'Đang cập nhật...'}</p>
                        <div className="text-stone-500 text-sm line-clamp-3 font-serif" dangerouslySetInnerHTML={{ __html: newsItems[0]?.desc || '' }} />
                      </div>
                      <div className="mt-auto pt-8 border-t border-pink-50 text-center relative group">
                        {isAdmin && <button onClick={() => { setTempContact(contactInfo); setEditingQuickPhone(true); }} className="absolute top-4 right-0 p-1.5 bg-pink-100 text-pink-600 rounded-full shadow-sm transition hover:bg-pink-600 hover:text-white"><Edit3 size={12}/></button>}
                        <Phone size={18} className="mx-auto text-pink-600 mb-1" />
                        <div className="text-lg font-bold text-pink-950">{contactInfo.phone}</div>
                        <span className="text-[9px] text-stone-400 uppercase font-bold tracking-widest">Văn phòng giáo xứ</span>
                      </div>
                   </div>
                </div>
             </section>
          </div>
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-white font-serif selection:bg-pink-100 antialiased relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(236, 72, 153, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(219, 39, 119, 0.6); }
      `}} />

      {/* ========================================== */}
      {/* TRÌNH ĐIỀU HƯỚNG (HEADER) */}
      {/* ========================================== */}
      <header className={`fixed w-full z-[100] transition-all duration-500 ${isSolidHeader ? 'bg-white shadow-md py-3 border-b border-pink-50' : 'bg-transparent py-5 text-white'}`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group relative" onClick={() => { setActiveTab('Home'); window.scrollTo(0,0); }}>
            {isAdmin && <button onClick={(e) => { e.stopPropagation(); setTempLogoUrl(logoUrl); setEditingLogo(true); }} className="absolute -top-3 -left-3 z-[110] p-1.5 bg-pink-600 text-white rounded-full shadow-md hover:bg-pink-700 transition active:scale-90"><Edit3 size={12} /></button>}
            <Logo sizeClass="w-10 h-10 md:w-12 md:h-12" isSolid={isSolidHeader} src={logoUrl} />
            <div className={`border-l pl-4 hidden sm:block ${isSolidHeader ? 'border-pink-200' : 'border-white/20'}`}>
              <h1 className={`font-bold text-base md:text-lg leading-none uppercase tracking-tight ${isSolidHeader ? 'text-pink-950' : 'text-white'}`}>GIÁO XỨ HOÀNG YÊN</h1>
              <p className={`text-[8px] md:text-[9px] font-bold uppercase tracking-[0.15em] mt-1 ${isSolidHeader ? 'text-pink-700' : 'text-pink-300'}`}>ĐỀN THÁNH NỮ VƯƠNG CÁC THÁNH TỬ ĐẠO VIỆT NAM</p>
            </div>
          </div>
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <button key={link.id} onClick={() => { setActiveTab(link.id); window.scrollTo(0,0); }} className={`text-[10px] font-bold uppercase tracking-widest relative pb-1 group transition-colors ${activeTab === link.id ? 'text-pink-600' : (isSolidHeader ? 'text-stone-600 hover:text-pink-900' : 'text-white/80 hover:text-white')}`}>
                {link.name}<span className={`absolute bottom-0 left-0 h-[2px] bg-pink-500 transition-all duration-300 rounded-full ${activeTab === link.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </button>
            ))}
            <button className={`p-1 transition-all hover:scale-110 ${isSolidHeader ? 'text-stone-400 hover:text-pink-600' : 'text-white/50 hover:text-white'}`}><Search size={18} /></button>
          </nav>
          <button className={`lg:hidden p-1.5 transition-all active:scale-90 ${isSolidHeader ? 'text-pink-950' : 'text-white'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
        </div>
        {/* Mobile Menu */}
        <div className={`fixed inset-0 top-0 left-0 w-full h-screen bg-pink-950/98 backdrop-blur-md z-[90] transition-all duration-500 lg:hidden flex flex-col items-center justify-center p-8 ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
           <div className="w-full flex flex-col items-center space-y-8 text-white">
              <Logo isSolid={false} sizeClass="w-20 h-20" src={logoUrl} />
              <div className="flex flex-col items-center space-y-5 w-full">
                {navLinks.map((link) => (<button key={link.id} onClick={() => { setActiveTab(link.id); setIsMenuOpen(false); window.scrollTo(0,0); }} className={`text-lg font-bold uppercase tracking-widest transition-all ${activeTab === link.id ? 'text-pink-400 scale-105' : 'text-white/70 hover:text-white'}`}>{link.name}</button>))}
              </div>
              <div className="h-px w-16 bg-pink-500/40"></div>
              <button onClick={() => setIsMenuOpen(false)} className="text-white/50 uppercase tracking-widest text-[10px] font-bold border border-white/20 px-5 py-2 rounded-full">Đóng Menu</button>
           </div>
        </div>
      </header>

      {/* NỘI DUNG CHÍNH */}
      <main className="pt-0 min-h-[70vh] bg-white">{renderContent()}</main>

      {/* CHÂN TRANG (FOOTER) */}
      <footer className="bg-[#1a0f12] text-pink-200/60 pt-20 pb-10 border-t-4 border-pink-950 relative group">
        {isAdmin && <button onClick={() => { setTempFooter(footerData); setTempContact(contactInfo); setEditingFooter(true); }} className="absolute top-6 right-6 z-20 p-2 bg-white/10 text-white rounded-full shadow-md transition active:scale-90 hover:bg-pink-600"><Edit3 size={16}/></button>}
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10 text-left">
          <div><div className="flex items-center space-x-3 mb-6"><Logo sizeClass="w-12 h-12" isSolid={true} src={logoUrl} /><h2 className="font-bold text-white text-lg uppercase tracking-widest">GIÁO XỨ HOÀNG YÊN</h2></div><p className="text-xs italic leading-relaxed opacity-70 whitespace-pre-wrap">{footerData.aboutText}</p></div>
          <div><h3 className="text-pink-100 font-bold text-xs uppercase mb-6 border-b border-pink-900/50 pb-3 tracking-widest">Thông Tin</h3><ul className="space-y-3 text-xs opacity-80"><li>{contactInfo.address}</li><li>{contactInfo.phone}</li><li>{contactInfo.email}</li></ul></div>
          <div><h3 className="text-pink-100 font-bold text-xs uppercase mb-6 border-b border-pink-900/50 pb-3 tracking-widest">Liên Kết</h3><ul className="space-y-3 text-[10px] uppercase opacity-80 tracking-widest"><li className="cursor-pointer hover:text-pink-300" onClick={() => {setActiveTab('Liturgy'); window.scrollTo(0,0);}}>Lịch Phụng Vụ</li><li className="cursor-pointer hover:text-pink-300" onClick={() => {setActiveTab('Contact'); window.scrollTo(0,0);}}>Liên Hệ Văn Phòng</li><li className="cursor-pointer hover:text-pink-300" onClick={() => {setActiveTab('Pilgrimage'); window.scrollTo(0,0);}}>Đăng ký Hành Hương</li></ul></div>
          <div><h3 className="text-pink-100 font-bold text-xs uppercase mb-6 border-b border-pink-900/50 pb-3 tracking-widest">Kết Nối</h3><a href={footerData.facebookLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-pink-300 transition-colors"><div className="w-8 h-8 rounded-full bg-pink-900/40 flex items-center justify-center border border-pink-800/50"><FacebookIcon size={14} className="text-pink-200" /></div><span>Facebook Giáo Xứ</span></a></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-16 pt-6 border-t border-white/10 text-[9px] uppercase font-bold opacity-40 flex justify-between tracking-widest"><p>© 2023 GIÁO XỨ HOÀNG YÊN.</p><span onClick={() => isAdmin ? setIsAdmin(false) : setShowLoginModal(true)} className="cursor-pointer hover:text-white transition-all">{isAdmin ? 'Thoát Quản Trị' : 'Admin'}</span></div>
      </footer>

      {showTopBtn && <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 p-2.5 bg-pink-700 text-white rounded-full shadow-xl z-50 active:scale-90"><ArrowUp size={20} /></button>}

      {/* ========================================== */}
      {/* MODALS QUẢN TRỊ (ADMIN) */}
      {/* ========================================== */}

      {showLoginModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border-t-4 border-pink-600 relative">
             <button onClick={() => {setShowLoginModal(false); setLoginError(''); setPassword('');}} className="absolute top-3 right-3 text-stone-400 hover:text-stone-600"><X size={18}/></button>
            <h3 className="text-xl font-bold text-pink-950 mb-2 uppercase tracking-tight">Đăng Nhập Admin</h3>
            <p className="text-[10px] text-stone-500 mb-6 uppercase tracking-widest">Nhập 'admin' để dùng thử</p>
            <input type="password" placeholder="Nhập mật khẩu" className={`w-full border p-3 mb-2 text-center text-sm outline-none focus:border-pink-500 font-serif rounded ${loginError ? 'border-red-400' : 'border-pink-200'}`} value={password} onChange={(e) => {setPassword(e.target.value); setLoginError('');}} onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit()} />
            <div className="h-6 mb-2">{loginError && <p className="text-red-500 text-xs font-bold animate-in slide-in-from-top-1">{loginError}</p>}</div>
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => {setShowLoginModal(false); setLoginError(''); setPassword('');}}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={handleLoginSubmit}>Xác Nhận</button></div>
          </div>
        </div>
      )}

      {editingContact && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full border-t-4 border-pink-600 relative">
             <button onClick={() => setEditingContact(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600"><X size={20}/></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Sửa Thông Tin Liên Hệ</h3>
            <div className="space-y-4 mb-8">
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Tiêu đề</label><input className="w-full border border-pink-200 p-2.5 rounded outline-none text-sm font-bold focus:border-pink-500" value={tempContact.title || ''} onChange={e => setTempContact({...tempContact, title: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Địa chỉ</label><input className="w-full border border-pink-200 p-2.5 rounded outline-none text-sm focus:border-pink-500" value={tempContact.address || ''} onChange={e => setTempContact({...tempContact, address: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Điện thoại</label><input className="w-full border border-pink-200 p-2.5 rounded outline-none text-sm focus:border-pink-500" value={tempContact.phone || ''} onChange={e => setTempContact({...tempContact, phone: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Email</label><input className="w-full border border-pink-200 p-2.5 rounded outline-none text-sm focus:border-pink-500" value={tempContact.email || ''} onChange={e => setTempContact({...tempContact, email: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Giờ làm việc</label><input className="w-full border border-pink-200 p-2.5 rounded outline-none text-sm font-serif focus:border-pink-500" value={tempContact.hours || ''} onChange={e => setTempContact({...tempContact, hours: e.target.value})} /></div>
            </div>
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingContact(false)}>Hủy</button><button className="flex-[2] bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow active:scale-95 transition-all hover:bg-pink-800" onClick={() => { setContactInfo(tempContact); setEditingContact(false); }}>Lưu Lại</button></div>
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
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingQuote(false)}>Hủy</button><button className="flex-[2] bg-pink-700 text-white rounded py-3 font-bold uppercase text-[10px] tracking-widest shadow active:scale-95 transition-all hover:bg-pink-800" onClick={() => { setQuote(tempQuote); setEditingQuote(false); }}>Lưu Lại</button></div>
          </div>
        </div>
      )}

      {editingNews !== null && tempNews && (
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Hình ảnh đại diện (Link hoặc Dán ảnh)</label>
            <div className="flex flex-col sm:flex-row gap-4 mb-5 items-start">
               <input className="flex-1 w-full border border-pink-200 p-3 rounded text-sm bg-white outline-none focus:border-pink-500" value={tempNews.image || ''} onChange={(e) => setTempNews({...tempNews, image: e.target.value})} onPaste={(e) => handleImagePaste(e, setTempNews)} placeholder="Dán link ảnh tại đây..." />
               {tempNews.image && <div className="w-24 h-16 bg-stone-100 rounded border border-pink-200 overflow-hidden shadow-inner"><img src={tempNews.image} alt="Preview" className="w-full h-full object-cover" /></div>}
            </div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Tiêu đề bài viết</label>
            <input className="w-full border border-pink-200 p-3 rounded mb-6 font-bold text-lg outline-none focus:border-pink-600" value={tempNews.title || ''} onChange={(e) => setTempNews({...tempNews, title: e.target.value})} placeholder="Nhập tiêu đề..." />
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div><label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Mô tả ngắn</label><RichTextEditor value={tempNews.desc || ''} onChange={(val) => setTempNews({...tempNews, desc: val})} minHeight="100px" /></div>
              <div><label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Nội dung chi tiết</label><RichTextEditor value={tempNews.content || ''} onChange={(val) => setTempNews({...tempNews, content: val})} minHeight="250px" /></div>
            </div>
            <div className="flex gap-4 border-t pt-5 mt-6">{editingNews !== 'new' && <button className="text-red-600 px-6 py-3 font-bold text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-50 transition-all rounded" onClick={() => { setNewsItems(newsItems.filter(n => n.id !== tempNews.id)); if (selectedNews?.id === tempNews.id) { setSelectedNews(null); setActiveTab(lastTab); } setEditingNews(null); }}>Xóa Bản Tin</button>}<div className="flex-1"></div><button className="bg-stone-100 px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingNews(null)}>Hủy Bỏ</button><button className="bg-pink-700 text-white px-10 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { if (!tempNews.title) return alert('Vui lòng nhập tiêu đề'); if (editingNews === 'new') setNewsItems([tempNews, ...newsItems]); else { setNewsItems(newsItems.map(n => n.id === tempNews.id ? tempNews : n)); if (selectedNews?.id === tempNews.id) setSelectedNews(tempNews); } setEditingNews(null); }}>Lưu Bài Viết</button></div>
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
            <div className="flex gap-4 pt-6 border-t mt-6"><div className="flex-1"></div><button className="bg-stone-100 px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingHistory(false)}>Hủy</button><button className="bg-pink-700 text-white px-10 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { setHistoryData(tempHistory); setEditingHistory(false); }}>Cập Nhật Lịch Sử</button></div>
          </div>
        </div>
      )}

      {editingHeritageTitle && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-pink-600 relative">
            <h3 className="text-lg font-bold text-pink-950 mb-5 uppercase text-center tracking-tight">Sửa Tiêu Đề Gia Sản</h3>
            <input className="w-full border border-pink-200 p-3 mb-6 rounded text-center text-base font-serif outline-none focus:border-pink-500 font-bold text-pink-950" value={tempHeritageTitle || ''} onChange={(e) => setTempHeritageTitle(e.target.value)} />
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] hover:bg-stone-200 transition" onClick={() => setEditingHeritageTitle(false)}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] shadow hover:bg-pink-800 transition" onClick={() => { setHeritageTitle(tempHeritageTitle); setEditingHeritageTitle(false); }}>Lưu Lại</button></div>
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Hình Ảnh Đại Diện (Link hoặc Dán ảnh)</label>
            <div className="flex flex-col sm:flex-row gap-4 mb-5 items-start">
               <input className="flex-1 w-full border border-pink-200 p-3 rounded text-sm bg-white outline-none focus:border-pink-500" value={tempHeritageItem.image || ''} onChange={(e) => setTempHeritageItem({...tempHeritageItem, image: e.target.value})} onPaste={(e) => handleImagePaste(e, setTempHeritageItem)} placeholder="Dán link ảnh tại đây..." />
               {tempHeritageItem.image && <div className="w-16 h-16 flex-shrink-0 bg-stone-100 rounded-full border-2 border-pink-200 overflow-hidden shadow-inner"><img src={tempHeritageItem.image} alt="Preview" className="w-full h-full object-cover" /></div>}
            </div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Tiểu sử sơ lược</label>
            <textarea className="w-full border border-pink-200 p-3 rounded h-28 text-sm font-serif leading-relaxed outline-none focus:border-pink-500 custom-scrollbar" value={tempHeritageItem.brief || ''} onChange={(e) => setTempHeritageItem({...tempHeritageItem, brief: e.target.value})} placeholder="Nhập sơ lược tiểu sử..." />
            <div className="flex gap-4 pt-6 border-t mt-6">
              {editingHeritageItem !== 'new' && <button className="text-red-600 px-6 py-3 font-bold text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-50 transition-all rounded" onClick={() => { setHeritageList(heritageList.filter(item => item.id !== tempHeritageItem.id)); setEditingHeritageItem(null); }}>Xóa Vị Thánh</button>}
              <div className="flex-1"></div>
              <button className="bg-stone-100 px-6 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingHeritageItem(null)}>Hủy</button>
              <button className="bg-pink-700 text-white px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { if (!tempHeritageItem.name) return alert('Vui lòng nhập tên'); if (editingHeritageItem === 'new') setHeritageList([tempHeritageItem, ...heritageList]); else setHeritageList(heritageList.map(item => item.id === tempHeritageItem.id ? tempHeritageItem : item)); setEditingHeritageItem(null); }}>Lưu Lại</button>
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
            <div className="flex gap-4 pt-6 border-t mt-6"><div className="flex-1"></div><button className="bg-stone-100 px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingPastoral(false)}>Hủy</button><button className="bg-pink-700 text-white px-10 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { setPastoralData(tempPastoral); setEditingPastoral(false); }}>Lưu Định Hướng</button></div>
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Hình ảnh đại diện (Link hoặc Dán ảnh)</label>
            <div className="flex flex-col sm:flex-row gap-4 mb-5 items-start">
               <input className="flex-1 w-full border border-pink-200 p-3 rounded text-sm bg-white outline-none focus:border-pink-500" value={tempPilgrimage.image || ''} onChange={(e) => setTempPilgrimage({...tempPilgrimage, image: e.target.value})} onPaste={(e) => handleImagePaste(e, setTempPilgrimage)} placeholder="Dán link ảnh tại đây..." />
               {tempPilgrimage.image && <div className="w-24 h-16 bg-stone-100 rounded border border-pink-200 overflow-hidden shadow-inner"><img src={tempPilgrimage.image} alt="Preview" className="w-full h-full object-cover" /></div>}
            </div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Mô tả ngắn gọn (Hiển thị bên ngoài thẻ)</label>
            <textarea className="w-full border border-pink-200 p-3 rounded mb-5 h-20 text-sm font-serif outline-none focus:border-pink-600 custom-scrollbar" value={tempPilgrimage.desc || ''} onChange={(e) => setTempPilgrimage({...tempPilgrimage, desc: e.target.value})} placeholder="Nhập mô tả ngắn..." />
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Nội dung chương trình chi tiết</label>
            <div className="mb-6"><RichTextEditor value={tempPilgrimage.content || ''} onChange={(val) => setTempPilgrimage({...tempPilgrimage, content: val})} minHeight="250px" /></div>
            <div className="flex gap-4 border-t pt-5 mt-6">
              {editingPilgrimage !== 'new' && <button className="text-red-600 px-6 py-3 font-bold text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-50 transition-all rounded" onClick={() => { setPilgrimagePlans(pilgrimagePlans.filter(p => p.id !== tempPilgrimage.id)); if (selectedPilgrimage?.id === tempPilgrimage.id) { setSelectedPilgrimage(null); setActiveTab('Pilgrimage'); } setEditingPilgrimage(null); }}>Xóa Kế Hoạch</button>}
              <div className="flex-1"></div>
              <button className="bg-stone-100 px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingPilgrimage(null)}>Hủy Bỏ</button>
              <button className="bg-pink-700 text-white px-10 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { 
                if (!tempPilgrimage.title || tempPilgrimage.title.trim() === '') return alert('Vui lòng nhập tên chương trình');
                if (editingPilgrimage === 'new') setPilgrimagePlans([tempPilgrimage, ...pilgrimagePlans]); 
                else { setPilgrimagePlans(pilgrimagePlans.map(p => p.id === tempPilgrimage.id ? tempPilgrimage : p)); if (selectedPilgrimage?.id === tempPilgrimage.id) setSelectedPilgrimage(tempPilgrimage); } 
                setEditingPilgrimage(null); 
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
              <button className="text-red-600 px-4 py-3 font-bold text-[10px] uppercase border border-red-100 hover:bg-red-50 transition-all rounded tracking-widest" onClick={() => { setLiturgyEvents(liturgyEvents.filter(e => e.date !== tempLiturgyEvent.date)); setEditingLiturgyEvent(false); }}>Xóa</button>
              <div className="flex-1"></div>
              <button className="bg-stone-100 px-6 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingLiturgyEvent(false)}>Hủy</button>
              <button className="bg-pink-700 text-white px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => {
                if (!tempLiturgyEvent.title || tempLiturgyEvent.title.trim() === '') return alert('Vui lòng nhập tên sự kiện');
                const n = liturgyEvents.filter(e => e.date !== tempLiturgyEvent.date);
                n.push(tempLiturgyEvent);
                setLiturgyEvents(n);
                setEditingLiturgyEvent(false);
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
            <div className="flex gap-4 pt-6 border-t mt-6"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingReception(false)}>Hủy Bỏ</button><button className="flex-[2] bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { setReceptionInfo(tempReception); setEditingReception(false); }}>Lưu Lại</button></div>
          </div>
        </div>
      )}

      {editingConfession && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-pink-600 relative">
             <button onClick={() => setEditingConfession(false)} className="absolute top-3 right-3 text-stone-400 hover:text-stone-600"><X size={18}/></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Sửa Bí Tích / Hoạt Động</h3>
            <div className="space-y-4 mb-8">
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Tiêu đề</label><input className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 font-bold text-sm" value={tempConfession.title || ''} onChange={(e) => setTempConfession({...tempConfession, title: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Nội dung</label><textarea className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 text-sm font-serif h-24 custom-scrollbar leading-relaxed" value={tempConfession.desc || ''} onChange={(e) => setTempConfession({...tempConfession, desc: e.target.value})} /></div>
            </div>
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingConfession(false)}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { setConfessionData(tempConfession); setEditingConfession(false); }}>Lưu Lại</button></div>
          </div>
        </div>
      )}

      {editingAdoration && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-pink-600 relative">
             <button onClick={() => setEditingAdoration(false)} className="absolute top-3 right-3 text-stone-400 hover:text-stone-600"><X size={18}/></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Sửa Bí Tích / Hoạt Động</h3>
            <div className="space-y-4 mb-8">
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Tiêu đề</label><input className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 font-bold text-sm" value={tempAdoration.title || ''} onChange={(e) => setTempAdoration({...tempAdoration, title: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Nội dung</label><textarea className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 text-sm font-serif h-24 custom-scrollbar leading-relaxed" value={tempAdoration.desc || ''} onChange={(e) => setTempAdoration({...tempAdoration, desc: e.target.value})} /></div>
            </div>
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingAdoration(false)}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { setAdorationData(tempAdoration); setEditingAdoration(false); }}>Lưu Lại</button></div>
          </div>
        </div>
      )}

      {editingMass && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-t-4 border-pink-600 custom-scrollbar">
            <h3 className="text-xl font-bold text-pink-950 mb-8 uppercase text-center tracking-tight">Sửa Giờ Lễ</h3>
            <div className="space-y-6">{tempMass.map((item, idx) => (<div key={idx} className="p-4 border border-pink-100 bg-pink-50/30 rounded-lg"><label className="block text-[10px] font-bold text-pink-800 uppercase mb-2 tracking-widest">{item.day}</label><input className="w-full border border-pink-200 p-2.5 rounded text-sm font-bold focus:border-pink-500 outline-none" value={item.times.join(', ')} onChange={(e) => { const n = [...tempMass]; n[idx].times = e.target.value.split(',').map(t => t.trim()); setTempMass(n); }}/></div>))}</div>
            <div className="flex gap-4 pt-8 border-t mt-8"><button className="flex-1 bg-stone-100 py-3 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingMass(false)}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow active:scale-95 transition-all hover:bg-pink-800" onClick={() => { setMassSchedules(tempMass); setEditingMass(false); }}>Lưu Giờ Lễ</button></div>
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
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingStats(false)}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { setParishStats(tempStats); setEditingStats(false); }}>Lưu Lại</button></div>
          </div>
        </div>
      )}

      {editingHero && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full border-t-4 border-pink-600 relative">
             <button onClick={() => setEditingHero(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Đổi Ảnh Nền Trang Chủ</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Đường dẫn hình ảnh (URL)</label>
                <input className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 text-sm" value={tempHero.bgImage || ''} onChange={(e) => setTempHero({...tempHero, bgImage: e.target.value})} onPaste={(e) => handleImagePaste(e, setTempHero)} placeholder="Dán link ảnh hoặc Ctrl+V để dán file ảnh..." />
              </div>
              {tempHero.bgImage && (
                <div className="w-full h-40 rounded-lg overflow-hidden border border-stone-200 shadow-inner">
                  <img src={tempHero.bgImage} className="w-full h-full object-cover" alt="Preview" />
                </div>
              )}
            </div>
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingHero(false)}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { setHeroData(tempHero); setEditingHero(false); }}>Lưu Hình Nền</button></div>
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
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingQuickPhone(false)}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { setContactInfo({...contactInfo, phone: tempContact.phone}); setEditingQuickPhone(false); }}>Lưu Lại</button></div>
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
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingFooter(false)}>Hủy</button><button className="flex-[2] bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { setFooterData(tempFooter); setContactInfo(tempContact); setEditingFooter(false); }}>Lưu Thay Đổi</button></div>
          </div>
        </div>
      )}

      {editingLogo && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-pink-600 relative">
             <button onClick={() => setEditingLogo(false)} className="absolute top-4 right-4 text-stone-400 hover:text-pink-600 transition-all"><X size={20} /></button>
            <h3 className="text-xl font-bold text-pink-950 mb-6 uppercase text-center tracking-tight">Đổi Logo Giáo Xứ</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Đường dẫn Logo (URL hoặc ./logo.svg)</label>
                <input className="w-full border border-pink-200 p-3 rounded outline-none focus:border-pink-600 text-sm" value={tempLogoUrl} onChange={(e) => setTempLogoUrl(e.target.value)} onPaste={(e) => {
                    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
                    for (let index in items) {
                      const item = items[index];
                      if (item.kind === 'file' && item.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (event) => setTempLogoUrl(event.target.result);
                        reader.readAsDataURL(item.getAsFile());
                        e.preventDefault();
                        break;
                      }
                    }
                }} placeholder="Nhập link ảnh hoặc dán ảnh..." />
              </div>
              {tempLogoUrl && (
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-pink-200 shadow-inner p-2 bg-stone-50 flex items-center justify-center">
                  <img src={tempLogoUrl} className="w-full h-full object-contain" alt="Preview Logo" onError={(e) => e.target.style.display='none'} />
                </div>
              )}
            </div>
            <div className="flex gap-3"><button className="flex-1 bg-stone-100 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-stone-200 transition" onClick={() => setEditingLogo(false)}>Hủy</button><button className="flex-1 bg-pink-700 text-white py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-pink-800" onClick={() => { setLogoUrl(tempLogoUrl); setEditingLogo(false); }}>Lưu Logo</button></div>
          </div>
        </div>
      )}

    </div>
  );
}