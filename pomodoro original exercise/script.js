class PomodoroTimer {
    constructor() {
        this.focusTime = 25 * 60; // 25 minutes in seconds
        this.shortBreak = 5 * 60; // 5 minutes in seconds
        this.longBreak = 15 * 60; // 15 minutes in seconds
        this.currentTime = this.focusTime;
        this.isRunning = false;
        this.isBreakTime = false;
        this.sessionsCompleted = 0;
        this.points = parseInt(localStorage.getItem('pomodoroPoints') || '120');
        this.interval = null;
        this.soundEnabled = JSON.parse(localStorage.getItem('soundEnabled') || 'true');

        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.updateDisplay();
        this.updatePoints();
    }

    initializeElements() {
        this.timerText = document.getElementById('timer-text');
        this.startButton = document.getElementById('start-button');
        this.settingsLink = document.getElementById('settings-link');
        this.settingsModal = document.getElementById('settings-modal');
        this.modalClose = document.getElementById('modal-close');
        this.saveSettings = document.getElementById('save-settings');
        this.progressCircle = document.getElementById('progress-circle');
        this.progressDot = document.getElementById('progress-dot');
        this.pointsValue = document.getElementById('points');
        this.app = document.querySelector('.app');

        // Coming Soon Modal
        this.comingSoonModal = document.getElementById('coming-soon-modal');
        this.comingSoonClose = document.getElementById('coming-soon-close');
        this.comingSoonMessage = document.getElementById('coming-soon-message');

        // Settings inputs
        this.focusTimeInput = document.getElementById('focus-time');
        this.shortBreakInput = document.getElementById('short-break');
        this.longBreakInput = document.getElementById('long-break');
        this.soundEnabledInput = document.getElementById('sound-enabled');

        // Navigation items
        this.navItems = document.querySelectorAll('.nav-item');
    }

    bindEvents() {
        this.startButton.addEventListener('click', () => this.toggleTimer());
        this.settingsLink.addEventListener('click', () => this.openSettings());
        this.modalClose.addEventListener('click', () => this.closeSettings());
        this.saveSettings.addEventListener('click', () => this.handleSaveSettings());
        
        // Coming Soon Modal
        this.comingSoonClose.addEventListener('click', () => this.closeComingSoon());
        
        // Close modal when clicking outside
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        // Close Coming Soon modal when clicking outside
        this.comingSoonModal.addEventListener('click', (e) => {
            if (e.target === this.comingSoonModal) {
                this.closeComingSoon();
            }
        });

        // Navigation
        this.navItems.forEach(item => {
            item.addEventListener('click', () => this.handleNavigation(item));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.settingsModal.classList.contains('active') && !this.comingSoonModal.classList.contains('active')) {
                e.preventDefault();
                this.toggleTimer();
            }
            if (e.code === 'Escape') {
                if (this.settingsModal.classList.contains('active')) {
                    this.closeSettings();
                }
                if (this.comingSoonModal.classList.contains('active')) {
                    this.closeComingSoon();
                }
            }
        });
    }

    loadSettings() {
        const savedFocusTime = localStorage.getItem('focusTime');
        const savedShortBreak = localStorage.getItem('shortBreak');
        const savedLongBreak = localStorage.getItem('longBreak');
        const savedSoundEnabled = localStorage.getItem('soundEnabled');

        if (savedFocusTime) {
            this.focusTime = parseInt(savedFocusTime) * 60;
            this.focusTimeInput.value = parseInt(savedFocusTime);
        }
        if (savedShortBreak) {
            this.shortBreak = parseInt(savedShortBreak) * 60;
            this.shortBreakInput.value = parseInt(savedShortBreak);
        }
        if (savedLongBreak) {
            this.longBreak = parseInt(savedLongBreak) * 60;
            this.longBreakInput.value = parseInt(savedLongBreak);
        }
        if (savedSoundEnabled !== null) {
            this.soundEnabled = JSON.parse(savedSoundEnabled);
            this.soundEnabledInput.checked = this.soundEnabled;
        }

        if (!this.isRunning) {
            this.currentTime = this.focusTime;
        }
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.isRunning = true;
        this.startButton.textContent = 'Pause';
        this.app.classList.add('timer-running');
        
        this.interval = setInterval(() => {
            this.currentTime--;
            this.updateDisplay();
            this.updateProgress();
            
            if (this.currentTime <= 0) {
                this.completeSession();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        this.startButton.textContent = 'Start';
        this.app.classList.remove('timer-running');
        
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    completeSession() {
        this.pauseTimer();
        this.playNotificationSound();
        
        if (!this.isBreakTime) {
            // Focus session completed
            this.sessionsCompleted++;
            this.addPoints(25);
            
            if (this.sessionsCompleted % 4 === 0) {
                // Long break after 4 sessions
                this.currentTime = this.longBreak;
                this.showNotification('Great work! Time for a long break! 🎉');
            } else {
                // Short break
                this.currentTime = this.shortBreak;
                this.showNotification('Well done! Time for a short break! ☕');
            }
            this.isBreakTime = true;
        } else {
            // Break completed
            this.currentTime = this.focusTime;
            this.isBreakTime = false;
            this.showNotification('Break over! Ready to focus? 🍅');
        }
        
        this.updateDisplay();
        this.updateProgress();
        this.startButton.textContent = 'Start';
    }

    addPoints(amount) {
        this.points += amount;
        this.updatePoints();
        localStorage.setItem('pomodoroPoints', this.points.toString());
    }

    updatePoints() {
        this.pointsValue.textContent = this.points;
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateProgress() {
        const totalTime = this.isBreakTime ? 
            (this.sessionsCompleted % 4 === 0 ? this.longBreak : this.shortBreak) : 
            this.focusTime;
        
        const progress = (totalTime - this.currentTime) / totalTime;
        const circumference = 2 * Math.PI * 120; // radius = 120
        const offset = circumference - (progress * circumference);
        
        this.progressCircle.style.strokeDashoffset = offset;
        
        // Update progress dot position
        const angle = progress * 360;
        this.progressDot.style.transform = `rotate(${angle}deg)`;
    }

    openSettings() {
        this.settingsModal.classList.add('active');
        this.focusTimeInput.value = this.focusTime / 60;
        this.shortBreakInput.value = this.shortBreak / 60;
        this.longBreakInput.value = this.longBreak / 60;
        this.soundEnabledInput.checked = this.soundEnabled;
    }

    closeSettings() {
        this.settingsModal.classList.remove('active');
    }

    openComingSoon(featureName) {
        const messages = {
            timeline: "📅 Timeline view is coming soon! Track your daily productivity sessions and see your focus patterns over time.",
            garden: "🌱 Your tomato garden is growing! Soon you'll be able to plant and nurture virtual tomatoes with each completed session.",
            blacklist: "🚫 Distraction blocker is in development! Block websites and apps during your focus sessions for ultimate productivity.",
            usage: "📊 Usage statistics are on the way! Get detailed insights into your productivity habits and session patterns."
        };
        
        this.comingSoonMessage.textContent = messages[featureName] || "This amazing feature is being prepared with love! 🍅";
        this.comingSoonModal.classList.add('active');
    }

    closeComingSoon() {
        this.comingSoonModal.classList.remove('active');
    }

    handleSaveSettings() {
        const newFocusTime = parseInt(this.focusTimeInput.value) * 60;
        const newShortBreak = parseInt(this.shortBreakInput.value) * 60;
        const newLongBreak = parseInt(this.longBreakInput.value) * 60;
        const newSoundEnabled = this.soundEnabledInput.checked;

        // Validate inputs
        if (newFocusTime < 60 || newFocusTime > 3600) {
            alert('Focus time must be between 1 and 60 minutes');
            return;
        }
        if (newShortBreak < 60 || newShortBreak > 1800) {
            alert('Short break must be between 1 and 30 minutes');
            return;
        }
        if (newLongBreak < 60 || newLongBreak > 3600) {
            alert('Long break must be between 1 and 60 minutes');
            return;
        }

        this.focusTime = newFocusTime;
        this.shortBreak = newShortBreak;
        this.longBreak = newLongBreak;
        this.soundEnabled = newSoundEnabled;

        // Save to localStorage
        localStorage.setItem('focusTime', (this.focusTime / 60).toString());
        localStorage.setItem('shortBreak', (this.shortBreak / 60).toString());
        localStorage.setItem('longBreak', (this.longBreak / 60).toString());
        localStorage.setItem('soundEnabled', JSON.stringify(this.soundEnabled));

        // Reset current time if not running
        if (!this.isRunning && !this.isBreakTime) {
            this.currentTime = this.focusTime;
            this.updateDisplay();
            this.updateProgress();
        }

        this.closeSettings();
        this.showNotification('Settings saved successfully! ✅');
    }

    handleNavigation(item) {
        // Remove active class from all items
        this.navItems.forEach(nav => nav.classList.remove('active'));
        
        // Add active class to clicked item
        item.classList.add('active');
        
        const navType = item.dataset.nav;
        
        // Show Coming Soon modal for unimplemented features
        if (navType !== 'timer') {
            // Reset timer tab as active since other features aren't implemented
            setTimeout(() => {
                this.navItems.forEach(nav => nav.classList.remove('active'));
                document.querySelector('[data-nav="timer"]').classList.add('active');
            }, 100);
            
            this.openComingSoon(navType);
        }
    }

    playNotificationSound() {
        if (!this.soundEnabled) return;
        
        try {
            // Create a simple beep using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }

    showNotification(message) {
        // Check if browser supports notifications
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('🍅 Pomodoro Timer', {
                    body: message,
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23FF6B47"/></svg>'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('🍅 Pomodoro Timer', {
                            body: message,
                            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23FF6B47"/></svg>'
                        });
                    }
                });
            }
        }
        
        // Also show in console for debugging
        console.log('Pomodoro:', message);
    }

    // Animate tomato when timer is running
    animateTomato() {
        if (this.isRunning) {
            const tomato = document.querySelector('.tomato-character');
            tomato.style.transform = 'translateY(-5px)';
            setTimeout(() => {
                tomato.style.transform = 'translateY(0)';
            }, 200);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
    
    // Request notification permission on first load
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Prevent phone from sleeping during timer (if supported)
    if ('wakeLock' in navigator) {
        let wakeLock = null;
        
        const requestWakeLock = async () => {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
            } catch (err) {
                console.log('Wake lock failed:', err);
            }
        };
        
        // Request wake lock when timer starts
        timer.startButton.addEventListener('click', () => {
            if (timer.isRunning) {
                requestWakeLock();
            } else if (wakeLock) {
                wakeLock.release();
                wakeLock = null;
            }
        });
    }
}); 