import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';


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

const luna = {
  nombre: 'Luna',
  textura: '/textures/moon.jpg',
  orbitaRadio: 3.6,      // antes 2, aumentado proporcionalmente (~1.8x)
  orbitaVelocidad: 0.0005,
  tamaño: 0.72           // antes no tenía tamaño definido, ahora la definimos (0.4 * 1.8 = 0.72)
};
const iss = {
  nombre: 'ISS',
  textura: '/textures/iss.png',  // pon una textura o color (puedes usar un cubo o esfera blanca)
  orbitaRadio: 2.4,               // más cerca que la luna (3.6)
  orbitaVelocidad: 0.02,          // órbita rápida
  tamaño: 0.24
};

const cinturónAsteroides = {
  innerRadius: 39,    // entre Marte (36) y Júpiter (46.8)
  outerRadius: 44,
  count: 200,         // cantidad de asteroides
  tamañoMin: 0.05,
  tamañoMax: 0.15,
  velocidadMin: 0.002,
  velocidadMax: 0.006,
};

let orbitLines = [];
let missionStarted = false;
let selectedObject = null;
let originalOrbitSpeeds = {};

let controls; // ✅ Control de órbita
let controlsEnabled = false; // Para activar/desactivar controles

let camera, scene, renderer;
let planetMeshes = [];
let planetMeshesMap = new Map();
let planetOrbitAngles = new Array(planetas.length).fill(0);

let lunaMesh = null;
let lunaOrbitAngle = 0;
let saturnRings = null;

const ROTACION_VELOCIDAD = 0.005;
const lookAtTarget = new THREE.Vector3();
let alineados = false;
let planetaVisitadoIndex = 0;
let audioStarted = false;

export function initScene() {
  const canvas = document.getElementById('scene');
  if (!canvas) return;

  canvas.style.position = 'absolute';
  canvas.style.zIndex = '1';
  canvas.style.pointerEvents = 'auto';

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.set(0, 10, 60);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // ✅ Crear OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Movimiento suave
  controls.dampingFactor = 0.08;
  controls.enablePan = false; // Evitar mover lateralmente
  controls.minDistance = 2; // Distancia mínima
  controls.maxDistance = 50; // Distancia máxima
  controls.rotateSpeed = 0.5;     // Velocidad de rotación
  controls.zoomSpeed = 0.8;
  controls.enabled = false; // Desactivado por defecto

  // Luz ambiental
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  // Luz del Sol más intensa
  const sunLight = new THREE.PointLight(0xffffff, 4, 5000);
  sunLight.position.set(0, 0, 0); // o donde esté el Sol
  scene.add(sunLight);

  // Fondo starfield
  const starTexture = new THREE.TextureLoader().load('/textures/starfield.jpg');
  const starGeo = new THREE.SphereGeometry(200, 64, 64);
  const starMat = new THREE.MeshBasicMaterial({
    map: starTexture,
    side: THREE.BackSide
  });
  const starMesh = new THREE.Mesh(starGeo, starMat);
  scene.add(starMesh);

  crearPlanetas();
  crearLuna();
  crearISS();
  crearCinturónAsteroides();
  crearPolvoAsteroides();
  // Crear líneas de órbita
  crearOrbitLines();
  // Actualizar fecha y hora cada segundo
  setInterval(updateDateTime, 1000);

  lookAtTarget.set(0, 0, 0);
  camera.lookAt(lookAtTarget);

  onWindowResize();

  animate();

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
  window.addEventListener('resize', onWindowResize);

  // Agregar evento de clic
  renderer.domElement.addEventListener('click', onClick, false);

  //let currentIndex = 0;
  // window.addEventListener('wheel', e => {
  //   if (controls.enabled) return; // 📌 Si estás en control manual, no cambiar de planeta
  //   startAudio();

  //   if (e.deltaY > 0) {
  //     if (currentIndex < planetas.length - 1) {
  //       currentIndex++;
  //       window.dispatchEvent(new CustomEvent('cambiarPlaneta', { detail: currentIndex }));
  //     }
  //   } else {
  //     if (currentIndex > 0) {
  //       currentIndex--;
  //       window.dispatchEvent(new CustomEvent('cambiarPlaneta', { detail: currentIndex }));
  //     }
  //   }
  // });

  document.body.addEventListener('click', startAudio);
}

// Nueva función para crear líneas de órbita
function crearOrbitLines() {
  // Limpiar órbitas existentes
  orbitLines.forEach(line => scene.remove(line));
  orbitLines = [];

  // Crear órbitas para planetas
  planetas.forEach(p => {
    if (p.orbitaRadio > 0) {
      const orbitGeometry = new THREE.BufferGeometry();
      const points = [];
      const segments = 64;

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

  // Órbita de la Luna
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

// Función para actualizar fecha y hora
function updateDateTime() {
  const now = new Date();
  document.getElementById('current-date').textContent = now.toLocaleDateString();
  document.getElementById('current-time').textContent = now.toLocaleTimeString();
}

function startAudio() {
  if (audioStarted) return;
  const audio = new Audio('/audio/space-ambient.mp3');
  audio.loop = true;
  audio.volume = 0.5;
  audio.play();
  audioStarted = true;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (window.innerWidth < 768) {
    // Vista más cercana en móviles
    camera.position.z = 40;
    camera.position.y = 8;
  } else {
    // Vista estándar en escritorio
    camera.position.z = 60;
    camera.position.y = 10;
  }
}

function crearPlanetas() {
  const loader = new THREE.TextureLoader();
  planetMeshes = [];
  planetMeshesMap.clear();

  planetas.forEach(p => {
    // let size = 1;
    // if (p.nombre === 'Sol') size = 4;
    // else if (p.nombre === 'Júpiter') size = 2.5;
    // else if (p.nombre === 'Saturno') size = 2;
    const size = p.tamaño;

    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const texture = loader.load(p.textura);
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

    if (p.nombre === 'Saturno') {
      const ringGeo = new THREE.RingGeometry(size * 1.4, size * 2.4, 256);
      const ringTexture = loader.load('/textures/saturn_ring.png');
      ringTexture.rotation = Math.PI / 2; // 90 grados
      ringTexture.center.set(0.5, 0.5);   // Rotar desde el centro
      const ringMat = new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        alphaTest: 0.1
      });

      // Ajuste de UV radial
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

    // if (p.nombre === 'Sol') {
    //   const sunLight = new THREE.PointLight(0xffffff, 3, 5000);
    //   sunLight.position.copy(mesh.position);
    //   scene.add(sunLight);
    // }
  });
}

function crearLuna() {
  const loader = new THREE.TextureLoader();
  const size = luna.tamaño || 0.4;  // fallback si no está definido
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const texture = loader.load(luna.textura);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  lunaMesh = new THREE.Mesh(geometry, material);
  scene.add(lunaMesh);
}

let issMesh = null;
let cinturónMeshes = [];
let cinturónOrbitAngles = [];
let cometaMesh = null;
let cometaOrbitAngle = 0;

function crearISS() {
  const loader = new GLTFLoader();

  // Configurar DRACO Loader
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/libs/draco/'); // Ruta a los decodificadores
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    '/models/iss.glb', // ruta del modelo
    gltf => {
      issMesh = gltf.scene;

      // Escalar
      issMesh.scale.set(0.005, 0.005, 0.005);

      // Centrar el modelo
      const box = new THREE.Box3().setFromObject(issMesh);
      const center = box.getCenter(new THREE.Vector3());
      issMesh.position.sub(center);

      // Posición inicial
      issMesh.position.set(iss.orbitaRadio, 0, 0);
      issMesh.userData.orbitAngle = 0;

      scene.add(issMesh);
    },
    undefined,
    error => console.error('Error cargando ISS:', error)
  );
}

function crearCinturónAsteroides() {
  const loader = new THREE.TextureLoader();
  const texture = loader.load('/textures/asteroid.jpg'); // textura de asteroide

  for (let i = 0; i < cinturónAsteroides.count; i++) {
    const size = THREE.MathUtils.lerp(cinturónAsteroides.tamañoMin, cinturónAsteroides.tamañoMax, Math.random());

    // Geometría base de icosaedro
    const geom = new THREE.IcosahedronGeometry(size, 1);

    // Deformar vértices para hacerlo irregular
    const positionAttribute = geom.attributes.position;
    for (let j = 0; j < positionAttribute.count; j++) {
      const x = positionAttribute.getX(j);
      const y = positionAttribute.getY(j);
      const z = positionAttribute.getZ(j);

      const offset = (Math.random() - 0.5) * 0.3 * size; // irregularidad
      positionAttribute.setXYZ(j, x + offset, y + offset, z + offset);
    }
    positionAttribute.needsUpdate = true;
    geom.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({ map: texture });
    const mesh = new THREE.Mesh(geom, mat);

    // Posición inicial aleatoria
    const radius = THREE.MathUtils.lerp(cinturónAsteroides.innerRadius, cinturónAsteroides.outerRadius, Math.random());
    const angle = Math.random() * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 1, Math.sin(angle) * radius);

    // Datos de órbita y rotación
    cinturónOrbitAngles.push(angle);
    mesh.userData.orbitRadius = radius;
    mesh.userData.orbitSpeed = THREE.MathUtils.lerp(cinturónAsteroides.velocidadMin, cinturónAsteroides.velocidadMax, Math.random());
    mesh.userData.rotationSpeed = {
      x: (Math.random() - 0.5) * 0.01,
      y: (Math.random() - 0.5) * 0.01
    };

    // Luz tenue simulando reflejo
    const light = new THREE.PointLight(0xffffff, 0.3, 3);
    light.position.copy(mesh.position);
    mesh.add(light);

    scene.add(mesh);
    cinturónMeshes.push(mesh);
  }
}
function crearPolvoAsteroides() {
  const particleCount = 500; // cantidad de partículas
  const positions = [];

  for (let i = 0; i < particleCount; i++) {
    const radius = THREE.MathUtils.lerp(cinturónAsteroides.innerRadius, cinturónAsteroides.outerRadius, Math.random());
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 1.5;
    positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const textureLoader = new THREE.TextureLoader();
  const particleTexture = textureLoader.load('/textures/dust.png'); // textura circular blanca/transparente

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

function animate() {
  requestAnimationFrame(animate);

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

  if (saturnRings) {
    const saturnoMesh = planetMeshesMap.get('Saturno');
    saturnRings.position.copy(saturnoMesh.position);
    saturnRings.rotation.z += 0.002;
    saturnRings.visible = (!alineados || planetaVisitadoIndex === planetas.findIndex(p => p.nombre === 'Saturno'));
  }



  camera.lookAt(lookAtTarget);
  if (controlsEnabled) {
    controls.update();
  }
  // HUD ligado al movimiento de la cámara
  const hudElement = document.querySelector('.hud-container');
  if (hudElement) {
    const tiltX = camera.rotation.x * (180 / Math.PI) * 0.2; // Inclinación vertical
    const tiltY = camera.rotation.y * (180 / Math.PI) * 0.2; // Inclinación horizontal

    hudElement.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  }
  // Actualizar reflejo del casco según posición de la luz del Sol
  const helmetReflection = document.querySelector('.helmet-reflection');
  if (helmetReflection && scene && camera) {
    // Obtener la luz puntual del Sol (suponemos que está en escena)
    const sunLight = scene.children.find(obj => obj.isPointLight);
    if (sunLight) {
      // Vector de la luz respecto a la cámara
      const lightPos = sunLight.position.clone();
      const camPos = camera.position.clone();

      const dir = lightPos.sub(camPos).normalize();

      // Proyectar el vector en 2D para reflejo (x,y)
      // Convertir el vector a valores entre 0% y 100%
      const reflectX = 50 + dir.x * 50;  // 0% a 100%
      const reflectY = 50 - dir.y * 50;

      // Opacidad basada en ángulo de incidencia (más brillante cuando está enfrente)
      const dot = dir.dot(camera.getWorldDirection(new THREE.Vector3()));
      const opacity = THREE.MathUtils.clamp(dot, 0, 1) * 0.1 + 0.02;

      helmetReflection.style.setProperty('--reflect-x', `${reflectX}%`);
      helmetReflection.style.setProperty('--reflect-y', `${reflectY}%`);
      helmetReflection.style.setProperty('--reflect-opacity', opacity.toFixed(3));
    }
  }
  // ISS orbitando la Tierra
  if (tierraMesh && issMesh) {
    if (!issMesh.userData.orbitAngle) issMesh.userData.orbitAngle = 0;
    issMesh.userData.orbitAngle += iss.orbitaVelocidad;

    issMesh.position.set(
      tierraMesh.position.x + Math.cos(issMesh.userData.orbitAngle) * iss.orbitaRadio,
      0,
      tierraMesh.position.z + Math.sin(issMesh.userData.orbitAngle) * iss.orbitaRadio
    );

    issMesh.rotation.y += ROTACION_VELOCIDAD * 2;
    issMesh.visible = (!alineados || planetaVisitadoIndex === planetas.findIndex(p => p.nombre === 'Tierra'));
  }

  // Cinturón de asteroides girando
  cinturónMeshes.forEach((mesh, i) => {
    cinturónOrbitAngles[i] += mesh.userData.orbitSpeed;
    mesh.position.set(
      Math.cos(cinturónOrbitAngles[i]) * mesh.userData.orbitRadius,
      mesh.position.y,
      Math.sin(cinturónOrbitAngles[i]) * mesh.userData.orbitRadius
    );

    // Rotación lenta
    mesh.rotation.x += mesh.userData.rotationSpeed.x;
    mesh.rotation.y += mesh.userData.rotationSpeed.y;

    // Parpadeo de luz
    const light = mesh.children[0];
    if (light && light.isPointLight) {
      light.intensity = 0.2 + Math.sin(Date.now() * 0.005 + i) * 0.1;
    }
  });

  renderer.render(scene, camera);
}


// Nueva función para comenzar misión
function comenzarMision() {
  missionStarted = true;
  
  // Detener órbitas pero mantener rotación
  planetas.forEach((p, i) => {
    originalOrbitSpeeds[`planet_${i}`] = p.orbitaVelocidad;
    p.orbitaVelocidad = 0; // Detener movimiento orbital
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

  // Habilitar interacción
  controls.enabled = true;
  controlsEnabled = true;
  renderer.domElement.style.pointerEvents = 'auto';
  
  // Actualizar UI
  document.getElementById('comenzar-btn').style.display = 'none';
  document.getElementById('finalizar-btn').style.display = 'block';
  document.getElementById('explore-btn').style.display = 'none';
  
  // Mover cámara a vista panorámica
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

// Nueva función para finalizar misión
function finalizarMision() {
  missionStarted = false;
  
  // Restaurar órbitas
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

  // Deshabilitar interacción
  controls.enabled = false;
  controlsEnabled = false;
  renderer.domElement.style.pointerEvents = 'none';
  
  // Actualizar UI
  document.getElementById('comenzar-btn').style.display = 'block';
  document.getElementById('finalizar-btn').style.display = 'none';
  hidePlanetInfoPanel();
  
  // Restaurar vista inicial
  gsap.to(camera.position, {
    duration: 2,
    x: 0,
    y: 10,
    z: 60,
    ease: 'power2.inOut'
  });
}

function moveCameraToPlanet(index) {
  planetaVisitadoIndex = index;
  const isMobile = window.innerWidth < 768;

  controls.enabled = false;
  controlsEnabled = false;

  if (index === 0) {
    // 🌞 Vista para el Sol
    alineados = false;
    const size = planetMeshes[index].userData.sizeOriginal;
    const distanceFactor = isMobile ? 5 : 6; // Más alejado que un planeta normal
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
    // 🪐 Vista para otros planetas
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


function moveCameraClose(index) {
  const targetPos = planetMeshes[index].position;
  const isMobile = window.innerWidth < 768;

  const size = planetMeshes[index].userData.sizeOriginal;

  // 📏 Calcular distancia ideal según el tamaño
  const distanceFactor = isMobile ? 3 : 4; // Factor base
  const offset = size * distanceFactor;

  controls.enabled = false;
  controlsEnabled = false;

  gsap.to(camera.position, {
    duration: 2,
    x: targetPos.x - offset,
    y: isMobile ? size * 0.8 : size * 1,
    z: offset,
    ease: 'power2.inOut',
    onComplete: () => {
      controls.target.copy(targetPos);
      controls.enabled = true;
      controlsEnabled = true;
      // Mostrar el panel info extra
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

let typewriterTimeout = null;

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

// Nueva función para manejar clics
function onClick(event) {
  // Solo procesar clicks si la misión ha comenzado
  if (!missionStarted || controlsEnabled) return;

  event.stopPropagation(); // Evitar que el click se propague

  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  // Incluir todos los objetos clickeables
  const clickableObjects = [...planetMeshes];
  if (lunaMesh) clickableObjects.push(lunaMesh);
  if (issMesh) clickableObjects.push(issMesh);
  if (planetMeshesMap.get('Sol')) clickableObjects.push(planetMeshesMap.get('Sol'));

  const intersects = raycaster.intersectObjects(clickableObjects, true);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    selectObject(object);
  }
}

function selectObject(object) {
  // Limpiar selección anterior
  if (selectedObject && selectedObject.userData.originalMaterial) {
    selectedObject.material = selectedObject.userData.originalMaterial;
  }

  // Seleccionar nuevo objeto
  selectedObject = object;
  object.userData.originalMaterial = object.material.clone();
  
  // Aplicar efecto de selección
  const highlightMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.5,
    wireframe: true
  });
  object.material = highlightMaterial;

  // Posicionar botón EXPLORAR
  const exploreBtn = document.getElementById('explore-btn');
  const vector = object.position.clone();
  vector.project(camera);

  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (vector.y * -0.5 + 0.5) * window.innerHeight;

  exploreBtn.style.display = 'block';
  exploreBtn.style.left = `${x}px`;
  exploreBtn.style.top = `${y}px`;
  exploreBtn.onclick = () => {
    explorarObjeto(object);
    exploreBtn.style.display = 'none';
  };
}

// Nueva función para explorar objetos
function explorarObjeto(object) {
  const size = object.userData.sizeOriginal || 1;
  const distanceFactor = 3;
  const offset = size * distanceFactor;

  controls.enabled = false;
  controlsEnabled = false;

  gsap.to(camera.position, {
    duration: 2,
    x: object.position.x - offset,
    y: size * 1.5,
    z: object.position.z + offset,
    ease: 'power2.inOut',
    onComplete: () => {
      controls.target.copy(object.position);
      mostrarInformacionObjeto(object);
    }
  });

  gsap.to(lookAtTarget, {
    duration: 2,
    x: object.position.x,
    y: object.position.y,
    z: object.position.z,
    ease: 'power2.inOut'
  });
}

// Nueva función para mostrar información
function mostrarInformacionObjeto(object) {
  const infoPanel = document.getElementById('planet-info-panel');
  const funfactsPanel = document.getElementById('planet-funfacts-panel');
  
  if (object === lunaMesh) {
    showMoonInfo();
  } else if (object === issMesh) {
    showISSInfo();
  } else {
    const index = planetMeshes.indexOf(object);
    if (index !== -1) {
      showPlanetInfoPanel(index);
    }
  }
  
  // Ocultar botón EXPLORAR
  document.getElementById('explore-btn').style.display = 'none';
}

// Reducir velocidad orbital del objeto seleccionado
function reduceOrbitSpeed(object) {
  // Guardar velocidades originales
  if (object === lunaMesh) {
    originalOrbitSpeeds.luna = luna.orbitaVelocidad;
    luna.orbitaVelocidad *= 0.2; // Reducir a 20% de velocidad
  }
  else if (object === issMesh) {
    originalOrbitSpeeds.iss = iss.orbitaVelocidad;
    iss.orbitaVelocidad *= 0.2;
  }
  else {
    const index = planetMeshes.indexOf(object);
    if (index !== -1) {
      originalOrbitSpeeds.planet = planetas[index].orbitaVelocidad;
      planetas[index].orbitaVelocidad *= 0.2;
    }
  }
}

// Restaurar velocidad orbital
function restoreOrbitSpeed() {
  if (!selectedObject) return;

  // Restaurar material original si existe
  if (selectedObject.userData.originalMaterial) {
    selectedObject.material = selectedObject.userData.originalMaterial;
  }

  // Restaurar velocidad orbital
  if (selectedObject === lunaMesh) {
    luna.orbitaVelocidad = originalOrbitSpeeds.luna;
  }
  else if (selectedObject === issMesh) {
    iss.orbitaVelocidad = originalOrbitSpeeds.iss;
  }
  else {
    const index = planetMeshes.indexOf(selectedObject);
    if (index !== -1) {
      planetas[index].orbitaVelocidad = originalOrbitSpeeds.planet;
    }
  }

  selectedObject = null;
  hideExploreButton();
}

// Mostrar botón de explorar
function showExploreButton(object) {
  const exploreBtn = document.getElementById('explore-btn');
  if (!exploreBtn) return;

  // Posicionar el botón cerca del objeto en pantalla
  const vector = new THREE.Vector3();
  vector.setFromMatrixPosition(object.matrixWorld);
  vector.project(camera);

  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (vector.y * -0.5 + 0.5) * window.innerHeight;

  exploreBtn.style.display = 'block';
  exploreBtn.style.left = `${x}px`;
  exploreBtn.style.top = `${y}px`;

  // Asignar evento
  exploreBtn.onclick = () => {
    if (object === lunaMesh) {
      exploreLuna();
    } else if (object === issMesh) {
      exploreISS();
    } else {
      const index = planetMeshes.indexOf(object);
      if (index !== -1) {
        if (planetas[index].nombre === 'Saturno') {
          explorarSaturno(index);
        } else {
          moveCameraClose(index);
        }
      }
    }
    hideExploreButton();
  };
}

// Ocultar botón de explorar
function hideExploreButton() {
  const exploreBtn = document.getElementById('explore-btn');
  if (exploreBtn) exploreBtn.style.display = 'none';
}

// Funciones de exploración específicas
function exploreLuna() {
  const tierraIndex = planetas.findIndex(p => p.nombre === 'Tierra');
  const tierraPos = planetMeshes[tierraIndex].position;

  gsap.to(camera.position, {
    duration: 2,
    x: tierraPos.x + luna.orbitaRadio * 0.8,
    y: luna.tamaño * 2,
    z: tierraPos.z + luna.orbitaRadio * 0.8,
    ease: 'power3.inOut',
    onComplete: () => {
      controls.target.copy(lunaMesh.position);
      controls.enabled = true;
      controlsEnabled = true;
      showMoonInfo();
    }
  });
}

function exploreISS() {
  const tierraIndex = planetas.findIndex(p => p.nombre === 'Tierra');
  const tierraPos = planetMeshes[tierraIndex].position;

  gsap.to(camera.position, {
    duration: 1.5,
    x: tierraPos.x + iss.orbitaRadio * 0.6,
    y: iss.tamaño * 10,
    z: tierraPos.z + iss.orbitaRadio * 0.6,
    ease: 'power2.inOut',
    onComplete: () => {
      controls.target.copy(issMesh.position);
      controls.enabled = true;
      controlsEnabled = true;
      showISSInfo();
    }
  });
}

// Funciones para mostrar información
function showMoonInfo() {
  const infoPanel = document.getElementById('planet-info-panel');
  if (!infoPanel) return;

  infoPanel.className = 'moon-panel';
  infoPanel.innerHTML = `
    <h2 class="special-panel-title">LUNA</h2>
    <p><strong>Diámetro:</strong> 3,474 km</p>
    <p><strong>Distancia Tierra:</strong> 384,400 km</p>
    <p><strong>Temperatura:</strong> -173°C a 127°C</p>
    <p><strong>Gravedad:</strong> 1.62 m/s² (16.5% de la Tierra)</p>
    <p style="margin-top:15px;">Único satélite natural de la Tierra y el quinto más grande del sistema solar.</p>
    <button onclick="hidePlanetInfoPanel()" class="hud-btn" style="margin-top:20px;">CERRAR</button>
  `;

  infoPanel.style.display = 'block';
  gsap.from(infoPanel, { duration: 0.8, x: 50, opacity: 0, ease: "power3.out" });
}

function showISSInfo() {
  const infoPanel = document.getElementById('planet-info-panel');
  if (!infoPanel) return;

  infoPanel.className = 'iss-panel';
  infoPanel.innerHTML = `
    <h2 class="special-panel-title">ESTACIÓN ESPACIAL INTERNACIONAL</h2>
    <p><strong>Altura:</strong> ~400 km</p>
    <p><strong>Velocidad:</strong> 27,600 km/h</p>
    <p><strong>Órbita:</strong> 90 minutos por vuelta</p>
    <p><strong>Tripulación:</strong> 7 astronautas</p>
    <p style="margin-top:15px;">Laboratorio orbital que completa 16 vueltas a la Tierra cada día.</p>
    <button onclick="hidePlanetInfoPanel()" class="hud-btn" style="margin-top:20px;">CERRAR</button>
  `;

  infoPanel.style.display = 'block';
  gsap.from(infoPanel, { duration: 0.8, x: 50, opacity: 0, ease: "power3.out" });
}

function showPlanetInfoPanel(index) {
  const infoPanel = document.getElementById('planet-info-panel');
  const funfactsPanel = document.getElementById('planet-funfacts-panel');
  if (!infoPanel || !funfactsPanel) return;

  const planeta = planetas[index];

  // Panel derecho
  infoPanel.querySelector('.planet-name').textContent = planeta.nombre;
  infoPanel.querySelector('.planet-distance').textContent = planeta.distancia;
  infoPanel.querySelector('.planet-temp').textContent = planeta.temperatura;
  infoPanel.querySelector('.planet-extra').textContent = planeta.infoExtra || 'No hay información extra disponible.';
  infoPanel.style.display = 'block';

  // Panel izquierdo con tipeo
  const funfactElement = funfactsPanel.querySelector('.planet-funfact');
  funfactsPanel.style.display = 'block';
  typewriterEffect(funfactElement, planeta.datoCurioso || 'Sin datos curiosos disponibles.', 35);

  // Ocultar HUD principal
  const hud = document.querySelector('.hud-container');
  if (hud) hud.style.display = 'none';

  // Animaciones
  gsap.fromTo(infoPanel, { x: 50, opacity: 0 }, { duration: 0.8, x: 0, opacity: 1, ease: "power3.out" });
  gsap.fromTo(funfactsPanel, { x: -50, opacity: 0 }, { duration: 0.8, x: 0, opacity: 1, ease: "power3.out" });
}


function hidePlanetInfoPanel() {
  const infoPanel = document.getElementById('planet-info-panel');
  const funfactsPanel = document.getElementById('planet-funfacts-panel');

  if (infoPanel) {
    gsap.to(infoPanel, { duration: 0.5, x: 50, opacity: 0, ease: "power3.in", onComplete: () => infoPanel.style.display = 'none' });
  }
  if (funfactsPanel) {
    gsap.to(funfactsPanel, { duration: 0.5, x: -50, opacity: 0, ease: "power3.in", onComplete: () => funfactsPanel.style.display = 'none' });
  }

  // Mostrar HUD de nuevo
  const hud = document.querySelector('.hud-container');
  if (hud) hud.style.display = 'flex';
}

function hideFunFactsPanel() {
  const funfactsPanel = document.getElementById('planet-funfacts-panel');
  if (funfactsPanel) {
    gsap.to(funfactsPanel, { duration: 0.5, x: -50, opacity: 0, ease: "power3.in", onComplete: () => funfactsPanel.style.display = 'none' });
  }
}
window.hidePlanetInfoPanel = hidePlanetInfoPanel;
window.hideFunFactsPanel = hideFunFactsPanel;


function explorarSaturno(index) {
  const targetPos = planetMeshes[index].position;
  const size = planetMeshes[index].userData.sizeOriginal;

  const distanceFactor = 3; // Factor de distancia lateral
  const offset = size * distanceFactor;

  controls.enabled = false;
  controlsEnabled = false;

  gsap.to(camera.position, {
    duration: 3,
    x: targetPos.x + offset,
    y: size * 1.5,
    z: offset * 2,
    ease: 'power3.inOut',
    onComplete: () => {
      controls.target.copy(targetPos);
      controls.enabled = true;
      controlsEnabled = true;
    }
  });

  gsap.to(lookAtTarget, {
    duration: 3,
    x: targetPos.x,
    y: targetPos.y,
    z: targetPos.z,
    ease: 'power3.inOut'
  });
}

// HUD
export function hudController() {
  return {
    mensaje: "Exploración del Sistema Solar",
    comenzarMision() {
      comenzarMision();
    },
    finalizarMision() {
      finalizarMision();
    },
    init() {
      initScene();
      updateDateTime();
      
      // Forzar el orden z-index al iniciar
      document.getElementById('scene').style.zIndex = '1';
      document.querySelector('.hud-container').style.zIndex = '2';
    }
  };
}
window.hudController = hudController;
