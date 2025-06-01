import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Orbital mechanics for elliptical orbits
export class EllipticalOrbit {
    constructor(semiMajorAxis, eccentricity, inclination = 0, longitudeOfPeriapsis = 0) {
        this.semiMajorAxis = semiMajorAxis; // a
        this.eccentricity = eccentricity; // e
        this.inclination = inclination; // orbital tilt
        this.longitudeOfPeriapsis = longitudeOfPeriapsis; // ω
        this.semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
        
        // Create rotation matrix for orbital plane
        this.rotationMatrix = new THREE.Matrix4();
        this.rotationMatrix.makeRotationFromEuler(new THREE.Euler(
            inclination * Math.PI / 180,
            longitudeOfPeriapsis * Math.PI / 180,
            0
        ));
    }

    // Calculate position at given mean anomaly (0 to 2π)
    getPositionAtAnomaly(meanAnomaly) {
        // Solve Kepler's equation iteratively for eccentric anomaly
        let eccentricAnomaly = meanAnomaly;
        for (let i = 0; i < 5; i++) {
            eccentricAnomaly = meanAnomaly + this.eccentricity * Math.sin(eccentricAnomaly);
        }

        // Calculate true anomaly
        const trueAnomaly = 2 * Math.atan2(
            Math.sqrt(1 + this.eccentricity) * Math.sin(eccentricAnomaly / 2),
            Math.sqrt(1 - this.eccentricity) * Math.cos(eccentricAnomaly / 2)
        );

        // Calculate distance from focus (Sun)
        const radius = this.semiMajorAxis * (1 - this.eccentricity * Math.cos(eccentricAnomaly));

        // Position in orbital plane
        const x = radius * Math.cos(trueAnomaly);
        const z = radius * Math.sin(trueAnomaly);
        const y = 0;

        // Apply orbital rotation
        const position = new THREE.Vector3(x, y, z);
        position.applyMatrix4(this.rotationMatrix);

        return position;
    }

    // Generate orbit path points for visualization
    generateOrbitPath(segments = 128) {
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const meanAnomaly = (i / segments) * Math.PI * 2;
            points.push(this.getPositionAtAnomaly(meanAnomaly));
        }
        return points;
    }
}

// Create orbital path line
export function createEllipticalOrbitLine(orbit, color = 0x444444, opacity = 0.3) {
    const points = orbit.generateOrbitPath();
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: color, 
        transparent: true, 
        opacity: opacity 
    });
    
    return new THREE.Line(geometry, material);
}

// Update planet position using elliptical orbit
export function updateEllipticalOrbit(planet, deltaTime) {
    const data = planet.userData;
    
    if (data.orbit && data.orbitSpeed > 0) {
        // Update mean anomaly
        data.meanAnomaly += data.orbitSpeed * deltaTime;
        if (data.meanAnomaly > Math.PI * 2) {
            data.meanAnomaly -= Math.PI * 2;
        }
        
        // Get new position
        const position = data.orbit.getPositionAtAnomaly(data.meanAnomaly);
        planet.position.copy(position);
    }
}

// Real orbital data (scaled for visualization)
export const realOrbitData = {
    mercury: {
        semiMajorAxis: 15,
        eccentricity: 0.206,
        inclination: 7.0,
        period: 88 // days (scaled)
    },
    venus: {
        semiMajorAxis: 20,
        eccentricity: 0.007,
        inclination: 3.4,
        period: 225
    },
    earth: {
        semiMajorAxis: 25,
        eccentricity: 0.017,
        inclination: 0.0,
        period: 365
    },
    mars: {
        semiMajorAxis: 35,
        eccentricity: 0.094,
        inclination: 1.8,
        period: 687
    },
    jupiter: {
        semiMajorAxis: 65,
        eccentricity: 0.049,
        inclination: 1.3,
        period: 4333
    },
    saturn: {
        semiMajorAxis: 95,
        eccentricity: 0.057,
        inclination: 2.5,
        period: 10759
    },
    uranus: {
        semiMajorAxis: 135,
        eccentricity: 0.046,
        inclination: 0.8,
        period: 30687
    },
    neptune: {
        semiMajorAxis: 165,
        eccentricity: 0.010,
        inclination: 1.8,
        period: 60190
    },
    pluto: {
        semiMajorAxis: 200,
        eccentricity: 0.244,
        inclination: 17.2,
        period: 90560
    }
}; 