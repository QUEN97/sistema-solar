import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Datos de los planetas del sistema solar con información detallada
const planetas = [
  {
    nombre: 'Sol',
    distancia: '0 km',
    temperatura: '5505 °C',
    orbitaRadio: 0,
    orbitaVelocidad: 0,
    tamaño: 7.2,
    textura: '/textures/sun.jpg',
    infoExtra: 'El Sol es una estrella de tipo espectral G2V, centro del sistema solar y fuente de energía.',
    datoCurioso: 'Cada segundo, el Sol convierte 600 millones de toneladas de hidrógeno en helio.'
  },
  {
    nombre: 'Mercurio',
    distancia: '57.9 M km',
    temperatura: '167 °C',
    orbitaRadio: 14.4,
    orbitaVelocidad: 0.02,
    tamaño: 1.26,
    textura: '/textures/mercury.jpg',
    infoExtra: 'Mercurio es el planeta más cercano al Sol y tiene la superficie más craterizada.',
    datoCurioso: 'Un día en Mercurio dura casi 59 días terrestres.'
  },
  {
    nombre: 'Venus',
    distancia: '108.2 M km',
    temperatura: '464 °C',
    orbitaRadio: 21.6,
    orbitaVelocidad: 0.015,
    tamaño: 1.62,
    textura: '/textures/venus.jpg',
    infoExtra: 'Venus tiene una atmósfera muy densa y es el planeta más caliente del sistema solar.',
    datoCurioso: 'Venus gira en sentido contrario a la mayoría de los planetas del sistema solar.'
  },
  {
    nombre: 'Tierra',
    distancia: '149.6 M km',
    temperatura: '15 °C',
    orbitaRadio: 28.8,
    orbitaVelocidad: 0.01,
    tamaño: 1.8,
    textura: '/textures/earth.jpg',
    infoExtra: 'La Tierra es el único planeta conocido con vida y posee agua en estado líquido.',
    datoCurioso: 'El 71% de la superficie terrestre está cubierta por agua.'
  },
  {
    nombre: 'Marte',
    distancia: '227.9 M km',
    temperatura: '-65 °C',
    orbitaRadio: 36,
    orbitaVelocidad: 0.008,
    tamaño: 1.44,
    textura: '/textures/mars.jpg',
    infoExtra: 'Marte es conocido como el planeta rojo y tiene el volcán más grande del sistema solar.',
    datoCurioso: 'Marte tiene el volcán más alto conocido: el Monte Olimpo, de 21 km de altura.'
  },
  {
    nombre: 'Júpiter',
    distancia: '778.3 M km',
    temperatura: '-110 °C',
    orbitaRadio: 46.8,
    orbitaVelocidad: 0.006,
    tamaño: 4.5,
    textura: '/textures/jupiter.jpg',
    infoExtra: 'Júpiter es el gigante gaseoso más grande y tiene una gran mancha roja.',
    datoCurioso: 'Júpiter es tan grande que cabrían más de 1,300 Tierras dentro de él.'
  },
  {
    nombre: 'Saturno',
    distancia: '1.4 B km',
    temperatura: '-140 °C',
    orbitaRadio: 57.6,
    orbitaVelocidad: 0.005,
    tamaño: 3.6,
    textura: '/textures/saturn.jpg',
    infoExtra: 'Saturno es famoso por sus impresionantes anillos compuestos de hielo y roca.',
    datoCurioso: 'Los anillos de Saturno están formados en un 90% por hielo de agua.'
  },
  {
    nombre: 'Urano',
    distancia: '2.9 B km',
    temperatura: '-195 °C',
    orbitaRadio: 68.4,
    orbitaVelocidad: 0.004,
    tamaño: 3.06,
    textura: '/textures/uranus.jpg',
    infoExtra: 'Urano rota de lado, lo que genera estaciones extremas y únicas.',
    datoCurioso: 'Urano es el único planeta que rota casi completamente de lado.'
  },
  {
    nombre: 'Neptuno',
    distancia: '4.5 B km',
    temperatura: '-200 °C',
    orbitaRadio: 79.2,
    orbitaVelocidad: 0.003,
    tamaño: 2.88,
    textura: '/textures/neptune.jpg',
    infoExtra: 'Neptuno es el planeta más alejado y tiene vientos extremadamente fuertes.',
    datoCurioso: 'Los vientos en Neptuno pueden superar los 2,000 km/h, los más rápidos del sistema solar.'
  },
];

// Datos de la Luna
const luna = {
  nombre: 'Luna',
  textura: '/textures/moon.jpg',
  orbitaRadio: 3.6,
  orbitaVelocidad: 0.0005,
  tamaño: 0.72
};

// Datos de la Estación Espacial Internacional
const iss = {
  nombre: 'ISS',
  textura: '/textures/iss.png',
  orbitaRadio: 2.4,
  orbitaVelocidad: 0.02,
  tamaño: 0.24
};

// Configuración del cinturón de asteroides
const cinturónAsteroides = {
  innerRadius: 39,
  outerRadius: 44,
  count: 200,
  tamañoMin: 0.05,
  tamañoMax: 0.15,
  velocidadMin: 0.002,
  velocidadMax: 0.006,
};

// Variables globales del sistema
let orbitLines = [];
let missionStarted = false;
let selectedObject = null;
let originalOrbitSpeeds = {};
let controls;
let controlsEnabled = false;
let camera, scene, renderer;
let planetMeshes = [];
let planetMeshesMap = new Map();
let planetOrbitAngles = new Array(planetas.length).fill(0);
let lunaMesh = null;
let lunaOrbitAngle = 0;
let saturnRings = null;
let issMesh = null;
let cinturónMeshes = [];
let cinturónOrbitAngles = [];
let alineados = false;
let planetaVisitadoIndex = 0;
let audioStarted = false;
let typewriterTimeout = null;

const ROTACION_VELOCIDAD = 0.005;
const lookAtTarget = new THREE.Vector3();

/**
 * Inicializa la escena 3D principal con todos los elementos del sistema solar
 */
export function initScene() {
  const canvas = document.getElementById('scene');
  if (!canvas) return;

  // Configuración del canvas
  canvas.style.position = 'absolute';
  canvas.style.zIndex = '1';
  canvas.style.pointerEvents = 'auto';

  // Crear escena, cámara y renderizador
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.set(0, 10, 60);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Configurar controles de órbita para navegación
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 2;
  controls.maxDistance = 50;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 0.8;
  controls.enabled = false;

  // Configurar iluminación de la escena
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  // Luz especial para el Sol, punto central
  const sunLight = new THREE.PointLight(0xffffff, 4, 5000);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  // Crear fondo estelar
  const starTexture = new THREE.TextureLoader().load('/textures/starfield.jpg');
  const starGeo = new THREE.SphereGeometry(200, 64, 64);
  const starMat = new THREE.MeshBasicMaterial({
    map: starTexture,
    side: THREE.BackSide
  });
  const starMesh = new THREE.Mesh(starGeo, starMat);
  scene.add(starMesh);

  // Crear todos los elementos del sistema solar
  crearPlanetas();
  crearLuna();
  crearISS();
  crearCinturónAsteroides();
  crearPolvoAsteroides();
  crearOrbitLines();

  // Configurar actualizaciones periódicas
  setInterval(updateDateTime, 1000);

  // Inicializar efectos de cabina después de cargar la escena
  setTimeout(initCockpitEffects, 2000);

  // Configuración inicial de cámara
  lookAtTarget.set(0, 0, 0);
  camera.lookAt(lookAtTarget);

  // Configurar eventos y animación
  onWindowResize();
  animate();

  // Eventos personalizados para cambiar entre planetas
  window.addEventListener('cambiarPlaneta', e => {
    controls.enabled = false;
    controlsEnabled = false;
    moveCameraToPlanet(e.detail);
  });

  window.addEventListener('explorarPlaneta', e => {
    const idx = e.detail;
    if (planetas[idx].nombre === 'Saturno') {
      explorarSaturno(idx);
    } else {
      moveCameraClose(idx);
    }
  });

  // Eventos del sistema
  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('click', onClick, false);
  document.body.addEventListener('click', startAudio);
}

/**
 * Crea las líneas circulares que muestran las órbitas de los planetas
 */
function crearOrbitLines() {
  // Limpiar órbitas existentes
  orbitLines.forEach(line => scene.remove(line));
  orbitLines = [];

  // Crear órbitas para cada planeta
  planetas.forEach(p => {
    if (p.orbitaRadio > 0) {
      const orbitGeometry = new THREE.BufferGeometry();
      const points = [];
      const segments = 64;

      // Calcular puntos para la órbita circular
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(angle) * p.orbitaRadio,
          0,
          Math.sin(angle) * p.orbitaRadio
        ));
      }

      orbitGeometry.setFromPoints(points);
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3
      });

      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbitLine);
      orbitLines.push(orbitLine);
    }
  });

  // Crear órbita especial para la Luna alrededor de la Tierra
  if (lunaMesh) {
    const orbitGeometry = new THREE.BufferGeometry();
    const points = [];
    const segments = 32;
    const tierraIndex = planetas.findIndex(p => p.nombre === 'Tierra');
    const tierraPos = planetMeshes[tierraIndex].position;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        tierraPos.x + Math.cos(angle) * luna.orbitaRadio,
        0,
        tierraPos.z + Math.sin(angle) * luna.orbitaRadio
      ));
    }

    orbitGeometry.setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.2
    });

    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbitLine);
    orbitLines.push(orbitLine);
  }
}

/**
 * Actualiza la fecha y hora actual en la interfaz HUD
 */
function updateDateTime() {
  const now = new Date();
  document.getElementById('current-date').textContent = now.toLocaleDateString();
  document.getElementById('current-time').textContent = now.toLocaleTimeString();
}

/**
 * Inicia la música ambiental del espacio (solo una vez)
 */
function startAudio() {
  if (audioStarted) return;
  const audio = new Audio('/audio/space-ambient.mp3');
  audio.loop = true;
  audio.volume = 0.5;
  audio.play();
  audioStarted = true;
}

/**
 * Ajusta el tamaño de la escena cuando cambia el tamaño de la ventana
 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Ajustes específicos para dispositivos móviles
  if (window.innerWidth < 768) {
    camera.position.z = 40;
    camera.position.y = 8;
  } else {
    camera.position.z = 60;
    camera.position.y = 10;
  }
}

/**
 * Crea todos los planetas del sistema solar como esferas 3D con texturas
 */
function crearPlanetas() {
  const loader = new THREE.TextureLoader();
  planetMeshes = [];
  planetMeshesMap.clear();

  planetas.forEach(p => {
    const size = p.tamaño;
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const texture = loader.load(p.textura);
    
    // Material especial para el Sol, estándar para planetas
    const material = p.nombre === 'Sol'
      ? new THREE.MeshBasicMaterial({ map: texture })
      : new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.2,
        roughness: 0.4,
      });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(p.orbitaRadio, 0, 0);
    mesh.userData.sizeOriginal = size;
    scene.add(mesh);
    planetMeshes.push(mesh);
    planetMeshesMap.set(p.nombre, mesh);

    // Crear anillos especiales para Saturno
    if (p.nombre === 'Saturno') {
      const ringGeo = new THREE.RingGeometry(size * 1.4, size * 2.4, 256);
      const ringTexture = loader.load('/textures/saturn_ring.png');
      ringTexture.rotation = Math.PI / 2;
      ringTexture.center.set(0.5, 0.5);
      const ringMat = new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        alphaTest: 0.1
      });

      // Ajustar coordenadas UV para textura radial
      const uvs = ringGeo.attributes.uv;
      for (let i = 0; i < uvs.count; i++) {
        const x = uvs.getX(i) * 2.0 - 1.0;
        const y = uvs.getY(i) * 2.0 - 1.0;
        const angle = Math.atan2(y, x);
        const radius = Math.sqrt(x * x + y * y);
        uvs.setXY(i, (angle + Math.PI) / (2 * Math.PI), radius);
      }
      uvs.needsUpdate = true;

      saturnRings = new THREE.Mesh(ringGeo, ringMat);
      saturnRings.rotation.x = Math.PI / 2;
      scene.add(saturnRings);
    }
  });
}

/**
 * Crea la Luna como objeto 3D que orbita alrededor de la Tierra
 */
function crearLuna() {
  const loader = new THREE.TextureLoader();
  const size = luna.tamaño || 0.4;
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const texture = loader.load(luna.textura);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  lunaMesh = new THREE.Mesh(geometry, material);
  scene.add(lunaMesh);
}

/**
 * Carga y configura el modelo 3D de la Estación Espacial Internacional
 */
function crearISS() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      '/models/iss.glb',
      gltf => {
        issMesh = gltf.scene;
        issMesh.scale.set(0.005, 0.005, 0.005);

        // Centrar el modelo en su posición
        const box = new THREE.Box3().setFromObject(issMesh);
        const center = box.getCenter(new THREE.Vector3());
        issMesh.position.sub(center);

        // Posición inicial en órbita terrestre
        issMesh.position.set(iss.orbitaRadio, 0, 0);
        issMesh.userData.orbitAngle = 0;
        issMesh.userData.sizeOriginal = 0.24; // Tamaño para cálculos
        issMesh.userData.nombre = 'ISS'; // Identificador
        issMesh.userData.tipo = 'iss'; // Nuevo identificador

         // Marcar todos los hijos como parte de la ISS
        issMesh.traverse((child) => {
          if (child.isMesh) {
            child.userData.esISS = true;
          }
        });

        scene.add(issMesh);
        console.log('✅ ISS cargada correctamente con', issMesh.children.length, 'hijos');
        resolve(issMesh);
      },
      undefined,
      error => {
        console.error('❌ Error cargando ISS:', error);
        reject(error);
      }
    );
  });
}

/**
 * Crea el cinturón de asteroides entre Marte y Júpiter
 */
function crearCinturónAsteroides() {
  const loader = new THREE.TextureLoader();
  const texture = loader.load('/textures/asteroid.jpg');

  for (let i = 0; i < cinturónAsteroides.count; i++) {
    const size = THREE.MathUtils.lerp(cinturónAsteroides.tamañoMin, cinturónAsteroides.tamañoMax, Math.random());

    // Crear geometría irregular para asteroides
    const geom = new THREE.IcosahedronGeometry(size, 1);
    const positionAttribute = geom.attributes.position;

    // Deformar vértices para hacer asteroides únicos
    for (let j = 0; j < positionAttribute.count; j++) {
      const x = positionAttribute.getX(j);
      const y = positionAttribute.getY(j);
      const z = positionAttribute.getZ(j);
      const offset = (Math.random() - 0.5) * 0.3 * size;
      positionAttribute.setXYZ(j, x + offset, y + offset, z + offset);
    }
    positionAttribute.needsUpdate = true;
    geom.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({ map: texture });
    const mesh = new THREE.Mesh(geom, mat);

    // Posicionar aleatoriamente en el cinturón
    const radius = THREE.MathUtils.lerp(cinturónAsteroides.innerRadius, cinturónAsteroides.outerRadius, Math.random());
    const angle = Math.random() * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 1, Math.sin(angle) * radius);

    // Configurar movimiento orbital y rotación
    cinturónOrbitAngles.push(angle);
    mesh.userData.orbitRadius = radius;
    mesh.userData.orbitSpeed = THREE.MathUtils.lerp(cinturónAsteroides.velocidadMin, cinturónAsteroides.velocidadMax, Math.random());
    mesh.userData.rotationSpeed = {
      x: (Math.random() - 0.5) * 0.01,
      y: (Math.random() - 0.5) * 0.01
    };

    // Añadir luz tenue a cada asteroide
    const light = new THREE.PointLight(0xffffff, 0.3, 3);
    light.position.copy(mesh.position);
    mesh.add(light);

    scene.add(mesh);
    cinturónMeshes.push(mesh);
  }
}

/**
 * Crea partículas de polvo estelar en el cinturón de asteroides
 */
function crearPolvoAsteroides() {
  const particleCount = 500;
  const positions = [];

  // Generar posiciones aleatorias para partículas de polvo
  for (let i = 0; i < particleCount; i++) {
    const radius = THREE.MathUtils.lerp(cinturónAsteroides.innerRadius, cinturónAsteroides.outerRadius, Math.random());
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 1.5;
    positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const textureLoader = new THREE.TextureLoader();
  const particleTexture = textureLoader.load('/textures/dust.png');

  const material = new THREE.PointsMaterial({
    map: particleTexture,
    size: 0.05,
    transparent: true,
    opacity: 0.5,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);
}

/**
 * Bucle principal de animación que actualiza todas las posiciones y rotaciones
 */
function animate() {
  requestAnimationFrame(animate);

  // Movimiento orbital cuando no hay misión activa
  if (!missionStarted) {
    planetMeshes.forEach((mesh, i) => {
      const p = planetas[i];
      if (p.orbitaRadio > 0) {
        planetOrbitAngles[i] += p.orbitaVelocidad;
        mesh.position.set(
          Math.cos(planetOrbitAngles[i]) * p.orbitaRadio,
          0,
          Math.sin(planetOrbitAngles[i]) * p.orbitaRadio
        );
      }
    });

    // Movimiento de la Luna
    if (lunaMesh) {
      lunaOrbitAngle += luna.orbitaVelocidad;
      const tierraPos = planetMeshesMap.get('Tierra').position;
      lunaMesh.position.set(
        tierraPos.x + Math.cos(lunaOrbitAngle) * luna.orbitaRadio,
        0,
        tierraPos.z + Math.sin(lunaOrbitAngle) * luna.orbitaRadio
      );
    }

    // Movimiento de la ISS
    if (issMesh) {
      issMesh.userData.orbitAngle += iss.orbitaVelocidad;
      const tierraPos = planetMeshesMap.get('Tierra').position;
      issMesh.position.set(
        tierraPos.x + Math.cos(issMesh.userData.orbitAngle) * iss.orbitaRadio,
        0,
        tierraPos.z + Math.sin(issMesh.userData.orbitAngle) * iss.orbitaRadio
      );
    }
  }

  // Comportamiento visual según modo de alineación
  if (!alineados) {
    planetMeshes.forEach((mesh, i) => {
      mesh.visible = true;
      mesh.rotation.y += ROTACION_VELOCIDAD;
      const p = planetas[i];
      if (p.orbitaRadio > 0) {
        planetOrbitAngles[i] += p.orbitaVelocidad;
        mesh.position.set(
          Math.cos(planetOrbitAngles[i]) * p.orbitaRadio,
          0,
          Math.sin(planetOrbitAngles[i]) * p.orbitaRadio
        );
      } else {
        mesh.position.set(0, 0, 0);
      }
    });
  } else {
    planetMeshes.forEach((mesh, i) => {
      mesh.rotation.y += ROTACION_VELOCIDAD;
      mesh.visible = (i === planetaVisitadoIndex);
    });
  }

  // Actualizar posiciones de objetos relacionados con la Tierra
  const tierraMesh = planetMeshesMap.get('Tierra');
  if (tierraMesh && lunaMesh) {
    lunaOrbitAngle += luna.orbitaVelocidad;
    lunaMesh.position.set(
      tierraMesh.position.x + Math.cos(lunaOrbitAngle) * luna.orbitaRadio,
      0,
      tierraMesh.position.z + Math.sin(lunaOrbitAngle) * luna.orbitaRadio
    );
    lunaMesh.rotation.y += ROTACION_VELOCIDAD;
    lunaMesh.visible = (!alineados || planetaVisitadoIndex === planetas.findIndex(p => p.nombre === 'Tierra'));
  }

  if (tierraMesh && issMesh) {
    issMesh.userData.orbitAngle += iss.orbitaVelocidad;
    issMesh.position.set(
      tierraMesh.position.x + Math.cos(issMesh.userData.orbitAngle) * iss.orbitaRadio,
      0,
      tierraMesh.position.z + Math.sin(issMesh.userData.orbitAngle) * iss.orbitaRadio
    );
    issMesh.rotation.y += ROTACION_VELOCIDAD * 2;
    issMesh.visible = (!alineados || planetaVisitadoIndex === planetas.findIndex(p => p.nombre === 'Tierra'));
  }

  // Actualizar anillos de Saturno
  if (saturnRings) {
    const saturnoMesh = planetMeshesMap.get('Saturno');
    saturnRings.position.copy(saturnoMesh.position);
    saturnRings.rotation.z += 0.002;
    saturnRings.visible = (!alineados || planetaVisitadoIndex === planetas.findIndex(p => p.nombre === 'Saturno'));
  }

  // Actualizar cámara y controles
  camera.lookAt(lookAtTarget);
  if (controlsEnabled) {
    controls.update();
  }

  // Efectos visuales HUD que siguen el movimiento de cámara
  const hudElement = document.querySelector('.hud-container');
  if (hudElement) {
    const tiltX = camera.rotation.x * (180 / Math.PI) * 0.2;
    const tiltY = camera.rotation.y * (180 / Math.PI) * 0.2;
    hudElement.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  }

  // Efecto de reflejo en el casco del astronauta
  const helmetReflection = document.querySelector('.helmet-reflection');
  if (helmetReflection && scene && camera) {
    const sunLight = scene.children.find(obj => obj.isPointLight);
    if (sunLight) {
      const lightPos = sunLight.position.clone();
      const camPos = camera.position.clone();
      const dir = lightPos.sub(camPos).normalize();

      const reflectX = 50 + dir.x * 50;
      const reflectY = 50 - dir.y * 50;
      const dot = dir.dot(camera.getWorldDirection(new THREE.Vector3()));
      const opacity = THREE.MathUtils.clamp(dot, 0, 1) * 0.1 + 0.02;

      helmetReflection.style.setProperty('--reflect-x', `${reflectX}%`);
      helmetReflection.style.setProperty('--reflect-y', `${reflectY}%`);
      helmetReflection.style.setProperty('--reflect-opacity', opacity.toFixed(3));
    }
  }

  // Animación del cinturón de asteroides
  cinturónMeshes.forEach((mesh, i) => {
    cinturónOrbitAngles[i] += mesh.userData.orbitSpeed;
    mesh.position.set(
      Math.cos(cinturónOrbitAngles[i]) * mesh.userData.orbitRadius,
      mesh.position.y,
      Math.sin(cinturónOrbitAngles[i]) * mesh.userData.orbitRadius
    );

    mesh.rotation.x += mesh.userData.rotationSpeed.x;
    mesh.rotation.y += mesh.userData.rotationSpeed.y;

    // Efecto de parpadeo en luces de asteroides
    const light = mesh.children[0];
    if (light && light.isPointLight) {
      light.intensity = 0.2 + Math.sin(Date.now() * 0.005 + i) * 0.1;
    }
  });

  renderer.render(scene, camera);
}

/**
 * Inicia el modo de exploración libre del sistema solar
 */
function comenzarMision() {
  missionStarted = true;

  showAlert("MISIÓN INICIADA - SISTEMAS DE NAVEGACIÓN ACTIVADOS");

  // Resetear selecciones anteriores
  if (selectedObject) {
    restoreObjectMaterial(selectedObject);
    selectedObject = null;
  }
  hideExploreButton();
  hidePlanetInfoPanel();
  resetSelection();

  // Asegurar que todos los objetos sean visibles
  planetMeshes.forEach(mesh => {
    mesh.visible = true;
  });
  if (lunaMesh) lunaMesh.visible = true;
  if (issMesh) issMesh.visible = true;
  if (saturnRings) saturnRings.visible = true;

  // Detener órbitas pero mantener rotación
  planetas.forEach((p, i) => {
    originalOrbitSpeeds[`planet_${i}`] = p.orbitaVelocidad;
    p.orbitaVelocidad = 0;
  });

  // Detener Luna y ISS
  if (lunaMesh) {
    originalOrbitSpeeds.luna = luna.orbitaVelocidad;
    luna.orbitaVelocidad = 0;
  }

  if (issMesh) {
    originalOrbitSpeeds.iss = iss.orbitaVelocidad;
    iss.orbitaVelocidad = 0;
  }

  // Habilitar controles de navegación
  controls.enabled = true;
  controlsEnabled = true;
  renderer.domElement.style.pointerEvents = 'auto';

  // Actualizar interfaz de usuario
  document.getElementById('comenzar-btn').style.display = 'none';
  document.getElementById('finalizar-btn').style.display = 'block';
  document.getElementById('explore-btn').style.display = 'none';

  // Animación de transición a vista panorámica
  gsap.to(camera.position, {
    duration: 2,
    x: 0,
    y: 15,
    z: 60,
    ease: 'power2.inOut'
  });

  gsap.to(lookAtTarget, {
    duration: 2,
    x: 0,
    y: 0,
    z: 0,
    ease: 'power2.inOut'
  });
}
window.comenzarMision = comenzarMision;

/**
 * Finaliza el modo de exploración y vuelve a la vista automática
 */
function finalizarMision() {
  missionStarted = false;

  showAlert("MISIÓN FINALIZADA - REGRESANDO A BASE");

  // Resetear selección actual
  if (selectedObject) {
    restoreObjectMaterial(selectedObject);
    selectedObject = null;
  }

  hideExploreButton();
  hidePlanetInfoPanel();

  // Restaurar velocidades orbitales originales
  planetas.forEach((p, i) => {
    if (originalOrbitSpeeds[`planet_${i}`] !== undefined) {
      p.orbitaVelocidad = originalOrbitSpeeds[`planet_${i}`];
    }
  });

  // Restaurar Luna y ISS
  if (lunaMesh && originalOrbitSpeeds.luna !== undefined) {
    luna.orbitaVelocidad = originalOrbitSpeeds.luna;
  }

  if (issMesh && originalOrbitSpeeds.iss !== undefined) {
    iss.orbitaVelocidad = originalOrbitSpeeds.iss;
  }

  // Deshabilitar controles
  controls.enabled = false;
  controlsEnabled = false;
  renderer.domElement.style.pointerEvents = 'none';

  // Restaurar vista completa del sistema solar
  alineados = false;
  planetaVisitadoIndex = 0;
  
  planetMeshes.forEach((mesh, i) => {
    mesh.visible = true;
    // Resetear posiciones iniciales
    if (planetas[i].orbitaRadio > 0) {
      mesh.position.set(planetas[i].orbitaRadio, 0, 0);
    } else {
      mesh.position.set(0, 0, 0);
    }
  });

  // Resetear ángulos orbitales
  planetOrbitAngles = new Array(planetas.length).fill(0);

  // Actualizar interfaz
  document.getElementById('comenzar-btn').style.display = 'block';
  document.getElementById('finalizar-btn').style.display = 'none';

  // Animación de retorno a vista inicial
  gsap.to(camera.position, {
    duration: 2,
    x: 0,
    y: 10,
    z: 60,
    ease: 'power2.inOut'
  });

  gsap.to(lookAtTarget, {
    duration: 2,
    x: 0,
    y: 0,
    z: 0,
    ease: 'power2.inOut',
    onComplete: () => {
      controls.target.set(0, 0, 0);
      controls.reset();
    }
  });

  // Limpiar timeouts de resaltado
  planetMeshes.forEach(mesh => {
    if (mesh.userData.highlightTimeout) {
      clearTimeout(mesh.userData.highlightTimeout);
      mesh.userData.highlightTimeout = null;
    }
  });
}
window.finalizarMision = finalizarMision;

/**
 * Mueve la cámara para enfocar un planeta específico
 */
function moveCameraToPlanet(index) {
  planetaVisitadoIndex = index;
  const isMobile = window.innerWidth < 768;

  controls.enabled = false;
  controlsEnabled = false;

  if (index === 0) {
    // Vista especial para el Sol (más alejada)
    alineados = false;
    const size = planetMeshes[index].userData.sizeOriginal;
    const distanceFactor = isMobile ? 5 : 6;
    const offset = size * distanceFactor;

    gsap.to(camera.position, {
      duration: 2,
      x: 0,
      y: isMobile ? size * 1.5 : size * 2,
      z: offset,
      ease: 'power2.inOut',
      onComplete: () => {
        controls.target.set(0, 0, 0);
        controls.enabled = true;
        controlsEnabled = true;
      }
    });

    gsap.to(lookAtTarget, {
      duration: 2,
      x: 0,
      y: 0,
      z: 0,
      ease: 'power2.inOut'
    });

  } else {
    // Vista normal para planetas
    alineados = true;
    const targetPos = planetMeshes[index].position;
    const size = planetMeshes[index].userData.sizeOriginal;

    const distanceFactor = isMobile ? 4 : 5;
    const offset = size * distanceFactor;

    gsap.to(camera.position, {
      duration: 2,
      x: targetPos.x - offset,
      y: isMobile ? size * 1.5 : size * 2,
      z: offset * 1.5,
      ease: 'power2.inOut',
      onComplete: () => {
        controls.target.copy(targetPos);
        controls.enabled = true;
        controlsEnabled = true;
      }
    });

    gsap.to(lookAtTarget, {
      duration: 2,
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      ease: 'power2.inOut'
    });
  }
}

/**
 * Acerca la cámara a un planeta para vista detallada
 */
function moveCameraClose(index) {
  const planeta = planetMeshes[index];
  const planetaData = planetas[index];
  const size = planetaData.tamaño;
  const isMobile = window.innerWidth < 768;

  controls.enabled = false;
  controlsEnabled = false;

  // Calcular posición cercana al planeta
  const distancia = isMobile ? size * 2.5 : size * 3;
  const targetPos = planeta.position;
  const cameraPos = new THREE.Vector3(
    targetPos.x - distancia,
    targetPos.y + (isMobile ? size * 0.5 : size * 0.8),
    targetPos.z + (isMobile ? distancia * 0.5 : distancia * 0.3)
  );

  // Animación de acercamiento
  gsap.to(camera.position, {
    duration: 2,
    x: cameraPos.x,
    y: cameraPos.y,
    z: cameraPos.z,
    ease: 'power2.inOut',
    onComplete: () => {
      controls.target.copy(targetPos);
      controls.enabled = true;
      controlsEnabled = true;
      showPlanetInfoPanel(index);
    }
  });

  gsap.to(lookAtTarget, {
    duration: 2,
    x: targetPos.x,
    y: targetPos.y,
    z: targetPos.z,
    ease: 'power2.inOut'
  });
}

/**
 * Vista especial de exploración para Saturno y sus anillos
 */
function explorarSaturno(index) {
  const saturno = planetMeshes[index];
  const isMobile = window.innerWidth < 768;

  controls.enabled = false;
  controlsEnabled = false;

  // Posición que muestra los anillos de perfil
  const targetPos = saturno.position;
  const distancia = isMobile ? 8 : 10;
  const cameraPos = new THREE.Vector3(
    targetPos.x + distancia,
    targetPos.y + (isMobile ? 2 : 3),
    targetPos.z
  );

  // Animación de acercamiento
  gsap.to(camera.position, {
    duration: 2,
    x: cameraPos.x,
    y: cameraPos.y,
    z: cameraPos.z,
    ease: 'power2.inOut',
    onComplete: () => {
      controls.target.copy(targetPos);
      controls.enabled = true;
      controlsEnabled = true;
      showPlanetInfoPanel(index);
    }
  });

  gsap.to(lookAtTarget, {
    duration: 2,
    x: targetPos.x,
    y: targetPos.y,
    z: targetPos.z,
    ease: 'power2.inOut'
  });
}

/**
 * Maneja clics en objetos 3D para seleccionarlos
 */
function onClick(event) {
  if (!missionStarted) {
    console.log('Misión no iniciada - no se puede seleccionar');
    return;
  }

  event.stopPropagation();
  
  console.log('Click detectado en coordenadas:', event.clientX, event.clientY);

  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const clickableObjects = [...planetMeshes];
  if (lunaMesh) clickableObjects.push(lunaMesh);
  if (issMesh) {
    // Agregar la ISS y todos sus hijos para detección de clicks
    clickableObjects.push(issMesh);
    issMesh.traverse((child) => {
      if (child.isMesh) {
        clickableObjects.push(child);
      }
    });
  }

  console.log('Objetos clickeables:', clickableObjects.length);
  const intersects = raycaster.intersectObjects(clickableObjects, true);

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    console.log('✅ OBJETO INTERSECTADO:', intersectedObject.name);
    
    // Determinar qué objeto seleccionar
    let objectToSelect = intersectedObject;
    
    // Si el objeto clickeado es un hijo de la ISS, usar la ISS principal
    if (issMesh && (intersectedObject === issMesh || isChildOfISS(intersectedObject))) {
      console.log('🛰️ Seleccionando ISS principal');
      objectToSelect = issMesh;
    }
    
    console.log('🎯 OBJETO FINAL SELECCIONADO:', objectToSelect);
    
    // FORZAR la inicialización de userData si no existe
    if (!objectToSelect.userData) {
      objectToSelect.userData = {};
    }
    
    selectObject(objectToSelect);
  } else {
    console.log('❌ Click fuera de objetos');
    if (selectedObject) {
      restoreObjectMaterial(selectedObject);
      selectedObject = null;
    }
    hideExploreButton();
  }
}

/**
 * Verifica si un objeto es hijo de la ISS
 */
function isChildOfISS(object) {
  if (!issMesh) return false;
  
  let current = object;
  while (current.parent) {
    if (current.parent === issMesh) {
      return true;
    }
    current = current.parent;
    // Prevenir loops infinitos
    if (current === scene) break;
  }
  return false;
}

/**
 * Selecciona un objeto y muestra el botón de exploración
 */
function selectObject(object) {
  console.log('🔍 selectObject llamado con:', object);
  
  // Restaurar objeto previamente seleccionado
  if (selectedObject && selectedObject !== object) {
    restoreObjectMaterial(selectedObject);
  }

  // Si ya está seleccionado, no hacer nada
  if (selectedObject === object) {
    console.log('Objeto ya seleccionado');
    return;
  }

  // Intentar guardar material original si es la primera selección
  let canHighlight = false;
  
  if (!object.userData.originalMaterial) {
    // Verificar que el objeto tenga material
    if (object.material) {
      object.userData.originalMaterial = object.material.clone();
      console.log('✅ Material original guardado');
      canHighlight = true;
    } else {
      console.warn('⚠️ Objeto no tiene material, no se puede resaltar');
      // CONTINUAR A PESAR DE NO TENER MATERIAL - solo no resaltaremos
      canHighlight = false;
    }
  } else {
    canHighlight = true;
  }

  // Aplicar efecto temporal de resaltado solo si es posible
  if (canHighlight) {
    try {
      const highlightMaterial = new THREE.MeshStandardMaterial({
        map: object.userData.originalMaterial.map,
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5,
        metalness: 0.7,
        roughness: 0.3
      });

      object.material = highlightMaterial;
      console.log('🎯 Objeto resaltado');
    } catch (error) {
      console.error('❌ Error aplicando material de resaltado:', error);
      canHighlight = false;
    }
  }

  selectedObject = object;

  // Limpiar timeout anterior si existe
  if (object.userData.highlightTimeout) {
    clearTimeout(object.userData.highlightTimeout);
  }

  // Configurar timeout para limpiar selección automáticamente (solo si podemos resaltar)
  if (canHighlight) {
    object.userData.highlightTimeout = setTimeout(() => {
      if (selectedObject === object) {
        console.log('⏰ Timeout - restaurando material');
        restoreObjectMaterial(object);
        selectedObject = null;
        hideExploreButton();
      }
    }, 5000);
  }

  // SIEMPRE mostrar el botón EXPLORAR, incluso si no se puede resaltar
  console.log('🎯 Mostrando botón EXPLORAR para:', object);
  showExploreButton(object);
}

/**
 * Restaura el material original de un objeto
 */
function restoreObjectMaterial(object) {
  if (!object) return;
  
  if (object.userData && object.userData.originalMaterial) {
    object.material = object.userData.originalMaterial;
    console.log('✅ Material restaurado');
  }
  
  if (object.userData && object.userData.highlightTimeout) {
    clearTimeout(object.userData.highlightTimeout);
    object.userData.highlightTimeout = null;
  }
}

/**
 * Muestra el botón de exploración cerca del objeto seleccionado
 */
function showExploreButton(object) {
  const exploreBtn = document.getElementById('explore-btn');
  if (!exploreBtn) {
    console.error('❌ Botón explore-btn no encontrado en el DOM');
    return;
  }

  try {
    // Obtener la posición mundial del objeto
    const worldPosition = new THREE.Vector3();
    object.getWorldPosition(worldPosition);
    
    console.log('🌍 Posición mundial ISS:', worldPosition);

    // Proyectar la posición 3D a coordenadas 2D de pantalla
    const screenPosition = worldPosition.clone();
    screenPosition.project(camera);

    console.log('📐 Posición proyectada:', screenPosition);

    // Convertir coordenadas normalizadas (-1 a 1) a píxeles
    let x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
    let y = (1 - (screenPosition.y * 0.5 + 0.5)) * window.innerHeight;

    console.log('📍 Coordenadas de pantalla:', Math.round(x), Math.round(y));

    // Para la ISS, usar un offset más específico
    const isISS = object === issMesh || object.userData?.esISS || object.userData?.tipo === 'iss';
    let offsetY = -50; // Offset por defecto
    
    if (isISS) {
      // Para la ISS, poner el botón más arriba
      offsetY = -80;
      console.log('🛰️ Aplicando offset especial para ISS');
    }

    y += offsetY;

    console.log('📍 Coordenadas con offset:', Math.round(x), Math.round(y));

    // Verificar si la posición está dentro de la pantalla visible
    const margin = 80;
    const isOnScreen = (
      x >= margin && x <= window.innerWidth - margin && 
      y >= margin && y <= window.innerHeight - margin
    );

    if (isOnScreen) {
      exploreBtn.style.left = `${x}px`;
      exploreBtn.style.top = `${y}px`;
      console.log('✅ Botón posicionado sobre el objeto');
    } else {
      // Posición de respaldo: centro de la pantalla
      exploreBtn.style.left = '50%';
      exploreBtn.style.top = '30%';
      console.log('⚠️ Fuera de pantalla, botón en posición central');
    }

    // Mostrar el botón
    exploreBtn.style.display = 'block';
    exploreBtn.style.pointerEvents = 'auto';
    exploreBtn.style.zIndex = '10000';

    console.log('🎯 Botón EXPLORAR mostrado');

    // Configurar el evento de click
    exploreBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🚀 EXPLORAR clickeado para:', object);
      explorarObjeto(object);
    };

  } catch (error) {
    console.error('❌ Error en showExploreButton:', error);
    // Fallback: mostrar botón en posición segura
    exploreBtn.style.left = '50%';
    exploreBtn.style.top = '30%';
    exploreBtn.style.display = 'block';
    exploreBtn.style.pointerEvents = 'auto';
    exploreBtn.style.zIndex = '10000';
    
    exploreBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🚀 EXPLORAR clickeado (fallback):', object);
      explorarObjeto(object);
    };
  }
}

/**
 * Oculta el botón de exploración
 */
function hideExploreButton() {
  const exploreBtn = document.getElementById('explore-btn');
  if (exploreBtn) exploreBtn.style.display = 'none';
}

/**
 * Explora un objeto seleccionado (acerca la cámara y muestra información)
 */
function explorarObjeto(object) {
  console.log('🌍 Explorando objeto:', object);
  
  if (!object) {
    console.error('❌ Objeto no definido en explorarObjeto');
    return;
  }
  
  // Restaurar material inmediatamente al explorar
  restoreObjectMaterial(object);
  hideExploreButton();

  // Ocultar todos los planetas excepto el seleccionado
  mostrarSoloPlanetaSeleccionado(object);

  // Encontrar el índice del planeta para obtener sus datos
  let planetIndex = -1;
  const esISS = object === issMesh || object.userData?.esISS || object.userData?.tipo === 'iss';
  const esLuna = object === lunaMesh || object.userData?.nombre === 'Luna';
  
  if (esLuna) {
    console.log('🌙 Explorando Luna');
  } else if (esISS) {
    console.log('🛰️ Explorando ISS');
  } else {
    planetIndex = planetMeshes.indexOf(object);
    console.log('🪐 Explorando planeta índice:', planetIndex, planetas[planetIndex]?.nombre);
  }

  const size = object.userData?.sizeOriginal || 1;
  const isMobile = window.innerWidth < 768;
  
  try {
    // Calcular posición de cámara basada en el tipo de objeto
    let targetPosition;
    const objectWorldPos = new THREE.Vector3();
    object.getWorldPosition(objectWorldPos);

    if (planetIndex !== -1 && planetas[planetIndex]?.nombre === 'Saturno') {
      // Vista especial para Saturno para ver los anillos
      const distance = isMobile ? 12 : 15;
      targetPosition = new THREE.Vector3(
        objectWorldPos.x + distance,
        objectWorldPos.y + (isMobile ? 3 : 4),
        objectWorldPos.z
      );
      console.log('🪐 Vista especial para Saturno');
    } else {
      // Vista normal para otros objetos
      const distance = isMobile ? size * 3 : size * 4;
      targetPosition = new THREE.Vector3(
        objectWorldPos.x - distance,
        objectWorldPos.y + (isMobile ? size * 0.8 : size * 1.2),
        objectWorldPos.z + distance * 0.5
      );
    }

    console.log('🎥 Moviendo cámara de:', camera.position, 'a:', targetPosition);

    // Deshabilitar controles temporalmente
    controls.enabled = false;
    controlsEnabled = false;

    // Animación de acercamiento de cámara
    gsap.to(camera.position, {
      duration: 2.5,
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      ease: 'power2.inOut',
      onUpdate: () => {
        // Actualizar el lookAt durante la animación
        camera.lookAt(objectWorldPos);
      },
      onComplete: () => {
        console.log('✅ Cámara posicionada - mostrando información');
        
        // Configurar controles para el objeto
        controls.target.copy(objectWorldPos);
        controls.enabled = true;
        controlsEnabled = true;
        
        // Mostrar información del objeto
        mostrarInformacionObjeto(object);
      }
    });

  } catch (error) {
    console.error('❌ Error en explorarObjeto:', error);
    // Fallback: mostrar información directamente
    mostrarInformacionObjeto(object);
  }
}

/**
 * Muestra solo el planeta seleccionado y oculta los demás
 */
function mostrarSoloPlanetaSeleccionado(object) {
  console.log('👁️ Mostrando solo objeto seleccionado:', object);
  console.log('🔍 Tipo:', object.userData?.nombre || object.userData?.tipo || 'Planeta');
  
  // Ocultar todos los planetas primero
  planetMeshes.forEach(mesh => {
    mesh.visible = false;
  });
  
  // Determinar el tipo de objeto
  const esLuna = object === lunaMesh || object.userData?.nombre === 'Luna';
  const esISS = object === issMesh || object.userData?.esISS || object.userData?.tipo === 'iss';
  
  // Mostrar solo el objeto seleccionado
  if (esLuna) {
    // Si es la Luna, mostrar también la Tierra
    const tierraMesh = planetMeshesMap.get('Tierra');
    if (tierraMesh) {
      tierraMesh.visible = true;
      console.log('🌍 Tierra visible para contexto lunar');
    }
    if (lunaMesh) lunaMesh.visible = true;
  } 
  else if (esISS) {
    // Si es la ISS, mostrar también la Tierra
    const tierraMesh = planetMeshesMap.get('Tierra');
    if (tierraMesh) {
      tierraMesh.visible = true;
      console.log('🌍 Tierra visible para contexto ISS');
    }
    if (issMesh) issMesh.visible = true;
  } 
  else {
    // Si es un planeta, mostrar solo ese planeta
    object.visible = true;
    console.log('🪐 Planeta principal visible');
  }
  
  // Mostrar anillos de Saturno si es Saturno
  if (saturnRings) {
    const saturnoMesh = planetMeshesMap.get('Saturno');
    if (object === saturnoMesh) {
      saturnRings.visible = true;
      console.log('💍 Anillos de Saturno visibles');
    } else {
      saturnRings.visible = false;
    }
  }
}

/**
 * Muestra la información del objeto seleccionado en el panel
 */
function mostrarInformacionObjeto(object) {
  const infoPanel = document.getElementById('planet-info-panel');
  const funfactsPanel = document.getElementById('planet-funfacts-panel');
  
  if (!infoPanel || !funfactsPanel) {
    console.error('❌ Paneles de información no encontrados');
    return;
  }

    console.log('📊 Mostrando información para:', object);
  console.log('🔍 Tipo de objeto:', object.userData?.nombre || object.userData?.tipo || 'Desconocido');
  console.log('🔍 Nombre del objeto:', object.name);
  console.log('🔍 Es ISS?:', object === issMesh || object.userData?.esISS);

  // Ocultar HUD principal temporalmente
  const hud = document.querySelector('.spaceship-cockpit');
  if (hud) hud.style.display = 'none';

  // Limpiar selección actual
  if (selectedObject) {
    restoreObjectMaterial(selectedObject);
    selectedObject = null;
  }

  let infoHTML = '';
  let funfactText = '';

   // Detectar qué tipo de objeto es
  const esLuna = object === lunaMesh || object.userData?.nombre === 'Luna';
  const esISS = object === issMesh || object.userData?.esISS || object.userData?.tipo === 'iss';
  
  if (esLuna) {
    console.log('🌙 Mostrando información de la Luna');
    infoHTML = `
      <h2 class="text-cyan-300 text-xl font-bold mb-4">LA LUNA</h2>
      <p><strong>Diámetro:</strong> 3,474 km</p>
      <p><strong>Distancia Tierra:</strong> 384,400 km</p>
      <p><strong>Temperatura:</strong> -173°C a 127°C</p>
      <p><strong>Gravedad:</strong> 1.62 m/s²</p>
      <p class="mt-3">Único satélite natural de la Tierra</p>
      <button onclick="hidePlanetInfoPanel()" class="cockpit-btn mt-4">CERRAR</button>
    `;
    funfactsPanel.style.display = 'none';
  } 
  else if (esISS) {
    console.log('🛰️ Mostrando información de la ISS');
    infoHTML = `
      <h2 class="text-cyan-300 text-xl font-bold mb-4">ESTACIÓN ESPACIAL INTERNACIONAL</h2>
      <p><strong>Altura orbital:</strong> ~408 km</p>
      <p><strong>Velocidad:</strong> 27,600 km/h</p>
      <p><strong>Órbita:</strong> 90 minutos alrededor de la Tierra</p>
      <p><strong>Tripulación:</strong> Hasta 7 astronautas</p>
      <p><strong>Países participantes:</strong> 15 naciones</p>
      <p><strong>Lanzamiento:</strong> Primer módulo en 1998</p>
      <p class="mt-3">Laboratorio de investigación en microgravedad que sirve como base para experimentos científicos internacionales. Es el objeto artificial más grande en órbita terrestre.</p>
      <button onclick="hidePlanetInfoPanel()" class="cockpit-btn mt-4">CERRAR</button>
    `;
    funfactsPanel.style.display = 'none';
  } else {
    // Para planetas normales
    const index = planetMeshes.indexOf(object);
    if (index !== -1 && planetas[index]) {
      const planeta = planetas[index];
      console.log(`🪐 Mostrando información de ${planeta.nombre}`);
      infoHTML = `
        <h2 class="text-cyan-300 text-xl font-bold mb-4">${planeta.nombre}</h2>
        <p><strong>Distancia al Sol:</strong> ${planeta.distancia}</p>
        <p><strong>Temperatura:</strong> ${planeta.temperatura}</p>
        <p class="mt-3">${planeta.infoExtra}</p>
        <button onclick="hidePlanetInfoPanel()" class="cockpit-btn mt-4">CERRAR</button>
      `;
      
      // Configurar dato curioso
      funfactText = planeta.datoCurioso;
      const funfactElement = funfactsPanel.querySelector('.planet-funfact');
      if (funfactElement) {
        typewriterEffect(funfactElement, funfactText, 35);
      }
      funfactsPanel.style.display = 'block';
    } else {
      console.error('❌ No se pudo encontrar información del objeto');
      // Información por defecto con más detalles de debug
      infoHTML = `
        <h2 class="text-cyan-300 text-xl font-bold mb-4">OBJETO ESPACIAL</h2>
        <p><strong>Nombre:</strong> ${object.name || 'Sin nombre'}</p>
        <p><strong>Tipo:</strong> ${object.type}</p>
        <p>Información detallada no disponible</p>
        <button onclick="hidePlanetInfoPanel()" class="cockpit-btn mt-4">CERRAR</button>
      `;
      funfactsPanel.style.display = 'none';
    }
  }

  // Actualizar contenido
  infoPanel.innerHTML = infoHTML;
  infoPanel.style.display = 'block';

  console.log('✅ Paneles de información mostrados');

  // Animaciones GSAP
  gsap.fromTo(infoPanel, 
    { x: 50, opacity: 0 }, 
    { duration: 0.8, x: 0, opacity: 1, ease: "power3.out" }
  );

  if (funfactsPanel.style.display === 'block') {
    gsap.fromTo(funfactsPanel, 
      { x: -50, opacity: 0 }, 
      { duration: 0.8, x: 0, opacity: 1, ease: "power3.out" }
    );
  }

  // Ocultar botón EXPLORAR
  hideExploreButton();
}

/**
 * Efecto de máquina de escribir para texto
 */
function typewriterEffect(element, text, speed = 40) {
  // Limpiar cualquier tipeo anterior
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
    typewriterTimeout = null;
  }

  element.textContent = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      typewriterTimeout = setTimeout(type, speed);
    }
  }
  type();
}

/**
 * Muestra el panel de información del planeta
 */
function showPlanetInfoPanel(index) {
  const infoPanel = document.getElementById('planet-info-panel');
  const funfactsPanel = document.getElementById('planet-funfacts-panel');
  if (!infoPanel || !funfactsPanel) return;

  const planeta = planetas[index];

  // Panel derecho - crear contenido completo
  infoPanel.innerHTML = `
    <h2 class="text-cyan-300 text-xl font-bold mb-4">${planeta.nombre}</h2>
    <p><strong>Distancia al Sol:</strong> ${planeta.distancia}</p>
    <p><strong>Temperatura:</strong> ${planeta.temperatura}</p>
    <p class="mt-3">${planeta.infoExtra}</p>
    <button onclick="hidePlanetInfoPanel()" class="hud-btn mt-4">CERRAR</button>
  `;
  infoPanel.style.display = 'block';

  // Panel izquierdo con tipeo
  const funfactElement = funfactsPanel.querySelector('.planet-funfact');
  if (funfactElement) {
    typewriterEffect(funfactElement, planeta.datoCurioso || 'Sin datos curiosos disponibles.', 35);
  }
  funfactsPanel.style.display = 'block';

  // Ocultar HUD principal
  const hud = document.querySelector('.hud-container');
  if (hud) hud.style.display = 'none';

  // Animaciones
  gsap.fromTo(infoPanel, 
    { x: 50, opacity: 0 }, 
    { duration: 0.8, x: 0, opacity: 1, ease: "power3.out" }
  );
  gsap.fromTo(funfactsPanel, 
    { x: -50, opacity: 0 }, 
    { duration: 0.8, x: 0, opacity: 1, ease: "power3.out" }
  );
}

/**
 * Oculta el panel de información del planeta
 */
function hidePlanetInfoPanel() {
  const infoPanel = document.getElementById('planet-info-panel');
  const funfactsPanel = document.getElementById('planet-funfacts-panel');
  const hud = document.querySelector('.spaceship-cockpit'); // Cambiado de .hud-container

  // Restaurar HUD principal
  if (hud) hud.style.display = 'block';

  // Limpiar selección actual
  if (selectedObject) {
    restoreObjectMaterial(selectedObject);
    selectedObject = null;
  }

  // Mostrar todos los planetas nuevamente al cerrar el panel
  if (missionStarted) {
    planetMeshes.forEach(mesh => {
      mesh.visible = true;
    });
    if (lunaMesh) lunaMesh.visible = true;
    if (issMesh) issMesh.visible = true;
    if (saturnRings) saturnRings.visible = true;
  }

  gsap.to([infoPanel, funfactsPanel], {
    duration: 0.3,
    opacity: 0,
    onComplete: () => {
      infoPanel.style.display = 'none';
      funfactsPanel.style.display = 'none';
      controls.enabled = true;
      controlsEnabled = true;
    }
  });
}
window.hidePlanetInfoPanel = hidePlanetInfoPanel;

/**
 * Resetea la selección actual
 */
function resetSelection() {
  if (selectedObject) {
    // Restaurar material
    if (selectedObject.userData.originalMaterial) {
      selectedObject.material = selectedObject.userData.originalMaterial;
    }

    // Ocultar botón
    document.getElementById('explore-btn').style.display = 'none';

    // Limpiar referencia
    selectedObject = null;
  }

  // Restaurar controles
  controls.enabled = true;
}

/**
 * Función para limpiar recursos cuando se cierra la aplicación
 */
export function cleanup() {
  if (renderer) {
    renderer.dispose();
  }
  
  if (scene) {
    scene.traverse(object => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
  
  window.removeEventListener('resize', onWindowResize);
  renderer.domElement.removeEventListener('click', onClick);
  document.body.removeEventListener('click', startAudio);
  
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
  }
}

// HUD
export function hudController() {
  return {
    mensaje: "Sistema de Navegación Espacial",
    iniciado: false,
    comenzarMision() {
      comenzarMision();
    },
    finalizarMision() {
      finalizarMision();
    },
    init() {
      // Esperar a que el DOM esté listo
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.inicializarSistema();
        });
      } else {
        this.inicializarSistema();
      }
    },
    inicializarSistema() {
      // Inicializar la escena 3D
      initScene();
      updateDateTime();
      
      // Configurar z-index de forma segura
      setTimeout(() => {
        const sceneElement = document.getElementById('scene');
        const cockpitElement = document.querySelector('.spaceship-cockpit');
        
        if (sceneElement) sceneElement.style.zIndex = '1';
        if (cockpitElement) cockpitElement.style.zIndex = '2';
        
        this.iniciado = true;
        console.log('Sistema de nave espacial inicializado');
      }, 100);
    }
  };
}
window.hudController = hudController;

/**
 * Inicializa efectos de la cabina de nave espacial
 */
function initCockpitEffects() {
  createCockpitParticles();
  initRadarBlips();
   // Actualizar el radar continuamente
  setInterval(updateRadarBlips, 100);
}

/**
 * Crea partículas flotantes en la cabina
 */
function createCockpitParticles() {
  const particlesContainer = document.getElementById('cockpit-particles');
  if (!particlesContainer) {
    // Crear el contenedor si no existe
    const cockpit = document.querySelector('.spaceship-cockpit');
    if (cockpit) {
      const newParticlesContainer = document.createElement('div');
      newParticlesContainer.className = 'cockpit-particles';
      newParticlesContainer.id = 'cockpit-particles';
      cockpit.appendChild(newParticlesContainer);
    }
    return;
  }

  // Limpiar partículas existentes
  particlesContainer.innerHTML = '';

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 20}s`;
    particle.style.animationDuration = `${15 + Math.random() * 15}s`;
    particlesContainer.appendChild(particle);
  }
}

/**
 * Inicializa blips en el radar basados en planetas
 */
function initRadarBlips() {
  // Esta función se llamaría periódicamente para actualizar posiciones
  //setInterval(updateRadarBlips, 1000);
}

/**
 * Actualiza posiciones de blips en el radar
 */
function updateRadarBlips() {
  const radar = document.querySelector('.radar-display');
  if (!radar || !planetMeshes.length) return;

  // Limpiar blips existentes (excepto el sweep)
  const existingBlips = radar.querySelectorAll('.radar-blip');
  existingBlips.forEach(blip => {
    if (!blip.classList.contains('radar-sweep')) {
      blip.remove();
    }
  });

  // Crear nuevos blips basados en posiciones de planetas
  planetMeshes.forEach((planet, index) => {
    if (planetas[index].nombre === 'Sol') return; // No mostrar Sol en radar

    const blip = document.createElement('div');
    blip.className = 'radar-blip';
    
    // Mapear posición 3D a coordenadas 2D del radar
    const maxDistance = 80; // Distancia máxima para normalizar
    const normalizedX = (planet.position.x / maxDistance) * 40 + 50;
    const normalizedY = (planet.position.z / maxDistance) * 40 + 50;

    // Asegurar que esté dentro del radar
    const x = Math.max(10, Math.min(90, normalizedX));
    const y = Math.max(10, Math.min(90, normalizedY));

    blip.style.left = `${x}%`;
    blip.style.top = `${y}%`;
    blip.title = planetas[index].nombre;

    // Color diferente según el planeta
    const colors = {
      'Mercurio': '#ff6b6b',
      'Venus': '#ffa500', 
      'Tierra': '#4ecdc4',
      'Marte': '#ff6b6b',
      'Júpiter': '#ffe66d',
      'Saturno': '#f7fff7',
      'Urano': '#6aecd2',
      'Neptuno': '#1a535c'
    };
    
    blip.style.background = colors[planetas[index].nombre] || '#00ff96';

    radar.appendChild(blip);
  });
}

/**
 * Muestra alerta en el panel de alertas
 */
function showAlert(message, duration = 3000) {
  const alertPanel = document.getElementById('alert-panel');
  const alertMessage = alertPanel.querySelector('.alert-message');
  
  if (alertPanel && alertMessage) {
    alertMessage.textContent = message;
    alertPanel.style.display = 'block';
    
    setTimeout(() => {
      alertPanel.style.display = 'none';
    }, duration);
  }
}