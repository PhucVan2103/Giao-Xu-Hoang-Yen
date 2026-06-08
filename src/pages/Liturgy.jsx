import React from 'react';
import { Edit3, Clock, Heart, BookOpen, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatDateString, getDaysArray, litColors, normalizeMassSchedules, expandMassSchedules } from '../utils/helpers';
import { db, appId } from '../utils/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function Liturgy({ isAdmin, selectedDate, setSelectedDate, calendarDate, prevMonth, nextMonth, liturgyEvents, massSchedules, setTempMass, setEditingMass, confessionData, setTempConfession, setEditingConfession, adorationData, setTempAdoration, setEditingAdoration, setTempLiturgyEvent, setEditingLiturgyEvent }) {
  const selectedDateStr = formatDateString(selectedDate);
  const eventOfDay = liturgyEvents.find(e => e.date === selectedDateStr);
  const eventColor = eventOfDay ? (litColors[eventOfDay.colorType] || litColors.white) : litColors.white;

  return (
    <div className="pt-28 pb-20 md:pt-32 md:pb-24 bg-[#fffcfd] min-h-screen text-stone-900 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12"><h2 className="text-3xl md:text-5xl font-serif font-bold text-pink-950 uppercase tracking-widest leading-tight">Lịch Phụng Vụ</h2></div>
        
        <div className="bg-white p-6 md:p-8 shadow-lg shadow-pink-100 border-t-4 border-pink-500 rounded-2xl relative group mb-10">
          {isAdmin && <button onClick={() => { 
            const expanded = expandMassSchedules(normalizeMassSchedules(massSchedules));
            setTempMass(expanded.map(d => ({ day: d.label, times: d.times })));
            setEditingMass(true); 
          }} className="absolute top-4 right-4 p-2 bg-pink-600 text-white rounded-full shadow-md transition hover:bg-pink-700"><Edit3 size={16}/></button>}
          <h3 className="text-xl font-bold mb-8 uppercase text-pink-700 flex items-center justify-center gap-2"><Clock size={22}/> Giờ Lễ Chung Trong Tuần</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {expandMassSchedules(massSchedules).map((item, idx) => {
              const isToday = new Date().getDay() === item.id;
              return (
                <div key={idx} className={`rounded-xl p-3 sm:p-4 border transition-all h-full flex flex-col ${isToday ? 'bg-pink-50 border-pink-400 shadow-md ring-1 ring-pink-200' : 'bg-stone-50 border-stone-100 hover:border-pink-200'}`}>
                  <div className={`font-bold uppercase text-[11px] sm:text-xs tracking-widest mb-4 border-b pb-3 text-center flex flex-col items-center justify-center gap-1.5 ${item.id === 0 ? 'text-red-600 border-red-100' : 'text-pink-800 border-pink-100'}`}>
                    <span>{item.label}</span>
                    {isToday && <span className="bg-pink-600 text-white text-[9px] px-2 py-0.5 rounded-full shadow-sm mt-1">HÔM NAY</span>}
                  </div>
                  <div className="flex flex-col gap-3 items-center flex-1 w-full">
                    {item.times.length > 0 ? item.times.map((t, i) => {
                      const isObj = typeof t === 'object';
                      const timeVal = isObj ? t.time : t;
                      const locVal = isObj ? t.location : '';
                      return (
                        <div key={i} className="flex flex-col items-center text-center w-full bg-white border border-pink-100 rounded-lg p-2 shadow-sm">
                          <span className={`font-bold text-sm ${isToday ? 'text-pink-700' : 'text-pink-600'}`}>{timeVal}</span>
                          {locVal && <span className="text-[10px] sm:text-[11px] text-stone-500 font-serif leading-tight mt-1 px-1">{locVal}</span>}
                        </div>
                      );
                    }) : (
                      <span className="text-[11px] text-stone-400 font-serif italic mt-2 text-center w-full">Không có lịch</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-6 shadow-lg shadow-purple-100 border-t-4 border-purple-500 rounded-xl relative group">
            {isAdmin && <button onClick={() => { setTempConfession(confessionData); setEditingConfession(true); }} className="absolute top-3 right-3 p-1.5 bg-purple-600 text-white rounded-full shadow-md"><Edit3 size={14}/></button>}
            <h3 className="text-lg font-bold text-purple-700 mb-3 flex items-center gap-2"><Heart size={18}/> {confessionData.title || 'Bí Tích'}</h3>
            <p className="font-serif text-sm leading-relaxed text-stone-600 whitespace-pre-wrap">{confessionData.desc || 'Đang cập nhật'}</p>
          </div>
          <div className="bg-white p-6 shadow-lg shadow-amber-100 border-t-4 border-amber-500 rounded-xl relative group">
            {isAdmin && <button onClick={() => { setTempAdoration(adorationData); setEditingAdoration(true); }} className="absolute top-3 right-3 p-1.5 bg-amber-600 text-white rounded-full shadow-md"><Edit3 size={14}/></button>}
            <h3 className="text-lg font-bold text-amber-700 mb-3 flex items-center gap-2"><BookOpen size={18}/> {adorationData.title || 'Hoạt Động'}</h3>
            <p className="font-serif text-sm leading-relaxed text-stone-600 whitespace-pre-wrap">{adorationData.desc || 'Đang cập nhật'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-pink-100 p-6">
            <div className="flex justify-between items-center mb-6"><button onClick={prevMonth} className="p-2 text-pink-700 hover:bg-pink-50 rounded-full transition"><ChevronLeft size={20}/></button><h3 className="text-xl font-bold font-serif text-pink-950 uppercase">Tháng {calendarDate.getMonth() + 1} / {calendarDate.getFullYear()}</h3><button onClick={nextMonth} className="p-2 text-pink-700 hover:bg-pink-50 rounded-full transition"><ChevronRight size={20}/></button></div>
            <div className="grid grid-cols-7 gap-2">
              {['T2','T3','T4','T5','T6','T7','CN'].map((d, i) => <div key={d} className={`text-center font-bold text-xs uppercase py-2 ${i === 6 ? 'text-red-600' : 'text-stone-400'}`}>{d}</div>)}
              {getDaysArray(calendarDate.getFullYear(), calendarDate.getMonth()).map((d, idx) => {
                if (!d) return <div key={idx}></div>;
                const dateStr = formatDateString(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), d));
                const evt = liturgyEvents.find(e => e.date === dateStr);
                return (<div key={idx} onClick={() => setSelectedDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), d))} className={`min-h-[80px] p-1 rounded-xl border transition-all cursor-pointer flex flex-col ${dateStr === selectedDateStr ? 'border-pink-500 bg-pink-50 shadow-md ring-2 ring-pink-100' : 'border-stone-50 bg-white hover:border-pink-200'}`}><span className={`text-xs font-bold mb-auto ${idx % 7 === 6 ? 'text-red-600' : 'text-stone-700'}`}>{d}</span>{evt && <div className={`text-[8px] p-1 rounded border leading-tight ${litColors[evt.colorType] ? litColors[evt.colorType].bg : ''} ${litColors[evt.colorType] ? litColors[evt.colorType].text : ''} ${litColors[evt.colorType] ? litColors[evt.colorType].border : ''}`}>{evt.title}</div>}</div>);
              })}
            </div>
          </div>
          <div className={`rounded-2xl shadow-lg border p-6 flex flex-col transition-all duration-500 ${eventColor.bg} ${eventColor.border}`}>
             <div className="flex justify-between items-start mb-6"><span className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-2"><Calendar size={14} className="text-pink-500"/> {selectedDate.toLocaleDateString('vi-VN')}</span>{isAdmin && <button onClick={() => { setTempLiturgyEvent(eventOfDay || { date: selectedDateStr, title: '', colorType: 'white', desc: '' }); setEditingLiturgyEvent(true); }} className="p-1.5 bg-white/50 hover:bg-white rounded-full shadow-sm transition"><Edit3 size={12}/></button>}</div>
             {eventOfDay ? (<div><h4 className={`text-xl font-serif font-bold mb-4 ${eventColor.text}`}>{eventOfDay.title}</h4><p className="font-serif text-sm leading-relaxed text-stone-700 whitespace-pre-wrap">{eventOfDay.desc}</p></div>) : <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-stone-500"><BookOpen size={32} className="mb-2"/><p className="text-xs text-center font-serif">Lịch cử hành theo ngày thường</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
}