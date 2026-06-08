export default async function handler(req, res) {
  const { id } = req.query;
  const actualId = id ? id.split('-').pop() : '';
  const url = `https://${req.headers.host}/tin-tuc/${id}`;
  
  try {
    // Gọi trực tiếp API công khai của Firebase Firestore để lấy bài viết
    const projectId = 'giao-xu-hoang-yen';
    const appId = 'giao-xu-hoang-yen-app'; // App ID của bạn thiết lập ở firebase.js
    const fireapiUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/artifacts/${appId}/public/data/news/${actualId}`;
    
    const response = await fetch(fireapiUrl);
    const data = await response.json();

    if (data && data.fields) {
      const title = data.fields.title?.stringValue || 'Tin Tức Giáo Xứ';
      const image = data.fields.image?.stringValue || 'https://giao-xu-hoang-yen.vercel.app/logo.svg';
      let desc = data.fields.desc?.stringValue || '';
      
      // Lược bỏ các thẻ HTML để lấy chữ thô gọn gàng cho mô tả
      desc = desc.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';

      const html = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta property="og:title" content="${title}">
          <meta property="og:description" content="${desc}">
          <meta property="og:image" content="${image}">
          <meta property="og:url" content="${url}">
          <meta property="og:type" content="article">
          <meta name="twitter:card" content="summary_large_image">
          <title>${title}</title>
        </head>
        <body></body>
        </html>
      `;
      // Trả về giao diện chứa thẻ Meta cho Facebook đọc
      return res.setHeader('Content-Type', 'text/html; charset=utf-8').status(200).send(html);
    }
  } catch (e) {
    console.error("Lỗi khi tạo thẻ OG:", e);
  }

  // Mặc định nếu lỗi
  return res.redirect(307, url);
}