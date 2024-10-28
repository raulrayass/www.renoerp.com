<?php
// Iniciar sesión si no está iniciada
session_start();

require_once __DIR__ . '/../../../settings/settings_control.php';

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

                // Obtener el nuevo browser_id
                $new_browser_id = session_id(); // Podrías usar otra lógica para generar el browser_id

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
