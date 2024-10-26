<?php
session_start();
require_once __DIR__ . '/../../../settings/settings_control.php';

// Recuperar el usuario actual de la sesión
if (isset($_SESSION['id_user'])) {
    $user_id = $_SESSION['id_user'];
    
    // Actualizar `is_logged_in` a 0 para indicar que la sesión está bloqueada
    $stmt = $pdo->prepare("UPDATE tbl_users SET is_logged_in = 0 WHERE id_user = :id_user");
    $stmt->bindParam(':id_user', $user_id);
    $stmt->execute();
}
?>
