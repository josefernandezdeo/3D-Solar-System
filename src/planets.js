import * as THREE from 'three';

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
        orbitSpeed: 0.008 // Much slower orbital speed
    },
    venus: {
        name: 'Venus',
        radius: 0.9,
        color: 0xFFC649,
        emissive: 0x664319,
        emissiveIntensity: 0.08,
        rotationSpeed: -0.0002, // Retrograde rotation, much slower
        orbitRadius: 20,
        orbitSpeed: 0.006 // Much slower orbital speed
    },
    earth: {
        name: 'Earth',
        radius: 1,
        color: 0x6B93D6,
        emissive: 0x1E2F45,
        emissiveIntensity: 0.06,
        rotationSpeed: 0.002, // Much slower
        orbitRadius: 25,
        orbitSpeed: 0.004 // Much slower orbital speed
    },
    mars: {
        name: 'Mars',
        radius: 0.5,
        color: 0xCD5C5C,
        emissive: 0x4A1F1F,
        emissiveIntensity: 0.07,
        rotationSpeed: 0.0018, // Much slower
        orbitRadius: 35,
        orbitSpeed: 0.003 // Much slower orbital speed
    },
    jupiter: {
        name: 'Jupiter',
        radius: 4.5,
        color: 0xD8A06A,
        emissive: 0x5C4229,
        emissiveIntensity: 0.04,
        rotationSpeed: 0.005, // Fast rotation but slower than before
        orbitRadius: 65,
        orbitSpeed: 0.0006 // Much slower orbital speed
    },
    saturn: {
        name: 'Saturn',
        radius: 3.8,
        color: 0xF5DEB3,
        emissive: 0x665A47,
        emissiveIntensity: 0.04,
        rotationSpeed: 0.0045, // Fast rotation but slower
        orbitRadius: 95,
        orbitSpeed: 0.0004, // Much slower orbital speed
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
        orbitSpeed: 0.0002 // Much slower orbital speed
    },
    neptune: {
        name: 'Neptune',
        radius: 1.7,
        color: 0x4B70DD,
        emissive: 0x1E2C59,
        emissiveIntensity: 0.05,
        rotationSpeed: 0.0038, // Slower
        orbitRadius: 165,
        orbitSpeed: 0.00016 // Much slower orbital speed
    },
    pluto: {
        name: 'Pluto',
        radius: 0.2,
        color: 0xBDB7A8,
        emissive: 0x4A453E,
        emissiveIntensity: 0.08,
        rotationSpeed: 0.0012, // Slower
        orbitRadius: 200,
        orbitSpeed: 0.00006 // Much slower orbital speed
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
        const warmth = Math.random() * 0.1;
        colors.push(brightness, brightness - warmth, brightness - warmth * 2);
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

// Create orbit line for visualization
export function createOrbitLine(radius) {
    const points = [];
    const segments = 64;
    
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        ));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: 0x444444, 
        transparent: true, 
        opacity: 0.3 
    });
    
    return new THREE.Line(geometry, material);
}

// Update planet positions and rotations (legacy for circular orbits)
export function updatePlanets(planets, deltaTime) {
    planets.forEach(planet => {
        const data = planet.userData;
        
        // Rotate planet on its axis
        planet.rotation.y += data.rotationSpeed;
        
        // Update orbital position (skip sun)
        if (data.orbitRadius > 0) {
            data.orbitAngle += data.orbitSpeed * deltaTime;
            
            planet.position.x = Math.cos(data.orbitAngle) * data.orbitRadius;
            planet.position.z = Math.sin(data.orbitAngle) * data.orbitRadius;
        }
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