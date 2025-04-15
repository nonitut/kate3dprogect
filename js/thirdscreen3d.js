import * as THREE from 'three';
import * as CANNON from 'cannon'; // npm install three cannon
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Масштабный коэффициент
const scale = 0.02; // 1 единица сцены = 50 пикселей (1 / scale = 50)

// Сцена
const scene = new THREE.Scene();

// Камера (OrthographicCamera)
const camera = new THREE.OrthographicCamera(
    -window.innerWidth * scale, // left
    window.innerWidth * scale,  // right
    window.innerHeight * scale, // top
    -window.innerHeight * scale, // bottom
    0.1,                       // near
    1000                       // far (увеличено для охвата всей глубины контейнера)
);
camera.position.set(0, 10, 10); // Позиция камеры
camera.lookAt(0, 10, 0);       // Камера смотрит в центр контейнера

// Рендерер
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#canvas3'), antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// document.body.appendChild(renderer.domElement);

// Освещение
const light = new THREE.DirectionalLight(0xffffff, 5);
light.position.set(5, 10, 7.5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// Физический мир
const world = new CANNON.World();
world.gravity.set(0, -20, 0);

// Материал для столкновений
// Материал, который описывает физические свойства отдельного объекта, назначается телу
const defaultMaterial = new CANNON.Material('default'); // Создаём материал с именем 'default' (для удобства отладки)
// Материал, который описывает, как два материала взаимодействуют друг с другом, назначается миру
const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 1, // трение от 0 до 1
    restitution: 0.3, // упругость, отскок от 0 до 1
});
world.addContactMaterial(defaultContactMaterial); // Добавляем материал взаимодействия в мир
world.defaultContactMaterial = defaultContactMaterial; // Задаём материал взаимодействия по умолчанию, он используется, если для конкретной пары материалов не задан явный ContactMaterial

// Размеры контейнера
const containerWidth = window.innerWidth * scale; // Ширина контейнера (соответствует ширине экрана)
const containerDepth = 1000 * scale;                   // Глубина контейнера (уменьшена)
const containerHeight = window.innerHeight * scale * 2; // Высота контейнера (соответствует высоте экрана)

// Дно
const groundShape = new CANNON.Plane(); // Создаём бесконечную плоскость
const groundBody = new CANNON.Body({ mass: 0 }); // Создаём физическое тело, оно статическое из-за нулевой массы, иначе стало бы динамическим
groundBody.addShape(groundShape); // Добавляем форму shape к телу body. Тело может состоять из одной или нескольких форм
// quaternion — это способ представления вращения в трёхмерном пространстве.
// Метод setFromAxisAngle задаёт вращение тела вокруг определённой оси (ось X) на заданный угол (90 градусов по часовой стрелке) в радианах.
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); // Поворачиваем плоскость горизонтально
groundBody.position.set(0, -5, 0); // Указываем позицию тела в мире
world.addBody(groundBody); // Теперь groundBody будет участвовать в физических расчётах

// Стены (используем Plane)
// Массив с информацией о позиции и повороте каждой стены
const wallPositions = [
    { position: new CANNON.Vec3(0, containerHeight / 2, -containerDepth / 2), rotation: new CANNON.Vec3(0, 0, 0) }, // Задняя стена, без поворота
    { position: new CANNON.Vec3(0, containerHeight / 2, containerDepth / 2), rotation: new CANNON.Vec3(0, Math.PI, 0) }, // Передняя стена, поворот на 180 градусов вокруг Y
    { position: new CANNON.Vec3(-containerWidth, containerHeight, 0), rotation: new CANNON.Vec3(0, Math.PI / 2, 0) }, // Левая стена, поворот на 90 градусов вокруг Y
    { position: new CANNON.Vec3(containerWidth, containerHeight, 0), rotation: new CANNON.Vec3(0, -Math.PI / 2, 0) }, // Правая стена, поворот на -90 градусов вокруг Y
];
wallPositions.forEach(wall => {
    const wallShape = new CANNON.Plane();
    const wallBody = new CANNON.Body({ mass: 0 });
    wallBody.addShape(wallShape);
    wallBody.position.copy(wall.position);

    // Поворачиваем плоскость
    // Поворот стен задаётся с помощью кватернионов (quaternion). Метод setFromEuler преобразует углы Эйлера (в радианах) в кватернион.
    wallBody.quaternion.setFromEuler(wall.rotation.x, wall.rotation.y, wall.rotation.z);

    wallBody.material = defaultMaterial; // Используем тот же материал, что и для дна
    world.addBody(wallBody);
});

// Загрузка модели GLB
const loader = new GLTFLoader();
let model;
const models = [];

loader.load('models/Create_a_3D_model_of__0318103040_texture.glb', (gltf) => {
    model = gltf.scene;
    model.scale.set(4, 4, 4); // Увеличиваем масштаб модели

    // Создаем 40 моделей
    for (let i = 0; i < 40; i++) {
        const clone = model.clone(); // Создаём копию model
        const body = new CANNON.Body({
            mass: 1, // масса делает тело динамическим
            shape: new CANNON.Sphere(4),
            material: defaultMaterial, // Используем тот же материал, что и для стенок
        });
    
        body.position.set(
            (Math.random() - 0.5) * (containerWidth - 5), // Оставляем зазор от стенок
            25 + Math.random() * 5,
            (Math.random() - 0.5) * (containerDepth - 5)
        );
        world.addBody(body);
        scene.add(clone);
        models.push({ mesh: clone, body }); // Cвязываем визуальное представление модели (mesh) с её физическим телом (body)
        // Визуальное представление (mesh) отображается на экране, управляется Three.js, не знает о физике
        // Физическое тело (body) обрабатывает физику (гравитация, столкновения), управляется Cannon.js, не знает о визуализации
    }
});

// Взаимодействие с мышью
// Raycaster — это инструмент в Three.js, который "бросает" луч из камеры в направлении указателя мыши и проверят, 
// с какими объектами в сцене этот луч пересекается.
const raycaster = new THREE.Raycaster();
// Сохраняем координаты мыши в нормализованной системе координат, т.е. координаты мыши преобразуются из пикселей экрана в диапазон [-1, 1], где:
// (-1, -1) — левый нижний угол экрана, (1, 1) — правый верхний угол экрана, (0, 0) — центр экрана.
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    // Нормализуем координаты мыши по X и Y в диапазон от -1 до 1
    // event.clientX и event.clientY - это координаты мыши в пикселях относительно левого верхнего угла окна браузера.
    // Нормализация: делим координату X на ширину окна браузера, получаем значение в диапазоне [0, 1]
    // Умножаем на 2 и вычитаем 1, чтобы преобразовать диапазон [0, 1] в [-1, 1]
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    // Умножаем на -1, чтобы инвертировать ось Y (в Three.js ось Y направлена вверх, а в браузере — вниз)
    // Затем умножаем на 2 и прибавляем 1, чтобы преобразовать диапазон [0, 1] в [-1, 1].
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Функция для проверки расстояния и приложения силы
function applyForceFromMouse() {
    // Устанавливаем начальную точку луча в позицию камеры, направляем луч в точку, соответствующую координатам мыши на экране
    raycaster.setFromCamera(mouse, camera); // нормализованные координаты мыши передаются в Raycaster для определения направления луча

    // Проверяем каждого барашка
    models.forEach(model => {
        // Вычисляем расстояние от курсора до барашка только по осям X и Y
        const cursorPosition = new THREE.Vector3(); // Вектор, в который будет записана вычисленная ниже точка
        raycaster.ray.at(0, cursorPosition); // Вычисляем точку в мировых координатах на луче (raycaster.ray) на определённом расстоянии от начала луча (t: 0)
        // Вычисляем расстояние до курсора
        // разница между позицией модели (model.body.position) и позицией курсора (cursorPosition) по осям X и Y
        const distanceX = model.body.position.x - cursorPosition.x;
        const distanceY = model.body.position.y - cursorPosition.y;
        // расстояние между моделью и курсором в 2D-плоскости (по осям X и Y) по формуле евклидова расстояния между двумя точками
        const distanceToMouse = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Если курсор находится достаточно близко к барашку
        if (distanceToMouse < 3) { // 5 - радиус взаимодействия
            // Вычисляем направление от курсора к барашку
            const direction = new CANNON.Vec3(
                distanceX,
                distanceY,
                0 
            );

            // Нормализуем направление, т.е. приводим вектора к единичной длине (длине 1), сохраняя его направление, и избегаем деления на ноль
            // Чтобы направление было единичным вектором, который можно масштабировать на любую силу (forceStrength)
            const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            if (length > 0) {
                direction.x /= length;
                direction.y /= length;
            }

            // Прикладываем силу к барашку
            const forceStrength = 15; // Сила отталкивания
            // Изменяем скорость тела
            model.body.velocity.x += direction.x * forceStrength;
            model.body.velocity.y += direction.y * forceStrength;
            model.body.velocity.z += 0; // Оставляем Z неизменным
        }
    });
}

// Анимация
function animate() {
    // Встроенная функция браузера, которая вызывает переданную функцию перед следующей перерисовкой экрана (обычно 60 раз в секунду)
    requestAnimationFrame(animate);

    // Обновляем физику
    world.step(1 / 60);

    // Применяем силу от курсора
    applyForceFromMouse();

    // Синхронизируем Three.js и Cannon.js
    models.forEach(model => {
        model.mesh.position.copy(model.body.position);
        model.mesh.quaternion.copy(model.body.quaternion);
    });

    // Рендеринг, отрисовка сцены
    renderer.render(scene, camera);
}
// Чтобы остановить анимацию, нужно не вызывать requestAnimationFrame
animate();

// Обработчик изменения размера окна
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);

    // Обновляем границы камеры
    camera.left = -width * scale;
    camera.right = width * scale;
    camera.top = height * scale;
    camera.bottom = -height * scale;
    camera.updateProjectionMatrix();
});