import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Texture loader with CORS support
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = 'anonymous'; // Enable CORS for GitHub Pages

// Planet texture URLs - Using reliable CDN sources with guaranteed CORS support
export const textureUrls = {
    sun: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/lava/lavatile.jpg',
    mercury: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/mercury.jpg',
    venus: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/venus_surface.jpg',
    earth: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_atmos_2048.jpg',
    mars: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/mars_1k_color.jpg',
    jupiter: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/jupiter_1024.jpg',
    saturn: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/land/grasslight-big.jpg',
    uranus: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/uranus_1024.jpg',
    neptune: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/neptune_1024.jpg',
    moon: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/moon_1024.jpg'
};

// Backup texture URLs in case primary ones fail
export const backupTextureUrls = {
    sun: 'https://threejs.org/examples/textures/lava/lavatile.jpg',
    mercury: 'https://threejs.org/examples/textures/planets/mercury.jpg',
    venus: 'https://threejs.org/examples/textures/planets/venus_surface.jpg',
    earth: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    mars: 'https://threejs.org/examples/textures/planets/mars_1k_color.jpg',
    jupiter: 'https://threejs.org/examples/textures/planets/jupiter_1024.jpg',
    saturn: 'https://threejs.org/examples/textures/land/grasslight-big.jpg',
    uranus: 'https://threejs.org/examples/textures/planets/uranus_1024.jpg',
    neptune: 'https://threejs.org/examples/textures/planets/neptune_1024.jpg',
    moon: 'https://threejs.org/examples/textures/planets/moon_1024.jpg'
};

// Alternative: Local texture paths (user's folder structure)
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
export function loadTexture(planetName, useLocal = false) {
    const cacheKey = `${planetName}_${useLocal ? 'local' : 'url'}`;
    
    if (textureCache.has(cacheKey)) {
        console.log(`🗂️ Using cached texture for ${planetName}`);
        return Promise.resolve(textureCache.get(cacheKey));
    }

    return new Promise((resolve, reject) => {
        const primaryPath = useLocal ? localTexturePaths[planetName] : textureUrls[planetName];
        const backupPath = backupTextureUrls[planetName];
        
        if (!primaryPath) {
            console.error(`❌ No texture path found for ${planetName}`);
            reject(new Error(`No texture path found for ${planetName}`));
            return;
        }

        console.log(`🔍 Attempting to load ${planetName} texture from: ${primaryPath}`);

        // Try loading the primary path first
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
            // Error callback - try backup URL or alternative paths
            (error) => {
                console.warn(`⚠️ Failed to load ${planetName} from primary path: ${primaryPath}`);
                console.warn(`Error details:`, error);
                
                // Try backup URL first if not using local
                if (!useLocal && backupPath) {
                    console.log(`🔄 Trying backup URL for ${planetName}: ${backupPath}`);
                    textureLoader.load(
                        backupPath,
                        (texture) => {
                            texture.wrapS = THREE.RepeatWrapping;
                            texture.wrapT = THREE.RepeatWrapping;
                            texture.flipY = false;
                            textureCache.set(cacheKey, texture);
                            console.log(`✅ Loaded ${planetName} from backup URL: ${backupPath}`);
                            resolve(texture);
                        },
                        undefined,
                        (backupError) => {
                            console.warn(`⚠️ Backup URL also failed for ${planetName}`);
                            if (useLocal && alternativeTexturePaths[planetName]) {
                                console.log(`🔄 Trying alternative local paths for ${planetName}...`);
                                tryAlternativePaths(planetName, resolve, reject);
                            } else {
                                console.error(`❌ All texture sources failed for ${planetName}`);
                                reject(backupError);
                            }
                        }
                    );
                } else if (useLocal && alternativeTexturePaths[planetName]) {
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

// Load all planet textures with GitHub Pages compatibility
export async function loadAllTextures(useLocal = false) {
    console.log('🎨 Starting texture loading...', useLocal ? 'LOCAL mode' : 'REMOTE mode');
    
    // For GitHub Pages, detect if we're running on localhost vs deployed
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.hostname === '';
    
    // On GitHub Pages, always use remote textures for faster loading
    const shouldTryLocal = useLocal && isLocalhost;
    
    console.log('🌍 Environment:', isLocalhost ? 'LOCALHOST' : 'GITHUB PAGES');
    console.log('📂 Will try local textures:', shouldTryLocal);

    const planetNames = Object.keys(textureUrls);
    const textures = {};

    // For GitHub Pages, use shorter timeout and skip local textures entirely
    const timeout = isLocalhost ? 5000 : 3000; // 3 seconds for GitHub Pages
    
    // Load textures with automatic fallback
    for (const planetName of planetNames) {
        try {
            let texture = null;
            
            // Only try local if we're on localhost
            if (shouldTryLocal) {
                console.log(`🔍 Trying local texture for ${planetName}...`);
                try {
                    const localPromise = loadTexture(planetName, true);
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Local timeout')), 1000)
                    );
                    texture = await Promise.race([localPromise, timeoutPromise]);
                    console.log(`✅ Loaded ${planetName} from LOCAL`);
                } catch (error) {
                    console.warn(`⚠️ Local texture failed for ${planetName}, trying remote...`);
                }
            }
            
            // If local failed or we're on GitHub Pages, try remote with timeout
            if (!texture) {
                console.log(`🌐 Loading remote texture for ${planetName}...`);
                try {
                    const remotePromise = loadTexture(planetName, false);
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Remote timeout')), timeout)
                    );
                    texture = await Promise.race([remotePromise, timeoutPromise]);
                    console.log(`✅ Loaded ${planetName} from REMOTE`);
                } catch (error) {
                    console.warn(`⚠️ Remote texture failed for ${planetName}:`, error);
                }
            }
            
            textures[planetName] = texture;
            
        } catch (error) {
            console.error(`💥 Critical error loading ${planetName}:`, error);
            textures[planetName] = null;
        }
    }

    const successCount = Object.values(textures).filter(t => t !== null).length;
    console.log(`🎯 Texture loading complete: ${successCount}/${planetNames.length} successful`);
    
    // For GitHub Pages, if no textures loaded, don't wait - just continue
    if (!isLocalhost && successCount === 0) {
        console.warn('🚨 GitHub Pages: No textures loaded, continuing with fallback colors immediately');
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