import React, { useEffect } from 'react';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import { Edit3, Star, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImgStyle } from '../utils/helpers';
import { editorContentClasses,FacebookShareButton } from '../components/Shared';
import { db, appId } from '../utils/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export function News({ isAdmin, newsItems, newsPage, setNewsPage, newsPerPage, setSelectedNews, setTempNews, setEditingNews, getTodayFormattedStr }) {
  const navigate = useNavigate();
  const featuredNews = newsItems.filter(n => n.isFeatured).slice(0, 2);
  const featuredIds = featuredNews.map(n => n.id);
  const regularNews = newsItems.filter(n => !featuredIds.includes(n.id));
  const totalNewsPages = Math.ceil(regularNews.length / newsPerPage);
  const currentRegularNews = regularNews.slice((newsPage - 1) * newsPerPage, newsPage * newsPerPage);

  return (
    <div className="pt-28 pb-20 md:pt-32 md:pb-24 bg-[#fffcfd] min-h-screen text-stone-900 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12 relative">
          <h2 className="text-pink-600 font-bold uppercase tracking-widest text-[10px] mb-2">Truyền thông Công giáo</h2>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-pink-950 uppercase tracking-widest leading-tight">Tin Tức & Thông Báo</h3>
          <div className="flex items-center justify-center space-x-3 mt-6 mb-8"><div className="h-[1px] w-16 bg-pink-200"></div><div className="text-pink-300 text-lg">❦</div><div className="h-[1px] w-16 bg-pink-200"></div></div>
          {isAdmin && (<button onClick={() => { setTempNews({ id: Date.now(), title: '', date: getTodayFormattedStr(), category: 'Tin Tức', desc: '', image: '', content: '', isFeatured: false, imgFit: 'cover' }); setEditingNews('new'); }} className="absolute right-0 top-6 px-4 py-2 bg-pink-600 text-white text-[11px] font-bold rounded shadow-md transition-all active:scale-95 hidden md:flex items-center gap-1">+ Thêm Bản Tin</button>)}
        </div>
        {isAdmin && (<button onClick={() => { setTempNews({ id: Date.now(), title: '', date: getTodayFormattedStr(), category: 'Tin Tức', desc: '', image: '', content: '', isFeatured: false, imgFit: 'cover' }); setEditingNews('new'); }} className="mb-8 w-full py-3 bg-pink-600 text-white text-xs font-bold rounded shadow-md transition active:scale-95 flex md:hidden items-center justify-center gap-2">+ Thêm Bản Tin</button>)}

        {featuredNews.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center mb-6"><span className="bg-pink-100 text-pink-700 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm border border-pink-200 flex items-center"><Star size={12} className="mr-1.5" /> Tin Nổi Bật</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredNews.map(item => (
                <div key={item.id} onClick={() => navigate(`/tin-tuc/${item.id}`)} className="group cursor-pointer relative flex flex-col rounded-2xl overflow-hidden shadow-lg border border-pink-50 h-[380px] bg-white hover:shadow-xl hover:border-pink-200 transition-all duration-300">
                  {isAdmin && <button onClick={(e) => { e.stopPropagation(); setTempNews(item); setEditingNews(item.id); }} className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-sm text-pink-700 rounded-full shadow-md transition hover:bg-pink-600 hover:text-white"><Edit3 size={14} /></button>}
                <div className="h-[220px] w-full overflow-hidden relative bg-stone-100"><div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"><img src={item.image} style={getImgStyle(item)} className="w-full h-full block" alt="" loading="lazy" /></div><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div><span className="absolute bottom-4 left-4 bg-pink-600 text-white text-[9px] font-bold px-2 py-1 rounded inline-block shadow-sm uppercase tracking-wider">{item.category}</span></div>
                  <div className="p-6 flex flex-col flex-1"><h4 className="font-serif font-bold text-xl text-pink-950 mb-3 group-hover:text-pink-700 transition leading-snug line-clamp-2">{item.title}</h4><div className="text-stone-500 text-sm line-clamp-2 leading-relaxed font-serif mb-4 flex-1" dangerouslySetInnerHTML={{ __html: item.desc || '' }} /><p className="text-[10px] font-bold text-stone-400 uppercase flex items-center tracking-widest mt-auto"><Calendar size={12} className="mr-1.5 text-pink-400" />{item.date}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xl font-serif font-bold text-pink-950 uppercase tracking-widest mb-6 pb-4 border-b border-pink-100">Điểm Tin Giáo Xứ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentRegularNews.map((item) => (
              <div key={item.id} onClick={() => navigate(`/tin-tuc/${item.id}`)} className="group cursor-pointer relative bg-white p-4 rounded-xl border border-pink-50 shadow-sm hover:border-pink-300 hover:shadow-md transition-all flex flex-col">
                {isAdmin && <button onClick={(e) => { e.stopPropagation(); setTempNews(item); setEditingNews(item.id); }} className="absolute top-2 right-2 z-20 p-1.5 bg-pink-100 text-pink-700 rounded-full shadow-sm transition hover:bg-pink-600 hover:text-white"><Edit3 size={12} /></button>}
              <div className="w-full h-48 mb-4 relative overflow-hidden rounded-lg shadow-sm bg-stone-100"><div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"><img src={item.image} style={getImgStyle(item)} className="w-full h-full block" alt="" loading="lazy" /></div><span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-pink-700 text-[9px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">{item.category}</span></div>
                <div className="flex flex-col flex-1"><p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center mb-2"><Calendar size={10} className="mr-1.5" />{item.date}</p><h4 className="font-serif font-bold text-lg text-pink-950 mb-2 group-hover:text-pink-700 transition leading-snug line-clamp-2">{item.title}</h4><div className="text-stone-500 text-sm line-clamp-3 leading-relaxed font-serif mt-auto" dangerouslySetInnerHTML={{ __html: item.desc || '' }} /></div>
              </div>
            ))}
          </div>
          {totalNewsPages > 1 && (<div className="flex justify-center items-center space-x-2 mt-12"><button onClick={() => setNewsPage(p => Math.max(1, p - 1))} disabled={newsPage === 1} className="p-2 rounded border border-pink-200 text-pink-600 hover:bg-pink-50 disabled:opacity-30 disabled:hover:bg-transparent transition"><ChevronLeft size={16}/></button>{Array.from({length: totalNewsPages}, (_, i) => (<button key={i+1} onClick={() => setNewsPage(i+1)} className={`w-8 h-8 rounded text-sm font-bold transition ${newsPage === i + 1 ? 'bg-pink-600 text-white shadow-md' : 'text-stone-600 hover:bg-pink-50 border border-transparent hover:border-pink-200'}`}>{i + 1}</button>))}<button onClick={() => setNewsPage(p => Math.min(totalNewsPages, p + 1))} disabled={newsPage === totalNewsPages} className="p-2 rounded border border-pink-200 text-pink-600 hover:bg-pink-50 disabled:opacity-30 disabled:hover:bg-transparent transition"><ChevronRight size={16}/></button></div>)}
        </div>
      </div>
    </div>
  );
}

export function NewsDetail({ isAdmin, newsItems, setTempNews, setEditingNews }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const selectedNews = newsItems.find(n => n.id.toString() === id);

  if (!selectedNews && newsItems.length > 0) return <Navigate to="/tin-tuc" replace />;
  if (!selectedNews) return <div className="pt-32 text-center text-pink-700 font-bold">Đang tải bản tin...</div>;

  useEffect(() => {
    if (selectedNews) {
      document.title = `${selectedNews.title} | Giáo Xứ Hoàng Yên`;
      const updateMeta = (property, content) => {
        let meta = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(property.includes(':') ? 'property' : 'name', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content || '');
      };
      updateMeta('og:title', selectedNews.title);
      updateMeta('og:image', selectedNews.image);
      updateMeta('og:description', (selectedNews.desc || '').replace(/<[^>]*>?/gm, '').substring(0, 160));
    }
  }, [selectedNews]);

  return (
    <div className="pt-28 pb-20 md:pt-32 md:pb-24 bg-[#fffcfd] min-h-screen text-stone-900 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto px-4 lg:px-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-pink-700 hover:text-pink-900 mb-8 font-bold text-[11px] uppercase tracking-widest transition-transform hover:-translate-x-1"><ChevronLeft size={14} className="mr-1" /> Quay lại</button>
        <div className="flex justify-between items-start mb-5 gap-4"><h1 className="text-2xl md:text-4xl font-serif font-bold text-pink-950 leading-tight">{selectedNews.title}</h1>{isAdmin && <button onClick={() => { setTempNews(selectedNews); setEditingNews(selectedNews.id); }} className="p-2.5 bg-pink-600 text-white rounded-full shadow-md flex-shrink-0 transition active:scale-90"><Edit3 size={16} /></button>}</div>
        <div className="flex items-center text-stone-500 mb-8 text-[11px] md:text-xs font-bold uppercase tracking-wider border-b border-pink-100 pb-4"><Calendar size={12} className="mr-1.5 text-pink-500" /> {selectedNews.date}</div>
      <div className="w-full aspect-[21/9] rounded-lg mb-8 shadow-sm overflow-hidden bg-stone-100"><img src={selectedNews.image} style={getImgStyle(selectedNews)} className="w-full h-full block" alt="" loading="lazy" /></div>
        <div className={editorContentClasses} dangerouslySetInnerHTML={{ __html: selectedNews.content || selectedNews.desc || '' }} />
        <div className="flex justify-end mt-12 border-t border-pink-100 pt-6">
          <FacebookShareButton />
        </div>
      </div>
    </div>
  );
}