import { S3Client, ListObjectsV2Command, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req, res) {
  // Thiết lập các giá trị này trong mục Environment Variables của Vercel/Hosting
  const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'eef3fc90fcbf9d39a64a021475959f36';
  const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
  const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
  const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'giaoxuhoangyen-media';
  const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://media.giaoxuhoangyen.com';

  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    return res.status(500).json({ error: 'Thiếu cấu hình R2 Secret Key ở Server' });
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  });

  const { action } = req.query;

  try {
    // 1. Tạo Pre-signed URL cho Frontend upload
    if (action === 'presign') {
      const { key, contentType, size } = req.query;
      
      // Giới hạn kích thước file tải lên (Ví dụ: 5MB = 5 * 1024 * 1024 bytes)
      const MAX_SIZE_BYTES = 5 * 1024 * 1024;
      const fileSize = parseInt(size || '0', 10);
      
      if (fileSize > MAX_SIZE_BYTES) {
        return res.status(400).json({ error: 'Kích thước file quá lớn. Vui lòng chọn file dưới 5MB.' });
      }

      const command = new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, ContentType: contentType });
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      return res.status(200).json({ uploadUrl, publicUrl: `${R2_PUBLIC_URL}/${key}` });
    }
    
    // 2. Liệt kê file (Cho thư viện media)
    if (action === 'list') {
      const { prefix } = req.query;
      const command = new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME, Prefix: prefix });
      const data = await s3.send(command);
      const files = (data.Contents || []).map(item => ({ name: item.Key.split('/').pop(), fullPath: item.Key, url: `${R2_PUBLIC_URL}/${item.Key}`, size: item.Size, timeCreated: item.LastModified })).filter(item => item.name !== '');
      return res.status(200).json({ files });
    }

    // 3. Xóa file
    if (action === 'delete') {
      const { key } = req.query;
      const command = new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
      await s3.send(command);
      return res.status(200).json({ success: true });
    }

    res.status(400).json({ error: 'Hành động không hợp lệ' });
  } catch (error) { res.status(500).json({ error: error.message }); }
}