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
  orbitaRadio: 3.6, // Radio orbital alrededor de la Tierra
  orbitaVelocidad: 0.0008,
  tamaño: 0.72
};

// Datos de la Estación Espacial Internacional
const iss = {
  nombre: 'ISS',
  textura: '/textures/iss.png',
  orbitaRadio: 2.4, // Radio orbital (más cerca que la Luna)
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
let issOrbitAngle = 0;
let saturnRings = null;
let issMesh = null;
let cinturónMeshes = [];
let cinturónOrbitAngles = [];
let alineados = false;
let planetaVisitadoIndex = 0;
let audioStarted = false;
let typewriterTimeout = null;

// Variables para sistemas dinámicos
// Variables para sistemas dinámicos
let fuel = 100;
let energy = 100;
let missionStartTime = null;
let fuelConsumptionRate = 0.05; // % por segundo
let energyConsumptionRate = 0.03; // % por segundo
let lastFuelUpdate = Date.now();
let isRefueling = false;
let refuelInterval = null;

// Variables para sistema de daño solar
let solarDamageEnabled = true;
let shieldDamageRate = 0.1; // % por segundo cerca del Sol
let solarWarningDistance = 25; // Distancia para advertencia
let solarDangerDistance = 15; // Distancia para daño
let lastShieldDamageTime = Date.now();
let inSolarDangerZone = false;
let shields = 100; // Nivel de escudos separado de energía

// Variables para recuperación automática
let autoRecoveryEnabled = true;
let autoRecoveryInterval = null;
let recoverySpeed = 0.5; // % por segundo

let orientationCheckInterval = null;

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

  // Configuración del canvas para móviles
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '1';
  canvas.style.pointerEvents = 'auto';

  // Detectar si es móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Crear escena, cámara y renderizador
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 5000);
  // Posición inicial basada en dispositivo
  if (isMobile && window.innerWidth < window.innerHeight) {
    // Vertical - vista más cercana
    camera.position.set(0, 5, 35);
  } else if (isMobile) {
    // Horizontal - vista óptima
    camera.position.set(0, 8, 45);
  } else {
    // Desktop
    camera.position.set(0, 10, 60);
  }

  // Configurar orientación para móviles
  // setupMobileOrientation();

  camera.position.set(0, 10, 60);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Configurar controles de órbita para navegación
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 0.2;
  controls.maxDistance = 120;
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
  crearCometas();
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
  // Inicializar HUD para móviles
  updateHUDForMobile();

  // Verificar orientación al iniciar
  if (window.innerHeight > window.innerWidth) {
    showOrientationAlert();
  }

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

  // Obtener dimensiones reales de la ventana
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);

  // Ajustes específicos para dispositivos móviles
  if (!missionStarted) {
    if (width < 768 || height > width) {
      // Modo vertical - ajustar para vista general
      camera.position.z = 35;
      camera.position.y = 5;

      // Forzar orientación horizontal si está en vertical
      if (height > width && !missionStarted) {
        showOrientationAlert();
      }
    } else {
      // Modo horizontal - vista óptima
      camera.position.z = 50;
      camera.position.y = 8;
    }
  }

  if (controls) {
    controls.update();
  }
  if (!missionStarted) {
    updateHUDForMobile();
  }
}

function showOrientationAlert() {
  if (document.getElementById('orientation-alert')) return;

  const alert = document.createElement('div');
  alert.id = 'orientation-alert';
  alert.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    text-align: center;
    padding: 20px;
    font-family: 'Orbitron', sans-serif;
  `;

  alert.innerHTML = `
    <h2 style="color: #00f0ff; margin-bottom: 20px; font-size: 1.5rem;">GIRA TU DISPOSITIVO</h2>
    <p style="color: #ccc; margin-bottom: 30px; font-size: 1rem;">
      Para una mejor experiencia, usa el dispositivo en modo horizontal
    </p>
    <div style="font-size: 3rem;">↻</div>
    <p style="color: #00ffaa; margin-top: 30px; font-size: 0.9rem;">
      El sistema solar se verá mejor en orientación horizontal
    </p>
  `;

  document.body.appendChild(alert);

  // Escuchar cambios de orientación
  window.addEventListener('orientationchange', function () {
    if (window.innerWidth > window.innerHeight) {
      alert.remove();
      onWindowResize(); // Reajustar
    }
  });

  // También escuchar resize
  window.addEventListener('resize', function () {
    if (window.innerWidth > window.innerHeight) {
      alert.remove();
      onWindowResize();
    }
  });
}

// function setupMobileOrientation() {
//   // Verificar orientación cada 500ms (para detectar cambios rápidos)
//   if (orientationCheckInterval) {
//     clearInterval(orientationCheckInterval);
//   }

//   orientationCheckInterval = setInterval(() => {
//     updateHUDForMobile();
//     onWindowResize();
//   }, 500);

//   // También escuchar eventos de orientación
//   window.addEventListener('orientationchange', () => {
//     setTimeout(() => {
//       updateHUDForMobile();
//       onWindowResize();
//     }, 300); // Pequeño delay para que el navegador actualice dimensiones
//   });
// }

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
      //mesh.rotation.x = Math.PI; // Venus rota en sentido contrario
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

function crearCometas() {
  const loader = new THREE.TextureLoader();

  cometas.forEach((c, index) => {
    const geometry = new THREE.SphereGeometry(c.tamaño, 16, 16);
    const texture = loader.load(c.textura);

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: 0xffffff,
      emissiveIntensity: 0.4
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Posición inicial
    mesh.position.set(c.afelio, 0, 0);

    mesh.userData = {
      nombre: c.nombre,
      tipo: 'cometa',
      perihelio: c.perihelio,
      afelio: c.afelio,
      velocidad: c.velocidad,
      inclinacion: c.inclinacion
    };

    scene.add(mesh);
    cometasMeshes.push(mesh);
    cometasOrbitAngles.push(Math.random() * Math.PI * 2);
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
        issMesh.userData.orbitSpeed = iss.orbitaVelocidad;

        // Marcar todos los hijos como parte de la ISS
        issMesh.traverse((child) => {
          if (child.isMesh) {
            child.userData = child.userData || {};
            child.userData.esISS = true;
          }
        });

        scene.add(issMesh);
        console.log('ISS cargada correctamente');
        resolve(issMesh);
      },
      undefined,
      error => {
        console.error('Error cargando ISS:', error);
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

// =============================
// COMETAS
// =============================
const cometas = [
  {
    nombre: 'Halley',
    tamaño: 0.4,
    textura: '/textures/comet.jpg',
    perihelio: 8,
    afelio: 110,
    velocidad: 0.0012,
    inclinacion: 0.6
  },
  {
    nombre: 'Encke',
    tamaño: 0.3,
    textura: '/textures/comet.jpg',
    perihelio: 6,
    afelio: 45,
    velocidad: 0.0022,
    inclinacion: 0.3
  }
];

let cometasMeshes = [];
let cometasOrbitAngles = [];

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
    // 1. Planetas orbitando alrededor del Sol
    planetMeshes.forEach((mesh, i) => {
      const p = planetas[i];

      // ROTACIÓN SOBRE SU PROPIO EJE
      if (mesh.userData) {
        if (!mesh.userData.rotationSpeed) {
          const rotationSpeeds = {
            'Sol': 0.002,
            'Mercurio': 0.008,
            'Venus': -0.004,
            'Tierra': 0.006,
            'Marte': 0.006,
            'Júpiter': 0.015,
            'Saturno': 0.012,
            'Urano': 0.005,
            'Neptuno': 0.005
          };
          mesh.userData.rotationSpeed = rotationSpeeds[p.nombre] || 0.005;
        }
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

    // 2. LUNA orbitando alrededor de la Tierra
    if (lunaMesh) {
      // Rotación de la Luna sobre su eje
      if (!lunaMesh.userData.rotationSpeed) {
        lunaMesh.userData.rotationSpeed = 0.001;
      }
      lunaMesh.rotation.y += lunaMesh.userData.rotationSpeed;

      // Actualizar ángulo de órbita
      lunaOrbitAngle += luna.orbitaVelocidad;

      // Obtener posición actual de la Tierra
      const tierraMesh = planetMeshesMap.get('Tierra');
      if (tierraMesh) {
        const tierraPos = tierraMesh.position;

        // Calcular nueva posición orbital alrededor de la Tierra
        const lunaX = tierraPos.x + Math.cos(lunaOrbitAngle) * luna.orbitaRadio;
        const lunaZ = tierraPos.z + Math.sin(lunaOrbitAngle) * luna.orbitaRadio;

        lunaMesh.position.set(lunaX, 0, lunaZ);
      }
    }

    // 3. ISS orbitando alrededor de la Tierra
    if (issMesh) {
      // Rotación de la ISS sobre su eje
      issMesh.rotation.y += ROTACION_VELOCIDAD * 2;

      // Actualizar ángulo de órbita
      if (!issMesh.userData.orbitAngle) {
        issMesh.userData.orbitAngle = 0;
      }
      issMesh.userData.orbitAngle += iss.orbitaVelocidad;

      // Obtener posición actual de la Tierra
      const tierraMesh = planetMeshesMap.get('Tierra');
      if (tierraMesh) {
        const tierraPos = tierraMesh.position;

        // Calcular nueva posición orbital alrededor de la Tierra
        // La ISS orbita más rápido y más cerca que la Luna
        const issX = tierraPos.x + Math.cos(issMesh.userData.orbitAngle) * iss.orbitaRadio;
        const issZ = tierraPos.z + Math.sin(issMesh.userData.orbitAngle) * iss.orbitaRadio;

        issMesh.position.set(issX, 0, issZ);
      }
    }
  }

  // VERIFICAR PROXIMIDAD AL SOL 
  if (missionStarted && solarDamageEnabled) {
    checkSolarProximity();
  }

  // También agregar rotación durante la misión (cuando no están orbitando)
  if (missionStarted) {
    planetMeshes.forEach((mesh, i) => {
      if (mesh.userData && mesh.userData.rotationSpeed) {
        mesh.rotation.y += mesh.userData.rotationSpeed;
      } else {
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

  // COMETAS - órbitas elípticas seguras
  if (!missionStarted) {
    cometasMeshes.forEach((mesh, i) => {
      if (!mesh.userData) return;

      const {
        perihelio,
        afelio,
        velocidad,
        inclinacion
      } = mesh.userData;

      if (velocidad === undefined) return;

      cometasOrbitAngles[i] += velocidad;

      const x = Math.cos(cometasOrbitAngles[i]) * afelio;
      const z = Math.sin(cometasOrbitAngles[i]) * perihelio;

      mesh.position.set(
        x,
        Math.sin(cometasOrbitAngles[i]) * inclinacion * 10,
        z
      );

      mesh.rotation.y += 0.01;
    });
  }

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
  console.log('Iniciando misión...');
  // Verificar que haya suficiente combustible
  if (fuel < 50) {
    showAlert(`❌ COMBUSTIBLE INSUFICIENTE: ${Math.round(fuel)}% - MÍNIMO 50% REQUERIDO`, 4000);
    return;
  }

  // Inicializar escudos al 100%
  shields = 100;
  inSolarDangerZone = false;

  // Verificar que haya suficiente energía
  if (energy < 30) {
    showAlert(`❌ ENERGÍA INSUFICIENTE: ${Math.round(energy)}% - RECARGAR SISTEMAS`, 4000);
    return;
  }
  missionStarted = true;
  missionStartTime = Date.now();

  setTimeout(() => {
    updateAllSystems();
    updateSystemsByEnergy(energy);
  }, 100);

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
    controlsEnabled = true;
  }

  if (renderer && renderer.domElement) {
    renderer.domElement.style.pointerEvents = 'auto';
  }

  // Actualizar botones en panel móvil
  const mobileStartBtn = document.querySelector('.mission-btn-container button:first-child');
  const mobileEndBtn = document.querySelector('.mission-btn-container button:last-child');

  if (mobileStartBtn) mobileStartBtn.style.display = 'none';
  if (mobileEndBtn) mobileEndBtn.style.display = 'block';

  // if (renderer) {
  //   renderer.domElement.style.pointerEvents = 'auto';
  // }

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

  // Resetear sistema de daño solar
  inSolarDangerZone = false;

  // Ocultar efectos solares
  const solarEffect = document.getElementById('solar-damage-effect');
  if (solarEffect) {
    solarEffect.style.opacity = 0;
  }

  // Actualizar estado de navegación
  actualizarEstadoNavegacion('inactiva');

  // Mostrar estadísticas de misión
  if (missionStartTime) {
    const missionDuration = Math.round((Date.now() - missionStartTime) / 1000);
    const fuelUsed = 100 - fuel;
    showAlert(`MISIÓN FINALIZADA - Duración: ${missionDuration}s - Combustible usado: ${Math.round(fuelUsed)}%`, 5000);
    missionStartTime = null;
  }

  // Iniciar recuperación automática INMEDIATAMENTE
  setTimeout(() => {
    startAutoRecovery();
  }, 100);

  // Resetear selección actual
  if (selectedObject) {
    restoreObjectMaterial(selectedObject);
    selectedObject = null;
  }

  // Actualizar botones en panel móvil
  const mobileStartBtn = document.querySelector('.mission-btn-container button:first-child');
  const mobileEndBtn = document.querySelector('.mission-btn-container button:last-child');

  if (mobileStartBtn) mobileStartBtn.style.display = 'block';
  if (mobileEndBtn) mobileEndBtn.style.display = 'none';

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

  // Restaurar cámara a posición de vista general
  controls.target.set(0, 0, 0);

  // Posición de cámara para vista general
  if (window.innerWidth < 768) {
    camera.position.set(0, 8, 40);
  } else {
    camera.position.set(0, 10, 60);
  }

  controls.update();

  // Deshabilitar controles
  if (controls) {
    controls.enabled = false;
  }
  controlsEnabled = false;

  // Actualizar interfaz
  const comenzarBtn = document.getElementById('comenzar-btn');
  const finalizarBtn = document.getElementById('finalizar-btn');
  if (comenzarBtn) comenzarBtn.style.display = 'block';
  if (finalizarBtn) finalizarBtn.style.display = 'none';

  // Iniciar recarga automática si combustible está bajo
  if (fuel < 50) {
    setTimeout(startRefueling, 2000);
  }

  console.log('Misión finalizada correctamente');
}

/**
 * Actualiza el estado de navegación en el HUD
 */
function actualizarEstadoNavegacion(estado) {
  const navigationElement = document.querySelector('.compact-system:nth-child(2) .compact-system-status');

  if (navigationElement) {
    if (estado === 'activa') {
      navigationElement.innerHTML = '<span class="status-light status-online"></span>ACTIVA';
    } else {
      navigationElement.innerHTML = '<span class="status-light status-warning"></span>INACTIVA';
    }
    navigationElement.title = `NAVEGACIÓN: ${estado === 'activa' ? 'ACTIVA' : 'INACTIVA'}`;
  }
}

// =============================================
// SISTEMAS DINÁMICOS DEL HUD
// =============================================

/**
 * Inicializa todos los sistemas dinámicos del HUD
 */
function initDynamicSystems() {
  console.log('Inicializando sistemas dinámicos del HUD...');

  // Inicializar combustible y energía
  fuel = 100;
  energy = 100;
  shields = 100;
  updateFuelUI();
  updateEnergyUI();
  updateShieldsUI();

  // Inicializar estado de navegación
  initializeNavigationSystem();
  actualizarEstadoNavegacion('inactiva'); // Estado inicial

  // Iniciar sistema de recuperación automática
  startAutoRecovery();

  // Iniciar radar inmediatamente
  setTimeout(() => {
    initRadarSystem();
  }, 500);

  // Inicializar monitoreo de batería
  initBatterySystem();

  // Inicializar sistemas en tiempo real
  initRealTimeSystems();


  console.log('Sistemas dinámicos inicializados');
}

/**
 * Sistema de monitoreo de batería
 */
function initBatterySystem() {
  // API de Battery Status del navegador
  if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
      console.log('🔋 Batería del dispositivo detectada:', Math.round(battery.level * 100), '%');

      // Actualizar UI inicial
      updateBatteryUI(battery.level * 100, battery.charging);

      // Event listeners
      battery.addEventListener('levelchange', () => {
        updateBatteryUI(battery.level * 100, battery.charging);
      });

      battery.addEventListener('chargingchange', () => {
        updateBatteryUI(battery.level * 100, battery.charging);
      });

      // También actualizar sistemas basados en batería del dispositivo
      battery.addEventListener('levelchange', () => {
        updateSystemsByBattery(battery.level * 100);
      });
    });
  } else {
    // Fallback: simular batería del dispositivo
    console.log('⚠️ API de batería no disponible, usando simulación');
    const simulatedBattery = 75; // 75% por defecto
    const isCharging = false;

    updateBatteryUI(simulatedBattery, isCharging);
    updateSystemsByBattery(simulatedBattery);

    // Simular cambios aleatorios
    setInterval(() => {
      const change = (Math.random() - 0.5) * 2; // -1 a +1
      simulatedBattery = Math.max(10, Math.min(100, simulatedBattery + change));
      updateBatteryUI(simulatedBattery, isCharging);
      updateSystemsByBattery(simulatedBattery);
    }, 30000); // Cada 30 segundos
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
  // Solo usar si la batería del dispositivo está disponible
  // De lo contrario, usar updateSystemsByEnergy()

  const sensorsElement = document.querySelector('.compact-system:nth-child(4) .compact-system-status');
  const shieldsElement = document.querySelector('.compact-system:nth-child(3) .compact-system-status');

  if (sensorsElement && shieldsElement) {
    // Sensores (más sensibles a la batería)
    const sensorsLevel = Math.min(100, batteryLevel + 15);

    // Escudos (consumen más energía)
    const shieldsLevel = Math.max(0, batteryLevel - 20);

    // Actualizar UI
    updateCompactSystemUI(sensorsElement, sensorsLevel, 'SENSORES');
    updateCompactSystemUI(shieldsElement, shieldsLevel, 'ESCUDOS');
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

  // Sistema de combustible (cada 100ms para más precisión)
  setInterval(updateFuelSystem, 100);

  // Sistema de energía (cada 500ms)
  setInterval(updateEnergySystem, 500);

  // Actualizar todos los sistemas (cada segundo)
  setInterval(() => {
    updateAllSystems();
  }, 1000);

  // Sistema de daño solar (cada 500ms)
  setInterval(() => {
    if (missionStarted) {
      checkSolarProximity();
    }
  }, 500);

  // Alertas contextuales
  setInterval(generateContextualAlerts, 3000);

  // Comunicaciones - PRIMER MENSAJE
  setTimeout(() => {
    showCommunicationMessage();
  }, 2000);

  // Comunicaciones - MENSAJES PERIÓDICOS
  // Cada 10-20 segundos cuando la misión está activa, cada 30 segundos cuando está inactiva
  setInterval(() => {
    if (missionStarted) {
      // Durante misión: mensajes más frecuentes
      if (Math.random() > 0.4) { // 60% de probabilidad
        showCommunicationMessage();
      }
    } else {
      // Sin misión: mensajes menos frecuentes
      if (Math.random() > 0.7) { // 30% de probabilidad
        showCommunicationMessage();
      }
    }
  }, 10000); // Revisar cada 10 segundos
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
  if (!missionStarted || !camera || fuel <= 0) return;

  const now = Date.now();
  const delta = (now - lastFuelUpdate) / 1000; // Segundos desde la última actualización
  lastFuelUpdate = now;

  // Consumo básico por tiempo
  fuel -= fuelConsumptionRate * delta;

  // Consumo adicional basado en movimiento de cámara
  const cameraSpeed = calculateCameraSpeed();
  fuel -= cameraSpeed * delta * 0.01;

  // Limitar valores
  fuel = Math.max(0, Math.min(100, fuel));

  // Si combustible llega a 0, finalizar misión automáticamente
  if (fuel <= 0.5) {
    fuel = 0;
    showAlert('COMBUSTIBLE AGOTADO - MISIÓN AUTOMÁTICAMENTE FINALIZADA', 4000);
    finalizarMision();
  }

  updateFuelUI();
}

/**
 * Calcula la velocidad de movimiento de la cámara
 */
function calculateCameraSpeed() {
  if (!camera || !controls) return 0;

  // Velocidad basada en distancia del target
  const distanceToTarget = camera.position.distanceTo(controls.target);
  const baseSpeed = 0.5;

  return Math.min(5, baseSpeed + (distanceToTarget * 0.01));
}

/**
 * Actualiza UI del combustible
 */
function updateFuelUI() {
  const fuelElement = document.getElementById('fuel-display');
  const fuelBar = document.querySelector('.compact-power-level');

  if (fuelElement) {
    fuelElement.textContent = `${Math.round(fuel)}%`;
    fuelElement.className = fuel < 20 ? 'value text-red-400' : 'value text-cyan-200';
  }

  if (fuelBar) {
    fuelBar.style.width = `${fuel}%`;

    // Cambiar color según nivel
    if (fuel < 20) {
      fuelBar.style.background = 'linear-gradient(90deg, #ff4444, #ff0000)';
    } else if (fuel < 50) {
      fuelBar.style.background = 'linear-gradient(90deg, #ffaa00, #ff8800)';
    } else {
      fuelBar.style.background = 'linear-gradient(90deg, #00ff88, #00ccff)';
    }
  }

  // Alertas de combustible crítico
  if (fuel < 20 && fuel > 0 && missionStarted) {
    showAlert('⚠️ COMBUSTIBLE CRÍTICO - REGRESAR A BASE', 3000);
  }
}

/**
 * Sistema de energía
 */
function updateEnergySystem() {
  if (!missionStarted || energy <= 0) return;

  // Consumo de energía por tiempo
  energy -= energyConsumptionRate * 0.1;
  energy = Math.max(0, Math.min(100, energy));

  // Consumo adicional cuando se explora un planeta
  if (selectedObject) {
    energy -= 0.02;
  }

  updateEnergyUI();
  updateAllSystems();
}

/**
 * Actualiza UI de energía
 */
function updateEnergyUI() {
  const energyElement = document.getElementById('battery-level');
  const energyBar = document.querySelector('.compact-power-level');
  const systemStatus = document.getElementById('system-status');

  if (energyElement) {
    energyElement.textContent = `${Math.round(energy)}%`;
  }

  if (systemStatus) {
    if (energy > 70) {
      systemStatus.innerHTML = '<span class="status-light status-online"></span>SISTEMA ESTABLE';
    } else if (energy > 40) {
      systemStatus.innerHTML = '<span class="status-light status-warning"></span>ENERGÍA BAJA';
    } else if (energy > 0) {
      systemStatus.innerHTML = '<span class="status-light status-critical"></span>ENERGÍA CRÍTICA';
    } else {
      systemStatus.innerHTML = '<span class="status-light status-critical"></span>SISTEMA APAGADO';
      // Si energía es 0, forzar fin de misión
      if (missionStarted) {
        finalizarMision();
      }
    }
  }

  // Actualizar sensores y escudos según energía
  updateSystemsByEnergy(energy);

  // Efecto visual para la barra de energía
  if (energyBar) {
    energyBar.style.width = `${energy}%`;

    // Cambiar color según nivel
    if (energy < 20) {
      energyBar.style.background = 'linear-gradient(90deg, #ff4444, #ff0000)';
      energyBar.style.animation = 'pulse 1s infinite';
    } else if (energy < 50) {
      energyBar.style.background = 'linear-gradient(90deg, #ffaa00, #ff8800)';
      energyBar.style.animation = 'none';
    } else {
      energyBar.style.background = 'linear-gradient(90deg, #00ff88, #00ccff)';
      energyBar.style.animation = 'none';
    }
  }
}

/**
 * Actualiza sensores y escudos según nivel de energía
 */
function updateSystemsByEnergy(energyLevel) {
  const sensorsElement = document.querySelector('.compact-system:nth-child(4) .compact-system-status');
  const shieldsElement = document.querySelector('.compact-system:nth-child(3) .compact-system-status');

  if (!sensorsElement || !shieldsElement) {
    console.warn('⚠️ Elementos de sensores o escudos no encontrados');
    return;
  }

  // Sensores - basados en energía
  const sensorsLevel = calculateSystemLevel(energyLevel, 'sensors');

  // ESCUDOS - usar la variable shields (afectada por daño solar)
  const shieldsLevel = Math.max(0, Math.min(100, shields));

  // Actualizar UI de sensores
  updateCompactSystemUI(sensorsElement, sensorsLevel, 'SENSORES');

  // Actualizar UI de escudos
  updateCompactSystemUI(shieldsElement, shieldsLevel, 'ESCUDOS');

  // Alertas si sistemas están críticos
  if (missionStarted) {
    if (sensorsLevel < 30) {
      showAlert('⚠️ SENSORES CRÍTICOS - VISIBILIDAD REDUCIDA', 2000);
    }
    if (shieldsLevel < 20) {
      showAlert('🛡️ ESCUDOS CRÍTICOS - VULNERABILIDAD ALTA', 2000);
    }
    if (shieldsLevel <= 0) {
      showAlert('💥 ESCUDOS DESTRUIDOS - EXPUESTO A RADIACIÓN SOLAR', 3000);
    }
  }
}

/**
 * Calcula el nivel de un sistema basado en la energía disponible
 */
function calculateSystemLevel(energyLevel, systemType) {
  let level = energyLevel;

  switch (systemType) {
    case 'sensors':
      // Sensores son 20% más eficientes
      level = Math.min(100, energyLevel + 20);
      // Penalización por baja energía
      if (energyLevel < 40) level *= 0.7;
      if (energyLevel < 20) level *= 0.5;
      break;

    case 'shields':
      // Escudos consumen 30% más energía
      level = Math.max(0, energyLevel - 30);
      // Efectos de baja energía
      if (energyLevel < 50) level *= 0.8;
      if (energyLevel < 30) level *= 0.6;
      if (energyLevel < 10) level = 0;
      break;

    case 'propulsion':
      // Propulsión usa energía directamente
      level = energyLevel;
      if (energyLevel < 30) level *= 0.6;
      break;

    case 'navigation':
      // Navegación menos afectada por baja energía
      level = Math.min(100, energyLevel + 10);
      break;
  }

  return Math.max(0, Math.min(100, Math.round(level)));
}

/**
 * Actualiza la UI de un sistema en el panel compacto
 * (Solo para sistemas que muestran porcentaje, NO para navegación)
 */
function updateCompactSystemUI(element, level, systemName) {
  if (!element) return;

  // Verificar que no sea el elemento de navegación
  const isNavigation = systemName === 'NAVEGACIÓN';
  if (isNavigation) {
    return; // No modificar navegación aquí
  }

  // Determinar estado basado en nivel
  let statusClass, statusText;

  if (level > 70) {
    statusClass = 'status-online';
    statusText = `${Math.round(level)}%`;
  } else if (level > 40) {
    statusClass = 'status-warning';
    statusText = `${Math.round(level)}%`;
  } else if (level > 0) {
    statusClass = 'status-critical';
    statusText = `${Math.round(level)}%`;
  } else {
    // SOLO mostrar "OFFLINE" si realmente es 0 Y estamos en misión
    if (missionStarted && level <= 0) {
      statusClass = 'status-critical';
      statusText = 'OFFLINE';
    } else {
      // Si no hay misión, mostrar porcentaje normal
      statusClass = 'status-online';
      statusText = `${Math.round(level)}%`;
    }
  }

  // Actualizar contenido del elemento
  element.innerHTML = `<span class="status-light ${statusClass}"></span>${statusText}`;

  // Actualizar tooltip si existe
  element.title = `${systemName}: ${level}%`;
}

/**
 * Inicializa el estado de navegación en el panel
 */
function initializeNavigationSystem() {
  const navigationElement = document.querySelector('.compact-system:nth-child(2) .compact-system-status');

  if (navigationElement) {
    if (missionStarted) {
      navigationElement.innerHTML = '<span class="status-light status-online"></span>ACTIVA';
    } else {
      navigationElement.innerHTML = '<span class="status-light status-warning"></span>INACTIVA';
    }
    navigationElement.title = `NAVEGACIÓN: ${missionStarted ? 'ACTIVA' : 'INACTIVA'}`;
  }
}

/**
 * Sistema de recarga de combustible y energía
 */
function startRefueling() {
  if (isRefueling) return;

  isRefueling = true;
  showAlert('⛽ RECARGANDO COMBUSTIBLE Y ENERGÍA...', 3000);

  refuelInterval = setInterval(() => {
    // Recargar más rápido cuando está en 0
    const rechargeRate = fuel === 0 ? 5 : 2;

    fuel += rechargeRate;
    energy += rechargeRate * 0.8;

    // Limitar máximos
    fuel = Math.min(100, fuel);
    energy = Math.min(100, energy);

    updateFuelUI();
    updateEnergyUI();

    // Si ambos están llenos, detener recarga
    if (fuel >= 100 && energy >= 100) {
      stopRefueling();
      showAlert('✅ RECARGA COMPLETA - SISTEMAS AL 100%', 3000);
    }
  }, 500);
}

/**
 * Actualiza todos los sistemas basados en la energía disponible
 */
function updateAllSystems() {
  // 1. PROPULSIÓN - Mostrar porcentaje basado en energía
  const propulsionElement = document.querySelector('.compact-system:nth-child(1) .compact-system-status');
  if (propulsionElement) {
    // Si no hay misión, mostrar energía actual directamente
    const propulsionLevel = missionStarted ? calculateSystemLevel(energy, 'propulsion') : energy;

    // Determinar estado
    let statusClass, statusText;

    if (propulsionLevel > 70) {
      statusClass = 'status-online';
      statusText = `${Math.round(propulsionLevel)}%`;
    } else if (propulsionLevel > 40) {
      statusClass = 'status-warning';
      statusText = `${Math.round(propulsionLevel)}%`;
    } else if (propulsionLevel > 0) {
      statusClass = 'status-critical';
      statusText = `${Math.round(propulsionLevel)}%`;
    } else {
      // Solo mostrar OFFLINE si es 0 Y estamos en misión
      if (missionStarted) {
        statusClass = 'status-critical';
        statusText = 'OFFLINE';
      } else {
        // Si no hay misión, mostrar 0% pero no OFFLINE
        statusClass = 'status-online';
        statusText = `${Math.round(propulsionLevel)}%`;
      }
    }

    propulsionElement.innerHTML = `<span class="status-light ${statusClass}"></span>${statusText}`;
    propulsionElement.title = `PROPULSIÓN: ${Math.round(propulsionLevel)}%`;
  }

  // 2. NAVEGACIÓN - Mostrar "ACTIVA" o "INACTIVA"
  const navigationElement = document.querySelector('.compact-system:nth-child(2) .compact-system-status');
  if (navigationElement) {
    if (missionStarted) {
      navigationElement.innerHTML = '<span class="status-light status-online"></span>ACTIVA';
    } else {
      navigationElement.innerHTML = '<span class="status-light status-warning"></span>INACTIVA';
    }
    navigationElement.title = `NAVEGACIÓN: ${missionStarted ? 'ACTIVA' : 'INACTIVA'}`;
  }

  // 3. ESCUDOS - Mostrar porcentaje actual (usando variable shields)
  const shieldsElement = document.querySelector('.compact-system:nth-child(3) .compact-system-status');
  if (shieldsElement) {
    // Si no hay misión, mostrar escudos recuperados (mínimo 80%)
    const displayShields = missionStarted ? shields : Math.max(80, shields);

    let statusClass, statusText;

    if (displayShields > 70) {
      statusClass = 'status-online';
      statusText = `${Math.round(displayShields)}%`;
    } else if (displayShields > 40) {
      statusClass = 'status-warning';
      statusText = `${Math.round(displayShields)}%`;
    } else if (displayShields > 0) {
      statusClass = 'status-critical';
      statusText = `${Math.round(displayShields)}%`;
    } else {
      // Solo mostrar DESTRUIDOS si estamos en misión
      if (missionStarted) {
        statusClass = 'status-critical';
        statusText = 'DESTRUIDOS';
      } else {
        // Si no hay misión, mostrar 0% pero no DESTRUIDOS
        statusClass = 'status-online';
        statusText = `${Math.round(displayShields)}%`;
      }
    }

    shieldsElement.innerHTML = `<span class="status-light ${statusClass}"></span>${statusText}`;
    shieldsElement.title = `ESCUDOS: ${Math.round(displayShields)}%`;
  }

  // 4. SENSORES - Mostrar porcentaje
  const sensorsElement = document.querySelector('.compact-system:nth-child(4) .compact-system-status');
  if (sensorsElement) {
    // Si no hay misión, mostrar 100%
    const sensorsLevel = missionStarted ? calculateSystemLevel(energy, 'sensors') : 100;

    updateCompactSystemUI(sensorsElement, sensorsLevel, 'SENSORES');
  }
}

/**
 * Sistema de recuperación automática después de misión
 */
function startAutoRecovery() {
  if (autoRecoveryInterval) {
    clearInterval(autoRecoveryInterval);
  }

  autoRecoveryInterval = setInterval(() => {
    if (!missionStarted) {
      recoverAllSystems();
    }
  }, 1000); // Recuperar cada segundo
}

/**
 * Recupera todos los sistemas gradualmente
 */
function recoverAllSystems() {
  // Recuperar combustible si está bajo 100%
  if (fuel < 100) {
    fuel += recoverySpeed;
    fuel = Math.min(100, fuel);
    updateFuelUI();
  }

  // Recuperar energía si está bajo 100%
  if (energy < 100) {
    energy += recoverySpeed * 0.8;
    energy = Math.min(100, energy);
    updateEnergyUI();
  }

  // Recuperar escudos a un mínimo de 80% si están bajos
  if (shields < 80) {
    shields += recoverySpeed * 1.2; // Los escudos se recuperan más rápido
    shields = Math.min(100, Math.max(80, shields)); // Mínimo 80%, máximo 100%
    updateShieldsUI();
  }

  // Actualizar todos los sistemas
  updateAllSystems();

  // Detener recuperación si todo está en niveles aceptables
  if (fuel >= 100 && energy >= 100 && shields >= 80) {
    if (autoRecoveryInterval) {
      clearInterval(autoRecoveryInterval);
      autoRecoveryInterval = null;
      console.log('✅ Sistemas recuperados a niveles normales');
    }
  }
}

/**
 * Detener recarga
 */
function stopRefueling() {
  if (refuelInterval) {
    clearInterval(refuelInterval);
    refuelInterval = null;
  }
  isRefueling = false;
}

/**
 * Mensajes de comunicación
 */
function showCommunicationMessage() {
  // Mostrar mensajes solo cuando la misión está activa
  // O mostrar mensajes menos frecuentes cuando está inactiva
  if (!missionStarted && Math.random() > 0.3) return; // 70% de probabilidad de no mostrar cuando inactivo

  const message = communicationMessages[Math.floor(Math.random() * communicationMessages.length)];
  const commElement = document.getElementById('comms-display');

  if (commElement) {
    // Efecto de "transmisión entrante"
    commElement.classList.add('transmitting');

    // Mostrar el mensaje con efecto
    gsap.to(commElement, {
      duration: 0.3,
      opacity: 0,
      onComplete: () => {
        commElement.textContent = `COM: ${message}`;
        gsap.to(commElement, {
          duration: 0.3,
          opacity: 1
        });

        // Después de 5 segundos, volver a "esperando"
        setTimeout(() => {
          if (commElement && !missionStarted) {
            gsap.to(commElement, {
              duration: 0.3,
              opacity: 0,
              onComplete: () => {
                commElement.textContent = 'COM: Esperando transmisión...';
                gsap.to(commElement, {
                  duration: 0.3,
                  opacity: 1
                });
              }
            });
          }
        }, 5000);
      }
    });
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

    // Usar posición actual del planeta (funciona con o sin misión)
    const planetPos = planet.position;
    const normalizedX = 50 + (planetPos.x / maxDistance) * 40;
    const normalizedY = 50 + (planetPos.z / maxDistance) * 40;

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
  // COMETAS EN RADAR
  cometasMeshes.forEach(mesh => {
    const blip = document.createElement('div');
    blip.className = 'radar-blip';
    blip.style.background = '#ff00ff'; // magenta distintivo

    const maxDistance = 120;
    const x = 50 + (mesh.position.x / maxDistance) * 40;
    const y = 50 + (mesh.position.z / maxDistance) * 40;

    blip.style.left = `${Math.max(10, Math.min(90, x))}%`;
    blip.style.top = `${Math.max(10, Math.min(90, y))}%`;
    blip.title = `Cometa ${mesh.userData.nombre}`;

    radar.appendChild(blip);
  });

}
// Iniciar radar inmediatamente al cargar
setTimeout(() => {
  initRadarSystem();
}, 1000);

/**
 * Alertas contextuales
 */
function generateContextualAlerts() {
  if (!missionStarted || !camera) return;

  // Alerta de temperatura cerca del Sol (mantener esta)
  const distanceToSun = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));

  if (distanceToSun < solarWarningDistance && distanceToSun >= solarDangerDistance) {
    // Solo mostrar cada 10 segundos para no saturar
    if (Math.random() < 0.2) {
      showAlert('🌡️ PROXIMIDAD AL SOL - TEMPERATURA AUMENTANDO', 2000);
    }
  }

  // Alerta de escudos bajos por daño solar
  if (inSolarDangerZone && shields < 50 && Math.random() < 0.3) {
    showAlert('🔥 DAÑO SOLAR DETECTADO - ESCUDOS BAJANDO', 2000);
  }

  // Alerta de cinturón de asteroides (mantener esta)
  const inAsteroidBelt = camera.position.x > 35 && camera.position.x < 45;
  if (inAsteroidBelt && Math.random() < 0.1) {
    showAlert('🪨 PRECAUCIÓN: PROXIMIDAD A ASTEROIDES', 1500);
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
    // Obtener nombre del objeto
    const objectName = object.userData?.nombre ||
      (object === lunaMesh ? 'Luna' :
        (object === issMesh ? 'ISS' : 'Objeto'));

    // Actualizar el texto del botón con el nombre
    const exploreText = exploreBtn.querySelector('span:first-child');
    const objectNameSpan = exploreBtn.querySelector('.object-name');

    if (exploreText) exploreText.textContent = 'EXPLORAR';
    if (objectNameSpan) objectNameSpan.textContent = objectName;

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
  if (exploreBtn) {
    exploreBtn.style.display = 'none';
    // Limpiar el nombre del objeto
    const objectNameSpan = exploreBtn.querySelector('.object-name');
    if (objectNameSpan) objectNameSpan.textContent = '';
  }
}

/**
 * Explora un objeto seleccionado (acerca la cámara y muestra información)
 */
function explorarObjeto(object) {
  if (!object) return;

  // Limpiar nombre en el botón
  const exploreBtn = document.getElementById('explore-btn');
  if (exploreBtn) {
    const objectNameSpan = exploreBtn.querySelector('.object-name');
    if (objectNameSpan) objectNameSpan.textContent = '';
  }

  // 1. Guardar la posición original del objeto ANTES de ocultar otros
  const objectWorldPos = new THREE.Vector3();
  object.getWorldPosition(objectWorldPos);

  // 2. Restaurar material inmediatamente al explorar y ocultar botón
  restoreObjectMaterial(object);
  hideExploreButton();

  // 3. Guardar posiciones de todos los planetas ANTES de ocultar
  const savedPositions = new Map();
  planetMeshes.forEach(mesh => {
    const pos = new THREE.Vector3();
    mesh.getWorldPosition(pos);
    savedPositions.set(mesh, pos.clone());
  });

  // 4. Ocultar todos los planetas excepto el seleccionado
  mostrarSoloPlanetaSeleccionado(object);

  // Encontrar el índice del planeta para obtener sus datos
  let planetIndex = -1;
  const esISS = object === issMesh || object.userData?.esISS || object.userData?.tipo === 'iss';
  const esLuna = object === lunaMesh || object.userData?.nombre === 'Luna';

  if (!esLuna && !esISS) {
    planetIndex = planetMeshes.indexOf(object);
  }

  // 6. Calcular parámetros de la cámara
  const size = object.userData?.sizeOriginal || 1;
  const isMobile = window.innerWidth < 768;

  // 7. Calcular posición de cámara basada en el tipo de objeto
  let targetPosition;

  try {
    // Obtener posición mundial del objeto
    const objectWorldPos = new THREE.Vector3();
    object.getWorldPosition(objectWorldPos);

    console.log(`Explorando ${object.userData?.nombre || 'objeto'} en posición:`, objectWorldPos);

    // Calcular posición de cámara basada en el tipo de objeto
    let targetPosition;
    let lookAtPosition = objectWorldPos.clone();

    // ELEGIR LA POSICIÓN DE LA CÁMARA SEGÚN EL TIPO DE OBJETO
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

    // Configurar el objetivo de la cámara en la posición real del objeto
    controls.target.copy(objectWorldPos);
    controls.update();

    // Animación de acercamiento de cámara
    const cameraTarget = controls.target.clone();

    gsap.to(camera.position, {
      duration: 2.5,
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      ease: 'power2.inOut'
    });

    gsap.to(cameraTarget, {
      duration: 2.5,
      x: objectWorldPos.x,
      y: objectWorldPos.y,
      z: objectWorldPos.z,
      ease: 'power2.inOut',
      onUpdate: () => {
        controls.target.copy(cameraTarget);
        controls.update();
      },
      onComplete: () => {
        controls.target.copy(objectWorldPos);
        controls.enabled = true;
        controlsEnabled = true;
        mostrarInformacionObjeto(object);
      }
    });

  } catch (error) {
    console.error('Error en explorarObjeto:', error);
    // Fallback: usar posición aproximada
    const fallbackPosition = new THREE.Vector3(
      object.position.x || 0,
      object.position.y || 0,
      object.position.z || 0
    );

    // Acercamiento simple como fallback
    gsap.to(camera.position, {
      duration: 2,
      x: fallbackPosition.x - 10,
      y: fallbackPosition.y + 5,
      z: fallbackPosition.z + 10,
      ease: 'power2.inOut',
      onUpdate: () => camera.lookAt(fallbackPosition),
      onComplete: () => mostrarInformacionObjeto(object)
    });
  }
}

/**
 * Muestra solo el planeta seleccionado y oculta los demás
 */
function mostrarSoloPlanetaSeleccionado(object) {
  // 4-1. cambiar visibilidad no posiciones
  planetMeshes.forEach(mesh => {
    mesh.visible = false;
  });
  if (lunaMesh) lunaMesh.visible = false;
  if (issMesh) issMesh.visible = false;
  if (saturnRings) saturnRings.visible = false;

  // 5. Determinar el tipo de objeto y mostrar solo lo necesario
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

  // Restaurar el objetivo al centro para vista general
  controls.target.set(0, 0, 0);
  controls.update();

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

/**
 * Actualiza la UI de los escudos
 */
function updateShieldsUI() {
  const shieldsElement = document.querySelector('.compact-system:nth-child(3) .compact-system-status');

  if (shieldsElement) {
    const shieldsLevel = Math.round(shields);

    // Determinar clase de estado
    let statusClass = 'status-online';
    let statusText = `${shieldsLevel}%`;

    if (missionStarted) {
      // DURANTE MISIÓN: mostrar estados críticos
      if (shieldsLevel < 40) statusClass = 'status-warning';
      if (shieldsLevel < 20) statusClass = 'status-critical';
      if (shieldsLevel <= 0) {
        statusClass = 'status-critical';
        statusText = 'DESTRUIDOS';
      }
    } else {
      // FUERA DE MISIÓN: siempre mostrar online (recuperación automática)
      statusClass = 'status-online';
      statusText = `${Math.max(80, shieldsLevel)}%`; // Mínimo 80%
    }

    // Actualizar elemento
    shieldsElement.innerHTML = `<span class="status-light ${statusClass}"></span>${statusText}`;
    shieldsElement.title = `ESCUDOS: ${shieldsLevel}%${inSolarDangerZone ? ' (DAÑO SOLAR)' : ''}`;

    // Efecto visual si escudos están bajos DURANTE misión
    if (shieldsLevel < 30 && missionStarted) {
      shieldsElement.style.animation = 'pulse 1s infinite';
    } else {
      shieldsElement.style.animation = 'none';
    }
  }
}

/**
 * Verifica la proximidad al Sol y aplica daño a escudos si es necesario
 */
function checkSolarProximity() {
  if (!missionStarted || !camera || !solarDamageEnabled) return;

  // Calcular distancia al Sol (posición 0,0,0)
  const distanceToSun = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));

  // Verificar si estamos en zona de peligro
  const wasInDangerZone = inSolarDangerZone;
  inSolarDangerZone = distanceToSun < solarDangerDistance;

  // Si acabamos de entrar en zona de peligro, mostrar alerta
  if (inSolarDangerZone && !wasInDangerZone) {
    showAlert('⚠️ ZONA DE PELIGRO SOLAR - ESCUDOS BAJANDO', 3000);
  }

  // Si salimos de la zona de peligro, mostrar alerta de recuperación
  if (!inSolarDangerZone && wasInDangerZone) {
    showAlert('✅ SALIENDO DE ZONA SOLAR - ESCUDOS SE RECUPERAN', 2000);
  }

  // Mostrar advertencia si estamos cerca pero no en peligro
  if (distanceToSun < solarWarningDistance && distanceToSun >= solarDangerDistance) {
    showAlert('🌡️ PROXIMIDAD AL SOL - MANTENER DISTANCIA', 2000);
  }

  // Aplicar daño a escudos si estamos en zona de peligro
  if (inSolarDangerZone && missionStarted) {
    applySolarDamage(distanceToSun);
  } else if (shields < 100) {
    // Recuperar escudos si no estamos en peligro
    recoverShields();
  }
  // Mostrar efectos visuales si estamos cerca del Sol
  if (inSolarDangerZone) {
    showSolarDamageEffects();
  } else {
    // Ocultar efectos
    const solarEffect = document.getElementById('solar-damage-effect');
    if (solarEffect) {
      solarEffect.style.opacity = 0;
    }
  }

  // Actualizar UI de escudos
  updateShieldsUI();
}

/**
 * Aplica daño a los escudos basado en la proximidad al Sol
 */
function applySolarDamage(distanceToSun) {
  const now = Date.now();
  const delta = (now - lastShieldDamageTime) / 1000; // Segundos

  // Daño basado en distancia (más cerca = más daño)
  const distanceFactor = 1 - (distanceToSun / solarDangerDistance);
  const damage = shieldDamageRate * delta * distanceFactor * 10;

  // Reducir escudos
  shields = Math.max(0, shields - damage);
  lastShieldDamageTime = now;

  // Si los escudos están críticos, mostrar alertas
  if (shields < 30 && shields > 0) {
    showAlert('🛡️ ESCUDOS CRÍTICOS - ALEJARSE DEL SOL INMEDIATAMENTE', 2000);
  }

  // Si los escudos llegan a 0
  if (shields <= 0 && missionStarted) {
    shields = 0;
    showAlert('💥 ESCUDOS DESTRUIDOS - SISTEMAS EN PELIGRO', 4000);

    // Aplicar daño directo a la nave (energía y combustible)
    applyDirectDamage();
  }
}

/**
 * Aplica daño directo a la nave cuando los escudos están destruidos
 */
function applyDirectDamage() {
  // Daño a energía cuando no hay escudos
  energy -= 0.5;
  energy = Math.max(0, energy);

  // Daño a combustible cuando no hay escudos
  fuel -= 0.3;
  fuel = Math.max(0, fuel);

  // Actualizar UIs
  updateEnergyUI();
  updateFuelUI();

  // Si la energía o combustible son críticos
  if (energy < 20) {
    showAlert('🔋 ENERGÍA CRÍTICA - PELIGRO DE APAGÓN', 2000);
  }

  if (fuel < 20) {
    showAlert('⛽ COMBUSTIBLE CRÍTICO - PROPULSIÓN COMPROMETIDA', 2000);
  }
}

/**
 * Recupera escudos cuando no hay peligro solar
 */
function recoverShields() {
  const recoveryRate = 0.05; // % por segundo

  // Solo recuperar si no estamos en misión o si estamos lejos del Sol
  if (!missionStarted || !inSolarDangerZone) {
    shields += recoveryRate;
    shields = Math.min(100, shields);
  }
}

/**
 * Muestra efectos visuales de daño solar
 */
function showSolarDamageEffects() {
  // Crear o obtener el elemento de efecto
  let solarEffect = document.getElementById('solar-damage-effect');

  if (!solarEffect) {
    solarEffect = document.createElement('div');
    solarEffect.id = 'solar-damage-effect';
    solarEffect.className = 'solar-damage-effect';
    document.body.appendChild(solarEffect);
  }

  // Calcular intensidad basada en proximidad y estado de escudos
  const distanceToSun = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
  const proximityFactor = 1 - Math.min(1, distanceToSun / solarDangerDistance);
  const shieldFactor = shields / 100;

  // Intensidad del efecto (0 a 1)
  const intensity = proximityFactor * (1 - shieldFactor);

  // Aplicar efecto
  solarEffect.style.opacity = Math.max(0, Math.min(0.7, intensity));

  // Destello aleatorio si los escudos están muy bajos
  if (shields < 10 && Math.random() < 0.1) {
    showSolarFlash();
  }
}

/**
 * Muestra un destello solar
 */
function showSolarFlash() {
  const flash = document.createElement('div');
  flash.className = 'flash-effect';
  document.body.appendChild(flash);

  // Animación del destello
  gsap.to(flash, {
    duration: 0.1,
    opacity: 0.8,
    onComplete: () => {
      gsap.to(flash, {
        duration: 0.3,
        opacity: 0,
        onComplete: () => {
          flash.remove();
        }
      });
    }
  });
}

function updateHUDForMobile() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isPortrait = window.innerHeight > window.innerWidth;

  if (isMobile && isPortrait) {
    // Solo en móviles verticales: mostrar botones en panel compacto
    const missionBtnContainer = document.querySelector('.mission-btn-container');
    const mainMissionContainer = document.querySelector('.mission-button-container');

    if (missionBtnContainer) {
      missionBtnContainer.style.display = 'flex';
    }
    if (mainMissionContainer) {
      mainMissionContainer.style.display = 'none';
    }
  } else {
    // En desktop o móviles horizontales: mostrar botones principales
    const missionBtnContainer = document.querySelector('.mission-btn-container');
    const mainMissionContainer = document.querySelector('.mission-button-container');

    if (missionBtnContainer) {
      missionBtnContainer.style.display = 'none';
    }
    if (mainMissionContainer) {
      mainMissionContainer.style.display = 'flex';
    }
  }
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

window.addEventListener('orientationchange', function () {
  setTimeout(() => {
    onWindowResize();
    updateHUDForMobile();
  }, 100);
});

window.addEventListener('resize', function () {
  onWindowResize();
  updateHUDForMobile();
});