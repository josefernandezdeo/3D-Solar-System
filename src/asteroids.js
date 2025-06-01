import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Create asteroid belt between Mars and Jupiter
export function createAsteroidBelt(innerRadius = 40, outerRadius = 60, count = 1500) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    // Generate random asteroids
    for (let i = 0; i < count; i++) {
        // Random position in belt
        const angle = Math.random() * Math.PI * 2;
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        
        // Add some vertical spread
        const y = (Math.random() - 0.5) * 3;
        
        // Slight elliptical variation
        const radiusVariation = 1 + (Math.random() - 0.5) * 0.3;
        const x = Math.cos(angle) * radius * radiusVariation;
        const z = Math.sin(angle) * radius * radiusVariation;
        
        positions.push(x, y, z);
        
        // Random asteroid colors (browns and grays)
        const colorVariation = 0.3 + Math.random() * 0.4;
        colors.push(
            colorVariation * 0.6, // R
            colorVariation * 0.4, // G
            colorVariation * 0.3  // B
        );
        
        // Random sizes
        sizes.push(0.5 + Math.random() * 1.5);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    // Asteroid material
    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const asteroids = new THREE.Points(geometry, material);
    
    // Add orbital data for slow rotation
    asteroids.userData = {
        rotationSpeed: 0.001,
        originalPositions: [...positions]
    };

    return asteroids;
}

// Create larger individual asteroids (Ceres, Vesta, etc.)
export function createMajorAsteroids() {
    const majorAsteroids = [];
    
    const asteroidData = [
        { name: 'Ceres', radius: 0.15, distance: 45, color: 0x8C7853, speed: 0.008 },
        { name: 'Vesta', radius: 0.08, distance: 48, color: 0x9C8563, speed: 0.007 },
        { name: 'Pallas', radius: 0.07, distance: 52, color: 0x7C6843, speed: 0.006 },
        { name: 'Hygiea', radius: 0.06, distance: 55, color: 0x6C5833, speed: 0.005 }
    ];

    asteroidData.forEach(data => {
        const geometry = new THREE.SphereGeometry(data.radius, 12, 8);
        const material = new THREE.MeshLambertMaterial({ color: data.color });
        const asteroid = new THREE.Mesh(geometry, material);
        
        // Random starting position
        const angle = Math.random() * Math.PI * 2;
        asteroid.position.x = Math.cos(angle) * data.distance;
        asteroid.position.z = Math.sin(angle) * data.distance;
        asteroid.position.y = (Math.random() - 0.5) * 2;
        
        asteroid.userData = {
            name: data.name,
            orbitRadius: data.distance,
            orbitSpeed: data.speed,
            rotationSpeed: 0.01 + Math.random() * 0.02,
            orbitAngle: angle
        };
        
        asteroid.castShadow = true;
        asteroid.receiveShadow = true;
        
        majorAsteroids.push(asteroid);
    });

    return majorAsteroids;
}

// Update asteroid belt rotation
export function updateAsteroidBelt(asteroidBelt, deltaTime) {
    if (asteroidBelt.userData.rotationSpeed) {
        asteroidBelt.rotation.y += asteroidBelt.userData.rotationSpeed * deltaTime;
    }
}

// Update major asteroids
export function updateMajorAsteroids(asteroids, deltaTime) {
    asteroids.forEach(asteroid => {
        const data = asteroid.userData;
        
        // Rotate asteroid
        asteroid.rotation.x += data.rotationSpeed * deltaTime;
        asteroid.rotation.y += data.rotationSpeed * deltaTime * 0.7;
        
        // Orbital motion
        if (data.orbitRadius > 0) {
            data.orbitAngle += data.orbitSpeed * deltaTime;
            
            asteroid.position.x = Math.cos(data.orbitAngle) * data.orbitRadius;
            asteroid.position.z = Math.sin(data.orbitAngle) * data.orbitRadius;
        }
    });
}

// Create asteroid belt orbit guide lines
export function createAsteroidBeltGuides(innerRadius, outerRadius) {
    const guides = [];
    
    // Inner belt boundary
    const innerPoints = [];
    const outerPoints = [];
    
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        innerPoints.push(new THREE.Vector3(
            Math.cos(angle) * innerRadius,
            0,
            Math.sin(angle) * innerRadius
        ));
        outerPoints.push(new THREE.Vector3(
            Math.cos(angle) * outerRadius,
            0,
            Math.sin(angle) * outerRadius
        ));
    }
    
    const innerGeometry = new THREE.BufferGeometry().setFromPoints(innerPoints);
    const outerGeometry = new THREE.BufferGeometry().setFromPoints(outerPoints);
    const material = new THREE.LineBasicMaterial({ 
        color: 0x666666, 
        transparent: true, 
        opacity: 0.2 
    });
    
    guides.push(new THREE.Line(innerGeometry, material));
    guides.push(new THREE.Line(outerGeometry, material));
    
    return guides;
} 