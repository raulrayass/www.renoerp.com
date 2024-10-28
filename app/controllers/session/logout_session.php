<?php
// Iniciar sesión si no está iniciada
session_start();

require_once __DIR__ . '/../../../settings/settings_control.php';

// Verificar si el usuario está logueado antes de intentar actualizar el estado
if (isset($_SESSION['id_user'])) {
    // Obtener el ID del usuario de la sesión
    $user_id = $_SESSION['id_user'];

    // Conexión a la base de datos utilizando PDO
    global $pdo;

    // Actualizar el estado de is_logged_in a 0 y establecer browser_id en NULL
    $stmt = $pdo->prepare("UPDATE tbl_users SET is_logged_in = 0, browser_id = NULL WHERE id_user = :id_user");
    $stmt->bindParam(':id_user', $user_id, PDO::PARAM_INT);
    $stmt->execute();
}

// Destruir todas las variables de sesión
session_unset();

// Destruir la sesión
session_destroy();

// Redirigir al login utilizando URLSERVER
header("Location: " . URLSERVER . "login/login.php");
exit;
?>
