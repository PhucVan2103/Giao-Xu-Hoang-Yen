export default function handler(req, res) {
  const isCss = req.url.includes('.css');
  
  // Tắt cache hoàn toàn cho file báo lỗi này
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (isCss) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.status(200).send(`/* Missing CSS chunk */`);
    return;
  }
  
  // Nếu là JS, trả về script ép trình duyệt xóa cache và tải lại trang bản mới nhất
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.status(200).send(`
    if (!window.sessionStorage.getItem('vite-chunk-reloaded')) {
      window.sessionStorage.setItem('vite-chunk-reloaded', 'true');
      var url = new URL(window.location.href);
      url.searchParams.set('v', Date.now().toString());
      window.location.replace(url.toString());
    } else { console.error("Chunk missing after reload. Please clear browser cache."); }
  `);
}