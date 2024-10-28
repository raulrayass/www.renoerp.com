<?php
// Iniciar sesión si no está iniciada
session_start();

// Incluir la configuración de conexión a la base de datos
require_once __DIR__ . '/../../../settings/settings_control.php';

// Comprobar si el usuario ya está logueado
if (isset($_SESSION['is_logged_in']) && $_SESSION['is_logged_in'] === session_id()) {
    // El usuario ya está logueado, redirigir al dashboard
    header('Location: ' . URLSERVER . 'app/controllers/session/redirect_dashboard.php');
    exit();
}

// Procesar la solicitud de desbloqueo
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Verificar si se ha enviado la contraseña
    if (isset($_POST['password'])) {
        $password = trim($_POST['password']);
        
        // Recuperar el usuario actual de la sesión
        $user_id = $_SESSION['id_user'];
        
        // Preparar la consulta para obtener el hash de la contraseña del usuario
        $stmt = $pdo->prepare("SELECT password FROM tbl_users WHERE id_user = :id_user");
        $stmt->bindParam(':id_user', $user_id);
        $stmt->execute();
        
        if ($stmt->rowCount() == 1) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            $hashed_password = $user['password'];

            // Verificar la contraseña
            if (password_verify($password, $hashed_password)) {
                // La contraseña es correcta, puedes desbloquear la sesión
                $_SESSION['is_logged_in'] = session_id(); // Marcar como logueado nuevamente
                
                // Actualizar el tiempo de la última actividad
                $_SESSION['last_activity'] = time();

                // Generar un nuevo browser_id
                $new_browser_id = bin2hex(random_bytes(16)); // Generar uno nuevo
                setcookie('browser_id', $new_browser_id, time() + (86400 * 30), "/"); // 30 días de expiración

                // Actualizar `is_logged_in` y `browser_id` en la base de datos
                $update_stmt = $pdo->prepare("UPDATE tbl_users SET is_logged_in = 1, browser_id = :browser_id WHERE id_user = :id_user");
                $update_stmt->bindParam(':id_user', $user_id);
                $update_stmt->bindParam(':browser_id', $new_browser_id);
                $update_stmt->execute();

                // Redirigir al dashboard
                header('Location: ' . URLSERVER . 'app/controllers/session/redirect_dashboard.php');
                exit();
            } else {
                $_SESSION['error'] = 'Contraseña incorrecta. Inténtalo de nuevo.';
                header('Location: ' . URLSERVER . 'login/lockscreen.php'); // Regresar a la pantalla de bloqueo
                exit();
            }
        } else {
            $_SESSION['error'] = 'Usuario no encontrado.';
            header('Location: ' . URLSERVER . 'login/lockscreen.php'); // Regresar a la pantalla de bloqueo
            exit();
        }
    }
} else {
    // Redireccionar si se accede directamente al archivo sin POST
    header('Location: ' . URLSERVER . 'login/lockscreen.php');
    exit();
}
?>
