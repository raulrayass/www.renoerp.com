<?php
require_once '../../app/models/settings/config.php'; // Asegúrate de que la ruta sea correcta
require_once '../../app/models/settings/database.php'; // Conexión a la base de datos

// Comprobar si el usuario ha iniciado sesión
if (!is_logged_in()) {
    header('Location: ' . URLSERVER . 'login/login.php'); // Redirigir si no está autenticado
    exit();
}

// Cerrar sesión si se está iniciando sesión con otra cuenta
if (isset($_GET['logout']) && $_GET['logout'] == 'true') {
    session_unset(); // Limpiar la sesión
    session_destroy(); // Destruir la sesión
    header('Location: ' . URLSERVER . 'login/login.php'); // Redirigir a login después de cerrar sesión
    exit();
}

// Comprobar la contraseña ingresada
if (isset($_POST['password'])) {
    $password = $_POST['password'];

    // Aquí debes comprobar la contraseña en la base de datos
    $user_id = $_SESSION['user_id']; // Obtener el ID del usuario de la sesión
    $query = "SELECT password FROM tbl_users WHERE id_user = :user_id"; // Utilizando PDO
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $hashed_password = $stmt->fetchColumn();

    // Verificar la contraseña
    if ($hashed_password && password_verify($password, $hashed_password)) {
        // Si la contraseña es correcta, restaurar la sesión
        $_SESSION['last_activity'] = time(); // Actualizar la última actividad
        
        // Mensaje de éxito
        echo "Sesión desbloqueada. Redirigiendo al dashboard...";
        
        // Redirigir al dashboard
        header('Location: ' . URLSERVER . '/app/controllers/redirect_dashboard.php'); // Asegúrate de que esta ruta sea correcta
        exit();
    } else {
        // Contraseña incorrecta
        echo "Contraseña incorrecta. Inténtalo de nuevo.";
    }
}
?>
