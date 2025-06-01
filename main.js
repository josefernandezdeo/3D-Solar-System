import * as THREE from 'three';
import { planetData, createPlanet, createSaturnRings, createSatellite } from './src/planets.js';
import { EllipticalOrbit, createEllipticalOrbitLine, updateEllipticalOrbit, realOrbitData } from './src/orbits.js';
import { createAsteroidBelt, createMajorAsteroids, updateAsteroidBelt, updateMajorAsteroids, createAsteroidBeltGuides } from './src/asteroids.js';
import { loadAllTextures, createTexturedMaterial, configureTexture } from './src/textures.js';
import { UIManager } from './src/ui.js';
import { PlanetPicker } from './src/utils.js';
import { CameraManager } from './src/camera.js';
import { getPlanetData } from './src/data.js';

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

// Interactive components
let uiManager;
let planetPicker;
let cameraManager;

// Camera positioning and controls
camera.position.set(80, 50, 80);
camera.lookAt(0, 0, 0);

// Camera control variables (managed by CameraManager)
let cameraRadius = 120;
let cameraTheta = Math.PI / 4;
let cameraPhi = Math.PI / 6;

// Update camera position (fallback function for when CameraManager isn't active)
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
        // Skip moon for now - we'll handle it separately
        if (planetName === 'moon') return;
        
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
        
        // Create the Moon for Earth
        if (planetName === 'earth') {
            const moonData = planetData.moon;
            const moonTexture = planetTextures.moon;
            
            // Configure moon texture
            if (moonTexture) {
                configureTexture(moonTexture, 'terrestrial');
            }
            
            // Create moon as Earth's satellite
            const moon = createSatelliteWithTexture(moonData, moonTexture, planet);
            console.log('🌙 Moon created and added to Earth!');
        }
        
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
    
    // Initialize interactive components
    initializeInteractiveFeatures();
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

// Create satellite with texture (like the Moon)
function createSatelliteWithTexture(satelliteInfo, texture, parentPlanet) {
    const geometry = new THREE.SphereGeometry(satelliteInfo.radius, 32, 16);
    
    // Use the textured material function
    const material = createTexturedMaterial(satelliteInfo, texture);
    
    // Adjust material for lunar surface characteristics
    material.shininess = 5; // Low shininess for rocky surface
    
    const satellite = new THREE.Mesh(geometry, material);
    
    // Add custom properties for satellite animation
    satellite.userData = {
        name: satelliteInfo.name,
        rotationSpeed: satelliteInfo.rotationSpeed,
        orbitRadius: satelliteInfo.orbitRadius,
        orbitSpeed: satelliteInfo.orbitSpeed,
        orbitAngle: Math.random() * Math.PI * 2,
        parent: satelliteInfo.parent,
        isSatellite: true
    };
    
    // Position the satellite initially
    const x = Math.cos(satellite.userData.orbitAngle) * satellite.userData.orbitRadius;
    const z = Math.sin(satellite.userData.orbitAngle) * satellite.userData.orbitRadius;
    satellite.position.set(x, 0, z);
    
    // Add the satellite to the parent planet
    parentPlanet.add(satellite);
    
    // Create a small orbit line for the satellite
    const orbitGeometry = new THREE.RingGeometry(satelliteInfo.orbitRadius - 0.05, satelliteInfo.orbitRadius + 0.05, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    
    const orbitLine = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbitLine.rotation.x = Math.PI / 2;
    parentPlanet.add(orbitLine);
    
    // Enable shadows for the satellite
    satellite.castShadow = true;
    satellite.receiveShadow = true;
    
    return satellite;
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
    
    // Update planets with realistic orbital speeds
    planets.forEach(planet => {
        const data = planet.userData;
        
        // Rotate planet on its axis (much slower)
        planet.rotation.y += data.rotationSpeed * deltaTime;
        
        // Use realistic orbital movement instead of elliptical
        if (data.name !== 'Sun') {
            // Update orbital position using realistic speeds
            data.orbitAngle += data.orbitSpeed * deltaTime;
            
            // Calculate new position
            const x = Math.cos(data.orbitAngle) * data.orbitRadius;
            const z = Math.sin(data.orbitAngle) * data.orbitRadius;
            
            planet.position.set(x, 0, z);
        }
        
        // Update satellites (like the Moon)
        planet.children.forEach(child => {
            if (child.userData && child.userData.isSatellite) {
                // Update satellite's orbital position around its parent
                child.userData.orbitAngle += child.userData.orbitSpeed * deltaTime;
                
                const satX = Math.cos(child.userData.orbitAngle) * child.userData.orbitRadius;
                const satZ = Math.sin(child.userData.orbitAngle) * child.userData.orbitRadius;
                
                child.position.set(satX, 0, satZ);
                
                // Update satellite rotation (tidally locked for Moon)
                child.rotation.y += child.userData.rotationSpeed * deltaTime;
            }
        });
    });
    
    // Update asteroid belt
    if (asteroidBelt) {
        updateAsteroidBelt(asteroidBelt, deltaTime);
        updateMajorAsteroids(majorAsteroids, deltaTime);
    }
    
    // Update camera position
    if (cameraManager) {
        cameraManager.update(deltaTime);
    } else {
        updateCamera();
    }
    
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
    // Info panel removed per user request
    const infoPanel = document.getElementById('info-panel');
    if (infoPanel) {
        infoPanel.style.display = 'none';
    }
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

// Initialize interactive UI and planet picking
function initializeInteractiveFeatures() {
    console.log('🔧 Starting interactive features initialization...');
    
    try {
        // Initialize UI Manager
        console.log('📋 Creating UI Manager...');
        uiManager = new UIManager(planetTextures);
        console.log('✅ UI Manager created');
        
        // Initialize Camera Manager
        console.log('📷 Creating Camera Manager...');
        cameraManager = new CameraManager(camera, scene);
        cameraManager.setPlanets(planets);
        console.log('✅ Camera Manager created');
        
        // Initialize Planet Picker
        console.log('🎯 Creating Planet Picker...');
        planetPicker = new PlanetPicker(camera, scene);
        planetPicker.planets = planets;
        console.log('✅ Planet Picker created');
        
        // Set up planet click handler
        planetPicker.setClickHandler((planetName) => {
            console.log('🪐 Planet clicked:', planetName);
            const planetData = getPlanetData(planetName.toLowerCase());
            if (planetData) {
                uiManager.showPlanetInfo(planetData);
                uiManager.selectPlanetByName(planetName.toLowerCase());
            } else {
                console.warn('❌ Planet data not found for:', planetName);
            }
        });
        
        // Set up UI event handlers using the correct custom event system
        document.addEventListener('solarSystem:planetSelected', (event) => {
            console.log('🎯 Planet selected event:', event.detail.planet);
            const planetName = event.detail.planet;
            cameraManager.zoomToPlanet(planetName);
        });
        
        document.addEventListener('solarSystem:followPlanet', (event) => {
            console.log('👁️ Follow planet event:', event.detail.planet);
            const planetName = event.detail.planet;
            cameraManager.setMode('follow', planetName);
        });
        
        document.addEventListener('solarSystem:zoomToPlanet', (event) => {
            console.log('🔍 Zoom to planet event:', event.detail.planet);
            const planetName = event.detail.planet;
            cameraManager.zoomToPlanet(planetName);
        });
        
        document.addEventListener('solarSystem:resetView', () => {
            console.log('🔄 Reset view event');
            cameraManager.resetView();
        });
        
        document.addEventListener('solarSystem:cameraModeChanged', (event) => {
            console.log('📷 Camera mode changed:', event.detail.mode);
            const mode = event.detail.mode;
            cameraManager.setMode(mode);
        });
        
        // Handle orbit visibility toggle
        document.addEventListener('solarSystem:orbitsToggled', (event) => {
            console.log('🔄 Orbits toggled:', event.detail.show);
            const show = event.detail.show;
            orbitLines.forEach(orbitLine => {
                orbitLine.visible = show;
            });
        });
        
        // Handle asteroid belt visibility toggle  
        document.addEventListener('solarSystem:asteroidsToggled', (event) => {
            console.log('🔄 Asteroids toggled:', event.detail.show);
            const show = event.detail.show;
            if (asteroidBelt) {
                asteroidBelt.visible = show;
            }
            if (majorAsteroids) {
                majorAsteroids.forEach(asteroid => {
                    asteroid.visible = show;
                });
            }
            if (asteroidGuides) {
                asteroidGuides.forEach(guide => {
                    guide.visible = show;
                });
            }
        });
        
        console.log('🖱️ Interactive features initialized successfully!');
    } catch (error) {
        console.error('❌ Error initializing interactive features:', error);
    }
} 