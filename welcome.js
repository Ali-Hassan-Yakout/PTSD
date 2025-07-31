// welcome.js - Enhanced welcome video functionality

document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById('welcomeVideo');
    const skipBtn = document.getElementById('skipBtn');
    const soundBtn = document.getElementById('soundBtn');
    const soundIcon = document.getElementById('soundIcon');
    const soundText = document.getElementById('soundText');
    const progressFill = document.getElementById('progressFill');
    const loadingScreen = document.getElementById('loadingScreen');

    let isMuted = true;
    let progressInterval;

    // Initialize video functionality
    function initializeVideo() {
        // Hide loading screen when video is ready
        video.addEventListener('loadeddata', () => {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 1000);
        });

        // Handle video errors
        video.addEventListener('error', (e) => {
            console.error('Video error:', e);
            showError('حدث خطأ في تحميل الفيديو. سيتم توجيهك للصفحة التالية.');
            setTimeout(() => {
                goToQuestions();
            }, 3000);
        });

        // Update progress bar
        video.addEventListener('timeupdate', () => {
            if (video.duration) {
                const progress = (video.currentTime / video.duration) * 100;
                progressFill.style.width = progress + '%';
            }
        });

        // Auto-redirect when video ends
        video.addEventListener('ended', () => {
            goToQuestions();
        });

        // Handle video loading
        video.addEventListener('loadstart', () => {
            console.log('Video loading started');
        });

        video.addEventListener('canplay', () => {
            console.log('Video can start playing');
        });
    }

    // Toggle sound function
    window.toggleSound = function() {
        if (isMuted) {
            video.muted = false;
            isMuted = false;
            soundIcon.className = 'fas fa-volume-up';
            soundText.textContent = 'إيقاف الصوت';
        } else {
            video.muted = true;
            isMuted = true;
            soundIcon.className = 'fas fa-volume-mute';
            soundText.textContent = 'تشغيل الصوت';
        }
    };

    // Skip to questions function
    window.goToQuestions = function() {
        // Clear progress interval
        if (progressInterval) {
            clearInterval(progressInterval);
        }

        // Show loading state
        skipBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التوجيه...';
        skipBtn.disabled = true;

        // Redirect to questionnaire
        setTimeout(() => {
            window.location.href = 'questionnaire.html';
        }, 1000);
    };

    // Show error function
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(220, 53, 69, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 600;
            backdrop-filter: blur(10px);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case ' ':
                e.preventDefault();
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
                break;
            case 'm':
            case 'M':
                toggleSound();
                break;
            case 'Escape':
                goToQuestions();
                break;
        }
    });

    // Touch gestures for mobile
    let touchStartTime = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
        const touchEndTime = Date.now();
        const touchEndY = e.changedTouches[0].clientY;
        const touchDuration = touchEndTime - touchStartTime;
        const touchDistance = Math.abs(touchEndY - touchStartY);

        // Double tap to skip
        if (touchDuration < 300 && touchDistance < 50) {
            goToQuestions();
        }
    });

    // Initialize video
    initializeVideo();

    // Fallback: if video doesn't load within 10 seconds, redirect
    setTimeout(() => {
        if (video.readyState === 0) {
            console.log('Video failed to load, redirecting...');
            goToQuestions();
        }
    }, 10000);
});
