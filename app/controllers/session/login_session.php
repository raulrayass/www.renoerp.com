<?php 
session_start();
require_once __DIR__ . '/../../../settings/settings_control.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email']); // Eliminar espacios en blanco
    $password = trim($_POST['password']); // Eliminar espacios en blanco

    global $pdo; // Usar la variable PDO que se carga en session_control.php

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
                header("Location: " . URLSERVER . "login/login.php");
                exit();
            }

            // Almacenar en sesión
            $_SESSION['id_user'] = $user['id_user'];
            $_SESSION['role_id'] = $user['role_id'];
            $_SESSION['role_name'] = $user['role_name'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['profile_image'] = $user['profile_image'];
            $_SESSION['is_logged_in'] = session_id(); // Prevenir doble sesión

            // Actualizar el estado de is_logged_in y browser_id en la base de datos
            $update_stmt = $pdo->prepare("UPDATE tbl_users SET is_logged_in = 1, browser_id = :browser_id WHERE id_user = :id_user");
            $update_stmt->bindParam(':id_user', $user['id_user']);
            $browser_id = session_id(); // Obtener el nuevo browser_id
            $update_stmt->bindParam(':browser_id', $browser_id);
            $update_stmt->execute();

            // Redireccionar al dashboard correspondiente
            header("Location: " . URLSERVER . "app/controllers/session/redirect_dashboard.php");
            exit();
        } else {
            $_SESSION['error'] = 'Usuario o contraseña incorrectos.';
            header("Location: " . URLSERVER . "login/login.php");
            exit();
        }
    } else {
        $_SESSION['error'] = 'Usuario o contraseña incorrectos.';
        header("Location: " . URLSERVER . "login/login.php");
        exit();
    }
}
?>
