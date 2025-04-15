import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {RGBELoader} from "three/examples/jsm/Addons.js";
document.addEventListener('DOMContentLoaded', function (){
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 20);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas1'),
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// document.body.appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xffffff, 1);
light.position.set(10,10,10);
scene.add (light);

const directlight = new THREE.DirectionalLight(0xffffff, 1)
directlight.position.set(5, 5, 10);
scene.add (directlight);

const rgbeloader = new RGBELoader();
const pmremgenerator = new THREE.PMREMGenerator(renderer);
pmremgenerator.compileEquirectangularShader();
rgbeloader.load('HDRI/kloppenheim_06_puresky_4k.hdr', (hdrmap) => {
    const envMap = pmremgenerator.fromEquirectangular(hdrmap).texture;
    scene.background = envMap;
    scene.environment = envMap;
    hdrmap.dispose();
    pmremgenerator.dispose();
})

const gltfloader = new GLTFLoader();
let model;
gltfloader.load('models/heart.glb', (gltf) => {
    model = gltf.scene;
    const glassmaterial = new THREE.MeshPhysicalMaterial({
    color:0xffffff,
    transmission: 1,
    ior: 2,
    thickness: 5,
    roughness: 0,
    metalness: 0,
    envMapIntensity: 10
    });
    model.traverse((child) => {
        if (child.isMesh) {
            child.material = glassmaterial;
        }
    })
    model.scale.set(8, 8, 8);
    scene.add (model);
})

const cursor = {
x:0,
y:0
}

window.addEventListener('mousemove', (event) => {
cursor.x = -(event.clientX/window.innerWidth - 0.5);
cursor.y = event.clientY/window.innerHeight - 0.5
});

window.addEventListener('resize', () =>{
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
});

function animate(){
    renderer.render(scene, camera);
    camera.position.x = cursor.x*10;
    camera.position.y = cursor.y*10;
    if (model){
        camera.lookAt(model.position);     
    }
    
}

renderer.setAnimationLoop(animate);
})