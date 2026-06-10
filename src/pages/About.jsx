import React, { useState } from 'react';
import { Edit3, Users, User, Star, MapPin, GripVertical } from 'lucide-react';
import { getImgStyle } from '../utils/helpers';
import { editorContentClasses } from '../components/Shared';

export default function About({ isAdmin, parishStats, setTempStats, setEditingStats, historyData, setTempHistory, setEditingHistory, heritageTitle, setTempHeritageTitle, setEditingHeritageTitle, heritageList, setTempHeritageItem, setEditingHeritageItem, pastoralData, setTempPastoral, setEditingPastoral, handleReorderHeritage }) {
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  return (
    <div className="pt-28 pb-20 md:pt-32 md:pb-24 bg-[#fffcfd] min-h-screen text-stone-900 animate-in fade-in duration-500">
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
            <div className="text-center px-2"><Users className="mx-auto text-pink-500 mb-2" size={24} /><span className="block text-2xl font-serif font-bold text-pink-950 tracking-tight mb-1">{parishStats.population || '0'}</span><span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">Giáo dân</span></div>
            <div className="text-center px-2"><User className="mx-auto text-pink-500 mb-2" size={24} /><span className="block text-base md:text-lg font-serif font-bold text-pink-950 tracking-tight mb-1 line-clamp-1">{parishStats.priest || 'Đang cập nhật'}</span><span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">Linh mục</span></div>
            <div className="text-center px-2"><Star className="mx-auto text-pink-500 mb-2" size={24} /><span className="block text-base md:text-lg font-serif font-bold text-pink-950 tracking-tight mb-1 line-clamp-1">{parishStats.patron || 'Đang cập nhật'}</span><span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">Bổn mạng</span></div>
            <div className="text-center px-2"><MapPin className="mx-auto text-pink-500 mb-2" size={24} /><span className="block text-base md:text-lg font-serif font-bold text-pink-950 tracking-tight mb-1 line-clamp-1">{parishStats.address || 'Đang cập nhật'}</span><span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">Địa chỉ</span></div>
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
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-pink-950 uppercase tracking-widest inline-flex items-center">{heritageTitle || 'Gia Sản Thiêng Liêng'}</h3>
            <div className="h-[2px] w-16 bg-pink-200 mx-auto mt-4"></div>
            {isAdmin && (<button onClick={() => { setTempHeritageTitle(heritageTitle); setEditingHeritageTitle(true); }} className="absolute top-0 right-10 md:right-14 p-2 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-600 hover:text-white transition shadow-sm"><Edit3 size={14} /></button>)}
            {isAdmin && (<button onClick={() => { setTempHeritageItem({ id: Date.now(), name: '', brief: '', image: '', imgFit: 'cover' }); setEditingHeritageItem('new'); }} className="absolute top-0 right-0 p-2 bg-pink-600 text-white rounded-full shadow-sm hover:bg-pink-500 transition"><span className="font-bold px-1">+</span></button>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {heritageList.filter((saint, index, self) => {
              const getCleanName = (name) => name ? name.replace(/^\d+[\.\-\s]+/, '').trim() : '';
              return index === self.findIndex((t) => String(t.id) === String(saint.id) || getCleanName(t.name) === getCleanName(saint.name));
            }).map((saint, idx) => {
              const cleanName = saint.name ? saint.name.replace(/^\d+[\.\-\s]+/, '').trim() : '';
              return (
              <div 
                key={saint.id} 
                draggable={isAdmin}
                onDragStart={(e) => { 
                  if (isAdmin) { 
                    setDraggedIdx(saint.id); 
                    e.dataTransfer.effectAllowed = 'move'; 
                    e.dataTransfer.setData('text/plain', saint.id.toString()); 
                  } 
                }}
                onDragEnter={(e) => { if (isAdmin) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; } }}
                onDragOver={(e) => { if (!isAdmin) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (dragOverIdx !== saint.id) setDragOverIdx(saint.id); }}
                onDragLeave={(e) => { if (!isAdmin) return; if (!e.currentTarget.contains(e.relatedTarget)) setDragOverIdx(null); }}
                onDrop={(e) => {
                  if (!isAdmin) return;
                  e.preventDefault();
                  
                  let sourceId = draggedIdx;
                  if (sourceId === null) {
                    const data = e.dataTransfer.getData('text/plain');
                    if (data) sourceId = data;
                  }
                  
                  if (sourceId !== null && String(sourceId) !== String(saint.id)) handleReorderHeritage(String(sourceId), String(saint.id));
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null); }}
                className={`relative group/card flex flex-col sm:flex-row gap-4 p-5 rounded-xl border transition-all duration-300 items-center sm:items-start ${isAdmin ? 'cursor-grab active:cursor-grabbing' : ''} ${draggedIdx === saint.id ? 'opacity-40 scale-95 bg-pink-100/50 z-10' : 'bg-pink-50/40 opacity-100 z-0'} ${dragOverIdx === saint.id && draggedIdx !== saint.id ? 'border-pink-500 border-dashed bg-pink-200/50 shadow-lg scale-[1.02] z-20' : 'border-pink-100 hover:border-pink-300 hover:shadow-md'} ${draggedIdx !== null ? '[&_*]:pointer-events-none' : ''}`}
              >
                {isAdmin && (
                  <div className="absolute top-2 left-2 z-20 text-pink-300/50 group-hover/card:text-pink-500 transition-colors" title="Kéo thả để sắp xếp">
                    <GripVertical size={16} />
                  </div>
                )}
                {isAdmin && (<button onClick={(e) => { e.stopPropagation(); setTempHeritageItem({...saint, name: cleanName}); setEditingHeritageItem(saint.id); }} className="absolute top-3 right-3 z-20 p-1.5 bg-pink-100 text-pink-700 rounded-full shadow-sm transition hover:bg-pink-600 hover:text-white"><Edit3 size={12} /></button>)}
              <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 relative overflow-hidden rounded-full border-[3px] border-white shadow-sm bg-pink-50 text-pink-300">
                <div className="absolute inset-0 transition-transform duration-300 group-hover/card:scale-110 flex items-center justify-center">
                  <User size={36} className="absolute z-0" />
                  {saint.image && saint.image.trim() !== '' && (
                    <img src={saint.image} onError={(e) => { e.target.style.opacity = 0; }} style={getImgStyle(saint)} className="w-full h-full block object-cover relative z-10 bg-white transition-opacity duration-300" alt={saint.name} loading="lazy" draggable={false} />
                  )}
                </div>
              </div>
                <div className="flex flex-col justify-center text-center sm:text-left flex-1"><h4 className="text-base md:text-lg font-bold text-pink-950 mb-2 font-serif tracking-wide">{idx + 1}. {cleanName || ''}</h4><p className="text-xs md:text-sm font-serif text-stone-600 leading-relaxed">{saint.brief || ''}</p></div>
              </div>
              );
            })}
          </div>
        </div>

        <div className="mb-16 relative group bg-white p-6 md:p-10 rounded-2xl border border-pink-50 shadow-md">
          {isAdmin && <button onClick={() => { setTempPastoral(pastoralData); setEditingPastoral(true); }} className="absolute top-4 right-4 z-20 p-2 bg-pink-600 text-white rounded-full shadow-md transition hover:bg-pink-700 active:scale-90"><Edit3 size={14} /></button>}
          <div className="text-center mb-8"><h3 className="text-2xl md:text-3xl font-serif font-bold text-pink-950 uppercase tracking-widest">{pastoralData.title || ''}</h3><div className="h-[2px] w-16 bg-pink-200 mx-auto mt-4"></div></div>
          <div className={`max-h-[1200px] overflow-y-auto custom-scrollbar pr-4 ${editorContentClasses}`} dangerouslySetInnerHTML={{ __html: pastoralData.content || '' }} />
        </div>
      </div>
    </div>
  );
}