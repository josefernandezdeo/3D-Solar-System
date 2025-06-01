import * as THREE from 'three';

export class CameraManager {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.planets = [];
        
        // Camera modes
        this.mode = 'free';
        this.followTarget = null;
        this.transitionSpeed = 0.05;
        this.isTransitioning = false;
        
        // Free roam properties
        this.freeRadius = 120;
        this.freeTheta = Math.PI / 4;
        this.freePhi = Math.PI / 6;
        
        // Follow mode properties
        this.followDistance = 15;
        this.followHeight = 8;
        this.followOffset = new THREE.Vector3();
        
        // Overview mode properties
        this.overviewDistance = 300;
        this.overviewHeight = 150;
        
        // Transition properties
        this.targetPosition = new THREE.Vector3();
        this.targetLookAt = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        
        // Animation properties
        this.animationSpeed = 1;
        this.smoothFactor = 0.1;
        
        // Mouse/touch controls
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDownX = 0;
        this.mouseDownY = 0;
        
        this.setupControls();
    }

    setupControls() {
        // Mouse controls
        document.addEventListener('mousedown', (event) => this.onMouseDown(event));
        document.addEventListener('mouseup', () => this.onMouseUp());
        document.addEventListener('mousemove', (event) => this.onMouseMove(event));
        
        // Improved wheel event handling for zoom
        document.addEventListener('wheel', (event) => {
            event.preventDefault(); // Prevent page scrolling
            this.onWheel(event);
        }, { passive: false });
        
        // Touch controls
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
                
                if (this.mode === 'free') {
                    this.freeTheta -= deltaX * 0.01;
                    this.freePhi -= deltaY * 0.01;
                    this.freePhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.freePhi));
                }
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
                this.zoom(zoomFactor);
            }
            
            touches = currentTouches;
        });
    }

    onMouseDown(event) {
        // Only handle left mouse button for camera controls
        if (event.button !== 0) return;
        
        this.isMouseDown = true;
        this.mouseDownX = event.clientX;
        this.mouseDownY = event.clientY;
        console.log('🖱️ Mouse down at:', this.mouseDownX, this.mouseDownY);
    }

    onMouseUp() {
        this.isMouseDown = false;
        console.log('🖱️ Mouse up');
    }

    onMouseMove(event) {
        if (!this.isMouseDown || this.mode !== 'free') return;
        
        const deltaX = event.clientX - this.mouseDownX;
        const deltaY = event.clientY - this.mouseDownY;
        
        console.log('🖱️ Mouse move delta:', deltaX, deltaY);
        
        this.freeTheta -= deltaX * 0.01;
        this.freePhi -= deltaY * 0.01;
        this.freePhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.freePhi));
        
        this.mouseDownX = event.clientX;
        this.mouseDownY = event.clientY;
    }

    onWheel(event) {
        console.log('🔍 Zoom event:', event.deltaY, 'Current mode:', this.mode);
        this.zoom(event.deltaY * 0.2);
    }

    zoom(delta) {
        console.log('⚙️ Zoom delta:', delta, 'Mode:', this.mode);
        
        switch (this.mode) {
            case 'free':
                const oldRadius = this.freeRadius;
                this.freeRadius += delta;
                this.freeRadius = Math.max(30, Math.min(400, this.freeRadius));
                console.log('🎥 Free mode zoom:', oldRadius, '->', this.freeRadius);
                break;
            case 'follow':
                const oldFollowDistance = this.followDistance;
                this.followDistance += delta * 0.1;
                this.followDistance = Math.max(5, Math.min(50, this.followDistance));
                console.log('🎯 Follow mode zoom:', oldFollowDistance, '->', this.followDistance);
                break;
            case 'overview':
                const oldOverviewDistance = this.overviewDistance;
                this.overviewDistance += delta;
                this.overviewDistance = Math.max(200, Math.min(500, this.overviewDistance));
                console.log('🌌 Overview mode zoom:', oldOverviewDistance, '->', this.overviewDistance);
                break;
        }
    }

    setPlanets(planets) {
        this.planets = planets;
    }

    setMode(mode, target = null) {
        this.mode = mode;
        this.followTarget = target;
        this.isTransitioning = true;
        
        // Calculate target camera position based on mode
        switch (mode) {
            case 'free':
                this.setFreeMode();
                break;
            case 'follow':
                this.setFollowMode(target);
                break;
            case 'overview':
                this.setOverviewMode();
                break;
        }
    }

    setFreeMode() {
        // Smooth transition to free roam mode
        this.calculateFreePosition();
        this.targetLookAt.set(0, 0, 0);
    }

    setFollowMode(planetName) {
        if (!planetName || !this.planets) return;
        
        const planet = this.planets.find(p => 
            p.userData.name.toLowerCase() === planetName.toLowerCase()
        );
        
        if (planet) {
            this.followTarget = planet;
            this.calculateFollowPosition();
        }
    }

    setOverviewMode() {
        this.targetPosition.set(0, this.overviewHeight, this.overviewDistance);
        this.targetLookAt.set(0, 0, 0);
    }

    calculateFreePosition() {
        this.targetPosition.x = this.freeRadius * Math.sin(this.freePhi) * Math.cos(this.freeTheta);
        this.targetPosition.y = this.freeRadius * Math.cos(this.freePhi);
        this.targetPosition.z = this.freeRadius * Math.sin(this.freePhi) * Math.sin(this.freeTheta);
    }

    calculateFollowPosition() {
        if (!this.followTarget) return;
        
        const planetPos = this.followTarget.position.clone();
        const offset = new THREE.Vector3(
            this.followDistance * Math.cos(Date.now() * 0.0005),
            this.followHeight,
            this.followDistance * Math.sin(Date.now() * 0.0005)
        );
        
        this.targetPosition.copy(planetPos).add(offset);
        this.targetLookAt.copy(planetPos);
    }

    zoomToPlanet(planetName) {
        const planet = this.planets.find(p => 
            p.userData.name.toLowerCase() === planetName.toLowerCase()
        );
        
        if (planet) {
            const planetPos = planet.position.clone();
            const radius = planet.userData.name === 'Sun' ? 20 : 
                          planet.userData.name === 'Jupiter' ? 15 : 
                          planet.userData.name === 'Saturn' ? 18 : 10;
            
            // Position camera at an angle to show the planet nicely
            const offset = new THREE.Vector3(radius * 1.5, radius * 0.5, radius * 1.2);
            this.targetPosition.copy(planetPos).add(offset);
            this.targetLookAt.copy(planetPos);
            this.isTransitioning = true;
        }
    }

    followPlanet(planetName) {
        this.setMode('follow', planetName);
    }

    resetView() {
        this.mode = 'free';
        this.freeRadius = 120;
        this.freeTheta = Math.PI / 4;
        this.freePhi = Math.PI / 6;
        this.followTarget = null;
        this.calculateFreePosition();
        this.targetLookAt.set(0, 0, 0);
        this.isTransitioning = true;
    }

    update(deltaTime) {
        switch (this.mode) {
            case 'free':
                this.updateFreeMode();
                break;
            case 'follow':
                this.updateFollowMode();
                break;
            case 'overview':
                this.updateOverviewMode();
                break;
        }
        
        // Smooth camera transitions
        if (this.isTransitioning) {
            this.updateTransition();
        }
    }

    updateFreeMode() {
        // Always calculate and apply the free position
        this.calculateFreePosition();
        
        // Apply position immediately if not transitioning
        if (!this.isTransitioning) {
            this.camera.position.copy(this.targetPosition);
            this.camera.lookAt(this.targetLookAt);
        }
    }

    updateFollowMode() {
        if (this.followTarget) {
            this.calculateFollowPosition();
            
            // Update immediately without transition for follow mode
            if (!this.isTransitioning) {
                this.camera.position.copy(this.targetPosition);
                this.camera.lookAt(this.targetLookAt);
            }
        }
    }

    updateOverviewMode() {
        // Slowly rotate around the solar system in overview mode
        const time = Date.now() * 0.0002;
        this.targetPosition.x = this.overviewDistance * Math.cos(time);
        this.targetPosition.y = this.overviewHeight;
        this.targetPosition.z = this.overviewDistance * Math.sin(time);
        this.targetLookAt.set(0, 0, 0);
        
        if (!this.isTransitioning) {
            this.camera.position.copy(this.targetPosition);
            this.camera.lookAt(this.targetLookAt);
        }
    }

    updateTransition() {
        // Smooth position transition
        this.camera.position.lerp(this.targetPosition, this.transitionSpeed);
        
        // Smooth look-at transition
        const currentLookDirection = new THREE.Vector3();
        this.camera.getWorldDirection(currentLookDirection);
        const targetLookDirection = this.targetLookAt.clone().sub(this.camera.position).normalize();
        
        currentLookDirection.lerp(targetLookDirection, this.transitionSpeed);
        const lookAtPoint = this.camera.position.clone().add(currentLookDirection);
        this.camera.lookAt(lookAtPoint);
        
        // Check if transition is complete
        const positionDistance = this.camera.position.distanceTo(this.targetPosition);
        if (positionDistance < 1) {
            this.isTransitioning = false;
        }
    }

    // Cinematic camera movements
    createCinematicSequence(planets) {
        const sequence = [
            { mode: 'overview', duration: 3000 },
            { mode: 'zoom', target: 'sun', duration: 2000 },
            { mode: 'follow', target: 'earth', duration: 3000 },
            { mode: 'zoom', target: 'jupiter', duration: 2000 },
            { mode: 'zoom', target: 'saturn', duration: 2000 },
            { mode: 'overview', duration: 2000 }
        ];
        
        return this.playSequence(sequence);
    }

    async playSequence(sequence) {
        for (const step of sequence) {
            if (step.mode === 'zoom') {
                this.zoomToPlanet(step.target);
            } else {
                this.setMode(step.mode, step.target);
            }
            
            await this.wait(step.duration);
        }
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Camera shake for dramatic effect
    addCameraShake(intensity = 1, duration = 500) {
        const originalPosition = this.camera.position.clone();
        const startTime = Date.now();
        
        const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < duration) {
                const shakeAmount = intensity * (1 - elapsed / duration);
                this.camera.position.x = originalPosition.x + (Math.random() - 0.5) * shakeAmount;
                this.camera.position.y = originalPosition.y + (Math.random() - 0.5) * shakeAmount;
                this.camera.position.z = originalPosition.z + (Math.random() - 0.5) * shakeAmount;
                requestAnimationFrame(shake);
            } else {
                this.camera.position.copy(originalPosition);
            }
        };
        
        shake();
    }

    // Performance optimization: Level of Detail (LOD) based on camera distance
    updateLOD() {
        if (!this.planets) return;
        
        this.planets.forEach(planet => {
            const distance = this.camera.position.distanceTo(planet.position);
            
            // Adjust planet detail based on distance
            if (planet.geometry) {
                let segments = 32;
                if (distance > 100) segments = 16;
                if (distance > 200) segments = 8;
                if (distance > 300) segments = 6;
                
                // Only update if segments changed significantly
                if (Math.abs(planet.geometry.parameters?.widthSegments - segments) > 4) {
                    const newGeometry = new THREE.SphereGeometry(
                        planet.geometry.parameters.radius,
                        segments,
                        segments / 2
                    );
                    planet.geometry.dispose();
                    planet.geometry = newGeometry;
                }
            }
        });
    }

    // Get camera info for UI display
    getCameraInfo() {
        return {
            mode: this.mode,
            position: this.camera.position.clone(),
            target: this.followTarget?.userData?.name || 'None',
            distance: this.mode === 'free' ? this.freeRadius : 
                     this.mode === 'follow' ? this.followDistance : 
                     this.overviewDistance
        };
    }

    // Save and restore camera states
    saveState() {
        return {
            mode: this.mode,
            freeRadius: this.freeRadius,
            freeTheta: this.freeTheta,
            freePhi: this.freePhi,
            followTarget: this.followTarget?.userData?.name,
            followDistance: this.followDistance,
            overviewDistance: this.overviewDistance,
            position: this.camera.position.clone(),
            rotation: this.camera.rotation.clone()
        };
    }

    restoreState(state) {
        this.mode = state.mode;
        this.freeRadius = state.freeRadius;
        this.freeTheta = state.freeTheta;
        this.freePhi = state.freePhi;
        this.followDistance = state.followDistance;
        this.overviewDistance = state.overviewDistance;
        
        if (state.followTarget) {
            this.setFollowMode(state.followTarget);
        }
        
        this.camera.position.copy(state.position);
        this.camera.rotation.copy(state.rotation);
    }
} 