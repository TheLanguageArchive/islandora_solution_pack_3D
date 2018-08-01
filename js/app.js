/**
 * Displaying 3D models
 *
 * Usage: var viewer = new SP3DViewer({url: '', container: '#container', width: 500, height: 500, background: ''})
 *        viewer.animate();
 *
 * @author  Ibrahim Abdullah <ibrahim@mpi.nl>
 * @package Islandora SP 3D
 */
function SP3DViewer(options) {

    if (!options.url) {
        throw new Error('No url specified');
    }

    if (!options.container || typeof options.container !== 'string') {
        throw new Error('No container selector specified');
    }

    if (!options.background) {
        throw new Error('No background color specified');
    }

    this.options = {

        url: options.url,
        container: options.container,
        background: options.background,
        antialias: options.antialias || true,
    };

    this.scene    = null;
    this.controls = null;
    this.camera   = null;
    this.renderer = null;
    this.clock    = null;

    this.initialize();
}

SP3DViewer.prototype = {

    /**
     * Initializing scene, camera and model
     */
    initialize: function() {

        this.prepareContainer();
        this.prepareLight();
        this.getScene().add(this.getCamera());
        this.prepareModel();
    },

    /**
     * Setting up scene + fog
     */
    getScene: function() {

        if (null === this.scene) {

            this.scene     = new THREE.Scene();
            this.scene.fog = new THREE.FogExp2(Drupal.settings.islandora_sp_3d.settings.background, 0.0003);
        }

        return this.scene;
    },

    /**
     * Setting up perspective camera
     */
    getCamera() {

        if (null === this.camera) {

            this.angle       = 45;
            this.aspectRatio = this.options.width / this.options.height;
            this.near        = 0.1;
            this.far         = 1000;

            this.camera = new THREE.PerspectiveCamera(this.angle, this.aspectRatio, this.near, this.far);
            this.camera.position.set(0, 0, 0);

            this.cameraHelper = new THREE.CameraHelper(this.camera);
        }

        return this.camera;
    },

    /**
     * Setting up renderer
     */
    getRenderer: function() {

        if (null === this.renderer) {

            this.renderer = new THREE.WebGLRenderer({
                antialias: this.options.antialias
            });

            this.renderer.setSize(this.options.width, this.options.height);
            this.renderer.setClearColor(this.getScene().fog.color);
        }

        return this.renderer;
    },

    /**
     * preparing container for render
     */
    prepareContainer: function() {

        this.container = document.querySelector(this.options.container);

        this.options.width  = this.container.clientWidth;
        this.options.height = this.container.clientWidth;

        this.container.appendChild(this.getRenderer().domElement);
    },

    /**
     * Allow for mouse to control 3D model
     */
    getControls: function() {

        if (null === this.controls) {

            this.controls             = new THREE.OrbitControls(this.getCamera(), this.container);
            this.controls.target      = new THREE.Vector3(0, 0, -100);
            this.controls.maxDistance = 250;
            this.controls.minDistance = 40;

            this.controls.dollyIn(3);
        }

        return this.controls;
    },

    /**
     * Setting up clock for animation
     */
    getClock: function() {

        if (null === this.clock) {
            this.clock = new THREE.Clock();
        }

        return this.clock;
    },

    /**
     * Preparing light in scene
     */
    prepareLight: function() {
        this.scene.add(new THREE.AmbientLight(0xFFFFFF));
    },

    /**
     * Loading model and replacing relative image path
     * to an absolute path
     *
     * @note because THREE.ColladaLoader already loads the image
     *       before we can change the path, three.collada.loader.js has
     *       been edited to call #parseImageUrl after parsing the XML
     */
    prepareModel: function() {

        var self   = this;
        var loader = new THREE.ColladaLoader();

        // removing path from loader to allow for own path override
        loader.setPath('');

        // adding parseImageUrl to replace relative path to absolute path
        THREE.ColladaLoader.prototype.parseImageUrl = function(image) {

            image = image.basename();

            if (typeof Drupal.settings.islandora_sp_3d.images[image] !== 'undefined') {
                return Drupal.settings.islandora_sp_3d.images[image];
            }

            return image;
        };

        loader.load(this.options.url, function(collada) {

            var mesh = collada.scene;

            mesh.traverse(function(child) {

                if (child instanceof THREE.SkinnedMesh) {

                    var animation = new THREE.Animation(child, child.geometry.animation);
                    animation.play();
                }

                if (typeof child.geometry !== 'undefined') {
                    // child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 0));
                }
            });

            var scale = 1;
            mesh.position.set(0, 0, -100);
            mesh.scale.set(scale, scale, scale);

            self.getScene().add(mesh);

            var box = new THREE.Box3().setFromObject(mesh);
            var boundingBoxSize = box.max.sub(box.min);
            var height = boundingBoxSize.y;

            mesh.position.y = (height / 2) *-1;
        });
    },

    /**
     * Updating controls after animation run
     */
    update: function() {
        this.getControls().update(this.getClock().getDelta());
    },

    /**
     * Rendering scene (every 60 frames p/s)
     */
    render: function() {
        this.getRenderer().render(this.getScene(), this.getCamera());
    },

    /**
     * Starting animation (every 60 frames p/s)
     */
    animate: function() {

        requestAnimationFrame(this.animate.bind(this));
        this.render();
        this.update();
    },

    /**
     * Updating dimensions
     */
    updateDimensions: function() {

        this.options.width  = this.container.clientWidth;
        this.options.height = this.container.clientWidth;

        this.getCamera().aspectRatio = this.options.width / this.options.height;
        this.getCamera().updateProjectionMatrix();

        this.getRenderer().setSize(this.options.width, this.options.height);
    }
};

window.attachEventListener = function(event, func) {

    if (window.addEventListener) {
        window.addEventListener(event, func, false);
    } else if (window.attachEvent) {
        window.attachEvent('on' + event, func);
    } else {
        window['on' + resize] = func;
    }
};

var onPageLoaded = function() {

    var viewer = new SP3DViewer({

        url: Drupal.settings.islandora_sp_3d.url,
        container: '[data-role="webgl-container"]',
        background: Drupal.settings.islandora_sp_3d.settings.background
    });

    viewer.animate();
    window.attachEventListener('resize', viewer.updateDimensions.bind(viewer));
};

window.attachEventListener('load', onPageLoaded);
