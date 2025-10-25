import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const folderPath = path.join(process.cwd(), 'Training Pictures');
    
    if (!fs.existsSync(folderPath)) {
      return res.status(200).json({ success: true, files: [] });
    }

    const files = fs.readdirSync(folderPath);
    const imageFiles = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext);
      })
      .map(file => ({
        name: file,
        path: `/Training Pictures/${file}`,
        isVideo: false,
        isImage: true
      }));

    res.status(200).json({ success: true, files: imageFiles });
  } catch (error) {
    console.error('Error reading training pictures folder:', error);
    res.status(200).json({ success: true, files: [] });
  }
}