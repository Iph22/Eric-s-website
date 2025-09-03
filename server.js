const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Supported file types
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv'];

// Helper function to get file stats
async function getFileInfo(filePath, fileName) {
    try {
        const stats = await fs.stat(filePath);
        return {
            name: fileName,
            path: filePath.replace(__dirname, '').replace(/\\/g, '/'),
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
        const lifestyleDir = path.join(__dirname, 'Lifestyle Media');
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
        const videosDir = path.join(__dirname, 'Training Videos');
        const files = await scanDirectory(videosDir);
        // Filter only video files
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
        const picturesDir = path.join(__dirname, 'Training Pictures');
        const files = await scanDirectory(picturesDir);
        // Filter only image files
        const imageFiles = files.filter(file => file.isImage);
        res.json({ success: true, files: imageFiles });
    } catch (error) {
        console.error('Error getting training pictures:', error);
        res.status(500).json({ success: false, error: 'Failed to load training pictures' });
    }
});

// API endpoint to refresh all media (useful for development)
app.get('/api/refresh', async (req, res) => {
    try {
        const [lifestyle, videos, pictures] = await Promise.all([
            scanDirectory(path.join(__dirname, 'Lifestyle Media')),
            scanDirectory(path.join(__dirname, 'Training Videos')),
            scanDirectory(path.join(__dirname, 'Training Pictures'))
        ]);
        
        res.json({
            success: true,
            data: {
                lifestyle: lifestyle,
                trainingVideos: videos.filter(file => file.isVideo),
                trainingPictures: pictures.filter(file => file.isImage)
            }
        });
    } catch (error) {
        console.error('Error refreshing media:', error);
        res.status(500).json({ success: false, error: 'Failed to refresh media' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🏀 Coach Eric's Website Server running at http://localhost:${PORT}`);
    console.log('📁 Media folders:');
    console.log('   - Lifestyle Media/');
    console.log('   - Training Videos/');
    console.log('   - Training Pictures/');
    console.log('');
    console.log('💡 To add media files:');
    console.log('   1. Add files to the respective folders');
    console.log('   2. Refresh the website to see new files');
    console.log('   3. Or visit http://localhost:3000/api/refresh to reload');
});
