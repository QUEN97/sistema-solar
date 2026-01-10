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

// Variables para sistemas dinámicos
let fuel = 100;
let lastFuelUpdate = Date.now();

const ROTACION_VELOCIDAD = 0.005;
const lookAtTarget = new THREE.Vector3();

// Mensajes de comunicación
const communicationMessages = [
  "Estación Base: Sistemas nominales",
  "Control: Permiso para exploración concedido",
  "Satélite Meteorológico: Condiciones estables",
  "Alerta: Tormenta solar menor detectada",
  "Comunicación: Señal fuerte y estable",
  "Navegación: Trayectoria estable",
  "Sensores: Lecturas dentro de parámetros"
];

// =============================================
// FUNCIONES PRINCIPALES DEL SISTEMA SOLAR
// =============================================

/**
 * Inicializa la escena 3D principal con todos los elementos del sistema solar
 */
export function initScene() {
  const canvas = document.getElementById('scene');
  if (!canvas) {
    console.error('❌ Canvas no encontrado');
    return;
  }

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
  crearISS().then(() => {
    console.log('ISS completamente inicializada');
  }).catch(error => {
    console.error('Error al cargar ISS:', error);
  });
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

  // Eventos del sistema
  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('click', onClick, false);
  document.body.addEventListener('click', startAudio);

  console.log('Escena 3D inicializada correctamente');
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
}

/**
 * Actualiza la fecha y hora actual en la interfaz HUD
 */
function updateDateTime() {
  const now = new Date();
  const dateElement = document.getElementById('current-date');
  const timeElement = document.getElementById('current-time');

  if (dateElement) dateElement.textContent = now.toLocaleDateString();
  if (timeElement) timeElement.textContent = now.toLocaleTimeString();
}

/**
 * Inicia la música ambiental del espacio (solo una vez)
 */
function startAudio() {
  if (audioStarted) return;
  const audio = new Audio('/audio/space-ambient.mp3');
  audio.loop = true;
  audio.volume = 0.5;
  audio.play().catch(e => console.log('Audio no pudo reproducirse automáticamente'));
  audioStarted = true;
}

/**
 * Ajusta el tamaño de la escena cuando cambia el tamaño de la ventana
 */
function onWindowResize() {
  if (!camera || !renderer) return;

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

   // Velocidades de rotación realistas
  const rotationSpeeds = {
    'Sol': 0.002,
    'Mercurio': 0.008,
    'Venus': -0.004, // Gira en sentido contrario
    'Tierra': 0.006,
    'Marte': 0.006,
    'Júpiter': 0.015, // Júpiter gira más rápido
    'Saturno': 0.012,
    'Urano': 0.005,
    'Neptuno': 0.005
  };

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

    //Guardar datos
    mesh.userData.sizeOriginal = size;
    mesh.userData.nombre = p.nombre;
    mesh.userData.rotationSpeed = rotationSpeeds[p.nombre] || 0.005;

     // Inclinar ejes de rotación (especialmente para Urano que rota de lado)
    if (p.nombre === 'Urano') {
      mesh.rotation.x = Math.PI / 2; // Rotado 90 grados
    } else if (p.nombre === 'Venus') {
      mesh.rotation.x = Math.PI; // Venus rota en sentido contrario
    }
    
    scene.add(mesh);
    planetMeshes.push(mesh);
    planetMeshesMap.set(p.nombre, mesh);

    // Crear anillos especiales para Saturno
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
  lunaMesh.userData.nombre = 'Luna';
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

        // Posición inicial en órbita terrestre
        issMesh.position.set(iss.orbitaRadio, 0, 0);

        issMesh.userData = issMesh.userData || {};
        issMesh.userData.orbitAngle = 0;
        issMesh.userData.sizeOriginal = 0.24;
        issMesh.userData.nombre = 'ISS';
        issMesh.userData.tipo = 'iss';

        // Marcar todos los hijos como parte de la ISS
        issMesh.traverse((child) => {
          if (child.isMesh) {
            child.userData = child.userData || {};
            child.userData.esISS = true;
          }
        });

        scene.add(issMesh);
        console.log('✅ ISS cargada correctamente');
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
    const geom = new THREE.IcosahedronGeometry(size, 1);
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

  // MOVIMIENTO ORBITAL cuando no hay misión activa
  if (!missionStarted) {
    planetMeshes.forEach((mesh, i) => {
      const p = planetas[i];

      // ROTACIÓN SOBRE SU PROPIO EJE (esto es lo que falta)
      // Cada planeta rota a diferentes velocidades
      if (mesh.userData) {
        if (!mesh.userData.rotationSpeed) {
          // Asignar velocidad de rotación única para cada planeta
          const rotationSpeeds = {
            'Sol': 0.002,
            'Mercurio': 0.008,
            'Venus': -0.004, // Gira en sentido contrario
            'Tierra': 0.006,
            'Marte': 0.006,
            'Júpiter': 0.015,
            'Saturno': 0.012,
            'Urano': 0.005,
            'Neptuno': 0.005
          };
          mesh.userData.rotationSpeed = rotationSpeeds[p.nombre] || 0.005;
        }
        // Aplicar rotación
        mesh.rotation.y += mesh.userData.rotationSpeed;
      }

      // ÓRBITA alrededor del Sol
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
      // Rotación de la Luna sobre su eje
      if (!lunaMesh.userData.rotationSpeed) {
        lunaMesh.userData.rotationSpeed = 0.001;
      }
      lunaMesh.rotation.y += lunaMesh.userData.rotationSpeed;

      // Órbita alrededor de la Tierra
      lunaOrbitAngle += luna.orbitaVelocidad;
      const tierraPos = planetMeshesMap.get('Tierra')?.position;
      if (tierraPos) {
        lunaMesh.position.set(
          tierraPos.x + Math.cos(lunaOrbitAngle) * luna.orbitaRadio,
          0,
          tierraPos.z + Math.sin(lunaOrbitAngle) * luna.orbitaRadio
        );
      }
    }

    // Movimiento de la ISS
    if (issMesh) {
      // Rotación de la ISS sobre su eje
      issMesh.rotation.y += ROTACION_VELOCIDAD * 2;

      // Órbita alrededor de la Tierra
      issMesh.userData.orbitAngle += iss.orbitaVelocidad;
      const tierraPos = planetMeshesMap.get('Tierra')?.position;
      if (tierraPos) {
        issMesh.position.set(
          tierraPos.x + Math.cos(issMesh.userData.orbitAngle) * iss.orbitaRadio,
          0,
          tierraPos.z + Math.sin(issMesh.userData.orbitAngle) * iss.orbitaRadio
        );
      }
    }
  }

  // También agregar rotación durante la misión (cuando no están orbitando)
  if (missionStarted) {
    planetMeshes.forEach((mesh, i) => {
      if (mesh.userData && mesh.userData.rotationSpeed) {
        mesh.rotation.y += mesh.userData.rotationSpeed;
      } else {
        // Si no tiene velocidad asignada, usar una por defecto
        mesh.rotation.y += 0.005;
      }
    });

    // Rotar Luna y ISS durante la misión
    if (lunaMesh && lunaMesh.userData && lunaMesh.userData.rotationSpeed) {
      lunaMesh.rotation.y += lunaMesh.userData.rotationSpeed;
    }

    if (issMesh) {
      issMesh.rotation.y += ROTACION_VELOCIDAD * 0.5;
    }
  }

  // Actualizar anillos de Saturno
  if (saturnRings) {
    const saturnoMesh = planetMeshesMap.get('Saturno');
    if (saturnoMesh) {
      saturnRings.position.copy(saturnoMesh.position);
      saturnRings.rotation.z += 0.002;
    }
  }

  // Actualizar cámara y controles
  if (camera) {
    camera.lookAt(lookAtTarget);
  }
  if (controlsEnabled && controls) {
    controls.update();
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
  });

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// =============================================
// SISTEMA DE MISIÓN Y EXPLORACIÓN
// =============================================

/**
 * Inicia el modo de exploración libre del sistema solar
 */
function comenzarMision() {
  console.log('🚀 Iniciando misión...');
  missionStarted = true;

  // Actualizar estado de navegación
  actualizarEstadoNavegacion('activa');

  showAlert("MISIÓN INICIADA - SISTEMAS DE NAVEGACIÓN ACTIVADOS");

  // Resetear selecciones anteriores
  if (selectedObject) {
    restoreObjectMaterial(selectedObject);
    selectedObject = null;
  }
  hideExploreButton();
  hidePlanetInfoPanel();

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
  if (controls) {
    controls.enabled = true;
  }
  controlsEnabled = true;
  if (renderer) {
    renderer.domElement.style.pointerEvents = 'auto';
  }

  // Actualizar interfaz de usuario
  const comenzarBtn = document.getElementById('comenzar-btn');
  const finalizarBtn = document.getElementById('finalizar-btn');
  if (comenzarBtn) comenzarBtn.style.display = 'none';
  if (finalizarBtn) finalizarBtn.style.display = 'block';

  // Inicializar radar en tiempo real
  initRadarSystem();

  console.log('Misión iniciada correctamente');
}

/**
 * Finaliza el modo de exploración y vuelve a la vista automática
 */
function finalizarMision() {
  console.log('Finalizando misión...');
  missionStarted = false;

  // Actualizar estado de navegación
  actualizarEstadoNavegacion('inactiva');

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
  if (controls) {
    controls.enabled = false;
  }
  controlsEnabled = false;
  if (renderer) {
    renderer.domElement.style.pointerEvents = 'none';
  }

  // Actualizar interfaz
  const comenzarBtn = document.getElementById('comenzar-btn');
  const finalizarBtn = document.getElementById('finalizar-btn');
  if (comenzarBtn) comenzarBtn.style.display = 'block';
  if (finalizarBtn) finalizarBtn.style.display = 'none';

  console.log('Misión finalizada correctamente');
}

/**
 * Actualiza el estado de navegación en el HUD
 */
function actualizarEstadoNavegacion(estado) {
  const navElement = document.querySelector('.system-indicator:nth-child(2) .system-status');
  if (navElement) {
    const statusLight = navElement.querySelector('.status-light');
    const statusText = navElement.lastChild; // Usar lastChild en lugar de childNodes[2]

    if (estado === 'activa') {
      if (statusLight) statusLight.className = 'status-light status-online';
      if (statusText && statusText.nodeType === Node.TEXT_NODE) {
        statusText.textContent = 'ACTIVA';
      }
    } else {
      if (statusLight) statusLight.className = 'status-light status-warning';
      if (statusText && statusText.nodeType === Node.TEXT_NODE) {
        statusText.textContent = 'INACTIVA';
      }
    }
  }
}

// =============================================
// SISTEMAS DINÁMICOS DEL HUD
// =============================================

/**
 * Inicializa todos los sistemas dinámicos del HUD
 */
export function initDynamicSystems() {
  console.log('Inicializando sistemas dinámicos del HUD...');

  // Inicializar monitoreo de batería
  initBatterySystem();

  // Inicializar sistemas en tiempo real
  initRealTimeSystems();

  // Inicializar efectos de cabina
  initCockpitEffects();

  // Inicializar radar básico
  initRadarSystem();

  console.log('Sistemas dinámicos inicializados');
}

/**
 * Sistema de monitoreo de batería
 */
function initBatterySystem() {
  // API de Battery Status
  if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
      updateBatteryUI(battery.level * 100, battery.charging);

      battery.addEventListener('levelchange', () => {
        updateBatteryUI(battery.level * 100, battery.charging);
      });

      battery.addEventListener('chargingchange', () => {
        updateBatteryUI(battery.level * 100, battery.charging);
      });
    });
  } else {
    // Fallback: simular batería
    updateBatteryUI(75, false);
  }
}

/**
 * Actualiza la UI de la batería
 */
function updateBatteryUI(level, charging) {
  const powerLevel = document.querySelector('.power-level');
  const batteryText = document.getElementById('battery-level');
  const systemStatus = document.getElementById('system-status');

  if (powerLevel) powerLevel.style.width = `${level}%`;
  if (batteryText) batteryText.textContent = `${Math.round(level)}%`;

  // Actualizar estado del sistema basado en batería
  if (systemStatus) {
    if (level > 60) {
      systemStatus.innerHTML = '<span class="status-light status-online"></span>SISTEMA ESTABLE';
    } else if (level > 30) {
      systemStatus.innerHTML = '<span class="status-light status-warning"></span>ENERGÍA BAJA';
    } else {
      systemStatus.innerHTML = '<span class="status-light status-critical"></span>ENERGÍA CRÍTICA';
    }
  }

  // Actualizar sensores y escudos según batería
  updateSystemsByBattery(level);

  // Efecto de carga
  if (powerLevel) {
    if (charging) {
      powerLevel.style.animation = 'chargingPulse 2s infinite';
    } else {
      powerLevel.style.animation = 'none';
    }
  }
}

/**
 * Actualiza sensores y escudos según nivel de batería
 */
function updateSystemsByBattery(batteryLevel) {
  const sensorsElement = document.querySelector('.system-indicator:nth-child(4) .system-status');
  const shieldsElement = document.querySelector('.system-indicator:nth-child(3) .system-status');

  if (sensorsElement && shieldsElement) {
    // Sensores (más sensibles)
    const sensorsLevel = Math.min(100, batteryLevel + 20);
    updateSystemUI(sensorsElement, sensorsLevel);

    // Escudos (consumen más energía)
    const shieldsLevel = Math.max(0, batteryLevel - 15);
    updateSystemUI(shieldsElement, shieldsLevel);
  }
}

/**
 * Actualiza la UI de un sistema individual
 */
function updateSystemUI(element, level) {
  const statusLight = element.querySelector('.status-light');
  const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
  const textNode = textNodes[0];

  if (statusLight) {
    if (level > 70) {
      statusLight.className = 'status-light status-online';
    } else if (level > 40) {
      statusLight.className = 'status-light status-warning';
    } else {
      statusLight.className = 'status-light status-critical';
    }
  }

  if (textNode) {
    textNode.textContent = ` ${Math.round(level)}%`;
  }
}

/**
 * Inicializa sistemas en tiempo real
 */
function initRealTimeSystems() {
  // Coordenadas en tiempo real
  setInterval(updateCoordinates, 1000);

  // Sistema de combustible
  setInterval(updateFuelSystem, 500);

  // Alertas contextuales
  setInterval(generateContextualAlerts, 3000);

  // Comunicaciones
  setTimeout(showCommunicationMessage, 5000);
  setInterval(showCommunicationMessage, 15000);
}

/**
 * Actualiza coordenadas de la cámara
 */
function updateCoordinates() {
  const coordsElement = document.getElementById('coords-display');
  if (coordsElement && camera) {
    const x = camera.position.x.toFixed(2);
    const y = camera.position.y.toFixed(2);
    const z = camera.position.z.toFixed(2);
    coordsElement.textContent = `X${x} Y${y} Z${z}`;
  }
}

/**
 * Sistema de combustible
 */
function updateFuelSystem() {
  if (!missionStarted || !camera) return;

  const now = Date.now();
  const delta = (now - lastFuelUpdate) / 1000;
  lastFuelUpdate = now;

  // Consumo basado en movimiento de cámara
  const speed = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
  fuel -= speed * delta * 0.1;
  fuel = Math.max(0, fuel);

  updateFuelUI();
}

/**
 * Actualiza UI del combustible
 */
function updateFuelUI() {
  const fuelElement = document.getElementById('fuel-display');
  if (fuelElement) {
    fuelElement.textContent = `${Math.round(fuel)}%`;

    // Alertas de combustible crítico
    if (fuel < 20 && missionStarted) {
      showAlert('COMBUSTIBLE CRÍTICO - REGRESAR A BASE', 3000);
    }
  }
}

/**
 * Mensajes de comunicación
 */
function showCommunicationMessage() {
  if (!missionStarted) return;

  const message = communicationMessages[Math.floor(Math.random() * communicationMessages.length)];
  const commElement = document.getElementById('comms-display');

  if (commElement) {
    commElement.textContent = `COM: ${message}`;
    setTimeout(() => {
      if (commElement) commElement.textContent = 'COM: Esperando transmisión...';
    }, 5000);
  }
}

/**
 * Sistema de radar
 */
function initRadarSystem() {
  // Actualizar radar cada segundo
  setInterval(updateRadar, 1000);
  // Actualizar inmediatamente
  updateRadar();
}

/**
 * Actualiza el radar con las posiciones de los planetas
 */
function updateRadar() {
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
    const maxDistance = 80;
    const normalizedX = 50 + (planet.position.x / maxDistance) * 40;
    const normalizedY = 50 + (planet.position.z / maxDistance) * 40;

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
 * Alertas contextuales
 */
function generateContextualAlerts() {
  if (!missionStarted || !camera) return;

  // Alerta de temperatura cerca del Sol
  const distanceToSun = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
  if (distanceToSun < 15) {
    showAlert('ALERTA: TEMPERATURA CRÍTICA - ALEJARSE DEL SOL', 2000);
  }

  // Alerta de cinturón de asteroides
  const inAsteroidBelt = camera.position.x > 35 && camera.position.x < 45;
  if (inAsteroidBelt && Math.random() < 0.1) {
    showAlert('PRECAUCIÓN: PROXIMIDAD A ASTEROIDES', 1500);
  }
}

/**
 * Muestra alerta en el panel de alertas
 */
function showAlert(message, duration = 3000) {
  const alertPanel = document.getElementById('alert-panel');
  const alertMessage = document.getElementById('alert-message');

  if (alertPanel && alertMessage) {
    alertMessage.textContent = message;
    alertPanel.style.display = 'block';

    setTimeout(() => {
      alertPanel.style.display = 'none';
    }, duration);
  }
}

/**
 * Inicializa efectos de la cabina de nave espacial
 */
function initCockpitEffects() {
  createCockpitParticles();
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

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 20}s`;
    particle.style.animationDuration = `${15 + Math.random() * 15}s`;
    particlesContainer.appendChild(particle);
  }
}

// =============================================
// SISTEMA DE INTERACCIÓN Y SELECCIÓN
// =============================================

/**
 * Maneja clics en objetos 3D para seleccionarlos
 */
function onClick(event) {
  if (!missionStarted) {
    console.log('Misión no iniciada - no se puede seleccionar');
    return;
  }

  event.stopPropagation();

  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const clickableObjects = [...planetMeshes];
  if (lunaMesh) clickableObjects.push(lunaMesh);
  if (issMesh) clickableObjects.push(issMesh);

  const intersects = raycaster.intersectObjects(clickableObjects, true);

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    let objectToSelect = intersectedObject;

    // Si el objeto clickeado es un hijo de la ISS, usar la ISS principal
    if (issMesh && isChildOfISS(intersectedObject)) {
      objectToSelect = issMesh;
    }

    selectObject(objectToSelect);
  } else {
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
    if (current === scene) break;
  }
  return false;
}

/**
 * Selecciona un objeto y muestra el botón de exploración
 */
function selectObject(object) {
  // Restaurar objeto previamente seleccionado
  if (selectedObject && selectedObject !== object) {
    restoreObjectMaterial(selectedObject);
  }

  // Si ya está seleccionado, no hacer nada
  if (selectedObject === object) {
    return;
  }

  selectedObject = object;
  showExploreButton(object);
}

/**
 * Restaura el material original de un objeto
 */
function restoreObjectMaterial(object) {
  if (!object) return;

  if (object.userData && object.userData.originalMaterial) {
    object.material = object.userData.originalMaterial;
  }
}

/**
 * Muestra el botón de exploración cerca del objeto seleccionado
 */
function showExploreButton(object) {
  const exploreBtn = document.getElementById('explore-btn');
  if (!exploreBtn) return;

  try {
    // Obtener la posición mundial del objeto
    const worldPosition = new THREE.Vector3();
    object.getWorldPosition(worldPosition);

    // Proyectar la posición 3D a coordenadas 2D de pantalla
    const screenPosition = worldPosition.clone();
    screenPosition.project(camera);

    // Convertir coordenadas normalizadas (-1 a 1) a píxeles
    let x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
    let y = (1 - (screenPosition.y * 0.5 + 0.5)) * window.innerHeight;

    // Offset para el botón
    y -= 50;

    // Verificar si la posición está dentro de la pantalla visible
    const margin = 80;
    const isOnScreen = (
      x >= margin && x <= window.innerWidth - margin &&
      y >= margin && y <= window.innerHeight - margin
    );

    if (isOnScreen) {
      exploreBtn.style.left = `${x}px`;
      exploreBtn.style.top = `${y}px`;
    } else {
      // Posición de respaldo: centro de la pantalla
      exploreBtn.style.left = '50%';
      exploreBtn.style.top = '30%';
    }

    // Mostrar el botón
    exploreBtn.style.display = 'block';
    exploreBtn.style.pointerEvents = 'auto';
    exploreBtn.style.zIndex = '10000';

    // Configurar el evento de click
    exploreBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      explorarObjeto(object);
    };

  } catch (error) {
    console.error('Error en showExploreButton:', error);
    // Fallback: mostrar botón en posición segura
    exploreBtn.style.left = '50%';
    exploreBtn.style.top = '30%';
    exploreBtn.style.display = 'block';
    exploreBtn.style.pointerEvents = 'auto';
    exploreBtn.style.zIndex = '10000';

    exploreBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
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
  if (!object) return;

  // Restaurar material inmediatamente al explorar
  restoreObjectMaterial(object);
  hideExploreButton();

  // Ocultar todos los planetas excepto el seleccionado
  mostrarSoloPlanetaSeleccionado(object);

  // Encontrar el índice del planeta para obtener sus datos
  let planetIndex = -1;
  const esISS = object === issMesh || object.userData?.esISS || object.userData?.tipo === 'iss';
  const esLuna = object === lunaMesh || object.userData?.nombre === 'Luna';

  if (!esLuna && !esISS) {
    planetIndex = planetMeshes.indexOf(object);
  }

  const size = object.userData?.sizeOriginal || 1;
  const isMobile = window.innerWidth < 768;

  try {
    // Obtener posición mundial del objeto
    const objectWorldPos = new THREE.Vector3();
    object.getWorldPosition(objectWorldPos);

    // Calcular posición de cámara basada en el tipo de objeto
    let targetPosition;
    let lookAtPosition = objectWorldPos.clone();

    if (planetIndex !== -1 && planetas[planetIndex]?.nombre === 'Saturno') {
      // Vista especial para Saturno para ver los anillos
      const distance = isMobile ? 12 : 15;
      targetPosition = new THREE.Vector3(
        objectWorldPos.x + distance,
        objectWorldPos.y + (isMobile ? 3 : 4),
        objectWorldPos.z
      );
    } else if (esISS) {
      // Vista especial para la ISS
      const distance = isMobile ? 3 : 4;
      targetPosition = new THREE.Vector3(
        objectWorldPos.x - distance,
        objectWorldPos.y + distance * 0.5,
        objectWorldPos.z + distance * 0.3
      );
    } else if (esLuna) {
      // Vista para la Luna
      const distance = isMobile ? size * 4 : size * 5;
      targetPosition = new THREE.Vector3(
        objectWorldPos.x - distance,
        objectWorldPos.y + size * 0.5,
        objectWorldPos.z + distance * 0.5
      );
    } else {
      // Vista normal para planetas
      const distance = isMobile ? size * 3 : size * 4;
      targetPosition = new THREE.Vector3(
        objectWorldPos.x - distance,
        objectWorldPos.y + (isMobile ? size * 0.8 : size * 1.2),
        objectWorldPos.z + distance * 0.5
      );
    }

    // Deshabilitar controles temporalmente
    controls.enabled = false;
    controlsEnabled = false;

    // Configurar el objetivo de la cámara
    controls.target.copy(lookAtPosition);

    // Animación de acercamiento de cámara
    gsap.to(camera.position, {
      duration: 2.5,
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      ease: 'power2.inOut',
      onUpdate: () => {
        camera.lookAt(lookAtPosition);
        controls.target.copy(lookAtPosition);
      },
      onComplete: () => {
        controls.target.copy(lookAtPosition);
        controls.enabled = true;
        controlsEnabled = true;
        mostrarInformacionObjeto(object);
      }
    });

  } catch (error) {
    console.error('Error en explorarObjeto:', error);
    mostrarInformacionObjeto(object);
  }
}

/**
 * Muestra solo el planeta seleccionado y oculta los demás
 */
function mostrarSoloPlanetaSeleccionado(object) {
  // Ocultar TODOS los objetos primero
  planetMeshes.forEach(mesh => {
    mesh.visible = false;
  });
  if (lunaMesh) lunaMesh.visible = false;
  if (issMesh) issMesh.visible = false;
  if (saturnRings) saturnRings.visible = false;

  // Determinar el tipo de objeto y mostrar solo lo necesario
  const esLuna = object === lunaMesh || object.userData?.nombre === 'Luna';
  const esISS = object === issMesh || object.userData?.esISS || object.userData?.tipo === 'iss';

  if (esLuna) {
    // Mostrar Luna y Tierra
    const tierraMesh = planetMeshesMap.get('Tierra');
    if (tierraMesh) tierraMesh.visible = true;
    if (lunaMesh) lunaMesh.visible = true;
  }
  else if (esISS) {
    // Mostrar ISS y Tierra
    const tierraMesh = planetMeshesMap.get('Tierra');
    if (tierraMesh) tierraMesh.visible = true;
    if (issMesh) issMesh.visible = true;
  }
  else {
    // Mostrar solo el planeta seleccionado
    object.visible = true;

    // Mostrar anillos si es Saturno
    if (object === planetMeshesMap.get('Saturno') && saturnRings) {
      saturnRings.visible = true;
    }
  }
}

/**
 * Muestra la información del objeto seleccionado en el panel
 */
function mostrarInformacionObjeto(object) {
  const infoPanel = document.getElementById('planet-info-panel');
  const funfactsPanel = document.getElementById('planet-funfacts-panel');

  if (!infoPanel || !funfactsPanel) return;

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
    infoHTML = `
      <h2 class="text-cyan-300 text-xl font-bold mb-4">ESTACIÓN ESPACIAL INTERNACIONAL</h2>
      <p><strong>Altura orbital:</strong> ~408 km</p>
      <p><strong>Velocidad:</strong> 27,600 km/h</p>
      <p><strong>Órbita:</strong> 90 minutos alrededor de la Tierra</p>
      <p><strong>Tripulación:</strong> Hasta 7 astronautas</p>
      <p><strong>Países participantes:</strong> 15 naciones</p>
      <p><strong>Lanzamiento:</strong> Primer módulo en 1998</p>
      <p class="mt-3">Laboratorio de investigación en microgravedad que sirve como base para experimentos científicos internacionales.</p>
      <button onclick="hidePlanetInfoPanel()" class="cockpit-btn mt-4">CERRAR</button>
    `;
    funfactsPanel.style.display = 'none';
  } else {
    // Para planetas normales
    const index = planetMeshes.indexOf(object);
    if (index !== -1 && planetas[index]) {
      const planeta = planetas[index];
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
    }
  }

  // Actualizar contenido
  infoPanel.innerHTML = infoHTML;
  infoPanel.style.display = 'block';

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
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
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
 * Oculta el panel de información del planeta
 */
function hidePlanetInfoPanel() {
  const infoPanel = document.getElementById('planet-info-panel');
  const funfactsPanel = document.getElementById('planet-funfacts-panel');
  const hud = document.querySelector('.spaceship-cockpit');

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
      if (infoPanel) infoPanel.style.display = 'none';
      if (funfactsPanel) funfactsPanel.style.display = 'none';
      if (controls) {
        controls.enabled = true;
      }
      controlsEnabled = true;
    }
  });
}

// =============================================
// INICIALIZACIÓN COMPLETA DEL SISTEMA
// =============================================

// HUD Controller para Alpine.js
export function hudController() {
  return {
    mensaje: "Sistema de Navegación Espacial",
    iniciado: false,

    comenzarMision() {
      if (window.comenzarMision) {
        window.comenzarMision();
      } else {
        console.error('comenzarMision no está disponible');
      }
    },

    finalizarMision() {
      if (window.finalizarMision) {
        window.finalizarMision();
      } else {
        console.error('finalizarMision no está disponible');
      }
    },

    init() {
      // Esperar a que el DOM esté listo
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.inicializarSistemaCompleto();
        });
      } else {
        this.inicializarSistemaCompleto();
      }
    },

    inicializarSistemaCompleto() {
      // Inicializar la escena 3D
      if (window.initScene) {
        window.initScene();
      }

      // Inicializar sistemas dinámicos después de un breve delay
      setTimeout(() => {
        if (window.initDynamicSystems) {
          window.initDynamicSystems();
        }
        this.iniciado = true;
        console.log('🚀 Sistema de nave espacial completamente inicializado');
      }, 1000);
    }
  };
}

// Hacer funciones disponibles globalmente
window.hudController = hudController;
window.comenzarMision = comenzarMision;
window.finalizarMision = finalizarMision;
window.hidePlanetInfoPanel = hidePlanetInfoPanel;
window.initScene = initScene;
window.initDynamicSystems = initDynamicSystems;