<?php
// session_start(); - Iniciar sesión se incluye en el dashboard principal


error_reporting(E_ALL); // Activa la visualización de errores
ini_set('display_errors', 1); // Configura la visualización de errores

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['id_user'])) {
    // Redirigir a la página de login si no está autenticado
    header('Location: ' . URLSERVER . 'login/login.php');
    exit();
}

// Obtener el nombre del archivo actual para evitar bucles de redirección
$current_file = basename($_SERVER['PHP_SELF']);

// Evitar bucles de redirección en lockscreen.php
if ($current_file != 'lockscreen.php') {
    // Verificar si ya se ha registrado actividad anterior
    if (isset($_SESSION['last_activity'])) {
        $current_time = time(); // Tiempo actual
        $time_since_last_activity = $current_time - $_SESSION['last_activity'];

        // Si ha pasado más del tiempo permitido de inactividad (5 minutos = 300 segundos)
        if ($time_since_last_activity > 300) {
            // Redirigir a la pantalla de bloqueo
            header('Location: ' . URLSERVER . 'login/lockscreen.php');
            exit();
        }
    }

    // Actualizar el tiempo de la última actividad
    $_SESSION['last_activity'] = time();
}

// Opcional: Regenerar el ID de sesión para mayor seguridad
session_regenerate_id(true);
?>
