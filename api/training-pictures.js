const fs = require('fs').promises;
const path = require('path');

// Supported file extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];

/**
 * Get file information with metadata
 * @param {string} filePath - Full path to the file
 * @param {string} fileName - Name of the file
 * @returns {Object|null} File info object or null if error
 */
async function getFileInfo(filePath, fileName) {
    try {
        const stats = await fs.stat(filePath);
        const ext = path.extname(fileName).toLowerCase();
        
        return {
            name: fileName,
            path: `/Training Pictures/${fileName}`,
            size: stats.size,
            modified: stats.mtime,
            isVideo: false,
            isImage: IMAGE_EXTENSIONS.includes(ext)
        };
    } catch (error) {
        console.error(`Error getting file info for ${filePath}:`, error);
        return null;
    }
}

/**
 * Scan directory for image files only
 * @param {string} dirPath - Directory path to scan
 * @returns {Array} Array of image file info objects
 */
async function scanDirectory(dirPath) {
    try {
        const files = await fs.readdir(dirPath);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return IMAGE_EXTENSIONS.includes(ext);
        });

        const fileInfoPromises = imageFiles.map(file => 
            getFileInfo(path.join(dirPath, file), file)
        );

        const fileInfos = await Promise.all(fileInfoPromises);
        return fileInfos.filter(info => info !== null);
    } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error);
        return [];
    }
}

/**
 * Vercel API handler for training pictures
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
module.exports = async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    try {
        // Get the project root directory
        const projectRoot = process.cwd();
        const picturesDir = path.join(projectRoot, 'Training Pictures');
        
        // Scan for image files only
        const files = await scanDirectory(picturesDir);
        
        // Return successful response
        res.status(200).json({ 
            success: true, 
            files,
            count: files.length 
        });
        
    } catch (error) {
        console.error('Error in training-pictures API:', error);
        
        // Return error response
        res.status(500).json({ 
            success: false, 
            error: 'Failed to load training pictures',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
