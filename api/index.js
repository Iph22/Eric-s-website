import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const app = express();

// Supported file types
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv'];

// Helper function to get file info
async function getFileInfo(filePath, fileName) {
    try {
        const stats = await fs.stat(filePath);
        return {
            name: fileName,
            path: '/' + path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
            size: stats.size,
            modified: stats.mtime,
            isVideo: VIDEO_EXTENSIONS.includes(path.extname(fileName).toLowerCase()),
            isImage: IMAGE_EXTENSIONS.includes(path.extname(fileName).toLowerCase())
        };
    } catch (error) {
        console.error(`Error getting file info for ${filePath}:`, error);
        return null;
    }
}

// Helper function to scan a directory
async function scanDirectory(dirPath) {
    try {
        const files = await fs.readdir(dirPath);
        const fileInfoPromises = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return IMAGE_EXTENSIONS.includes(ext) || VIDEO_EXTENSIONS.includes(ext);
            })
            .map(file => getFileInfo(path.join(dirPath, file), file));

        const fileInfos = await Promise.all(fileInfoPromises);
        return fileInfos.filter(info => info !== null);
    } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error);
        return [];
    }
}

// API endpoint to get lifestyle media
app.get('/api/lifestyle', async (req, res) => {
    try {
        const lifestyleDir = path.join(process.cwd(), 'Lifestyle Media');
        const files = await scanDirectory(lifestyleDir);
        res.json({ success: true, files });
    } catch (error) {
        console.error('Error getting lifestyle media:', error);
        res.status(500).json({ success: false, error: 'Failed to load lifestyle media' });
    }
});

// API endpoint to get training videos
app.get('/api/training-videos', async (req, res) => {
    try {
        const videosDir = path.join(process.cwd(), 'Training Videos');
        const files = await scanDirectory(videosDir);
        const videoFiles = files.filter(file => file.isVideo);
        res.json({ success: true, files: videoFiles });
    } catch (error) {
        console.error('Error getting training videos:', error);
        res.status(500).json({ success: false, error: 'Failed to load training videos' });
    }
});

// API endpoint to get training pictures
app.get('/api/training-pictures', async (req, res) => {
    try {
        const picturesDir = path.join(process.cwd(), 'Training Pictures');
        const files = await scanDirectory(picturesDir);
        const imageFiles = files.filter(file => file.isImage);
        res.json({ success: true, files: imageFiles });
    } catch (error) {
        console.error('Error getting training pictures:', error);
        res.status(500).json({ success: false, error: 'Failed to load training pictures' });
    }
});

// API endpoint to get 40 Under 40 Award media
app.get('/api/forty-under-40', async (req, res) => {
    try {
        const fortyUnder40Dir = path.join(process.cwd(), '40 Under 40');
        const files = await scanDirectory(fortyUnder40Dir);
        const sortedFiles = files.sort((a, b) => {
            if (a.isImage && !b.isImage) return -1;
            if (!a.isImage && b.isImage) return 1;
            return a.name.localeCompare(b.name);
        });
        res.json({ success: true, files: sortedFiles });
    } catch (error) {
        console.error('Error getting 40 Under 40 media:', error);
        res.status(500).json({ success: false, error: 'Failed to load 40 Under 40 media' });
    }
});

// API endpoint to refresh all media
app.get('/api/refresh', async (req, res) => {
    try {
        const [lifestyle, videos, pictures, fortyUnder40] = await Promise.all([
            scanDirectory(path.join(process.cwd(), 'Lifestyle Media')),
            scanDirectory(path.join(process.cwd(), 'Training Videos')),
            scanDirectory(path.join(process.cwd(), 'Training Pictures')),
            scanDirectory(path.join(process.cwd(), '40 Under 40'))
        ]);

        res.json({
            success: true,
            data: {
                lifestyle: lifestyle,
                trainingVideos: videos.filter(file => file.isVideo),
                trainingPictures: pictures.filter(file => file.isImage),
                fortyUnder40: fortyUnder40
            }
        });
    } catch (error) {
        console.error('Error refreshing media:', error);
        res.status(500).json({ success: false, error: 'Failed to refresh media' });
    }
});

export default app;