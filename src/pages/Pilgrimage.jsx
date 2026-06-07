import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Edit3, Calendar, Clock, MapPin, Heart, Users, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImgStyle, getStatusStyles } from '../utils/helpers';
import { editorContentClasses } from '../components/Shared';
import { db, appId } from '../utils/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export function Pilgrimage({ isAdmin, pilgrimagePlans, pilgrimagePage, setPilgrimagePage, itemsPerPage, setSelectedPilgrimage, setTempPilgrimage, setEditingPilgrimage, receptionInfo, setTempReception, setEditingReception }) {
  const navigate = useNavigate();
  const totalPilgrimagePages = Math.ceil(pilgrimagePlans.length / itemsPerPage);
  const currentPilgrimagePlans = pilgrimagePlans.slice((pilgrimagePage - 1) * itemsPerPage, pilgrimagePage * itemsPerPage);

  return (
    <div className="pt-28 pb-20 md:pt-32 md:pb-24 bg-[#fffcfd] min-h-screen text-stone-900 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-pink-950 mb-4 uppercase tracking-widest leading-tight text-center">Trung Tâm Hành Hương</h2>
          <div className="flex items-center justify-center space-x-3 mb-6"><div className="h-[1px] w-16 bg-pink-200"></div><div className="text-pink-300 text-lg">❦</div><div className="h-[1px] w-16 bg-pink-200"></div></div>
          <p className="text-stone-500 font-serif text-sm md:text-base max-w-2xl mx-auto italic text-center leading-relaxed">"Phúc thay ai lấy Chúa làm sức mạnh, quyết tâm tiến bước hành hương." (Tv 84, 6)</p>
        </div>

        <div className="mb-16">
          <div className="flex justify-between items-center mb-8 border-b border-pink-100 pb-4 relative">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-pink-950 uppercase tracking-widest">Kế Hoạch Hành Hương</h3>
            {isAdmin && (<button onClick={() => { setTempPilgrimage({ id: Date.now(), title: '', date: '', duration: '', status: 'Sắp diễn ra', desc: '', image: '', content: '' }); setEditingPilgrimage('new'); }} className="px-4 py-2 bg-pink-600 text-white text-[11px] font-bold rounded shadow-md transition-all active:scale-95 flex items-center gap-1">+ Thêm Kế Hoạch</button>)}
          </div>

          <div className="space-y-6">
            {currentPilgrimagePlans.map(plan => (
              <div key={plan.id} onClick={() => { setSelectedPilgrimage(plan); navigate('/hanh-huong/chi-tiet'); }} className="group flex flex-col sm:flex-row bg-white rounded-xl shadow-md border border-pink-50 overflow-hidden cursor-pointer hover:shadow-lg hover:border-pink-300 transition-all relative">
                {isAdmin && <button onClick={(e) => { e.stopPropagation(); setTempPilgrimage(plan); setEditingPilgrimage(plan.id); }} className="absolute top-3 right-3 z-20 p-1.5 bg-white/80 backdrop-blur-sm text-pink-700 rounded-full shadow-sm transition hover:bg-pink-600 hover:text-white"><Edit3 size={14} /></button>}
                <div className="sm:w-56 h-48 sm:h-auto flex-shrink-0 relative overflow-hidden bg-stone-100">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"><img src={plan.image} style={getImgStyle(plan)} className="w-full h-full block" alt={plan.title} loading="lazy" /></div>
                  <div className="absolute top-3 left-3"><span className={`text-[10px] font-bold px-2 py-1 rounded shadow-sm border ${getStatusStyles(plan.status)} uppercase tracking-wider`}>{plan.status}</span></div>
                </div>
                <div className="p-6 flex flex-col justify-center flex-1">
                  <h4 className="text-lg md:text-xl font-serif font-bold text-pink-950 mb-3 group-hover:text-pink-700 transition leading-snug line-clamp-2">{plan.title}</h4>
                  <div className="flex flex-wrap gap-4 mb-4"><span className="flex items-center text-xs font-bold text-stone-500 uppercase tracking-widest"><Calendar size={14} className="mr-1.5 text-pink-500" /> {plan.date}</span><span className="flex items-center text-xs font-bold text-stone-500 uppercase tracking-widest"><Clock size={14} className="mr-1.5 text-pink-500" /> {plan.duration}</span></div>
                  <p className="text-sm font-serif text-stone-600 leading-relaxed line-clamp-2">{plan.desc || ''}</p>
                </div>
              </div>
            ))}
            {pilgrimagePlans.length === 0 && (<div className="text-center py-12 bg-stone-50 rounded-xl border border-stone-100"><MapPin className="mx-auto text-stone-300 mb-4" size={32} /><p className="text-stone-500 font-serif">Hiện tại chưa có kế hoạch hành hương nào.</p></div>)}
          </div>

          {totalPilgrimagePages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-10">
              <button onClick={() => setPilgrimagePage(p => Math.max(1, p - 1))} disabled={pilgrimagePage === 1} className="p-2 rounded border border-pink-200 text-pink-600 hover:bg-pink-50 disabled:opacity-30 disabled:hover:bg-transparent transition"><ChevronLeft size={16}/></button>
              {Array.from({length: totalPilgrimagePages}, (_, i) => (<button key={i+1} onClick={() => setPilgrimagePage(i+1)} className={`w-8 h-8 rounded text-sm font-bold transition ${pilgrimagePage === i + 1 ? 'bg-pink-600 text-white shadow-md' : 'text-stone-600 hover:bg-pink-50 border border-transparent hover:border-pink-200'}`}>{i + 1}</button>))}
              <button onClick={() => setPilgrimagePage(p => Math.min(totalPilgrimagePages, p + 1))} disabled={pilgrimagePage === totalPilgrimagePages} className="p-2 rounded border border-pink-200 text-pink-600 hover:bg-pink-50 disabled:opacity-30 disabled:hover:bg-transparent transition"><ChevronRight size={16}/></button>
            </div>
          )}
        </div>

        <div className="mt-16 bg-pink-950 p-8 md:p-12 rounded-2xl shadow-xl text-pink-50 border-t-4 border-pink-400 relative group">
          {isAdmin && <button onClick={() => { setTempReception(receptionInfo); setEditingReception(true); }} className="absolute top-4 right-4 z-20 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full shadow-md transition hover:bg-pink-600 active:scale-90"><Edit3 size={16} /></button>}
          <div className="text-center mb-10"><h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4 uppercase tracking-tight flex items-center justify-center"><Heart className="mr-3 text-pink-400" size={28}/> Liên Hệ Đón Tiếp</h3><div className="h-[2px] w-16 bg-pink-800 mx-auto"></div></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start p-6 bg-pink-900/50 rounded-xl border border-pink-800/50"><div className="w-14 h-14 bg-pink-800/60 rounded-full flex items-center justify-center mb-4 border border-pink-700/50"><Users className="text-pink-300" size={24} /></div><h4 className="font-bold text-pink-200 uppercase tracking-widest text-[10px] mb-2">{receptionInfo.item1Title || 'Đăng ký đoàn'}</h4><p className="font-serif text-sm leading-relaxed opacity-90 whitespace-pre-wrap">{receptionInfo.item1Desc || ''}</p></div>
            <div className="flex flex-col items-center md:items-start p-6 bg-pink-900/50 rounded-xl border border-pink-800/50"><div className="w-14 h-14 bg-pink-800/60 rounded-full flex items-center justify-center mb-4 border border-pink-700/50"><MapPin className="text-pink-300" size={24} /></div><h4 className="font-bold text-pink-200 uppercase tracking-widest text-[10px] mb-2">{receptionInfo.item2Title || 'Cơ sở vật chất'}</h4><p className="font-serif text-sm leading-relaxed opacity-90 whitespace-pre-wrap">{receptionInfo.item2Desc || ''}</p></div>
            <div className="flex flex-col items-center md:items-start p-6 bg-pink-900/50 rounded-xl border border-pink-800/50"><div className="w-14 h-14 bg-pink-800/60 rounded-full flex items-center justify-center mb-4 border border-pink-700/50"><Phone className="text-pink-300" size={24} /></div><h4 className="font-bold text-pink-200 uppercase tracking-widest text-[10px] mb-2">{receptionInfo.item3Title || 'Hỗ trợ'}</h4><p className="font-serif text-sm leading-relaxed opacity-90 mb-3 whitespace-pre-wrap">{receptionInfo.item3Desc || ''}</p><strong className="text-xl text-white block mt-auto">{receptionInfo.item3Phone || ''}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PilgrimageDetail({ isAdmin, selectedPilgrimage, setTempPilgrimage, setEditingPilgrimage }) {
  const navigate = useNavigate();
  if (!selectedPilgrimage) return <Navigate to="/hanh-huong" replace />;

  return (
    <div className="pt-28 pb-20 md:pt-32 md:pb-24 bg-[#fffcfd] min-h-screen text-stone-900 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto px-4 lg:px-6">
        <button onClick={() => navigate('/hanh-huong')} className="flex items-center text-pink-700 hover:text-pink-900 mb-8 font-bold text-[11px] uppercase tracking-widest transition-transform hover:-translate-x-1"><ChevronLeft size={14} className="mr-1" /> Quay lại Kế hoạch Hành Hương</button>
        <div className="bg-white rounded-2xl shadow-xl border border-pink-50 overflow-hidden relative">
          {isAdmin && <button onClick={() => { setTempPilgrimage(selectedPilgrimage); setEditingPilgrimage(selectedPilgrimage.id); }} className="absolute top-4 right-4 z-20 p-2.5 bg-white/80 backdrop-blur-sm text-pink-700 rounded-full shadow-md transition active:scale-90 hover:bg-pink-600 hover:text-white"><Edit3 size={16} /></button>}
        <div className="w-full aspect-[21/9] md:aspect-[21/7] overflow-hidden bg-stone-100 relative"><img src={selectedPilgrimage.image} style={getImgStyle(selectedPilgrimage)} className="w-full h-full block" alt="" loading="lazy" /></div>
          <div className="p-8 md:p-12"><div className="mb-4"><span className={`text-[10px] font-bold px-3 py-1.5 rounded shadow-sm border ${getStatusStyles(selectedPilgrimage.status)} uppercase tracking-wider`}>{selectedPilgrimage.status}</span></div><h1 className="text-3xl md:text-4xl font-serif font-bold text-pink-950 leading-tight mb-6">{selectedPilgrimage.title}</h1><div className="flex flex-wrap gap-6 mb-10 pb-6 border-b border-pink-100"><span className="flex items-center text-xs font-bold text-stone-500 uppercase tracking-widest"><Calendar size={14} className="mr-2 text-pink-500" /> Ngày: {selectedPilgrimage.date}</span><span className="flex items-center text-xs font-bold text-stone-500 uppercase tracking-widest"><Clock size={14} className="mr-2 text-pink-500" /> Thời lượng: {selectedPilgrimage.duration}</span></div><p className="text-lg font-serif italic text-stone-600 mb-10 leading-relaxed border-l-4 border-pink-300 pl-4">{selectedPilgrimage.desc}</p><div className={editorContentClasses} dangerouslySetInnerHTML={{ __html: selectedPilgrimage.content || '' }} /></div>
        </div>
      </div>
    </div>
  );
}