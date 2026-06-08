import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Quote, Clock, MapPin, Phone, Mail, Bell, ChevronRight, Calendar, Edit3, Star, Timer } from 'lucide-react';
import { getImgStyle, createSlug, formatDateString, getNextMass, normalizeMassSchedules, expandMassSchedules } from '../utils/helpers';

export default function Home({ isAdmin, heroData, setTempHero, setEditingHero, quote, setTempQuote, setEditingQuote, massSchedules, setTempMass, setEditingMass, contactInfo, setTempContact, setEditingQuickPhone, newsItems, setSelectedNews, liturgyEvents }) {
  const navigate = useNavigate();
  const [nextMassInfo, setNextMassInfo] = useState(null);
  const [countdown, setCountdown] = useState('');

  // Lấy Lời Chúa theo Lịch Phụng Vụ hôm nay (Nếu có)
  const todayStr = formatDateString(new Date());
  const todayLiturgy = liturgyEvents?.find(e => e.date === todayStr);
  
  const hasLiturgyQuote = todayLiturgy && todayLiturgy.quoteText;
  const displayQuoteText = hasLiturgyQuote ? `<p>${todayLiturgy.quoteText.replace(/\n/g, '<br/>')}</p>` : (quote.text || '');
  const displayQuoteRef = hasLiturgyQuote ? todayLiturgy.quoteRef : (quote.ref || '');
  const displayQuoteTitle = todayLiturgy ? `Lời Chúa - ${todayLiturgy.title}` : 'Lời Chúa Hôm Nay';

  useEffect(() => {
    const updateCountdown = () => {
      const nextMass = getNextMass(massSchedules);
      if (!nextMass) { setNextMassInfo(null); return; }
      setNextMassInfo(nextMass);

      const now = new Date().getTime();
      const distance = nextMass.date.getTime() - now;
      if (distance < 0) return; // Wait for next tick to update

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setCountdown(`${hours > 0 ? hours + 'h ' : ''}${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [massSchedules]);

  return (
    <div className="animate-in fade-in duration-500">
       <section className="relative h-[85vh] flex items-center justify-center text-white overflow-hidden group">
          {isAdmin && <button onClick={() => { setTempHero(heroData); setEditingHero(true); }} className="absolute top-24 right-4 z-50 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full shadow-md transition active:scale-90 hover:bg-pink-600"><Edit3 size={16}/></button>}
          <div className="absolute inset-0 bg-black/40 z-20"></div>
          <div className="absolute inset-0 overflow-hidden z-10">
             <div className="w-full h-full transition-transform duration-[30000ms] scale-105">
               {heroData.image && <img src={heroData.image} style={getImgStyle({...heroData, imgFit: heroData.imgFit || 'cover'})} className="w-full h-full block" alt="" />}
             </div>
          </div>
            <div className="relative z-30 max-w-5xl px-4 text-center">
              <h2 className="text-pink-200 text-xs md:text-sm uppercase tracking-[0.6em] mb-4 font-bold">Chào mừng quý vị đến với</h2>
              <h1 className="text-4xl md:text-7xl font-serif font-bold tracking-tight uppercase leading-tight">GIÁO XỨ HOÀNG YÊN</h1>
              <p className="text-base md:text-xl font-serif font-light text-pink-50 mt-6 italic tracking-wider opacity-90 uppercase">ĐỀN THÁNH NỮ VƯƠNG CÁC THÁNH TỬ ĐẠO VIỆT NAM</p>
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={() => navigate('/phung-vu')} className="px-10 py-3 bg-pink-700 hover:bg-pink-800 text-white rounded font-bold text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95">Lịch Phụng Vụ</button>
                <button onClick={() => navigate('/hanh-huong')} className="px-10 py-3 bg-transparent hover:bg-white/10 text-white border border-white/50 rounded font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95">Hành Hương</button>
              </div>
            </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce text-pink-200/50"><ChevronDown size={32} /></div>
       </section>

       <section className="py-16 bg-[#fffcfd] relative z-20 border-b border-pink-50">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="bg-white p-8 rounded-2xl shadow-md border border-pink-100 flex flex-col items-center text-center relative group">
                <Quote size={40} className="text-pink-100 mb-4"/>
                <h3 className="text-lg font-bold text-pink-900 uppercase border-b border-pink-50 pb-2 mb-6 tracking-tighter">{displayQuoteTitle}</h3>
                <div className="text-stone-700 font-serif italic text-base leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: displayQuoteText }} />
                <p className="text-pink-800 font-bold text-[11px] uppercase tracking-widest mt-auto mb-2">{displayQuoteRef}</p>
                {hasLiturgyQuote && <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded border border-emerald-100 shadow-sm mt-2">Cập nhật theo Phụng Vụ</span>}
                {!hasLiturgyQuote && isAdmin && <button onClick={() => { setTempQuote({ text: quote.text, ref: quote.ref }); setEditingQuote(true); }} className="absolute top-4 right-4 p-1.5 bg-pink-600 text-white rounded-full shadow transition hover:bg-pink-700" title="Sửa Lời Chúa mặc định"><Edit3 size={12}/></button>}
                {hasLiturgyQuote && isAdmin && <button onClick={() => navigate('/phung-vu')} className="absolute top-4 right-4 p-1.5 bg-emerald-600 text-white rounded-full shadow transition hover:bg-emerald-700" title="Đến trang Phụng Vụ để sửa Lời Chúa này"><Edit3 size={12}/></button>}
             </div>
             
             <div className="bg-pink-950 p-8 rounded-2xl shadow-xl text-white flex flex-col items-center text-center border-t-4 border-pink-400 relative group">
                <Clock size={32} className="text-pink-300 mb-4"/>
                <h3 className="text-xl font-bold uppercase text-pink-100 tracking-tight mb-8">Giờ Thánh Lễ</h3>
                
                {nextMassInfo ? (
                  <div className="w-full flex flex-col items-center animate-in zoom-in mt-auto mb-auto">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400 mb-3 flex items-center gap-1.5"><Timer size={14}/> Thánh lễ tiếp theo</span>
                    <span className="text-4xl font-bold text-white mb-2 leading-snug">{nextMassInfo.timeOnly}</span>
                    {nextMassInfo.locationOnly && <span className="text-sm font-serif text-pink-200 mb-8 flex items-center gap-1.5"><MapPin size={14}/> {nextMassInfo.locationOnly}</span>}
                    <div className="font-serif text-sm font-bold text-pink-200 bg-pink-900/80 px-4 py-3 rounded-xl border border-pink-800 shadow-inner tracking-wide flex flex-col items-center gap-2 w-full">
                      Bắt đầu sau: <span className="text-white font-mono text-2xl bg-pink-950 px-3 py-1.5 rounded-lg shadow-md">{countdown}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-pink-300/50 font-serif italic flex-1 flex items-center justify-center">Chưa có lịch Thánh lễ</div>
                )}
                
                {isAdmin && <button onClick={() => { 
                  const expanded = expandMassSchedules(normalizeMassSchedules(massSchedules));
                  setTempMass(expanded.map(d => ({ day: d.label, times: d.times })));
                  setEditingMass(true); 
                }} className="absolute top-4 right-4 p-1.5 bg-pink-600 text-white rounded-full shadow hover:bg-pink-700 transition"><Edit3 size={12}/></button>}
             </div>

             <div className="bg-white p-8 rounded-2xl shadow-md border border-pink-100 flex flex-col relative group">
                {isAdmin && <button onClick={() => { setTempContact(contactInfo); setEditingQuickPhone(true); }} className="absolute top-4 right-4 p-1.5 bg-pink-100 text-pink-600 rounded-full shadow-sm transition hover:bg-pink-600 hover:text-white"><Edit3 size={12}/></button>}
                <h3 className="text-lg font-bold text-pink-900 uppercase border-b border-pink-50 pb-2 mb-6 tracking-tighter text-center">Liên Hệ & Văn Phòng</h3>
                
                <ul className="space-y-4 flex-1">
                  <li className="flex items-start gap-3">
                    <MapPin size={16} className="text-pink-500 mt-0.5 flex-shrink-0" />
                    <div><span className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Địa chỉ</span><p className="text-sm font-serif text-stone-700 leading-snug line-clamp-2">{contactInfo.address || ''}</p></div>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone size={16} className="text-pink-500 flex-shrink-0" />
                    <div><span className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Điện thoại</span><p className="text-lg font-bold text-pink-900">{contactInfo.phone || ''}</p></div>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail size={16} className="text-pink-500 flex-shrink-0" />
                    <div><span className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Email</span><p className="text-sm font-serif text-stone-700 line-clamp-1">{contactInfo.email || ''}</p></div>
                  </li>
                </ul>
                
                <div className="mt-6 pt-5 border-t border-pink-50 text-center flex items-center justify-center gap-2 text-stone-500 text-sm font-serif italic">
                  <Clock size={16} className="text-pink-400" />
                  <span>{contactInfo.hours || ''}</span>
                </div>
             </div>
          </div>
       </section>

       <section id="news-section" className="py-20 bg-stone-50">
         <div className="max-w-6xl mx-auto px-4 lg:px-6">
           
           <div className="flex justify-between items-end mb-10 border-b border-pink-100 pb-4">
             <div>
               <h2 className="text-pink-600 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2"><Bell size={14} /> Tin Tức Giáo Xứ</h2>
               <h3 className="text-3xl md:text-4xl font-serif font-bold text-pink-950 tracking-tight">Thông Báo Mới</h3>
             </div>
             <button onClick={() => navigate('/tin-tuc')} className="hidden sm:flex items-center gap-2 text-xs font-bold text-pink-600 uppercase tracking-widest hover:text-pink-800 transition-colors">
               Xem tất cả <ChevronRight size={16} />
             </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[420px]">
             {newsItems.length > 0 && (
               <div 
                 className="lg:col-span-7 group cursor-pointer relative rounded-2xl overflow-hidden shadow-md border border-stone-200 hover:border-pink-300 transition-all duration-300 h-[350px] lg:h-full bg-white flex flex-col"
                   onClick={() => navigate(`/tin-tuc/${createSlug(newsItems[0].title)}-${newsItems[0].id}`)}
               >
                 <div className="absolute inset-0 bg-stone-100 overflow-hidden">
                 <img src={newsItems[0].image} style={getImgStyle(newsItems[0])} className="w-full h-full block transition-transform duration-700 group-hover:scale-105" alt={newsItems[0].title} loading="lazy" />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 transition-opacity group-hover:opacity-100"></div>
                 
                 <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-8">
                   <div>
                     <span className="bg-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-sm inline-block shadow-sm uppercase tracking-widest mb-4">
                       {newsItems[0].category}
                     </span>
                   </div>
                   <h4 className="font-serif font-bold text-2xl md:text-3xl text-white mb-3 leading-tight line-clamp-2 drop-shadow-md group-hover:text-pink-200 transition-colors">
                     {newsItems[0].title}
                   </h4>
                   <div className="text-stone-300 text-sm leading-relaxed line-clamp-2 font-serif mb-4 [&_p]:mb-0 drop-shadow" dangerouslySetInnerHTML={{ __html: newsItems[0].desc || '' }} />
                   <div className="text-[11px] font-bold text-pink-300 uppercase tracking-widest flex items-center gap-2">
                     <Calendar size={14} /> {newsItems[0].date}
                   </div>
                 </div>
               </div>
             )}

             <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 h-full">
               {newsItems.slice(1, 6).map((item) => (
                 <div 
                   key={item.id} 
                   className="group cursor-pointer flex gap-4 items-center bg-white p-3 rounded-xl border border-stone-200 hover:border-pink-300 hover:shadow-md transition-all duration-300"
                       onClick={() => navigate(`/tin-tuc/${createSlug(item.title)}-${item.id}`)}
                 >
                   <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 relative overflow-hidden rounded-lg bg-stone-100">
                     <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
                    <img src={item.image} style={getImgStyle(item)} className="w-full h-full block" alt={item.title} loading="lazy" />
                     </div>
                   </div>
                   <div className="flex flex-col flex-1 py-1">
                     <span className="text-[9px] font-bold text-pink-600 uppercase tracking-widest mb-1.5">{item.category}</span>
                     <h4 className="font-serif font-bold text-sm sm:text-base text-stone-900 group-hover:text-pink-700 transition-colors leading-snug line-clamp-2 mb-2">
                       {item.title}
                     </h4>
                     <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mt-auto">
                       <Calendar size={12} className="text-pink-400" /> {item.date}
                     </div>
                   </div>
                 </div>
               ))}
               {newsItems.length === 0 && <div className="p-8 text-center text-stone-400 border border-dashed rounded-xl"><p>Chưa có bản tin nào.</p></div>}
             </div>
           </div>

           <div className="mt-8 text-center sm:hidden">
             <button onClick={() => navigate('/tin-tuc')} className="inline-flex items-center gap-2 px-6 py-3 border border-pink-200 text-pink-700 font-bold text-[10px] uppercase tracking-widest rounded-full hover:bg-pink-50 transition-colors">
               Tất cả tin tức <ChevronRight size={14} />
             </button>
           </div>

         </div>
       </section>
    </div>
  );
}