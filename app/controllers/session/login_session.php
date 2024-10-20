<?php 
session_start();
require_once '../../models/database.php'; // conexión a la base de datos

error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email']); // Eliminar espacios en blanco
    $password = trim($_POST['password']); // Eliminar espacios en blanco

    // Conexión a la base de datos utilizando PDO
    global $pdo;

    // Preparar la consulta
    $stmt = $pdo->prepare("SELECT u.id_user, u.password, u.role_id, r.role_name, u.username 
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
            // Almacenar en sesión
            $_SESSION['user_id'] = $user['id_user'];
            $_SESSION['role_id'] = $user['role_id'];
            $_SESSION['role_name'] = $user['role_name']; // Almacenar el nombre del rol en la sesión
            $_SESSION['username'] = $user['username']; // Almacenar el nombre de usuario en la sesión

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
