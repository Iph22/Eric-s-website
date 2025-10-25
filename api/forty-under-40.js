import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const folderPath = path.join(process.cwd(), '40 Under 40');
    
    if (!fs.existsSync(folderPath)) {
      return res.status(200).json({ success: true, files: [] });
    }

    const files = fs.readdirSync(folderPath);
    const mediaFiles = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm', '.mov'].includes(ext);
      })
      .map(file => {
        const ext = path.extname(file).toLowerCase();
        const isVideo = ['.mp4', '.webm', '.mov', '.avi'].includes(ext);
        
        return {
          name: file,
          path: `/40 Under 40/${file}`,
          isVideo: isVideo,
          isImage: !isVideo
        };
      });

    res.status(200).json({ success: true, files: mediaFiles });
  } catch (error) {
    console.error('Error reading forty-under-40 folder:', error);
    res.status(200).json({ success: true, files: [] });
  }
}