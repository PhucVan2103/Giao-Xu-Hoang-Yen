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

export const createSlug = (str) => {
  if (!str) return '';
  return str.toString().toLowerCase()
    .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ặ|ẵ|â|ấ|ầ|ẩ|ậ|ẫ/g, 'a')
    .replace(/é|è|ẻ|ẹ|ẽ|ê|ế|ề|ể|ệ|ễ/g, 'e')
    .replace(/í|ì|ỉ|ị|ĩ/g, 'i')
    .replace(/ó|ò|ỏ|ọ|õ|ô|ố|ồ|ổ|ộ|ỗ|ơ|ớ|ờ|ở|ợ|ỡ/g, 'o')
    .replace(/ú|ù|ủ|ụ|ũ|ư|ứ|ừ|ử|ự|ữ/g, 'u')
    .replace(/ý|ỳ|ỷ|ỵ|ỹ/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '-') 
    .replace(/[^\w\-]+/g, '') 
    .replace(/\-\-+/g, '-') 
    .replace(/^-+/, '') 
    .replace(/-+$/, '');
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

export const normalizeMassSchedules = (schedules) => {
  if (!schedules || !Array.isArray(schedules)) return [];
  return schedules.map(item => ({
    ...item,
    times: (item.times || []).map(t => {
      if (typeof t === 'object') return t;
      const timeMatch = t.match(/\d{1,2}:\d{2}/);
      const time = timeMatch ? timeMatch[0] : t;
      let location = t.replace(time, '').trim().replace(/^[\(\-\s]+|[\)\s]+$/g, '');
      return { time, location };
    })
  }));
};

export const getNextMass = (schedules) => {
  if (!schedules || !Array.isArray(schedules) || schedules.length === 0) return null;

  const now = new Date();
  const currentDay = now.getDay(); 
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const parseTimes = (timesStrArray) => {
    return timesStrArray.map(tStr => {
      const timeString = typeof tStr === 'object' ? (tStr.time || '') : tStr;
      const locString = typeof tStr === 'object' ? (tStr.location ? ` - ${tStr.location}` : '') : '';
      const labelStr = typeof tStr === 'object' ? `${tStr.time}${locString}` : tStr;
      const match = timeString.match(/(\d{1,2}):(\d{2})/);
      const timeOnly = match ? match[0] : timeString;
      const locationOnly = typeof tStr === 'object' ? (tStr.location || '') : tStr.replace(timeOnly, '').trim().replace(/^[\(\-\s]+|[\)\s]+$/g, '');
      
      if (match) return { hour: parseInt(match[1], 10), minute: parseInt(match[2], 10), original: labelStr, timeOnly, locationOnly };
      return null;
    }).filter(Boolean);
  };

  const getDayOffsets = (dayName) => {
    const name = dayName.toLowerCase();
    if (name.includes('chúa nhật') || name.includes('chu nhat')) return [0];
    if (name.includes('thứ bảy') || name.includes('thu bay') || name.includes('thứ 7')) return [6];
    if (name.includes('ngày thường') || name.includes('ngay thuong')) return [1, 2, 3, 4, 5];
    return [];
  };

  let allMasses = [];
  schedules.forEach(schedule => {
    const offsets = getDayOffsets(schedule.day);
    const parsedTimes = parseTimes(schedule.times);
    offsets.forEach(offset => {
      parsedTimes.forEach(pt => allMasses.push({ dayOfWeek: offset, hour: pt.hour, minute: pt.minute, label: pt.original, timeOnly: pt.timeOnly, locationOnly: pt.locationOnly }));
    });
  });

  if (allMasses.length === 0) return null;
  allMasses.sort((a, b) => a.dayOfWeek !== b.dayOfWeek ? a.dayOfWeek - b.dayOfWeek : (a.hour !== b.hour ? a.hour - b.hour : a.minute - b.minute));

  let nextMass = null;
  let daysToAdd = 0;
  for (let i = 0; i < allMasses.length; i++) {
    if (allMasses[i].dayOfWeek === currentDay && allMasses[i].hour * 60 + allMasses[i].minute > currentTime) { nextMass = allMasses[i]; break; }
    else if (allMasses[i].dayOfWeek > currentDay) { nextMass = allMasses[i]; daysToAdd = allMasses[i].dayOfWeek - currentDay; break; }
  }
  if (!nextMass) { nextMass = allMasses[0]; daysToAdd = 7 - currentDay + nextMass.dayOfWeek; }

  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + daysToAdd);
  targetDate.setHours(nextMass.hour, nextMass.minute, 0, 0);
  return { date: targetDate, label: nextMass.label, timeOnly: nextMass.timeOnly, locationOnly: nextMass.locationOnly };
};

export const expandMassSchedules = (schedules) => {
  const week = [
    { id: 1, label: 'Thứ Hai', short: 'T2', times: [] },
    { id: 2, label: 'Thứ Ba', short: 'T3', times: [] },
    { id: 3, label: 'Thứ Tư', short: 'T4', times: [] },
    { id: 4, label: 'Thứ Năm', short: 'T5', times: [] },
    { id: 5, label: 'Thứ Sáu', short: 'T6', times: [] },
    { id: 6, label: 'Thứ Bảy', short: 'T7', times: [] },
    { id: 0, label: 'Chúa Nhật', short: 'CN', times: [] }
  ];
  if (!schedules || !Array.isArray(schedules)) return week;

  const sortedSchedules = [...schedules].sort((a, b) => {
    const aGen = (a.day || '').toLowerCase().includes('thường') ? -1 : 1;
    const bGen = (b.day || '').toLowerCase().includes('thường') ? -1 : 1;
    return aGen - bGen;
  });

  sortedSchedules.forEach(schedule => {
    const lowerDay = (schedule.day || '').toLowerCase();
    let targetIndices = [];
    if (lowerDay.includes('chúa nhật') || lowerDay.includes('chu nhat') || lowerDay.includes('chủ nhật')) targetIndices = [6];
    else if (lowerDay.includes('thứ bảy') || lowerDay.includes('thu bay') || lowerDay.includes('thứ 7') || lowerDay.includes('t7')) targetIndices = [5];
    else if (lowerDay.includes('thường') || lowerDay.includes('thuong') || lowerDay.includes('hằng ngày')) targetIndices = [0, 1, 2, 3, 4];
    else {
      if (lowerDay.includes('hai') || lowerDay.includes('2')) targetIndices.push(0);
      if (lowerDay.includes('ba') || lowerDay.includes('3')) targetIndices.push(1);
      if (lowerDay.includes('tư') || lowerDay.includes('4')) targetIndices.push(2);
      if (lowerDay.includes('năm') || lowerDay.includes('5')) targetIndices.push(3);
      if (lowerDay.includes('sáu') || lowerDay.includes('6')) targetIndices.push(4);
    }
    targetIndices.forEach(idx => { 
      week[idx].times = (schedule.times || []).map(t => typeof t === 'object' ? { ...t } : t); 
    });
  });
  return week;
};