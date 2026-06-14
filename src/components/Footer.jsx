import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3 } from 'lucide-react';
import { Logo, FacebookIcon } from './Shared';

export default function Footer({ isAdmin, footerData, contactInfo, logoConfig, setTempFooter, setTempContact, setEditingFooter, setShowLoginModal, setIsAdmin }) {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#1a0f12] text-pink-200/60 pt-20 pb-10 border-t-4 border-pink-950 relative group">
      {isAdmin && <button onClick={() => { setTempFooter(footerData); setTempContact(contactInfo); setEditingFooter(true); }} className="absolute top-6 right-6 z-20 p-2 bg-white/10 text-white rounded-full shadow-md transition active:scale-90 hover:bg-pink-600"><Edit3 size={16}/></button>}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10 text-left">
        <div><div className="flex items-center space-x-3 mb-6"><Logo sizeClass="w-16 h-16" isSolid={true} config={logoConfig} /><h2 className="font-bold text-white text-lg uppercase tracking-widest">GIÁO XỨ HOÀNG YÊN</h2></div><p className="text-xs italic leading-relaxed opacity-70 whitespace-pre-wrap">{footerData.aboutText}</p></div>
        <div><h3 className="text-pink-100 font-bold text-xs uppercase mb-6 border-b border-pink-900/50 pb-3 tracking-widest">Thông Tin</h3><ul className="space-y-3 text-xs opacity-80"><li>{contactInfo.address}</li><li>{contactInfo.phone}</li><li>{contactInfo.email}</li></ul></div>
        <div><h3 className="text-pink-100 font-bold text-xs uppercase mb-6 border-b border-pink-900/50 pb-3 tracking-widest">Liên Kết</h3><ul className="space-y-3 text-[10px] uppercase opacity-80 tracking-widest"><li className="cursor-pointer hover:text-pink-300" onClick={() => navigate('/phung-vu')}>Lịch Phụng Vụ</li><li className="cursor-pointer hover:text-pink-300" onClick={() => navigate('/lien-he')}>Liên Hệ Văn Phòng</li><li className="cursor-pointer hover:text-pink-300" onClick={() => navigate('/hanh-huong')}>Đăng ký Hành Hương</li></ul></div>
        <div><h3 className="text-pink-100 font-bold text-xs uppercase mb-6 border-b border-pink-900/50 pb-3 tracking-widest">Kết Nối</h3><a href={footerData.facebookLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-pink-300 transition-colors"><div className="w-8 h-8 rounded-full bg-pink-900/40 flex items-center justify-center border border-pink-800/50"><FacebookIcon size={14} className="text-pink-200" /></div><span>Facebook Giáo Xứ</span></a></div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-16 pt-6 border-t border-white/10 text-[9px] uppercase font-bold opacity-40 flex flex-col sm:flex-row justify-between items-center gap-4 tracking-widest">
        <p onClick={() => setShowLoginModal(true)} className="cursor-pointer hover:opacity-100 transition-opacity">© 2013 GIÁO XỨ HOÀNG YÊN.</p>
        <div className="flex items-center gap-4 text-right">
          {isAdmin && <span onClick={() => navigate('/admin')} className="cursor-pointer text-pink-300 hover:text-white transition-all">Dashboard</span>}
        </div>
      </div>
    </footer>
  );
}