class PomodoroTimer {
    constructor() {
        // Timer state
        this.isRunning = false;
        this.isPaused = false;
        this.currentMode = 'pomodoro'; // 'pomodoro', 'short-break', 'long-break'
        this.timeLeft = 0;
        this.totalTime = 0;
        this.sessionCount = 0;
        this.interval = null;

        // Settings
        this.settings = {
            pomodoro: 25,
            shortBreak: 5,
            longBreak: 15,
            font: 'kumbh',
            color: 'coral'
        };

        // DOM elements
        this.timerText = document.getElementById('timer-text');
        this.timerBtn = document.getElementById('timer-btn');
        this.progressCircle = document.getElementById('progress-circle');
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.modal = document.getElementById('settings-modal');
        this.modalClose = document.getElementById('modal-close');
        this.applyBtn = document.getElementById('apply-btn');

        // Settings inputs
        this.pomodoroTimeInput = document.getElementById('pomodoro-time');
        this.shortBreakTimeInput = document.getElementById('short-break-time');
        this.longBreakTimeInput = document.getElementById('long-break-time');
        this.fontBtns = document.querySelectorAll('.font-btn');
        this.colorBtns = document.querySelectorAll('.color-btn');
        this.arrowBtns = document.querySelectorAll('.arrow-btn');

        this.init();
    }

    init() {
        this.loadSettings();
        this.applyTheme();
        this.resetTimer();
        this.bindEvents();
        this.updateSettingsInputs();
    }

    bindEvents() {
        // Timer button
        this.timerBtn.addEventListener('click', () => this.toggleTimer());

        // Tab buttons
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
        });

        // Settings modal
        this.settingsBtn.addEventListener('click', () => this.openModal());
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.applyBtn.addEventListener('click', () => this.applySettings());

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Font selection
        this.fontBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectFont(e.target.dataset.font));
        });

        // Color selection
        this.colorBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectColor(e.target.dataset.color));
        });

        // Arrow buttons for time inputs
        this.arrowBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleArrowClick(e));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.modal.classList.contains('active')) {
                e.preventDefault();
                this.toggleTimer();
            }
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }

        const savedSessionCount = localStorage.getItem('pomodoroSessionCount');
        if (savedSessionCount) {
            this.sessionCount = parseInt(savedSessionCount);
        }
    }

    saveSettings() {
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
    }

    updateSettingsInputs() {
        this.pomodoroTimeInput.value = this.settings.pomodoro;
        this.shortBreakTimeInput.value = this.settings.shortBreak;
        this.longBreakTimeInput.value = this.settings.longBreak;

        // Update font selection
        this.fontBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.font === this.settings.font);
        });

        // Update color selection
        this.colorBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === this.settings.color);
        });
    }

    applyTheme() {
        // Apply font
        document.body.className = document.body.className.replace(/\b\w+-font\b/g, '');
        document.body.classList.add(`${this.settings.font}-font`);

        // Apply color theme
        document.body.className = document.body.className.replace(/\b\w+-theme\b/g, '');
        document.body.classList.add(`${this.settings.color}-theme`);
    }

    switchMode(mode) {
        if (this.isRunning) return; // Don't switch modes while timer is running

        this.currentMode = mode;
        
        // Update tab buttons
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        this.resetTimer();
    }

    resetTimer() {
        this.isRunning = false;
        this.isPaused = false;
        
        // Set time based on current mode
        switch (this.currentMode) {
            case 'pomodoro':
                this.timeLeft = this.settings.pomodoro * 60;
                break;
            case 'short-break':
                this.timeLeft = this.settings.shortBreak * 60;
                break;
            case 'long-break':
                this.timeLeft = this.settings.longBreak * 60;
                break;
        }
        
        this.totalTime = this.timeLeft;
        this.timerBtn.textContent = 'START';
        
        clearInterval(this.interval);
        this.updateDisplay();
        this.updateProgress();
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
        this.isPaused = false;
        this.timerBtn.textContent = 'PAUSE';

        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgress();

            if (this.timeLeft <= 0) {
                this.completeSession();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        this.isPaused = true;
        this.timerBtn.textContent = 'START';
        clearInterval(this.interval);
    }

    completeSession() {
        this.isRunning = false;
        clearInterval(this.interval);

        // Count completed pomodoro sessions
        if (this.currentMode === 'pomodoro') {
            this.sessionCount++;
            this.saveSessionCount();
        }

        this.timerBtn.textContent = 'START';
        this.playNotificationSound();
        this.showNotification();

        // Auto-switch to appropriate break mode
        if (this.currentMode === 'pomodoro') {
            // Switch to break mode based on session count
            const nextMode = this.sessionCount % 4 === 0 ? 'long-break' : 'short-break';
            this.switchMode(nextMode);
        } else {
            // Switch back to pomodoro mode
            this.switchMode('pomodoro');
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateProgress() {
        const progress = (this.totalTime - this.timeLeft) / this.totalTime;
        const circumference = 2 * Math.PI * 164; // radius = 164
        const dashOffset = circumference - (progress * circumference);
        this.progressCircle.style.strokeDashoffset = dashOffset;
    }

    openModal() {
        this.modal.classList.add('active');
        this.updateSettingsInputs();
    }

    closeModal() {
        this.modal.classList.remove('active');
    }

    selectFont(font) {
        this.settings.font = font;
        this.fontBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.font === font);
        });
    }

    selectColor(color) {
        this.settings.color = color;
        this.colorBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === color);
        });
    }

    handleArrowClick(e) {
        const target = e.target.closest('.arrow-btn');
        const inputId = target.dataset.target;
        const input = document.getElementById(inputId);
        const isUp = target.classList.contains('up');
        
        let currentValue = parseInt(input.value);
        const min = parseInt(input.min);
        const max = parseInt(input.max);

        if (isUp && currentValue < max) {
            input.value = currentValue + 1;
        } else if (!isUp && currentValue > min) {
            input.value = currentValue - 1;
        }
    }

    applySettings() {
        // Update time settings
        this.settings.pomodoro = parseInt(this.pomodoroTimeInput.value);
        this.settings.shortBreak = parseInt(this.shortBreakTimeInput.value);
        this.settings.longBreak = parseInt(this.longBreakTimeInput.value);

        // Apply theme changes
        this.applyTheme();
        this.saveSettings();

        // Reset timer if not running
        if (!this.isRunning) {
            this.resetTimer();
        }

        this.closeModal();
    }

    saveSessionCount() {
        localStorage.setItem('pomodoroSessionCount', this.sessionCount.toString());
    }

    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.8);
        } catch (error) {
            console.log('Audio not supported:', error);
        }
    }

    showNotification() {
        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            let message = '';
            
            switch (this.currentMode) {
                case 'pomodoro':
                    message = 'Time for a break! Great work on your focus session.';
                    break;
                case 'short-break':
                case 'long-break':
                    message = 'Break time is over! Ready to get back to work?';
                    break;
            }
            
            new Notification('🍅 Pomodoro Timer', {
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
            });
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
    
    // Request notification permission
    timer.requestNotificationPermission();
    
    // Prevent space bar from scrolling the page
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
        }
    });
}); 