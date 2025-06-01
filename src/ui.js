import * as THREE from 'three';

// UI State Management
export class UIManager {
    constructor() {
        this.timeScale = 1;
        this.isPaused = false;
        this.selectedPlanet = null;
        this.showOrbits = true;
        this.showAsteroidBelt = true;
        this.currentCameraMode = 'free';
        this.searchResults = [];
        
        this.initializeUI();
        this.setupEventListeners();
    }

    initializeUI() {
        this.createConsolidatedControlPanel();
        this.createPlanetInfoPanel();
        this.createKeyboardShortcuts();
    }

    createConsolidatedControlPanel() {
        const controlPanel = document.createElement('div');
        controlPanel.id = 'control-panel';
        controlPanel.className = 'consolidated-panel';
        controlPanel.innerHTML = `
            <!-- Time Controls Section -->
            <div class="control-section">
                <h3>⏰ Time Controls</h3>
                <div class="time-buttons">
                    <button id="pause-btn" class="control-btn">⏸️ Pause</button>
                    <button id="play-btn" class="control-btn active">▶️ Play</button>
                </div>
                <div class="speed-control">
                    <label for="speed-slider">Speed: <span id="speed-value">1x</span></label>
                    <input type="range" id="speed-slider" min="0.1" max="10" step="0.1" value="1">
                </div>
            </div>

            <!-- Planet Search Section -->
            <div class="control-section">
                <h3>🔍 Planet Navigator</h3>
                <div class="search-container">
                    <input type="text" id="planet-search" placeholder="Search planets..." autocomplete="off">
                    <div id="search-results" class="search-results"></div>
                </div>
                <div class="quick-nav">
                    <button class="planet-btn" data-planet="sun">☀️ Sun</button>
                    <button class="planet-btn" data-planet="earth">🌍 Earth</button>
                    <button class="planet-btn" data-planet="mars">🔴 Mars</button>
                    <button class="planet-btn" data-planet="jupiter">🪐 Jupiter</button>
                    <button class="planet-btn" data-planet="saturn">💍 Saturn</button>
                </div>
            </div>

            <!-- View Controls Section -->
            <div class="control-section">
                <h3>👁️ View Options</h3>
                <div class="camera-modes">
                    <button id="free-camera" class="mode-btn active" data-mode="free">🎥 Free Roam</button>
                    <button id="follow-camera" class="mode-btn" data-mode="follow">🎯 Follow Planet</button>
                    <button id="overview-camera" class="mode-btn" data-mode="overview">🌌 Overview</button>
                </div>
                <div class="toggle-controls">
                    <label class="toggle-label">
                        <input type="checkbox" id="show-orbits" checked>
                        <span class="toggle-slider"></span>
                        Show Orbits
                    </label>
                    <label class="toggle-label">
                        <input type="checkbox" id="show-asteroids" checked>
                        <span class="toggle-slider"></span>
                        Asteroid Belt
                    </label>
                </div>
            </div>
        `;
        document.body.appendChild(controlPanel);
    }

    createTimeControls() {
        // This method is no longer needed as it's part of the consolidated panel
    }

    createPlanetSearch() {
        // This method is no longer needed as it's part of the consolidated panel
    }

    createViewControls() {
        // This method is no longer needed as it's part of the consolidated panel
    }

    createPlanetInfoPanel() {
        const infoPanel = document.createElement('div');
        infoPanel.id = 'planet-info-panel';
        infoPanel.className = 'hidden';
        infoPanel.innerHTML = `
            <div class="info-header">
                <h2 id="planet-name">Planet Name</h2>
                <button id="close-info" class="close-btn">✕</button>
            </div>
            <div class="info-content">
                <div id="planet-image" class="planet-image"></div>
                <div class="planet-stats">
                    <div class="stat-item">
                        <span class="stat-label">Radius:</span>
                        <span id="planet-radius" class="stat-value">-</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Distance from Sun:</span>
                        <span id="planet-distance" class="stat-value">-</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Orbital Period:</span>
                        <span id="planet-period" class="stat-value">-</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Day Length:</span>
                        <span id="planet-day" class="stat-value">-</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Temperature:</span>
                        <span id="planet-temp" class="stat-value">-</span>
                    </div>
                </div>
                <div class="planet-description">
                    <p id="planet-desc">Select a planet to learn more about it!</p>
                </div>
                <div class="action-buttons">
                    <button id="zoom-to-planet" class="action-btn">🔍 Zoom to Planet</button>
                    <button id="follow-planet" class="action-btn">🎯 Follow Planet</button>
                </div>
            </div>
        `;
        document.body.appendChild(infoPanel);
    }

    createKeyboardShortcuts() {
        const shortcuts = document.createElement('div');
        shortcuts.id = 'keyboard-shortcuts';
        shortcuts.className = 'hidden';
        shortcuts.innerHTML = `
            <div class="shortcuts-content">
                <h3>⌨️ Keyboard Shortcuts</h3>
                <button id="close-shortcuts" class="close-btn" style="position: absolute; top: 15px; right: 15px;">✕</button>
                <div class="shortcut-list">
                    <div class="shortcut-item"><kbd>Space</kbd> - Pause/Play</div>
                    <div class="shortcut-item"><kbd>+/-</kbd> - Speed Up/Down</div>
                    <div class="shortcut-item"><kbd>R</kbd> - Reset View</div>
                    <div class="shortcut-item"><kbd>O</kbd> - Toggle Orbits</div>
                    <div class="shortcut-item"><kbd>A</kbd> - Toggle Asteroids</div>
                    <div class="shortcut-item"><kbd>H</kbd> - Show/Hide Shortcuts</div>
                    <div class="shortcut-item"><kbd>1-9</kbd> - Select Planet</div>
                    <div class="shortcut-item"><kbd>Esc</kbd> - Deselect Planet</div>
                </div>
            </div>
        `;
        document.body.appendChild(shortcuts);

        // Add keyboard shortcut toggle button
        const shortcutBtn = document.createElement('button');
        shortcutBtn.id = 'shortcuts-btn';
        shortcutBtn.innerHTML = '⌨️';
        shortcutBtn.title = 'Keyboard Shortcuts (H)';
        document.body.appendChild(shortcutBtn);
    }

    setupEventListeners() {
        console.log('🔧 Setting up UI event listeners...');
        
        // Helper function to safely add event listener
        const safeAddListener = (id, event, handler) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, handler);
                console.log(`✅ Added ${event} listener to ${id}`);
            } else {
                console.warn(`⚠️ Element ${id} not found`);
            }
        };

        // Time controls
        safeAddListener('pause-btn', 'click', () => this.pauseTime());
        safeAddListener('play-btn', 'click', () => this.playTime());
        safeAddListener('speed-slider', 'input', (e) => this.setTimeSpeed(parseFloat(e.target.value)));

        // Planet search
        safeAddListener('planet-search', 'input', (e) => this.searchPlanets(e.target.value));
        document.querySelectorAll('.planet-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectPlanetByName(btn.dataset.planet));
        });

        // Camera modes
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setCameraMode(btn.dataset.mode));
        });

        // View toggles
        safeAddListener('show-orbits', 'change', (e) => this.toggleOrbits(e.target.checked));
        safeAddListener('show-asteroids', 'change', (e) => this.toggleAsteroids(e.target.checked));

        // Info panel
        safeAddListener('close-info', 'click', () => this.hidePlanetInfo());
        safeAddListener('zoom-to-planet', 'click', () => this.zoomToPlanet());
        safeAddListener('follow-planet', 'click', () => this.followPlanet());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        safeAddListener('shortcuts-btn', 'click', () => this.toggleShortcuts());
        safeAddListener('close-shortcuts', 'click', () => this.toggleShortcuts());

        // Search results click handling
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('search-result-item')) {
                this.selectPlanetByName(e.target.dataset.planet);
            }
        });
        
        console.log('🎯 UI event listeners setup complete');
    }

    // Time control methods
    pauseTime() {
        this.isPaused = true;
        document.getElementById('pause-btn').classList.add('active');
        document.getElementById('play-btn').classList.remove('active');
        this.dispatchEvent('timeStateChanged', { paused: true, timeScale: this.timeScale });
    }

    playTime() {
        this.isPaused = false;
        document.getElementById('play-btn').classList.add('active');
        document.getElementById('pause-btn').classList.remove('active');
        this.dispatchEvent('timeStateChanged', { paused: false, timeScale: this.timeScale });
    }

    setTimeSpeed(speed) {
        this.timeScale = speed;
        document.getElementById('speed-value').textContent = `${speed}x`;
        this.dispatchEvent('timeStateChanged', { paused: this.isPaused, timeScale: this.timeScale });
    }

    // Planet search methods
    searchPlanets(query) {
        const planets = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
        const results = planets.filter(planet => 
            planet.toLowerCase().includes(query.toLowerCase())
        );

        const resultsContainer = document.getElementById('search-results');
        if (query.length === 0) {
            resultsContainer.innerHTML = '';
            return;
        }

        resultsContainer.innerHTML = results.map(planet => 
            `<div class="search-result-item" data-planet="${planet}">
                ${this.getPlanetEmoji(planet)} ${planet.charAt(0).toUpperCase() + planet.slice(1)}
            </div>`
        ).join('');
    }

    getPlanetEmoji(planet) {
        const emojis = {
            sun: '☀️', mercury: '☿️', venus: '♀️', earth: '🌍', mars: '🔴',
            jupiter: '🪐', saturn: '💍', uranus: '🔵', neptune: '🔷', pluto: '🟫'
        };
        return emojis[planet] || '🌑';
    }

    selectPlanetByName(planetName) {
        this.selectedPlanet = planetName;
        document.getElementById('planet-search').value = '';
        document.getElementById('search-results').innerHTML = '';
        this.dispatchEvent('planetSelected', { planet: planetName });
    }

    // Camera mode methods
    setCameraMode(mode) {
        this.currentCameraMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        this.dispatchEvent('cameraModeChanged', { mode });
    }

    // View toggle methods
    toggleOrbits(show) {
        this.showOrbits = show;
        this.dispatchEvent('orbitsToggled', { show });
    }

    toggleAsteroids(show) {
        this.showAsteroidBelt = show;
        this.dispatchEvent('asteroidsToggled', { show });
    }

    // Planet info methods
    showPlanetInfo(planetData) {
        document.getElementById('planet-name').textContent = planetData.name;
        document.getElementById('planet-radius').textContent = planetData.radius;
        document.getElementById('planet-distance').textContent = planetData.distance;
        document.getElementById('planet-period').textContent = planetData.period;
        document.getElementById('planet-day').textContent = planetData.dayLength;
        document.getElementById('planet-temp').textContent = planetData.temperature;
        document.getElementById('planet-desc').textContent = planetData.description;
        
        document.getElementById('planet-info-panel').classList.remove('hidden');
    }

    hidePlanetInfo() {
        document.getElementById('planet-info-panel').classList.add('hidden');
        this.selectedPlanet = null;
        this.dispatchEvent('planetDeselected');
    }

    zoomToPlanet() {
        if (this.selectedPlanet) {
            this.dispatchEvent('zoomToPlanet', { planet: this.selectedPlanet });
        }
    }

    followPlanet() {
        if (this.selectedPlanet) {
            this.setCameraMode('follow');
            this.dispatchEvent('followPlanet', { planet: this.selectedPlanet });
        }
    }

    // Keyboard handling
    handleKeyboard(event) {
        const key = event.key.toLowerCase();
        
        switch(key) {
            case ' ':
                event.preventDefault();
                this.isPaused ? this.playTime() : this.pauseTime();
                break;
            case '+':
            case '=':
                this.setTimeSpeed(Math.min(10, this.timeScale + 0.5));
                break;
            case '-':
                this.setTimeSpeed(Math.max(0.1, this.timeScale - 0.5));
                break;
            case 'r':
                this.dispatchEvent('resetView');
                break;
            case 'o':
                const orbitsCheckbox = document.getElementById('show-orbits');
                orbitsCheckbox.checked = !orbitsCheckbox.checked;
                this.toggleOrbits(orbitsCheckbox.checked);
                break;
            case 'a':
                const asteroidsCheckbox = document.getElementById('show-asteroids');
                asteroidsCheckbox.checked = !asteroidsCheckbox.checked;
                this.toggleAsteroids(asteroidsCheckbox.checked);
                break;
            case 'h':
                this.toggleShortcuts();
                break;
            case 'escape':
                this.hidePlanetInfo();
                break;
            case '1': this.selectPlanetByName('mercury'); break;
            case '2': this.selectPlanetByName('venus'); break;
            case '3': this.selectPlanetByName('earth'); break;
            case '4': this.selectPlanetByName('mars'); break;
            case '5': this.selectPlanetByName('jupiter'); break;
            case '6': this.selectPlanetByName('saturn'); break;
            case '7': this.selectPlanetByName('uranus'); break;
            case '8': this.selectPlanetByName('neptune'); break;
            case '9': this.selectPlanetByName('pluto'); break;
        }
    }

    toggleShortcuts() {
        const shortcuts = document.getElementById('keyboard-shortcuts');
        shortcuts.classList.toggle('hidden');
    }

    // Event system
    dispatchEvent(eventName, data = {}) {
        const event = new CustomEvent(`solarSystem:${eventName}`, { detail: data });
        document.dispatchEvent(event);
    }

    // Public getters
    getTimeScale() {
        return this.isPaused ? 0 : this.timeScale;
    }

    getSelectedPlanet() {
        return this.selectedPlanet;
    }

    getCameraMode() {
        return this.currentCameraMode;
    }
} 