import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Texture loader with CORS support
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = 'anonymous'; // Enable CORS for GitHub Pages

// Local texture paths (user's folder structure) - used for both localhost and GitHub Pages
export const localTexturePaths = {
    sun: './textures%20solar%20system/2k_sun.jpg',
    mercury: './textures%20solar%20system/2k_mercury.jpg',
    venus: './textures%20solar%20system/2k_venus_surface.jpg',
    earth: './textures%20solar%20system/2k_earth_daymap.jpg',
    mars: './textures%20solar%20system/2k_mars.jpg',
    jupiter: './textures%20solar%20system/2k_jupiter.jpg',
    saturn: './textures%20solar%20system/2k_saturn.jpg',
    uranus: './textures%20solar%20system/2k_uranus.jpg',
    neptune: './textures%20solar%20system/2k_neptune.jpg',
    moon: './textures%20solar%20system/2k_moon.jpg'
};

// Alternative file names (in case user has different naming)
export const alternativeTexturePaths = {
    sun: ['./textures%20solar%20system/2k_sun.jpg', './textures solar system/2k_sun.jpg'],
    mercury: ['./textures%20solar%20system/2k_mercury.jpg', './textures solar system/2k_mercury.jpg'],
    venus: ['./textures%20solar%20system/2k_venus_surface.jpg', './textures%20solar%20system/2k_venus_atmosphere.jpg', './textures solar system/2k_venus_surface.jpg'],
    earth: ['./textures%20solar%20system/2k_earth_daymap.jpg', './textures solar system/2k_earth_daymap.jpg'],
    mars: ['./textures%20solar%20system/2k_mars.jpg', './textures solar system/2k_mars.jpg'],
    jupiter: ['./textures%20solar%20system/2k_jupiter.jpg', './textures solar system/2k_jupiter.jpg'],
    saturn: ['./textures%20solar%20system/2k_saturn.jpg', './textures solar system/2k_saturn.jpg'],
    uranus: ['./textures%20solar%20system/2k_uranus.jpg', './textures solar system/2k_uranus.jpg'],
    neptune: ['./textures%20solar%20system/2k_neptune.jpg', './textures solar system/2k_neptune.jpg'],
    moon: ['./textures%20solar%20system/2k_moon.jpg', './textures solar system/2k_moon.jpg']
};

// Cache for loaded textures
const textureCache = new Map();

// Load texture with fallback and backup URLs
export function loadTexture(planetName, useLocal = true) {
    const cacheKey = `${planetName}_local`;
    
    if (textureCache.has(cacheKey)) {
        console.log(`🗂️ Using cached texture for ${planetName}`);
        return Promise.resolve(textureCache.get(cacheKey));
    }

    return new Promise((resolve, reject) => {
        const primaryPath = localTexturePaths[planetName];
        
        if (!primaryPath) {
            console.error(`❌ No texture path found for ${planetName}`);
            reject(new Error(`No texture path found for ${planetName}`));
            return;
        }

        console.log(`🔍 Attempting to load ${planetName} texture from: ${primaryPath}`);

        // Try loading the primary local path first
        textureLoader.load(
            primaryPath,
            // Success callback
            (texture) => {
                // Configure texture properties
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.flipY = false;
                
                // Cache the texture
                textureCache.set(cacheKey, texture);
                console.log(`✅ Successfully loaded texture for ${planetName} from: ${primaryPath}`);
                resolve(texture);
            },
            // Progress callback
            (progress) => {
                if (progress.total > 0) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`📥 Loading ${planetName} texture: ${percent}% (${progress.loaded}/${progress.total} bytes)`);
                }
            },
            // Error callback - try alternative paths
            (error) => {
                console.warn(`⚠️ Failed to load ${planetName} from primary path: ${primaryPath}`);
                console.warn(`Error details:`, error);
                
                if (alternativeTexturePaths[planetName]) {
                    console.log(`🔄 Trying alternative local paths for ${planetName}...`);
                    tryAlternativePaths(planetName, resolve, reject);
                } else {
                    console.error(`❌ No alternatives available for ${planetName}, rejecting`);
                    reject(error);
                }
            }
        );
    });
}

// Try alternative texture paths
function tryAlternativePaths(planetName, resolve, reject) {
    const alternatives = alternativeTexturePaths[planetName];
    let attemptIndex = 0;

    function tryNext() {
        if (attemptIndex >= alternatives.length) {
            reject(new Error(`All texture paths failed for ${planetName}`));
            return;
        }

        const currentPath = alternatives[attemptIndex];
        console.log(`🔄 Trying alternative path for ${planetName}: ${currentPath}`);

        textureLoader.load(
            currentPath,
            // Success
            (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.flipY = false;
                
                const cacheKey = `${planetName}_local`;
                textureCache.set(cacheKey, texture);
                console.log(`✅ Loaded ${planetName} texture from alternative path: ${currentPath}`);
                resolve(texture);
            },
            // Progress
            undefined,
            // Error - try next alternative
            (error) => {
                attemptIndex++;
                tryNext();
            }
        );
    }

    tryNext();
}

// Load all planet textures with GitHub Pages compatibility
export async function loadAllTextures(useLocal = false) {
    console.log('🎨 Starting texture loading...');
    
    // For GitHub Pages, detect if we're running on localhost vs deployed
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.hostname === '';
    
    console.log('🌍 Environment:', isLocalhost ? 'LOCALHOST' : 'GITHUB PAGES');
    console.log('🎨 Loading textures from textures solar system folder...');

    const planetNames = Object.keys(localTexturePaths);
    const textures = {};
    
    // Load textures for both localhost and GitHub Pages
    for (const planetName of planetNames) {
        try {
            console.log(`🔍 Loading texture for ${planetName}...`);
            const texturePromise = loadTexture(planetName, true);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Texture timeout')), 5000)
            );
            const texture = await Promise.race([texturePromise, timeoutPromise]);
            textures[planetName] = texture;
            console.log(`✅ Loaded ${planetName} texture successfully`);
        } catch (error) {
            console.warn(`⚠️ Texture failed for ${planetName}, using fallback color:`, error.message);
            textures[planetName] = null;
        }
    }

    const successCount = Object.values(textures).filter(t => t !== null).length;
    console.log(`🎯 Texture loading complete: ${successCount}/${planetNames.length} successful`);
    
    if (successCount === 0) {
        console.log('🎨 No textures loaded - using beautiful fallback colors');
    } else {
        console.log(`🎨 Using ${successCount} textures + ${planetNames.length - successCount} fallback colors`);
    }
    
    return textures;
}

// Enhanced texture configuration for different planet types
export function configureTexture(texture, planetType) {
    if (!texture) return;

    switch (planetType) {
        case 'sun':
            // Sun should glow and not repeat
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            break;
        
        case 'gas_giant':
            // Gas giants have atmospheric bands
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            break;
        
        case 'terrestrial':
            // Rocky planets need detailed surface features
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            break;
        
        default:
            // Default configuration
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
    }

    return texture;
}

// Create material with texture and fallback color
export function createTexturedMaterial(planetInfo, texture) {
    const materialProps = {
        color: texture ? 0xffffff : planetInfo.color, // White if textured, color if not
        emissive: planetInfo.emissive,
        emissiveIntensity: planetInfo.emissiveIntensity,
        shininess: planetInfo.name === 'Sun' ? 0 : 30,
        specular: planetInfo.name === 'Sun' ? 0x000000 : 0x111111
    };

    // Add texture if available
    if (texture) {
        materialProps.map = texture;
        
        // Special handling for the Sun
        if (planetInfo.name === 'Sun') {
            // Sun should be self-illuminated
            materialProps.emissiveMap = texture;
            materialProps.emissive = 0xffffff;
            materialProps.emissiveIntensity = 0.8;
            console.log(`🌟 Applied Sun texture with emissive properties`);
        } else {
            console.log(`🪐 Applied texture to ${planetInfo.name}`);
        }
    } else {
        console.log(`⚠️ No texture available for ${planetInfo.name}, using fallback color`);
    }

    return new THREE.MeshPhongMaterial(materialProps);
} 