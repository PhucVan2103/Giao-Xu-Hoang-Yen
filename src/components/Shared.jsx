import React, { useState, useEffect, useRef } from 'react';
import { Church, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, Video, Link as LinkIcon, Paperclip, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebase';
import toast from 'react-hot-toast';
import { getImgStyle } from '../utils/helpers';

export const FacebookIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

export const FacebookShareButton = ({ url, title = "Chia sẻ lên Facebook" }) => {
  const handleShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || window.location.href)}`;
    window.open(shareUrl, 'facebook-share-dialog', 'width=800,height=600');
  };
  return (
    <button onClick={handleShare} title={title} className="flex items-center justify-center w-10 h-10 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-full transition-all shadow-md active:scale-95">
      <FacebookIcon size={18} className="text-white" />
    </button>
  );
};

export const Logo = ({ sizeClass = "w-12 h-12", isSolid, config = {} }) => {
  const [hasError, setHasError] = useState(false);
  const imgSrc = config.image || "./logo.svg";

  useEffect(() => {
    setHasError(false);
  }, [imgSrc]);

  return (
    <div className={`${sizeClass} bg-white rounded-full border-2 border-white flex items-center justify-center transition-all duration-700 shadow-md overflow-hidden flex-shrink-0`}>
      {!hasError ? (
        <img 
          src={imgSrc} 
          alt="Logo Giáo Xứ" 
          style={getImgStyle(config)}
          className="w-full h-full block" 
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-pink-600 bg-pink-50">
          <Church size={24} />
        </div>
      )}
    </div>
  );
};

export const PromptModal = ({ isOpen, title, desc, placeholder, defaultValue, onConfirm, onCancel }) => {
  const [val, setVal] = useState('');
  useEffect(() => { if(isOpen) setVal(defaultValue || ''); }, [defaultValue, isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200 backdrop-blur-sm">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-md w-full border-t-4 border-pink-600 relative">
        <h3 className="text-lg md:text-xl font-bold text-pink-950 mb-2 uppercase tracking-tight">{title}</h3>
        {desc && <p className="text-sm font-serif text-stone-600 mb-5 whitespace-pre-wrap leading-relaxed">{desc}</p>}
        <input autoFocus type="text" className="w-full border border-pink-200 p-3 md:p-4 rounded-xl text-sm focus:border-pink-500 outline-none mb-6 font-serif shadow-inner transition-colors" placeholder={placeholder} value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && onConfirm(val)} />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-stone-100 py-3 rounded-xl font-bold uppercase text-[10px] md:text-xs tracking-widest hover:bg-stone-200 transition text-stone-600">Hủy Bỏ</button>
          <button onClick={() => onConfirm(val)} className="flex-1 bg-pink-600 text-white py-3 rounded-xl font-bold uppercase text-[10px] md:text-xs tracking-widest shadow-md hover:bg-pink-700 transition active:scale-95">Xác Nhận</button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Xác Nhận", cancelText = "Hủy Bỏ", isDanger = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 animate-in zoom-in duration-200 backdrop-blur-sm">
      <div className={`bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-sm w-full border-t-4 relative ${isDanger ? 'border-red-500' : 'border-pink-600'}`}>
        <h3 className={`text-xl font-bold uppercase tracking-tight mb-3 ${isDanger ? 'text-red-700' : 'text-pink-950'}`}>{title}</h3>
        <p className="text-sm font-serif text-stone-600 mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-stone-100 py-3 rounded-xl font-bold uppercase text-[10px] md:text-xs tracking-widest hover:bg-stone-200 transition text-stone-600">{cancelText}</button>
          <button onClick={onConfirm} className={`flex-1 text-white py-3 rounded-xl font-bold uppercase text-[10px] md:text-xs tracking-widest shadow-md transition active:scale-95 ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-pink-600 hover:bg-pink-700'}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export const Lightbox = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-50 p-2"><X size={32} /></button>
      <img src={src} className="max-w-full max-h-full object-contain rounded shadow-2xl animate-in zoom-in-90 duration-300" alt="Phóng to" onClick={e => e.stopPropagation()} />
    </div>
  );
};

export const editorContentClasses = "lightbox-container font-serif text-stone-700 text-sm md:text-base leading-relaxed text-justify flow-root [&_img]:max-w-[90%] md:[&_img]:max-w-[45%] [&_img]:h-auto [&_img]:rounded-md [&_img]:shadow-sm [&_img]:cursor-zoom-in [&_img]:hover:opacity-90 [&_img]:transition-opacity [&_p]:mb-4 [&_h3]:text-xl md:[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-pink-900 [&_h3]:mt-6 [&_h3]:mb-3 [&_h4]:text-lg md:[&_h4]:text-xl [&_h4]:font-bold [&_h4]:text-pink-700 [&_h4]:mt-5 [&_h4]:mb-2 [&_blockquote]:border-l-3 [&_blockquote]:border-pink-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-stone-500 [&_blockquote]:my-4 [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:my-4 [&_iframe]:shadow-sm [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800";

export const RichTextEditor = ({ value, onChange, minHeight = "150px" }) => {
  const editorRef = useRef(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const fileInputRef = useRef(null);
  const [promptConfig, setPromptConfig] = useState({ isOpen: false, type: '', title: '', desc: '', defaultValue: '' });
  const [savedRange, setSavedRange] = useState(null);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.contains(document.activeElement) && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => { if (editorRef.current) onChange(editorRef.current.innerHTML); };
  const execCmd = (command, val = null) => { document.execCommand(command, false, val); handleInput(); };

  const handleAlign = (alignType) => {
    if (selectedImg) {
      if (alignType === 'left') { selectedImg.style.display = 'inline-block'; selectedImg.style.float = 'left'; selectedImg.style.margin = '0.5rem 1.5rem 1rem 0'; }
      else if (alignType === 'right') { selectedImg.style.display = 'inline-block'; selectedImg.style.float = 'right'; selectedImg.style.margin = '0.5rem 0 1rem 1.5rem'; }
      else { selectedImg.style.display = 'block'; selectedImg.style.float = 'none'; selectedImg.style.margin = '1.5rem auto'; }
      selectedImg.style.outline = 'none'; setSelectedImg(null); handleInput();
    } else {
      const cmd = alignType === 'left' ? 'justifyLeft' : alignType === 'right' ? 'justifyRight' : 'justifyCenter';
      document.execCommand(cmd, false, null); handleInput();
    }
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) setSavedRange(selection.getRangeAt(0));
  };

  const restoreSelection = () => {
    if (savedRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }
  };

  const handleInsertImage = (e) => {
    e.preventDefault();
    saveSelection();
    setPromptConfig({ isOpen: true, type: 'image', title: 'Chèn Hình Ảnh', desc: 'Nhập đường dẫn (URL) của hình ảnh:', defaultValue: '' });
  };

  const handleInsertLink = (e) => {
    e.preventDefault();
    saveSelection();
    setPromptConfig({ isOpen: true, type: 'link', title: 'Chèn Liên Kết', desc: 'Nhập đường dẫn liên kết (URL):', defaultValue: 'https://' });
  };

  const handleInsertVideo = (e) => {
    e.preventDefault();
    saveSelection();
    setPromptConfig({ isOpen: true, type: 'video', title: 'Chèn Video', desc: 'Nhập đường dẫn (URL) video Youtube hoặc Facebook:\n(Ví dụ: https://www.youtube.com/... hoặc https://www.facebook.com/...)', defaultValue: '' });
  };

  const onPromptConfirm = (url) => {
    restoreSelection();
    setPromptConfig({ isOpen: false });
    if (!url) return;

    if (promptConfig.type === 'image') {
      execCmd('insertHTML', `<img src="${url}" style="display: inline-block; float: left; margin: 0.5rem 1.5rem 1rem 0;" />&nbsp;`);
    } else if (promptConfig.type === 'link') {
      const selection = window.getSelection();
      const selectedText = selection.toString();
      if (selectedText) {
        execCmd('insertHTML', `<a href="${url}" target="_blank" rel="noopener noreferrer">${selectedText}</a>`);
      } else {
        execCmd('insertHTML', `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
      }
    } else if (promptConfig.type === 'video') {
      let embedUrl = '';
      if (url.includes('youtube.com/watch?v=')) embedUrl = `https://www.youtube.com/embed/${url.split('v=')[1].split('&')[0]}`;
      else if (url.includes('youtu.be/')) embedUrl = `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`;
      else if (url.includes('facebook.com') || url.includes('fb.watch')) embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`;
      
      if (embedUrl) execCmd('insertHTML', `<iframe src="${embedUrl}" style="width: 100%; aspect-ratio: 16/9; border: none; border-radius: 0.5rem; margin: 1rem 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="true"></iframe><p><br></p>`);
      else toast.error("Đường dẫn video không hợp lệ. Vui lòng sử dụng link từ Youtube hoặc Facebook!");
    }
  };

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (storage) {
      const toastId = toast.loading('Đang tải tài liệu lên...');
      try {
        const fileRef = ref(storage, `documents/${Date.now()}_${file.name}`);
        
        // Cấp Content-Type chuẩn để trình duyệt tự động đọc (View) PDF thay vì tải về (Download)
        let mimeType = file.type || 'application/octet-stream';
        if (file.name.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';
        
        await uploadBytes(fileRef, file, { contentType: mimeType });
        const url = await getDownloadURL(fileRef);
        execCmd('insertHTML', `<a href="${url}" target="_blank" rel="noopener noreferrer">📎 ${file.name}</a>&nbsp;`);
        toast.success('Tải tài liệu thành công!', { id: toastId });
      } catch (error) {
        console.error("Lỗi upload tài liệu:", error);
        toast.error('Lỗi tải tài liệu lên!', { id: toastId });
      }
    } else {
      toast.error('Chưa kết nối CSDL!');
    }
    e.target.value = null; // Reset input sau khi upload
  };

  const handlePaste = (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
      const item = items[index];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (event) => execCmd('insertHTML', `<img src="${event.target.result}" style="display: inline-block; float: left; margin: 0.5rem 1.5rem 1rem 0;" />&nbsp;`);
        reader.readAsDataURL(item.getAsFile());
        return;
      }
    }
  };

  return (
    <div className="border border-pink-200 rounded-sm flex flex-col bg-white overflow-hidden shadow-sm">
      <div className="bg-pink-50 p-2 flex flex-wrap gap-1 border-b border-pink-200 items-center">
        <select onMouseDown={e => e.preventDefault()} onChange={(e) => execCmd('formatBlock', e.target.value)} className="text-xs p-1 border border-pink-200 rounded bg-white font-bold outline-none"><option value="P">Đoạn văn</option><option value="H3">Tiêu đề Lớn</option><option value="H4">Tiêu đề Nhỏ</option></select>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => execCmd('bold')} className="p-1.5 hover:bg-pink-200 rounded text-stone-700"><Bold size={14}/></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => execCmd('italic')} className="p-1.5 hover:bg-pink-200 rounded text-stone-700"><Italic size={14}/></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => execCmd('underline')} className="p-1.5 hover:bg-pink-200 rounded text-stone-700"><Underline size={14}/></button>
        <div className="w-px h-4 bg-pink-200 mx-1"></div>
        <input type="color" onInput={(e) => execCmd('foreColor', e.target.value)} className="w-6 h-6 p-0 bg-transparent border-0 cursor-pointer rounded hover:scale-110 transition-transform" title="Đổi màu chữ" />
        <input type="color" onInput={(e) => execCmd('backColor', e.target.value)} defaultValue="#ffff00" className="w-6 h-6 p-0 bg-transparent border-0 cursor-pointer rounded hover:scale-110 transition-transform" title="Tô màu nền (Highlight)" />
        <div className="w-px h-4 bg-pink-200 mx-1"></div>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={handleInsertLink} className="p-1.5 hover:bg-pink-200 rounded text-stone-700" title="Chèn liên kết (Link)"><LinkIcon size={14}/></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-pink-200 rounded text-stone-700" title="Đính kèm tài liệu (PDF, Word, Excel)"><Paperclip size={14}/></button>
        <div className="w-px h-4 bg-pink-200 mx-1"></div>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleAlign('left')} className="p-1.5 hover:bg-pink-200 rounded ml-2 text-stone-700"><AlignLeft size={14}/></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleAlign('center')} className="p-1.5 hover:bg-pink-200 rounded text-stone-700"><AlignCenter size={14}/></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleAlign('right')} className="p-1.5 hover:bg-pink-200 rounded text-stone-700"><AlignRight size={14}/></button>
        <div className="w-px h-4 bg-pink-200 mx-1"></div>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={handleInsertImage} className="p-1.5 hover:bg-pink-200 rounded text-stone-700"><ImageIcon size={14}/></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={handleInsertVideo} className="p-1.5 hover:bg-pink-200 rounded text-stone-700" title="Chèn Video YouTube/Facebook"><Video size={14}/></button>
      </div>
      <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar" ref={fileInputRef} onChange={handleAttachmentUpload} className="hidden" />
      <div ref={editorRef} contentEditable onInput={handleInput} onPaste={handlePaste} onClick={(e) => { if (e.target.tagName === 'IMG') { e.target.style.outline = '3px solid #ec4899'; setSelectedImg(e.target); } else { if (selectedImg) selectedImg.style.outline='none'; setSelectedImg(null); } }} className={`p-4 focus:outline-none overflow-y-auto ${editorContentClasses}`} style={{ minHeight }} />
      <PromptModal isOpen={promptConfig.isOpen} title={promptConfig.title} desc={promptConfig.desc} defaultValue={promptConfig.defaultValue} onCancel={() => { restoreSelection(); setPromptConfig({ ...promptConfig, isOpen: false }); }} onConfirm={onPromptConfirm} />
    </div>
  );
};

export const ImageAdjuster = ({ data, setData, aspectClass = "aspect-[21/9] w-full rounded-lg" }) => {
  if (!data?.image) return null;

  return (
    <div className="mt-4 p-5 bg-stone-50 border border-stone-200 rounded-xl shadow-inner">
      <h4 className="text-xs font-bold uppercase text-stone-500 tracking-widest mb-5 flex items-center gap-2">
        <ImageIcon size={14} /> Căn chỉnh hình ảnh
      </h4>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Box Preview */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <div className={`overflow-hidden border-2 border-pink-300 shadow-sm bg-stone-200 relative flex-shrink-0 ${aspectClass}`}>
             <img
               src={data.image}
               style={getImgStyle(data)}
               className="w-full h-full block max-w-none"
               alt="Preview"
             />
             {/* Grid overlay */}
             <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20 divide-x divide-y divide-black/20" style={{ borderRadius: 'inherit' }}>
               <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
             </div>
          </div>
        </div>
        
        {/* Controllers */}
        <div className="w-full md:w-1/2 space-y-5">
           <div className="flex items-center gap-4">
              <label className="text-[10px] font-bold uppercase text-stone-500 w-20">Thu / Phóng</label>
              <input type="range" min="0.5" max="3" step="0.05" value={data.imgScale || 1} onChange={e => setData({...data, imgScale: parseFloat(e.target.value)})} className="flex-1 accent-pink-600" />
           </div>
           <div className="flex items-center gap-4">
              <label className="text-[10px] font-bold uppercase text-stone-500 w-20">Trái / Phải</label>
              <input type="range" min="0" max="100" value={data.imgPosX ?? 50} onChange={e => setData({...data, imgPosX: parseFloat(e.target.value)})} className="flex-1 accent-pink-600" />
           </div>
           <div className="flex items-center gap-4">
              <label className="text-[10px] font-bold uppercase text-stone-500 w-20">Lên / Xuống</label>
              <input type="range" min="0" max="100" value={data.imgPosY ?? 50} onChange={e => setData({...data, imgPosY: parseFloat(e.target.value)})} className="flex-1 accent-pink-600" />
           </div>
           <div className="flex items-center gap-6 mt-2 pt-4 border-t border-stone-200">
             <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                <input type="radio" checked={(data.imgFit || 'cover') === 'cover'} onChange={() => setData({...data, imgFit: 'cover'})} className="accent-pink-600 w-4 h-4" /> Lấp đầy
             </label>
             <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                <input type="radio" checked={data.imgFit === 'contain'} onChange={() => setData({...data, imgFit: 'contain'})} className="accent-pink-600 w-4 h-4" /> Vừa vặn
             </label>
           </div>
        </div>
      </div>
    </div>
  );
};