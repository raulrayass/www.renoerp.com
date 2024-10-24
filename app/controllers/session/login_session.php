<?php 
require_once '../../models/settings/config.php'; // conexión a la config
require_once '../../models/settings/database.php'; // conexión a la base de datos
require_once '../../models/settings/routes.php'; // conexión a la config

error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email']); // Eliminar espacios en blanco
    $password = trim($_POST['password']); // Eliminar espacios en blanco

    // Conexión a la base de datos utilizando PDO
    global $pdo;

    // Preparar la consulta
    $stmt = $pdo->prepare("SELECT u.id_user, u.password, u.role_id, r.role_name, u.username, u.profile_image, u.is_logged_in 
                            FROM tbl_users u 
                            JOIN tbl_roles r ON u.role_id = r.id_role 
                            WHERE u.email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    // Verificar si el usuario existe
    if ($stmt->rowCount() == 1) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        $hashed_password = $user['password'];

        // Verificar la contraseña
        if (password_verify($password, $hashed_password)) {
            // Comprobar si el usuario ya está logueado
            if ($user['is_logged_in'] == 1) {
                $_SESSION['error'] = 'Este usuario ya está logueado en otra sesión.';
                header("Refresh: 3; URL=../../../login/login.php");
                exit();
            }

            // Almacenar en sesión
            $_SESSION['id_user'] = $user['id_user'];
            $_SESSION['role_id'] = $user['role_id'];
            $_SESSION['role_name'] = $user['role_name']; // Almacenar el nombre del rol en la sesión
            $_SESSION['username'] = $user['username']; // Almacenar el nombre de usuario en la sesión
            $_SESSION['profile_image'] = $user['profile_image']; // Almacenar la ruta de la imagen de perfil en la sesión
            

            // Actualizar el estado de is_logged_in en la base de datos
            $update_stmt = $pdo->prepare("UPDATE tbl_users SET is_logged_in = 1 WHERE id_user = :id_user");
            $update_stmt->bindParam(':id_user', $user['id_user']);
            $update_stmt->execute();

            // Redireccionar al dashboard correspondiente
            header("Location: ../session/redirect_dashboard.php");
            exit();
        } else {
            // Contraseña incorrecta, guardar el mensaje de error
            $_SESSION['error'] = 'Usuario o contraseña incorrectos.';
            header("Refresh: 3; URL=../../../login/login.php"); // Redirige después de 3 segundos
            exit();
        }
    } else {
        // Usuario no encontrado, guardar el mensaje de error
        $_SESSION['error'] = 'Usuario o contraseña incorrectos.';
        header("Refresh: 3; URL=../../../login/login.php"); // Redirige después de 3 segundos
        exit();
    }
}
?>
