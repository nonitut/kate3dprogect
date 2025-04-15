import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Создание сцены
const scene = new THREE.Scene();

// Создание камеры
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

// Создание рендерера
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas2'),
    alpha:true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// document.body.appendChild(renderer.domElement);

const gltfloader = new GLTFLoader();
let model;
gltfloader.load('../models/Create_a_3D_model_of__0318103040_texture.glb', (gltf) => {
    model = gltf.scene;
    const glassmaterial = new THREE.MeshPhysicalMaterial({
        color:0xffffff,
        transmission: 1,
        ior: 5,
        thickness: 5,
        roughness: 0,
        metalness: 0,
        envMapIntensity: 5,
    });
    model.traverse((child) => {
        if (child.isMesh) {
            child.material = glassmaterial;
        }
    })
    model.scale.set(7, 7, 7);
    model.position.set(0, 0, -10);
    scene.add (model);
});

// Загрузка шрифта
const fontLoader = new FontLoader();
let font;

fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (loadedFont) => {
    font = loadedFont;
    init(); // Инициализация сцены после загрузки шрифта
});

function init() {
    // Создание сфер и текстовых объектов
    const spheres = [];
    const textMeshes = [];

    const textes = ['ferrous sulfate', 'agalsidase alfa', 'dalteparin sodium', 'isotretinoin', 'gramicidin S'];

    for (let i = 0; i < 5; i++) {
        // Создаем сферу
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.1),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        spheres.push(sphere);
        scene.add(sphere);

        // Создаем 3D-текст
        const textMesh = create3DText(textes[i]);
        textMeshes.push(textMesh);
        scene.add(textMesh);
    }

    spheres.push(spheres[0]);

    // Создание геометрии для линий
    const lineGeometry = new LineGeometry();
    const lineMaterial = new LineMaterial({ color: 0xffffff, linewidth: 2 });
    
    // Используем THREE.Line вместо THREE.LineLoop
    const line = new Line2(lineGeometry, lineMaterial);
    scene.add(line);

    // Функция для обновления позиций сфер и текстовых объектов
    function updateSpheres(spheres, textMeshes, time) {
        const radius = 6; // Радиус траектории
        const speed = 0.2; // Скорость движения

        spheres[0].position.x = Math.sin(time * speed) * radius;
        spheres[0].position.y = Math.sin(time * speed * 2) * radius;

        spheres[1].position.x = Math.sin(time * speed * 1.5) * radius;
        spheres[1].position.y = Math.sin(time * speed * 3) * radius;

        spheres[2].position.x = Math.sin(time * speed * 2) * radius;
        spheres[2].position.y = Math.sin(time * speed * 4) * radius;

        spheres[3].position.x = Math.sin(time * speed * 2.5) * radius;
        spheres[3].position.y = Math.sin(time * speed * 5) * radius;

        spheres[4].position.x = Math.sin(time * speed * 3) * radius;
        spheres[4].position.y = Math.sin(time * speed * 6) * radius;

        // Обновляем позиции текстовых объектов
        textMeshes.forEach((textMesh, index) => {
            textMesh.position.copy(spheres[index].position);
            textMesh.position.y += 0.5; // Смещаем текст немного выше сферы
        });
    }
    // Функция для обновления геометрии линий
    function updateLineGeometry(line, spheres) {
        const points = spheres.map(sphere => [sphere.position.x, sphere.position.y, sphere.position.z]).flat();
        line.setPositions(points);
    }

    // Анимация
    function animate() {
        requestAnimationFrame(animate);

        // Обновление позиций сфер и текстовых объектов
        const time = performance.now() * 0.001; // Время в секундах
        updateSpheres(spheres, textMeshes, time);

        // Обновление геометрии линии
        updateLineGeometry(lineGeometry, spheres);

        // Рендеринг сцены
        renderer.render(scene, camera);
    }

    // Запуск анимации
    animate();
}

// Функция для создания 3D-текста
function create3DText(text, color = 0xffffff) {
    const textGeometry = new TextGeometry(text, {
        font: font,
        size: 0.2, // Размер текста
        height: 0.1, // Толщина текста
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: color });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    // Центрируем текст
    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    textMesh.position.x = -textWidth / 2; // Центрирование по горизонтали

    return textMesh;
}

// Обработчик изменения размера окна
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Обновление размера рендерера
    renderer.setSize(width, height);

    // Обновление соотношения сторон камеры
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});