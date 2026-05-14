import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, Edit3 } from 'lucide-react';
import { Logo } from './Shared';
import { navLinks } from '../utils/helpers';

export default function Header({ isAdmin, isSolidHeader, isMenuOpen, setIsMenuOpen, logoConfig, setTempLogoConfig, setEditingLogo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className={`fixed w-full z-[100] transition-all duration-500 ${isSolidHeader ? 'bg-white shadow-md py-3 border-b border-pink-50' : 'bg-transparent py-5 text-white'}`}>
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-3 cursor-pointer group relative" onClick={() => navigate('/')}>
          {isAdmin && <button onClick={(e) => { e.stopPropagation(); setTempLogoConfig(logoConfig); setEditingLogo(true); }} className="absolute -top-3 -left-3 z-[110] p-1.5 bg-pink-600 text-white rounded-full shadow-md hover:bg-pink-700 transition active:scale-90"><Edit3 size={12} /></button>}
          <Logo sizeClass="w-16 h-16 md:w-20 md:h-20" isSolid={isSolidHeader} config={logoConfig} />
          <div className={`border-l pl-4 hidden sm:block ${isSolidHeader ? 'border-pink-200' : 'border-white/20'}`}>
            <h1 className={`font-bold text-lg md:text-2xl leading-none uppercase tracking-tight whitespace-nowrap ${isSolidHeader ? 'text-pink-950' : 'text-white'}`}>GIÁO XỨ HOÀNG YÊN</h1>
            <p className={`text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] mt-1.5 whitespace-nowrap ${isSolidHeader ? 'text-pink-700' : 'text-pink-300'}`}>ĐỀN THÁNH NỮ VƯƠNG CÁC THÁNH TỬ ĐẠO VIỆT NAM</p>
          </div>
        </div>
        <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
          {navLinks.map((link) => (
            <button key={link.id} onClick={() => navigate(link.path)} className={`text-[12px] xl:text-[13px] whitespace-nowrap font-bold uppercase tracking-widest relative pb-1 group transition-colors ${currentPath === link.path ? 'text-pink-600' : (isSolidHeader ? 'text-stone-600 hover:text-pink-900' : 'text-white/80 hover:text-white')}`}>
              {link.name}<span className={`absolute bottom-0 left-0 h-[2px] bg-pink-500 transition-all duration-300 rounded-full ${currentPath === link.path || (currentPath.startsWith('/tin-tuc') && link.id === 'News') || (currentPath.startsWith('/hanh-huong') && link.id === 'Pilgrimage') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </button>
          ))}
          <button className={`p-1 transition-all hover:scale-110 ${isSolidHeader ? 'text-stone-400 hover:text-pink-600' : 'text-white/50 hover:text-white'}`}><Search size={22} /></button>
        </nav>
        <button className={`lg:hidden p-1.5 transition-all active:scale-90 ${isSolidHeader ? 'text-pink-950' : 'text-white'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={32} /> : <Menu size={32} />}</button>
      </div>
      {/* Mobile Menu */}
      <div className={`fixed inset-0 top-0 left-0 w-full h-screen bg-pink-950/98 backdrop-blur-md z-[90] transition-all duration-500 lg:hidden flex flex-col items-center justify-center p-8 ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
         <div className="w-full flex flex-col items-center space-y-8 text-white">
            <Logo isSolid={false} sizeClass="w-24 h-24" config={logoConfig} />
            <div className="flex flex-col items-center space-y-5 w-full">
              {navLinks.map((link) => (<button key={link.id} onClick={() => { navigate(link.path); setIsMenuOpen(false); }} className={`text-lg font-bold uppercase tracking-widest transition-all ${currentPath === link.path ? 'text-pink-400 scale-105' : 'text-white/70 hover:text-white'}`}>{link.name}</button>))}
            </div>
            <div className="h-px w-16 bg-pink-500/40"></div>
            <button onClick={() => setIsMenuOpen(false)} className="text-white/50 uppercase tracking-widest text-[13px] font-bold border border-white/20 px-6 py-2.5 rounded-full">Đóng Menu</button>
         </div>
      </div>
    </header>
  );
}