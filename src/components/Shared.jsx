import React, { useState, useEffect, useRef } from 'react';
import { Church, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon } from 'lucide-react';
import { getImgStyle } from '../utils/helpers';

export const FacebookIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

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

export const editorContentClasses = "font-serif text-stone-700 text-sm md:text-base leading-relaxed text-justify flow-root [&_img]:max-w-[90%] md:[&_img]:max-w-[45%] [&_img]:h-auto [&_img]:rounded-md [&_img]:shadow-sm [&_p]:mb-4 [&_h3]:text-xl md:[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-pink-900 [&_h3]:mt-6 [&_h3]:mb-3 [&_h4]:text-lg md:[&_h4]:text-xl [&_h4]:font-bold [&_h4]:text-pink-700 [&_h4]:mt-5 [&_h4]:mb-2 [&_blockquote]:border-l-3 [&_blockquote]:border-pink-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-stone-500 [&_blockquote]:my-4";

export const RichTextEditor = ({ value, onChange, minHeight = "150px" }) => {
  const editorRef = useRef(null);
  const [selectedImg, setSelectedImg] = useState(null);

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

  const handleInsertImage = (e) => {
    e.preventDefault();
    const url = prompt('Nhập đường dẫn (URL) của hình ảnh:');
    if (url) execCmd('insertHTML', `<img src="${url}" style="display: inline-block; float: left; margin: 0.5rem 1.5rem 1rem 0;" />&nbsp;`);
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
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleAlign('left')} className="p-1.5 hover:bg-pink-200 rounded ml-2 text-stone-700"><AlignLeft size={14}/></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleAlign('center')} className="p-1.5 hover:bg-pink-200 rounded text-stone-700"><AlignCenter size={14}/></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleAlign('right')} className="p-1.5 hover:bg-pink-200 rounded text-stone-700"><AlignRight size={14}/></button>
        <div className="w-px h-4 bg-pink-200 mx-1"></div>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={handleInsertImage} className="p-1.5 hover:bg-pink-200 rounded text-stone-700"><ImageIcon size={14}/></button>
      </div>
      <div ref={editorRef} contentEditable onInput={handleInput} onPaste={handlePaste} onClick={(e) => { if (e.target.tagName === 'IMG') { e.target.style.outline = '3px solid #ec4899'; setSelectedImg(e.target); } else { if (selectedImg) selectedImg.style.outline='none'; setSelectedImg(null); } }} className={`p-4 focus:outline-none overflow-y-auto ${editorContentClasses}`} style={{ minHeight }} />
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