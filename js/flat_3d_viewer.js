// The bare "three" specifier is resolved by the import map rendered in
// flat_3d_viewer_attachments(); the add-on loaders are loaded from the
// locally vendored copies (relative to this file) so no CDN is required.
import * as THREE from 'three';
import { ColladaLoader } from './vendor/three/loaders/ColladaLoader.js';
import { FBXLoader } from './vendor/three/loaders/FBXLoader.js';
import { OrbitControls } from './vendor/three/controls/OrbitControls.js';

(function (Drupal, drupalSettings) {
    'use strict';

    Drupal.behaviors.flat3dViewer = {
        attach: function (context, settings) {
            const elements = once('flat3dViewer', '#flat-3d-viewer', context);
            elements.forEach((container) => {
                const url = container.getAttribute('data-url');
                const textures = JSON.parse(container.getAttribute('data-textures') || '{}');
                const background = (drupalSettings.flat_3d_viewer && drupalSettings.flat_3d_viewer.background) || container.getAttribute('data-background') || '#eeeeee';

                const viewer = new Flat3DViewer(container, url, textures, background);

                const initViewer = () => {
                    try {
                        viewer.init();
                        viewer.animate();
                        window.addEventListener('resize', () => viewer.onWindowResize(), false);
                    } catch (e) {
                        console.error('FLAT 3D: Error during initialization:', e);
                    }
                };

                setTimeout(() => initViewer(), 0);
            });
        }
    };

    class Flat3DViewer {
        constructor(container, url, textures, background) {
            this.container = container;
            this.url = url;
            this.textures = textures;
            this.background = background;

            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.controls = null;
            this.clock = new THREE.Clock();
            this.mixer = null; // For animations
        }

        init() {
            // Scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(this.background);
            this.scene.fog = new THREE.FogExp2(this.background, 0.0003);

            // Camera
            const width = this.container.clientWidth;
            const height = this.container.clientHeight || 500;
            this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
            this.camera.position.set(100, 100, 100);

            // Renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(width, height);
            // Better color management and brightness
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.5;
            this.container.appendChild(this.renderer.domElement);

            // Controls
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;

            // Lights - Pushed to maximum for extreme visibility
            const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
            this.scene.add(ambientLight);

            const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
            hemiLight.position.set(0, 50, 0);
            this.scene.add(hemiLight);

            // Front Right (Key)
            const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
            mainLight.position.set(5, 5, 5);
            this.scene.add(mainLight);

            // Front Left (Fill)
            const fillLight = new THREE.DirectionalLight(0xffffff, 1.8);
            fillLight.position.set(-5, 5, 5);
            this.scene.add(fillLight);

            // Back
            const backLight = new THREE.DirectionalLight(0xffffff, 1.5);
            backLight.position.set(0, 5, -5);
            this.scene.add(backLight);

            // Loading Manager for textures
            const manager = new THREE.LoadingManager();
            manager.crossOrigin = 'anonymous';
            manager.setURLModifier((url) => {
                const filename = url.split(/[\\/]/).pop();
                if (this.textures[filename]) {
                    return this.textures[filename];
                }
                return url;
            });

            // Loader - Support for DAE and FBX
            const ext = this.url.split('.').pop().toLowerCase();
            let loader;

            if (ext === 'fbx') {
                loader = new FBXLoader(manager);
            } else {
                loader = new ColladaLoader(manager);
            }

            loader.load(this.url, (result) => {
                const avatar = (ext === 'fbx') ? result : result.scene;

                // For FBX, we might need to adjust lighting or materials specifically
                if (ext === 'fbx') {
                    // FBX models often come with their own lights which can be dim. 
                    // We remove them to rely on our own balanced lighting.
                    avatar.traverse((node) => {
                        if (node.isLight) {
                            node.visible = false;
                        }
                    });
                    // Boost exposure for FBX specifically
                    this.renderer.toneMappingExposure = 1.8;
                }

                // Traverse and fix materials
                avatar.traverse((node) => {
                    if (node.isMesh) {
                        if (node.material) {
                            // Convert arrays to single materials if needed
                            const materials = Array.isArray(node.material) ? node.material : [node.material];

                            const fixedMaterials = materials.map(mat => {
                                // For FBX, convert to MeshStandardMaterial for better PBR response
                                if (ext === 'fbx') {
                                    const newMat = new THREE.MeshStandardMaterial({
                                        map: mat.map,
                                        color: mat.color ? mat.color.clone().multiplyScalar(1.4) : 0xffffff,
                                        roughness: 0.8,
                                        metalness: 0.1,
                                        side: THREE.DoubleSide,
                                        transparent: mat.transparent,
                                        opacity: mat.opacity
                                    });
                                    if (mat.normalMap) newMat.normalMap = mat.normalMap;
                                    return newMat;
                                }

                                mat.transparent = false;
                                mat.opacity = 1;
                                mat.side = THREE.DoubleSide;

                                if (mat.map) {
                                    mat.map.needsUpdate = true;
                                }
                                mat.needsUpdate = true;
                                return mat;
                            });

                            node.material = Array.isArray(node.material) ? fixedMaterials : fixedMaterials[0];
                        }
                    }
                });

                // Center the model
                const box = new THREE.Box3().setFromObject(avatar);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                avatar.position.x += (avatar.position.x - center.x);
                avatar.position.y += (avatar.position.y - center.y);
                avatar.position.z += (avatar.position.z - center.z);

                this.scene.add(avatar);

                // Adjust camera to fit
                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = this.camera.fov * (Math.PI / 180);
                let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
                cameraZ *= 1.5; // zoom out a bit to fit comfortably

                this.camera.position.set(cameraZ, cameraZ, cameraZ);
                this.camera.lookAt(new THREE.Vector3(0, 0, 0));

                if (this.controls) {
                    this.controls.target.set(0, 0, 0);
                    this.controls.update();
                }

                // Animations if any
                let animations = result.animations;
                if (!animations && avatar.animations) {
                    animations = avatar.animations;
                }

                if (animations && animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(avatar);
                    this.mixer.clipAction(animations[0]).play();
                }
            });
        }

        onWindowResize() {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight || 500;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }

        animate() {
            requestAnimationFrame(this.animate.bind(this));
            this.render();
        }

        render() {
            const delta = this.clock.getDelta();
            if (this.mixer) {
                this.mixer.update(delta);
            }
            if (this.controls) {
                this.controls.update();
            }
            this.renderer.render(this.scene, this.camera);
        }
    }

})(Drupal, drupalSettings);
