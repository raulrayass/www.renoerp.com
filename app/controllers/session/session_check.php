<?php
// Duración de inactividad en segundos (5 segundos para pruebas)
$inactive_time = 5;

// Comprobar si hay actividad en la sesión
if (isset($_SESSION['last_activity'])) {
    // Calcular el tiempo inactivo
    $session_lifetime = time() - $_SESSION['last_activity'];
    
    if ($session_lifetime > $inactive_time) {
        // Redirigir a la pantalla de bloqueo si la inactividad supera el límite
        header('Location: ' . URLSERVER . 'login/lockscreen.php');
        exit();
    }
}

// Actualizar la última actividad
$_SESSION['last_activity'] = time();
?>
