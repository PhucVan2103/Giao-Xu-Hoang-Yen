export const getImgStyle = (data) => {
  if (!data) return { objectFit: 'cover', objectPosition: '50% 50%', transform: 'scale(1)', transformOrigin: '50% 50%' };
  const x = data.imgPosX ?? 50;
  const y = data.imgPosY ?? 50;
  const scale = data.imgScale || 1;
  return {
    objectFit: data.imgFit || 'cover',
    objectPosition: `${x}% ${y}%`,
    transformOrigin: `${x}% ${y}%`,
    transform: `scale(${scale})`
  };
};

export const navLinks = [
  { name: 'Trang Chủ', id: 'Home', path: '/' },
  { name: 'Giới Thiệu', id: 'About', path: '/gioi-thieu' },
  { name: 'Phụng Vụ', id: 'Liturgy', path: '/phung-vu' },
  { name: 'Hành Hương', id: 'Pilgrimage', path: '/hanh-huong' },
  { name: 'Tin Tức', id: 'News', path: '/tin-tuc' },
  { name: 'Liên Hệ', id: 'Contact', path: '/lien-he' },
];

export const litColors = {
  white: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', name: 'Trắng/Vàng' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', name: 'Đỏ' },
  green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', name: 'Xanh Lá' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', name: 'Tím' },
  rose: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800', name: 'Hồng' }
};

export const formatDateString = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getDaysArray = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startingDayIndex = firstDay === 0 ? 6 : firstDay - 1; 
  const days = [];
  for (let i = 0; i < startingDayIndex; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
};

export const getStatusStyles = (status) => {
  switch(status) {
    case 'Đang mở đăng ký': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Đã kết thúc': return 'bg-stone-100 text-stone-500 border-stone-200';
    case 'Sắp diễn ra':
    default: return 'bg-blue-100 text-blue-700 border-blue-200';
  }
};