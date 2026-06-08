import React from 'react';
import { Edit3, Mail, MapPin, Phone, Clock, MessageSquare, CheckCircle2, Send } from 'lucide-react';

export default function Contact({ isAdmin, contactInfo, setTempContact, setEditingContact, formStatus, handleContactSubmit }) {
  return (
    <div className="pt-28 pb-20 md:pt-32 md:pb-24 bg-[#fffcfd] min-h-screen text-stone-900 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-pink-950 mb-4 uppercase tracking-widest leading-tight">Liên Hệ</h2>
          <div className="flex items-center justify-center space-x-3 mb-6"><div className="h-[1px] w-16 bg-pink-200"></div><div className="text-pink-300 text-lg">❦</div><div className="h-[1px] w-16 bg-pink-200"></div></div>
          <p className="text-stone-500 font-serif text-sm md:text-base max-w-2xl mx-auto italic text-center">"Hãy gõ, cửa sẽ mở cho anh em." (Mt 7, 7)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="flex flex-col h-full gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-pink-50 relative group">
              {isAdmin && <button onClick={() => { setTempContact(contactInfo); setEditingContact(true); }} className="absolute top-4 right-4 p-2 bg-pink-600 text-white rounded-full shadow-md transition active:scale-90 hover:bg-pink-700"><Edit3 size={14}/></button>}
              <h3 className="text-xl font-bold text-pink-950 uppercase mb-8 pb-4 border-b border-pink-50 flex items-center gap-3"><Mail className="text-pink-600" /> {contactInfo.title || ''}</h3>
              <ul className="space-y-6">
                <li className="flex gap-4"><div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center flex-shrink-0"><MapPin size={18} className="text-pink-600"/></div><div><span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Địa chỉ</span><p className="text-sm font-serif text-stone-700 leading-relaxed">{contactInfo.address || ''}</p></div></li>
                <li className="flex gap-4"><div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center flex-shrink-0"><Phone size={18} className="text-pink-600"/></div><div><span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Điện thoại</span><p className="text-lg font-bold text-pink-900">{contactInfo.phone || ''}</p></div></li>
                <li className="flex gap-4"><div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center flex-shrink-0"><Mail size={18} className="text-pink-600"/></div><div><span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Email</span><p className="text-sm font-serif text-stone-700">{contactInfo.email || ''}</p></div></li>
                <li className="flex gap-4"><div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center flex-shrink-0"><Clock size={18} className="text-pink-600"/></div><div><span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Giờ làm việc</span><p className="text-sm font-serif text-stone-700 italic">{contactInfo.hours || ''}</p></div></li>
              </ul>
            </div>
            <div className="bg-stone-200 rounded-2xl flex-1 min-h-[300px] shadow-inner overflow-hidden relative border border-stone-300 flex items-center justify-center">
              {contactInfo.mapUrl ? (
                <iframe src={contactInfo.mapUrl} className="w-full h-full absolute inset-0" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
              ) : (
                <div className="text-center opacity-40"><MapPin size={48} className="mx-auto mb-2"/><p className="text-xs font-bold uppercase tracking-widest">Bản đồ Đền Thánh</p></div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-pink-50 h-full flex flex-col">
            <h3 className="text-xl font-bold text-pink-950 uppercase mb-6 pb-4 border-b border-pink-50 flex items-center gap-3"><MessageSquare className="text-pink-600" /> Gửi Ý Nguyện & Góp Ý</h3>
            {formStatus === 'success' && (<div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2"><CheckCircle2 size={20} className="text-emerald-500" /><span className="text-sm font-bold">Gửi thông tin thành công! Xin cảm ơn bạn.</span></div>)}
            <form className="space-y-5 flex-1 flex flex-col" onSubmit={handleContactSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="text-[10px] font-bold uppercase text-stone-400 mb-2 block tracking-widest">Họ và tên</label><input type="text" name="sender" required className="w-full border border-stone-200 bg-stone-50 p-3 rounded text-sm focus:border-pink-500 focus:bg-white outline-none transition" placeholder="Tên của bạn..." /></div>
                <div><label className="text-[10px] font-bold uppercase text-stone-400 mb-2 block tracking-widest">Số điện thoại</label><input type="text" name="phone" required className="w-full border border-stone-200 bg-stone-50 p-3 rounded text-sm focus:border-pink-500 focus:bg-white outline-none transition" placeholder="Số liên lạc..." /></div>
              </div>
              <div><label className="text-[10px] font-bold uppercase text-stone-400 mb-2 block tracking-widest">Chủ đề</label><select name="topic" className="w-full border border-stone-200 bg-stone-50 p-3 rounded text-sm focus:border-pink-500 focus:bg-white outline-none transition cursor-pointer"><option>Gửi ý lễ / Xin ơn</option><option>Góp ý xây dựng Giáo xứ</option><option>Hỏi đáp thủ tục Bí tích</option><option>Liên hệ công việc khác</option></select></div>
              <div className="flex-1 flex flex-col"><label className="text-[10px] font-bold uppercase text-stone-400 mb-2 block tracking-widest">Nội dung</label><textarea name="content" required className="w-full flex-1 border border-stone-200 bg-stone-50 p-3 rounded text-sm min-h-[120px] focus:border-pink-500 focus:bg-white outline-none transition resize-none font-serif" placeholder="Nhập nội dung ý nguyện hoặc góp ý của bạn tại đây..."></textarea></div>
              <button type="submit" className="w-full bg-pink-700 hover:bg-pink-800 text-white font-bold py-4 rounded-lg shadow-md active:scale-95 transition-all uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 mt-4">Gửi Thông Tin <Send size={14}/></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}