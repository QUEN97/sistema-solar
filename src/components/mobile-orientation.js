// Detectar cambios de orientación
function handleOrientation() {
  const isPortrait = window.innerHeight > window.innerWidth;
  
  if (isPortrait) {
    // Orientación vertical
    document.body.classList.add('portrait');
    document.body.classList.remove('landscape');
    
    // Mostrar alerta si no hay misión activa
    if (!window.missionStarted) {
      showOrientationAlert();
    }
  } else {
    // Orientación horizontal
    document.body.classList.add('landscape');
    document.body.classList.remove('portrait');
    
    // Ocultar alerta
    const alert = document.getElementById('orientation-alert');
    if (alert) alert.remove();
    
    // Reajustar cámara
    if (window.onWindowResize) {
      window.onWindowResize();
    }
  }
}

// Escuchar eventos
window.addEventListener('resize', handleOrientation);
window.addEventListener('orientationchange', handleOrientation);

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', handleOrientation);