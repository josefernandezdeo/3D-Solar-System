import * as THREE from 'three';

// Texture loader
const textureLoader = new THREE.TextureLoader();

// Planet texture URLs (using Solar System Scope textures)
export const textureUrls = {
    sun: 'https://www.solarsystemscope.com/textures/download/2k_sun.jpg',
    mercury: 'https://www.solarsystemscope.com/textures/download/2k_mercury.jpg',
    venus: 'https://www.solarsystemscope.com/textures/download/2k_venus_surface.jpg',
    earth: 'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg',
    mars: 'https://www.solarsystemscope.com/textures/download/2k_mars.jpg',
    jupiter: 'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg',
    saturn: 'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg',
    uranus: 'https://www.solarsystemscope.com/textures/download/2k_uranus.jpg',
    neptune: 'https://www.solarsystemscope.com/textures/download/2k_neptune.jpg'
};

// Alternative: Local texture paths (user's folder structure)
export const localTexturePaths = {
    sun: './textures solar system/2k_sun.jpg',
    mercury: './textures solar system/2k_mercury.jpg',
    venus: './textures solar system/2k_venus_surface.jpg',
    earth: './textures solar system/2k_earth_daymap.jpg',
    mars: './textures solar system/2k_mars.jpg',
    jupiter: './textures solar system/2k_jupiter.jpg',
    saturn: './textures solar system/2k_saturn.jpg',
    uranus: './textures solar system/2k_uranus.jpg',
    neptune: './textures solar system/2k_neptune.jpg'
};

// Alternative file names (in case user has different naming)
export const alternativeTexturePaths = {
    sun: ['./textures solar system/2k_sun.jpg'],
    mercury: ['./textures solar system/2k_mercury.jpg'],
    venus: ['./textures solar system/2k_venus_surface.jpg', './textures solar system/2k_venus_atmosphere.jpg'],
    earth: ['./textures solar system/2k_earth_daymap.jpg'],
    mars: ['./textures solar system/2k_mars.jpg'],
    jupiter: ['./textures solar system/2k_jupiter.jpg'],
    saturn: ['./textures solar system/2k_saturn.jpg'],
    uranus: ['./textures solar system/2k_uranus.jpg'],
    neptune: ['./textures solar system/2k_neptune.jpg']
};

// Cache for loaded textures
const textureCache = new Map();

// Load texture with fallback
export function loadTexture(planetName, useLocal = false) {
    const cacheKey = `${planetName}_${useLocal ? 'local' : 'url'}`;
    
    if (textureCache.has(cacheKey)) {
        console.log(`🗂️ Using cached texture for ${planetName}`);
        return Promise.resolve(textureCache.get(cacheKey));
    }

    return new Promise((resolve, reject) => {
        const texturePath = useLocal ? localTexturePaths[planetName] : textureUrls[planetName];
        
        if (!texturePath) {
            console.error(`❌ No texture path found for ${planetName}`);
            reject(new Error(`No texture path found for ${planetName}`));
            return;
        }

        console.log(`🔍 Attempting to load ${planetName} texture from: ${texturePath}`);

        // Try loading the primary path first
        textureLoader.load(
            texturePath,
            // Success callback
            (texture) => {
                // Configure texture properties
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.flipY = false;
                
                // Cache the texture
                textureCache.set(cacheKey, texture);
                console.log(`✅ Successfully loaded texture for ${planetName} from: ${texturePath}`);
                resolve(texture);
            },
            // Progress callback
            (progress) => {
                if (progress.total > 0) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`📥 Loading ${planetName} texture: ${percent}% (${progress.loaded}/${progress.total} bytes)`);
                }
            },
            // Error callback - try alternative paths if local
            (error) => {
                console.warn(`⚠️ Failed to load ${planetName} from primary path: ${texturePath}`);
                console.warn(`Error details:`, error);
                
                if (useLocal && alternativeTexturePaths[planetName]) {
                    console.log(`🔄 Trying alternative paths for ${planetName}...`);
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

// Load all planet textures
export async function loadAllTextures(useLocal = false) {
    const loadingPromises = Object.keys(textureUrls).map(planetName => 
        loadTexture(planetName, useLocal).catch(error => {
            console.warn(`Failed to load ${planetName} texture:`, error);
            return null; // Return null for failed textures
        })
    );

    const results = await Promise.all(loadingPromises);
    
    // Create texture map
    const textures = {};
    Object.keys(textureUrls).forEach((planetName, index) => {
        textures[planetName] = results[index];
    });

    console.log('🎨 Texture loading complete!');
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