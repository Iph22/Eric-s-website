// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Profile picture upload functionality
const profileImg = document.getElementById('profile-img');
const uploadOverlay = document.querySelector('.upload-overlay');

// Create hidden file input
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);


// Handle file selection
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            profileImg.src = e.target.result;
            profileImg.alt = "David Iphy Profile Picture";
        };
        reader.readAsDataURL(file);
    }
});

// Gallery image modal functionality
const galleryItems = document.querySelectorAll('.gallery-item');
const modal = createModal();

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const caption = item.querySelector('.gallery-caption');
        showModal(img.src, caption.querySelector('h4').textContent, caption.querySelector('p').textContent);
    });
});

function createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <img class="modal-image" src="" alt="">
            <div class="modal-caption">
                <h3 class="modal-title"></h3>
                <p class="modal-description"></p>
            </div>
        </div>
    `;

    // Add modal styles
    const modalStyles = `
        .modal-video {
            width: 100%;
            max-height: 70vh;
            object-fit: contain;
            border-radius: 15px;
            margin-bottom: 20px;
        }
        
        .video-modal .modal-content {
            max-width: 90vw;
            max-height: 90vh;
        }
        
        .modal {
            display: none;
            position: fixed;
            z-index: 2000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            animation: fadeIn 0.3s ease;
        }
        
        .modal-content {
            position: relative;
            margin: 5% auto;
            padding: 20px;
            width: 90%;
            max-width: 800px;
            background: white;
            border-radius: 20px;
            text-align: center;
        }
        
        .modal-close {
            position: absolute;
            top: 15px;
            right: 25px;
            color: #aaa;
            font-size: 35px;
            font-weight: bold;
            cursor: pointer;
            transition: color 0.3s ease;
        }
        
        .modal-close:hover {
            color: #4A90E2;
        }
        
        .modal-image {
            width: 100%;
            max-height: 500px;
            object-fit: contain;
            border-radius: 15px;
            margin-bottom: 20px;
        }
        
        .modal-title {
            font-size: 1.5rem;
            margin-bottom: 10px;
            color: #333;
        }
        
        .modal-description {
            color: #666;
            font-size: 1.1rem;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @media (max-width: 768px) {
            .modal-content {
                margin: 10% auto;
                width: 95%;
                padding: 15px;
            }
            
            .modal-title {
                font-size: 1.2rem;
            }
            
            .modal-description {
                font-size: 1rem;
            }
        }
    `;

    // Add styles to head
    const styleSheet = document.createElement('style');
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);

    document.body.appendChild(modal);

    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });

    return modal;
}

function showModal(imageSrc, title,) {
    const modalImage = modal.querySelector('.modal-image');
    const modalTitle = modal.querySelector('.modal-title');
    // const modalDescription = modal.querySelector('.modal-description');

    modalImage.src = imageSrc;
    modalImage.alt = title;
    modalTitle.textContent = title;
    // modalDescription.textContent = description;

    modal.style.display = 'block';
}

// Folder-based Media Gallery Management
class MediaGallery {
    constructor() {
        this.mediaFolders = {
            lifestyle: 'Lifestyle Media',
            trainingVideos: 'Training Videos',
            trainingPictures: 'Training Pictures'
        };
        this.supportedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        this.supportedVideoTypes = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv'];

        this.initializeGalleries();
        this.initializeTabSwitching();
    }

    async initializeGalleries() {
        // Load lifestyle media
        await this.loadFolderMedia('lifestyle', 'lifestyle-gallery');

        // Load training videos
        await this.loadFolderMedia('trainingVideos', 'training-videos-gallery');

        // Load training pictures
        await this.loadFolderMedia('trainingPictures', 'training-pictures-gallery');
    }

    async loadFolderMedia(folderKey, galleryId) {
        const gallery = document.getElementById(galleryId);
        const folderPath = this.mediaFolders[folderKey];

        if (!gallery) return;

        try {
            const files = await this.scanFolder(folderPath, folderKey);

            if (files.length === 0) {
                this.showEmptyState(gallery, folderKey);
                return;
            }

            // Clear placeholder
            const placeholder = gallery.querySelector('.gallery-placeholder');
            if (placeholder) {
                placeholder.remove();
            }

            // Create grid container
            const gridClass = this.getGridClass(folderKey);
            let gridContainer = gallery.querySelector(`.${gridClass}`);
            if (!gridContainer) {
                gridContainer = document.createElement('div');
                gridContainer.className = gridClass;
                gallery.appendChild(gridContainer);
            }

            // Add each file to gallery
            files.forEach((file, index) => {
                setTimeout(() => {
                    this.addMediaToGallery(file, gridContainer, folderKey);
                }, index * 100); // Stagger animations
            });

        } catch (error) {
            console.error(`Error loading ${folderPath}:`, error);
            this.showErrorState(gallery, folderKey);
        }
    }

    async scanFolder(folderPath, folderKey) {
        try {
            const response = await fetch('/media.json');
            const mediaData = await response.json();

            // Return the array for the matching key
            const files = mediaData[folderKey] || [];
            return files;
        } catch (error) {
            console.error(`Error loading media.json for ${folderKey}:`, error);
            return [];
        }
    }

    getGridClass(folderKey) {
        switch (folderKey) {
            case 'lifestyle': return 'media-grid';
            case 'trainingPictures': return 'gallery-grid';
            case 'trainingVideos': return 'video-grid';
            default: return 'media-grid';
        }
    }

    showEmptyState(gallery, folderKey) {
        const placeholder = gallery.querySelector('.gallery-placeholder');
        if (placeholder) {
            const icon = placeholder.querySelector('i');
            const text = placeholder.querySelector('p');

            const messages = {
                lifestyle: 'No lifestyle media found. Add photos and videos to the "Lifestyle Media" folder.',
                trainingVideos: 'No training videos found. Add video files to the "Training Videos" folder.',
                trainingPictures: 'No training pictures found. Add image files to the "Training Pictures" folder.'
            };

            text.textContent = messages[folderKey];
            icon.style.color = '#ccc';
        }
    }

    showErrorState(gallery, folderKey) {
        const placeholder = gallery.querySelector('.gallery-placeholder');
        if (placeholder) {
            const icon = placeholder.querySelector('i');
            const text = placeholder.querySelector('p');

            icon.className = 'fas fa-exclamation-triangle';
            icon.style.color = '#ff6b6b';
            text.textContent = `Error loading media from ${this.mediaFolders[folderKey]} folder.`;
        }
    }

    addMediaToGallery(fileData, gridContainer, storageKey) {
        const isVideo = this.isVideoFile(fileData.name);

        const mediaItem = document.createElement('div');
        mediaItem.className = storageKey === 'trainingPictures' ? 'gallery-item' : 'media-item';

        const mediaContent = document.createElement('div');
        mediaContent.className = storageKey === 'trainingPictures' ? 'gallery-image' : 'media-content';

        if (isVideo) {
            const video = document.createElement('video');
            video.src = fileData.path;
            video.controls = false;
            video.muted = true;
            video.preload = 'metadata';
            mediaContent.appendChild(video);

            // Add play overlay for videos
            const playOverlay = document.createElement('div');
            playOverlay.className = 'video-play-overlay';
            playOverlay.innerHTML = '<i class="fas fa-play"></i>';
            mediaContent.appendChild(playOverlay);

            // Video click handler
            mediaItem.addEventListener('click', () => {
                this.openVideoModal(fileData);
            });
        } else {
            const img = document.createElement('img');
            img.src = fileData.path;
            img.alt = fileData.name;
            img.loading = 'lazy';
            mediaContent.appendChild(img);

            // Image click handler
            mediaItem.addEventListener('click', () => {
                this.openImageModal(fileData);
            });
        }

        const overlay = document.createElement('div');
        overlay.className = storageKey === 'trainingPictures' ? 'gallery-overlay' : 'media-overlay';
        overlay.innerHTML = isVideo ? '<i class="fas fa-play"></i>' : '<i class="fas fa-search-plus"></i>';
        mediaContent.appendChild(overlay);

        const caption = document.createElement('div');
        caption.className = storageKey === 'trainingPictures' ? 'gallery-caption' : 'media-caption';
        caption.innerHTML = `
            <h4>${this.formatFileName(fileData.name)}</h4>
        `;

        mediaItem.appendChild(mediaContent);
        mediaItem.appendChild(caption);
        gridContainer.appendChild(mediaItem);

        // Add fade-in animation
        mediaItem.style.opacity = '0';
        mediaItem.style.transform = 'translateY(30px)';
        setTimeout(() => {
            mediaItem.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            mediaItem.style.opacity = '1';
            mediaItem.style.transform = 'translateY(0)';
        }, 100);
    }

    isVideoFile(filename) {
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return this.supportedVideoTypes.includes(ext);
    }

    isImageFile(filename) {
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return this.supportedImageTypes.includes(ext);
    }

    formatFileName(filename) {
        // Remove file extension and format for display
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
        return nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    openImageModal(fileData) {
        showModal(fileData.path, this.formatFileName(fileData.name));
    }

    openVideoModal(fileData) {
        // Create video modal
        const videoModal = document.createElement('div');
        videoModal.className = 'modal video-modal';
        videoModal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <video class="modal-video" controls autoplay>
                    <source src="${fileData.path}" type="${this.getVideoMimeType(fileData.name)}">
                    Your browser does not support the video tag.
                </video>
                <div class="modal-caption">
                    <h3 class="modal-title">${this.formatFileName(fileData.name)}</h3>
                </div>
            </div>
        `;

        document.body.appendChild(videoModal);
        videoModal.style.display = 'block';

        // Close functionality
        const closeBtn = videoModal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(videoModal);
        });

        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                document.body.removeChild(videoModal);
            }
        });

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(videoModal);
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    getVideoMimeType(filename) {
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        const mimeTypes = {
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.ogg': 'video/ogg',
            '.avi': 'video/avi',
            '.mov': 'video/quicktime',
            '.wmv': 'video/x-ms-wmv',
            '.flv': 'video/x-flv'
        };
        return mimeTypes[ext] || 'video/mp4';
    }

    initializeTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchTab(tabName, button);
            });
        });
    }

    switchTab(tabName, activeButton) {
        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to clicked button
        activeButton.classList.add('active');

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Show selected tab content
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    // Method to refresh galleries (useful for when new files are added to folders)
    async refreshGalleries() {
        await this.initializeGalleries();
    }

    // Method to refresh a specific gallery
    async refreshGallery(folderKey, galleryId) {
        const gallery = document.getElementById(galleryId);
        if (gallery) {
            // Clear existing content
            gallery.innerHTML = `
                <div class="gallery-placeholder">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Refreshing...</p>
                </div>
            `;

            await this.loadFolderMedia(folderKey, galleryId);
        }
    }
}

// Initialize media gallery when DOM is loaded
let mediaGallery;
document.addEventListener('DOMContentLoaded', () => {
    mediaGallery = new MediaGallery();
});

// Add refresh functionality for development
window.refreshMediaGalleries = () => {
    if (mediaGallery) {
        mediaGallery.refreshGalleries();
        console.log('Media galleries refreshed!');
    }
};

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.gallery-item, .timeline-item, .program-item, .schedule-item, .video-item, .social-link');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Social media link tracking (for analytics)
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const platform = link.classList[1]; // Gets the platform class (instagram, twitter, etc.)
        console.log(`Social media click: ${platform}`);

        // In a real implementation, you might send this to Google Analytics or other tracking service
        // gtag('event', 'social_click', { platform: platform });
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Add loaded class styles
    const loadedStyles = `
        body {
            opacity: 0;
            transition: opacity 0.5s ease;
        }
        
        body.loaded {
            opacity: 1;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = loadedStyles;
    document.head.appendChild(styleSheet);
});

// Add hover effects for better interactivity
document.querySelectorAll('.cta-button, .play-btn').forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px) scale(1.05)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0) scale(1)';
    });
});

// Add ripple effect to buttons
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
}

// Add ripple styles
const rippleStyles = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 600ms linear;
        background-color: rgba(255, 255, 255, 0.6);
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .cta-button, .play-btn, .social-link {
        position: relative;
        overflow: hidden;
    }
`;

const rippleStyleSheet = document.createElement('style');
rippleStyleSheet.textContent = rippleStyles;
document.head.appendChild(rippleStyleSheet);

// Apply ripple effect to interactive elements
document.querySelectorAll('.cta-button, .play-btn, .social-link').forEach(button => {
    button.addEventListener('click', createRipple);
});

// Console welcome message
console.log(`
🏀 Welcome to Eric Darko's Personal Website!
==========================================
Built with modern web technologies
- Responsive design
- Folder-based media management
- Interactive features
- Smooth animations
- Accessible navigation

To add media:
- Training Videos: Add video files to "Training Videos" folder
- Training Pictures: Add image files to "Training Pictures" folder  
- Lifestyle Media: Add photos/videos to "Lifestyle Media" folder

Run refreshMediaGalleries() in console to reload after adding files.

Follow Eric's basketball journey on social media!
`);

// Helper function to manually load files from folders (for development)
window.loadSampleMedia = () => {
    // This function can be used to test with sample files
    console.log('To add media files:');
    console.log('1. Place video files in "Training Videos" folder');
    console.log('2. Place image files in "Training Pictures" folder');
    console.log('3. Place photos/videos in "Lifestyle Media" folder');
    console.log('4. Run refreshMediaGalleries() to reload');
};
