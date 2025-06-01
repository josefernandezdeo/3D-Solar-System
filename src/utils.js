import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Performance monitoring
export class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fpsDisplay = null;
        this.showFPS = false;
        
        this.createFPSDisplay();
    }

    createFPSDisplay() {
        this.fpsDisplay = document.createElement('div');
        this.fpsDisplay.id = 'fps-counter';
        this.fpsDisplay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 5px 10px;
            font-family: monospace;
            font-size: 12px;
            border-radius: 3px;
            z-index: 1000;
            display: none;
        `;
        document.body.appendChild(this.fpsDisplay);
    }

    update() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            if (this.showFPS && this.fpsDisplay) {
                this.fpsDisplay.textContent = `FPS: ${this.fps}`;
                this.fpsDisplay.style.color = this.fps < 30 ? 'red' : this.fps < 50 ? 'yellow' : 'lime';
            }
        }
    }

    toggleDisplay() {
        this.showFPS = !this.showFPS;
        this.fpsDisplay.style.display = this.showFPS ? 'block' : 'none';
    }

    getFPS() {
        return this.fps;
    }
}

// Click/Touch detection for planet selection
export class PlanetPicker {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.planets = [];
        this.onPlanetClick = null;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse events
        document.addEventListener('click', (event) => this.onMouseClick(event));
        
        // Touch events for mobile
        document.addEventListener('touchend', (event) => {
            if (event.touches.length === 0 && event.changedTouches.length === 1) {
                this.onTouchEnd(event.changedTouches[0]);
            }
        });
    }

    setPlanets(planets) {
        this.planets = planets;
    }

    setClickHandler(handler) {
        this.onPlanetClick = handler;
    }

    onMouseClick(event) {
        // Prevent clicking through UI elements
        if (event.target.closest('#time-controls, #search-panel, #view-controls, #planet-info-panel, #keyboard-shortcuts')) {
            return;
        }

        this.handleClick(event.clientX, event.clientY);
    }

    onTouchEnd(touch) {
        this.handleClick(touch.clientX, touch.clientY);
    }

    handleClick(x, y) {
        // Convert screen coordinates to normalized device coordinates
        this.mouse.x = (x / window.innerWidth) * 2 - 1;
        this.mouse.y = -(y / window.innerHeight) * 2 + 1;

        // Cast ray from camera through mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Find intersections with planets
        const intersects = this.raycaster.intersectObjects(this.planets);
        
        if (intersects.length > 0) {
            const planet = intersects[0].object;
            if (planet.userData && planet.userData.name) {
                this.highlightPlanet(planet);
                if (this.onPlanetClick) {
                    this.onPlanetClick(planet.userData.name);
                }
            }
        }
    }

    highlightPlanet(planet) {
        // Add a quick flash effect to show selection
        const originalEmissive = planet.material.emissive.clone();
        const originalIntensity = planet.material.emissiveIntensity;
        
        // Flash brighter
        planet.material.emissive.setHex(0xffffff);
        planet.material.emissiveIntensity = 0.3;
        
        // Fade back to original
        setTimeout(() => {
            planet.material.emissive.copy(originalEmissive);
            planet.material.emissiveIntensity = originalIntensity;
        }, 200);
    }
}

// Loading screen management
export class LoadingManager {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.progressBar = document.querySelector('.loading-progress');
        this.loadingText = document.querySelector('#loading-screen p');
        this.isLoading = true;
        this.progress = 0;
    }

    updateProgress(progress, message = null) {
        this.progress = Math.max(0, Math.min(100, progress));
        
        if (this.progressBar) {
            this.progressBar.style.width = `${this.progress}%`;
        }
        
        if (message && this.loadingText) {
            this.loadingText.textContent = message;
        }
    }

    setMessage(message) {
        if (this.loadingText) {
            this.loadingText.textContent = message;
        }
    }

    hide() {
        if (this.loadingScreen) {
            this.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                this.isLoading = false;
            }, 500);
        }
    }

    show() {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'flex';
            this.loadingScreen.style.opacity = '1';
            this.isLoading = true;
        }
    }

    isVisible() {
        return this.isLoading;
    }
}

// Local storage management for user preferences
export class PreferencesManager {
    constructor() {
        this.storageKey = 'solarSystemPreferences';
        this.defaultPreferences = {
            showOrbits: true,
            showAsteroidBelt: true,
            timeScale: 1,
            volume: 0.5,
            cameraMode: 'free',
            showFPS: false,
            qualityLevel: 'high',
            theme: 'dark'
        };
    }

    save(preferences) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save preferences:', error);
        }
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return { ...this.defaultPreferences, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load preferences:', error);
        }
        return this.defaultPreferences;
    }

    clear() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.warn('Failed to clear preferences:', error);
        }
    }
}

// Mobile device detection and optimization
export class MobileOptimizer {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        this.isIOS = this.detectIOS();
        this.isAndroid = this.detectAndroid();
        
        if (this.isMobile) {
            this.applyMobileOptimizations();
        }
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    detectTablet() {
        return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    }

    detectIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }

    detectAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    applyMobileOptimizations() {
        // Reduce particle counts
        document.body.classList.add('mobile-device');
        
        // Prevent zoom on double tap
        document.addEventListener('touchstart', function(event) {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Optimize viewport for mobile
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }

    getOptimalSettings() {
        if (this.isMobile) {
            return {
                shadowMapSize: 1024,
                planetSegments: 16,
                asteroidCount: 500,
                starCount: 1000,
                enableAntialiasing: false,
                maxLights: 2
            };
        } else {
            return {
                shadowMapSize: 2048,
                planetSegments: 32,
                asteroidCount: 2000,
                starCount: 3000,
                enableAntialiasing: true,
                maxLights: 4
            };
        }
    }
}

// Smooth animations and transitions
export class AnimationHelper {
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    static easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    static easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    static easeIn(t) {
        return t * t * t;
    }

    static smoothStep(edge0, edge1, x) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }

    static createSmoothTransition(fromValue, toValue, duration, easing = 'easeOut') {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const easingFunctions = {
                linear: t => t,
                easeIn: this.easeIn,
                easeOut: this.easeOut,
                easeInOut: this.easeInOut
            };
            
            const easingFunc = easingFunctions[easing] || easingFunctions.easeOut;
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easingFunc(progress);
                
                const currentValue = this.lerp(fromValue, toValue, easedProgress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve(toValue);
                }
                
                // Return current value for external use
                return currentValue;
            };
            
            requestAnimationFrame(animate);
        });
    }
}

// Math utilities for astronomical calculations
export class AstronomicalUtils {
    static auToKm(au) {
        return au * 149597870.7; // 1 AU in kilometers
    }

    static kmToAu(km) {
        return km / 149597870.7;
    }

    static degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    static radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    static calculateOrbitalVelocity(semiMajorAxis, mass = 1.989e30) {
        // Simplified orbital velocity calculation (circular orbit)
        const G = 6.67430e-11; // Gravitational constant
        return Math.sqrt(G * mass / (semiMajorAxis * 1000));
    }

    static calculateGravity(mass, radius) {
        const G = 6.67430e-11;
        return (G * mass) / (radius * radius);
    }

    static formatDistance(km) {
        if (km < 1000) {
            return `${km.toFixed(0)} km`;
        } else if (km < 1000000) {
            return `${(km / 1000).toFixed(1)} thousand km`;
        } else if (km < 1000000000) {
            return `${(km / 1000000).toFixed(1)} million km`;
        } else {
            return `${(km / 1000000000).toFixed(1)} billion km`;
        }
    }

    static formatMass(kg) {
        if (kg < 1e24) {
            return `${(kg / 1e21).toFixed(1)} × 10²¹ kg`;
        } else if (kg < 1e27) {
            return `${(kg / 1e24).toFixed(1)} × 10²⁴ kg`;
        } else {
            return `${(kg / 1e27).toFixed(1)} × 10²⁷ kg`;
        }
    }
}

// Keyboard shortcut manager
export class KeyboardManager {
    constructor() {
        this.shortcuts = new Map();
        this.isEnabled = true;
        
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }

    register(key, callback, description = '') {
        const normalizedKey = key.toLowerCase();
        this.shortcuts.set(normalizedKey, { callback, description });
    }

    unregister(key) {
        this.shortcuts.delete(key.toLowerCase());
    }

    handleKeyDown(event) {
        if (!this.isEnabled) return;
        
        // Don't trigger shortcuts when typing in input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const key = event.key.toLowerCase();
        const shortcut = this.shortcuts.get(key);
        
        if (shortcut) {
            event.preventDefault();
            shortcut.callback(event);
        }
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }

    getShortcuts() {
        return Array.from(this.shortcuts.entries()).map(([key, data]) => ({
            key: key.toUpperCase(),
            description: data.description
        }));
    }
}

// URL state management for sharing specific views
export class URLStateManager {
    constructor() {
        this.params = new URLSearchParams(window.location.search);
    }

    saveState(state) {
        const url = new URL(window.location);
        
        Object.entries(state).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, JSON.stringify(value));
            } else {
                url.searchParams.delete(key);
            }
        });
        
        window.history.replaceState({}, '', url);
    }

    loadState() {
        const state = {};
        
        for (const [key, value] of this.params.entries()) {
            try {
                state[key] = JSON.parse(value);
            } catch {
                state[key] = value;
            }
        }
        
        return state;
    }

    getShareableURL(state) {
        const url = new URL(window.location.origin + window.location.pathname);
        
        Object.entries(state).forEach(([key, value]) => {
            url.searchParams.set(key, JSON.stringify(value));
        });
        
        return url.toString();
    }
}

// Debug utilities
export class DebugUtils {
    static logPerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    }

    static createCoordinateHelper(scene, size = 100) {
        const axesHelper = new THREE.AxesHelper(size);
        scene.add(axesHelper);
        return axesHelper;
    }

    static createGridHelper(scene, size = 100, divisions = 10) {
        const gridHelper = new THREE.GridHelper(size, divisions);
        scene.add(gridHelper);
        return gridHelper;
    }

    static logCameraInfo(camera) {
        console.log('Camera Position:', camera.position);
        console.log('Camera Rotation:', camera.rotation);
        console.log('Camera FOV:', camera.fov);
    }

    static logObjectInfo(object) {
        console.log('Object Position:', object.position);
        console.log('Object Rotation:', object.rotation);
        console.log('Object Scale:', object.scale);
        console.log('Object UserData:', object.userData);
    }
} 