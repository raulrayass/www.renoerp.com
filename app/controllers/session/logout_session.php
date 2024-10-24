<?php
// Iniciar sesión si no está iniciada
session_start();

// Incluir la conexión a la base de datos y la configuración
require_once '../../models/settings/database.php';
require_once '../../models/settings/config.php'; // Para incluir la URLSERVER

// Verificar si el usuario está logueado antes de intentar actualizar el estado
if (isset($_SESSION['user_id'])) {
    // Obtener el ID del usuario de la sesión
    $user_id = $_SESSION['user_id'];

    // Conexión a la base de datos utilizando PDO
    global $pdo;

    // Actualizar el estado de is_logged_in a 0
    $stmt = $pdo->prepare("UPDATE tbl_users SET is_logged_in = 0 WHERE id_user = :id_user");
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
