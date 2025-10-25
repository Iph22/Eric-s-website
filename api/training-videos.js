import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const folderPath = path.join(process.cwd(), 'Training Videos');
    
    if (!fs.existsSync(folderPath)) {
      return res.status(200).json({ success: true, files: [] });
    }

    const files = fs.readdirSync(folderPath);
    const videoFiles = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.mp4', '.webm', '.mov', '.avi', '.ogg'].includes(ext);
      })
      .map(file => ({
        name: file,
        path: `/Training Videos/${file}`,
        isVideo: true,
        isImage: false
      }));

    res.status(200).json({ success: true, files: videoFiles });
  } catch (error) {
    console.error('Error reading training videos folder:', error);
    res.status(200).json({ success: true, files: [] });
  }
}