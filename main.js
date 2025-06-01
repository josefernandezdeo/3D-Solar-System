import * as THREE from 'three';
import { planetData, createPlanet, createSaturnRings } from './src/planets.js';
import { EllipticalOrbit, createEllipticalOrbitLine, updateEllipticalOrbit, realOrbitData } from './src/orbits.js';
import { createAsteroidBelt, createMajorAsteroids, updateAsteroidBelt, updateMajorAsteroids, createAsteroidBeltGuides } from './src/asteroids.js';
import { loadAllTextures, createTexturedMaterial, configureTexture } from './src/textures.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('solar-system-canvas'),
    antialias: true 
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Set dark space background with stars
scene.background = new THREE.Color(0x000011);

// Add starfield background
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.5,
        transparent: true,
        opacity: 0.8
    });

    const starsVertices = [];
    for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

createStarfield();

// Enhanced lighting setup to prevent black planets
const ambientLight = new THREE.AmbientLight(0x404040, 0.4); // Increased ambient light
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 2.5, 0, 1.5); // Adjusted intensity and decay
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 1000;
scene.add(sunLight);

// Add additional directional light for better planet visibility
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

// Global variables
let planets = [];
let orbits = [];
let orbitLines = [];
let asteroidBelt;
let majorAsteroids = [];
let asteroidGuides = [];
let planetTextures = {};

// Camera positioning and controls
camera.position.set(80, 50, 80);
camera.lookAt(0, 0, 0);

// Enhanced mouse controls
let mouseX = 0;
let mouseY = 0;
let mouseDownX = 0;
let mouseDownY = 0;
let isMouseDown = false;

let cameraRadius = 120;
let cameraTheta = Math.PI / 4;
let cameraPhi = Math.PI / 6;

// Mouse event listeners
document.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    mouseDownX = event.clientX;
    mouseDownY = event.clientY;
});

document.addEventListener('mouseup', () => {
    isMouseDown = false;
});

document.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
        const deltaX = event.clientX - mouseDownX;
        const deltaY = event.clientY - mouseDownY;
        
        cameraTheta -= deltaX * 0.01;
        cameraPhi -= deltaY * 0.01;
        
        cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhi));
        
        mouseDownX = event.clientX;
        mouseDownY = event.clientY;
    }
});

// Zoom with mouse wheel
document.addEventListener('wheel', (event) => {
    cameraRadius += event.deltaY * 0.2;
    cameraRadius = Math.max(30, Math.min(400, cameraRadius));
});

// Touch controls for mobile
let touches = [];

document.addEventListener('touchstart', (event) => {
    touches = Array.from(event.touches);
});

document.addEventListener('touchmove', (event) => {
    event.preventDefault();
    const currentTouches = Array.from(event.touches);
    
    if (touches.length === 1 && currentTouches.length === 1) {
        const deltaX = currentTouches[0].clientX - touches[0].clientX;
        const deltaY = currentTouches[0].clientY - touches[0].clientY;
        
        cameraTheta -= deltaX * 0.01;
        cameraPhi -= deltaY * 0.01;
        cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhi));
    } else if (touches.length === 2 && currentTouches.length === 2) {
        const oldDistance = Math.hypot(
            touches[1].clientX - touches[0].clientX,
            touches[1].clientY - touches[0].clientY
        );
        const newDistance = Math.hypot(
            currentTouches[1].clientX - currentTouches[0].clientX,
            currentTouches[1].clientY - currentTouches[0].clientY
        );
        
        const zoomFactor = (oldDistance - newDistance) * 0.8;
        cameraRadius += zoomFactor;
        cameraRadius = Math.max(30, Math.min(400, cameraRadius));
    }
    
    touches = currentTouches;
});

// Update camera position
function updateCamera() {
    camera.position.x = cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta);
    camera.position.y = cameraRadius * Math.cos(cameraPhi);
    camera.position.z = cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta);
    camera.lookAt(0, 0, 0);
}

// Create planets with textures
async function createTexturedPlanets() {
    // Update loading screen
    updateLoadingScreen("Loading planet textures from local folder...");
    
    console.log('🔍 Starting texture loading process...');
    console.log('📁 Expected texture folder: "./textures solar system/"');
    
    try {
        // Load all textures from local folder
        planetTextures = await loadAllTextures(true); // true = use local files
        console.log('🎨 Texture loading complete! Results:', planetTextures);
        
        // Count successful textures
        const successCount = Object.values(planetTextures).filter(texture => texture !== null).length;
        console.log(`✅ Successfully loaded ${successCount}/9 textures`);
        
        // List which textures failed
        Object.entries(planetTextures).forEach(([planetName, texture]) => {
            if (!texture) {
                console.warn(`❌ Missing texture for: ${planetName}`);
            }
        });
        
    } catch (error) {
        console.error('🚨 Critical error during texture loading:', error);
        console.warn('⚠️ Some textures failed to load from local folder, using fallback colors');
    }

    // Create all planets with textures
    Object.entries(planetData).forEach(([planetName, planetInfo]) => {
        const texture = planetTextures[planetName];
        
        // Configure texture based on planet type
        if (texture) {
            let planetType;
            if (planetName === 'sun') planetType = 'sun';
            else if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(planetName)) planetType = 'gas_giant';
            else planetType = 'terrestrial';
            
            configureTexture(texture, planetType);
        }

        // Create planet with textured material
        const planet = createPlanetWithTexture(planetInfo, texture);
        planets.push(planet);
        scene.add(planet);
        
        // Create elliptical orbit (except for sun)
        if (planetInfo.orbitRadius > 0 && realOrbitData[planetName]) {
            const orbitData = realOrbitData[planetName];
            const orbit = new EllipticalOrbit(
                orbitData.semiMajorAxis,
                orbitData.eccentricity,
                orbitData.inclination
            );
            
            // Store orbit in planet userData
            planet.userData.orbit = orbit;
            planet.userData.orbitSpeed = (2 * Math.PI) / (orbitData.period * 0.05); // Much slower time scaling
            
            // Create orbit visualization
            const orbitLine = createEllipticalOrbitLine(orbit, 0x666666, 0.4);
            orbitLines.push(orbitLine);
            scene.add(orbitLine);
            
            orbits.push(orbit);
        }
        
        // Add Saturn's rings
        if (planetInfo.hasRings) {
            createSaturnRings(planet);
        }
        
        // Enable shadows for planets (except sun)
        if (planetInfo.name !== 'Sun') {
            planet.castShadow = true;
            planet.receiveShadow = true;
        }
    });

    // Create asteroid belt
    asteroidBelt = createAsteroidBelt(40, 60, 1500);
    scene.add(asteroidBelt);

    majorAsteroids = createMajorAsteroids();
    majorAsteroids.forEach(asteroid => scene.add(asteroid));

    asteroidGuides = createAsteroidBeltGuides(40, 60);
    asteroidGuides.forEach(guide => scene.add(guide));

    console.log('🪐 Solar system created with textures!');
}

// Create planet with texture (enhanced version of createPlanet)
function createPlanetWithTexture(planetInfo, texture) {
    const geometry = new THREE.SphereGeometry(planetInfo.radius, 64, 32);
    
    // Use the textured material function
    const material = createTexturedMaterial(planetInfo, texture);
    
    // Add some surface detail for gas giants
    if (['Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(planetInfo.name)) {
        material.bumpScale = 0.02;
    }
    
    const planet = new THREE.Mesh(geometry, material);
    
    // Add atmospheric glow for gas giants
    if (['Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(planetInfo.name)) {
        const glowGeometry = new THREE.SphereGeometry(planetInfo.radius * 1.05, 32, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: planetInfo.color,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        planet.add(glow);
    }
    
    // Add custom properties for animation
    planet.userData = {
        name: planetInfo.name,
        rotationSpeed: planetInfo.rotationSpeed,
        orbitRadius: planetInfo.orbitRadius,
        orbitSpeed: planetInfo.orbitSpeed,
        orbitAngle: Math.random() * Math.PI * 2,
        meanAnomaly: Math.random() * Math.PI * 2
    };
    
    return planet;
}

// Update loading screen with progress
function updateLoadingScreen(message) {
    const loadingScreen = document.querySelector('#loading-screen p');
    if (loadingScreen) {
        loadingScreen.textContent = message;
    }
}

// Animation loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    
    // Update planets with elliptical orbits
    planets.forEach(planet => {
        const data = planet.userData;
        
        // Rotate planet on its axis (now much slower)
        planet.rotation.y += data.rotationSpeed;
        
        // Update elliptical orbital position
        updateEllipticalOrbit(planet, deltaTime);
    });
    
    // Update asteroid belt
    if (asteroidBelt) {
        updateAsteroidBelt(asteroidBelt, deltaTime);
        updateMajorAsteroids(majorAsteroids, deltaTime);
    }
    
    // Update camera position
    updateCamera();
    
    // Render the scene
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Hide loading screen and start animation
function startSolarSystem() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('hidden');
    
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
    
    animate();
}

// Update info panel for textured version
function updateInfoPanel() {
    const infoPanel = document.getElementById('info-panel');
    infoPanel.innerHTML = `
        <h2>3D Solar System - Textured</h2>
        <p>🪐 Complete Solar System (9 planets)</p>
        <p>🎨 Realistic Planet Textures</p>
        <p>🌌 Slower Orbits for Easy Viewing</p>
        <p>💫 Saturn's Rings & Atmospheric Glow</p>
        <p>🖱️ Mouse: Rotate | 🔄 Scroll: Zoom</p>
    `;
}

// Initialize the solar system with textures
async function initSolarSystem() {
    updateLoadingScreen("Initializing solar system...");
    
    try {
        await createTexturedPlanets();
        updateInfoPanel();
        
        console.log('🚀 3D Solar System - Textured Version');
        console.log('Planets created:', planets.length);
        console.log('Orbits created:', orbits.length);
        console.log('🎨 Features: Realistic textures, atmospheric glow, enhanced materials');
        console.log('🐌 Orbital speeds optimized for viewing experience');
        console.log('Use mouse to rotate, scroll to zoom!');
        
        // Start animation
        setTimeout(startSolarSystem, 1000);
        
    } catch (error) {
        console.error('Failed to initialize solar system:', error);
        updateLoadingScreen("Error loading textures. Using fallback colors...");
        
        // Fallback: create without textures
        setTimeout(startSolarSystem, 2000);
    }
}

// Start the initialization
initSolarSystem(); 