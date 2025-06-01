import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Planet data with realistic properties (scaled for visualization)
export const planetData = {
    sun: {
        name: 'Sun',
        radius: 5,
        color: 0xFDB813,
        emissive: 0xFDB813,
        emissiveIntensity: 0.3,
        rotationSpeed: 0.001, // Much slower
        orbitRadius: 0,
        orbitSpeed: 0
    },
    mercury: {
        name: 'Mercury',
        radius: 0.4,
        color: 0x8C7853,
        emissive: 0x4A3629,
        emissiveIntensity: 0.05,
        rotationSpeed: 0.0005, // Much slower
        orbitRadius: 15,
        orbitSpeed: 0.002 // Realistic: Mercury orbits fastest (88 Earth days)
    },
    venus: {
        name: 'Venus',
        radius: 0.9,
        color: 0xFFC649,
        emissive: 0x664319,
        emissiveIntensity: 0.08,
        rotationSpeed: -0.0002, // Retrograde rotation, much slower
        orbitRadius: 20,
        orbitSpeed: 0.0012 // Realistic: Venus (225 Earth days)
    },
    earth: {
        name: 'Earth',
        radius: 1,
        color: 0x6B93D6,
        emissive: 0x1E2F45,
        emissiveIntensity: 0.06,
        rotationSpeed: 0.002, // Much slower
        orbitRadius: 25,
        orbitSpeed: 0.0008 // Realistic: Earth baseline (365 days)
    },
    mars: {
        name: 'Mars',
        radius: 0.5,
        color: 0xCD5C5C,
        emissive: 0x4A1F1F,
        emissiveIntensity: 0.07,
        rotationSpeed: 0.0018, // Much slower
        orbitRadius: 35,
        orbitSpeed: 0.0004 // Realistic: Mars (687 Earth days - about half Earth's speed)
    },
    jupiter: {
        name: 'Jupiter',
        radius: 4.5,
        color: 0xD8A06A,
        emissive: 0x5C4229,
        emissiveIntensity: 0.04,
        rotationSpeed: 0.005, // Fast rotation but slower than before
        orbitRadius: 65,
        orbitSpeed: 0.000067 // Realistic: Jupiter (11.9 Earth years)
    },
    saturn: {
        name: 'Saturn',
        radius: 3.8,
        color: 0xF5DEB3,
        emissive: 0x665A47,
        emissiveIntensity: 0.04,
        rotationSpeed: 0.0045, // Fast rotation but slower
        orbitRadius: 95,
        orbitSpeed: 0.000027, // Realistic: Saturn (29.5 Earth years)
        hasRings: true
    },
    uranus: {
        name: 'Uranus',
        radius: 1.8,
        color: 0x4FD0E7,
        emissive: 0x1F5459,
        emissiveIntensity: 0.05,
        rotationSpeed: 0.0035, // Slower
        orbitRadius: 135,
        orbitSpeed: 0.0000095 // Realistic: Uranus (84 Earth years)
    },
    neptune: {
        name: 'Neptune',
        radius: 1.7,
        color: 0x4B70DD,
        emissive: 0x1E2C59,
        emissiveIntensity: 0.05,
        rotationSpeed: 0.0038, // Slower
        orbitRadius: 165,
        orbitSpeed: 0.0000048 // Realistic: Neptune (165 Earth years)
    },
    pluto: {
        name: 'Pluto',
        radius: 0.2,
        color: 0xBDB7A8,
        emissive: 0x4A453E,
        emissiveIntensity: 0.08,
        rotationSpeed: 0.0012, // Slower
        orbitRadius: 200,
        orbitSpeed: 0.0000032 // Realistic: Pluto (248 Earth years)
    },
    moon: {
        name: 'Moon',
        radius: 0.27, // About 1/4 Earth's size
        color: 0xC4C4C4,
        emissive: 0x2A2A2A,
        emissiveIntensity: 0.04,
        rotationSpeed: 0.00037, // Tidally locked with orbit
        orbitRadius: 3.8, // Distance from Earth (scaled)
        orbitSpeed: 0.037, // Realistic: Moon orbits Earth every 27.3 days
        parent: 'earth' // This moon orbits Earth
    }
};

// Create a planet mesh with enhanced materials
export function createPlanet(planetInfo) {
    const geometry = new THREE.SphereGeometry(planetInfo.radius, 64, 32);
    
    // Use MeshPhongMaterial for better lighting and shininess
    const material = new THREE.MeshPhongMaterial({
        color: planetInfo.color,
        emissive: planetInfo.emissive,
        emissiveIntensity: planetInfo.emissiveIntensity,
        shininess: planetInfo.name === 'Sun' ? 0 : 30,
        specular: planetInfo.name === 'Sun' ? 0x000000 : 0x111111
    });
    
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

// Create Saturn's ring system with improved visuals
export function createSaturnRings(planet) {
    const rings = new THREE.Group();
    
    // Multiple ring sections with different radii and opacities
    const ringData = [
        { innerRadius: 4.5, outerRadius: 6.5, opacity: 0.9, color: 0xE6E6FA },
        { innerRadius: 6.8, outerRadius: 8.2, opacity: 0.7, color: 0xDDDDDD },
        { innerRadius: 8.5, outerRadius: 9.8, opacity: 0.5, color: 0xCCCCCC },
        { innerRadius: 10.2, outerRadius: 11.5, opacity: 0.4, color: 0xBBBBBB }
    ];
    
    ringData.forEach(ring => {
        const geometry = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 64);
        const material = new THREE.MeshPhongMaterial({
            color: ring.color,
            transparent: true,
            opacity: ring.opacity,
            side: THREE.DoubleSide,
            emissive: ring.color,
            emissiveIntensity: 0.02
        });
        
        const ringMesh = new THREE.Mesh(geometry, material);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.rotation.z = (Math.random() - 0.5) * 0.1;
        
        rings.add(ringMesh);
    });
    
    // Enhanced ring particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 3000;
    const positions = [];
    const colors = [];
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 4.5 + Math.random() * 7;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (Math.random() - 0.5) * 0.15;
        
        positions.push(x, y, z);
        
        // Enhanced ice and rock colors
        const brightness = 0.8 + Math.random() * 0.2;
        colors.push(brightness, brightness, brightness * 0.9);
    }
    
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    rings.add(particles);
    
    planet.add(rings);
    return rings;
}

// Create orbit line visualization
export function createOrbitLine(radius) {
    const geometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 128);
    const material = new THREE.MeshBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    
    const orbitLine = new THREE.Mesh(geometry, material);
    orbitLine.rotation.x = Math.PI / 2;
    
    return orbitLine;
}

// Create a satellite (like the Moon) that orbits a parent planet
export function createSatellite(satelliteInfo, parentPlanet) {
    const geometry = new THREE.SphereGeometry(satelliteInfo.radius, 32, 16);
    
    // Create material with lunar surface characteristics
    const material = new THREE.MeshPhongMaterial({
        color: satelliteInfo.color,
        emissive: satelliteInfo.emissive,
        emissiveIntensity: satelliteInfo.emissiveIntensity,
        shininess: 5, // Low shininess for rocky surface
        specular: 0x111111
    });
    
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
    
    return satellite;
}

// Update planet positions and rotations
export function updatePlanets(planets, deltaTime) {
    planets.forEach(planet => {
        if (planet.userData.name === 'Sun') return;
        
        // Update orbital position
        planet.userData.orbitAngle += planet.userData.orbitSpeed * deltaTime;
        
        // Calculate new position
        const x = Math.cos(planet.userData.orbitAngle) * planet.userData.orbitRadius;
        const z = Math.sin(planet.userData.orbitAngle) * planet.userData.orbitRadius;
        
        planet.position.set(x, 0, z);
        
        // Update planet rotation
        planet.rotation.y += planet.userData.rotationSpeed * deltaTime;
        
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
}

// Enhanced planet sizes based on real ratios (scaled)
export const planetSizes = {
    sun: 5.0,
    mercury: 0.35,
    venus: 0.87,
    earth: 1.0,
    mars: 0.48,
    jupiter: 4.5,
    saturn: 3.8,
    uranus: 1.8,
    neptune: 1.7,
    pluto: 0.18
};

// Planet colors with more realistic representations
export const planetColors = {
    sun: 0xFDB813,      // Golden yellow
    mercury: 0x8C7853,  // Gray-brown
    venus: 0xFFC649,    // Bright yellow-orange  
    earth: 0x6B93D6,    // Blue with white clouds
    mars: 0xCD5C5C,     // Red
    jupiter: 0xD8A06A,  // Orange-brown with bands
    saturn: 0xF5DEB3,   // Pale yellow
    uranus: 0x4FD0E7,   // Ice blue
    neptune: 0x4B70DD,  // Deep blue
    pluto: 0xBDB7A8     // Gray-brown
}; 