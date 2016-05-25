(function () {
    
    'use strict';

    var camera, scene, renderer, light, ambientLight,
        player, effect, controls, emitter;

    var boxId = 0;

    /**
     * 生成される落下ボックス
     *
     * @param {THREE.Vector3} position 生成位置
     * @param {THREE.Vector3} angularvelocity 回転速度
     */
    function Box(position, angularVelocity) {

        THREE.Object3D.call(this);

        var geo = new THREE.BoxGeometry(1, 1, 1);
        var mat = new THREE.MeshLambertMaterial({
            color: 0xff3333
        });

        var mesh = new THREE.Mesh(geo, mat);

        this.name = 'Box-' + (boxId++);
        this.angularVelocity = angularVelocity;
        this.position.copy(position);

        this.add(mesh);
    }
    Box.prototype = Object.create(THREE.Object3D.prototype);
    Box.prototype.constructor = Box;
    Box.prototype.update = function () {
        this.rotation.x += this.angularVelocity.x;
        this.rotation.y += this.angularVelocity.y;
        this.rotation.z += this.angularVelocity.z;
    };


    /**
     * エミッター
     *
     * @param {THREE.Scene} scene
     */
    function Emitter(scene) {
        this.pool = [];
        this.scene = scene;
    }
    Emitter.prototype = {
        constructor: Emitter,

        update: function () {
            this.pool.forEach(function (box, i) {
                box.update();
            });
        },

        emit: function () {
            var position = this.randomPosition();
            var velocity = this.randomVelocity();
            var box = new Box(position, velocity);
            this.add(box);
        },

        add: function (obj) {
            if (~this.pool.indexOf(obj)) {
                return;
            }

            this.scene.add(obj);
            this.pool.push(obj);
        },

        remove: function (obj) {
            if (!~this.pool.indexOf(obj)) {
                return;
            }

            var index = this.pool.indexOf(obj);
            this.pool.splice(index, 1);
        },

        randomPosition: function () {
            var x = Math.random() * 1;
            var y = Math.random() * 1;
            var z = Math.random() * 1;
            return new THREE.Vector3(x, y, z);
        },

        randomVelocity: function () {
            var x = Math.random() * 0.01;
            var y = Math.random() * 0.01;
            var z = Math.random() * 0.01;
            return new THREE.Vector3(x, y, z);
        }
    };

    function setupCamera() {
        player = new THREE.Object3D();
        player.name = 'player';
        player.position.set(0, 1.4, 3);

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        player.add(camera);

        controls = new THREE.VRControls(camera);

        scene.add(player);
    }

    function setupScene() {
        window.scene = scene = new THREE.Scene();
    }

    function setupRenderer() {
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000);

        effect = new THREE.VREffect(renderer);

        document.body.appendChild(renderer.domElement);
    }

    function setupLight() {
        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, -3, 4);
        scene.add(light);

        ambientLight = new THREE.AmbientLight(0x333333);
        scene.add(ambientLight);
    }

    function setupObjects() {
        emitter = new Emitter(scene);
        emitter.emit();

        // box = new Box(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.001, 0.001, 0.02));

        // scene.add(box);

        var texture = new THREE.TextureLoader().load('img/background.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        var skyboxGeo = new THREE.SphereGeometry(100, 32, 32);
        var skyboxMat = new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            map: texture
        });
        var skybox = new THREE.Mesh(skyboxGeo, skyboxMat);
        skybox.name = 'skybox';
        scene.add(skybox);
    }

    function update() {
        // renderer.render(scene, camera);
        controls.update();
        emitter.update();
        effect.render(scene, camera);
    }

    function main() {
        setupScene();
        setupCamera();
        setupRenderer();
        setupLight();
        setupObjects();

        (function loop() {
            requestAnimationFrame(loop);

            update();
        }());
    }

    document.addEventListener('DOMContentLoaded', main ,false);

}());
