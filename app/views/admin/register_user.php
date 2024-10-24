<?php
session_start();
require_once '../../models/database.php'; // conexión a la base de datos

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Recibir datos del formulario
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    // Cifrar la contraseña
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Preparar la consulta SQL para insertar el nuevo usuario
    $stmt = $pdo->prepare("INSERT INTO tbl_users (email, password, role_id, created_at, updated_at) VALUES (:email, :password, :role_id, NOW(), NOW())");
    
    
    $role_id = 1; // ID del rol del usuario

    // Vincular los parámetros y ejecutar la consulta
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $hashed_password);
    $stmt->bindParam(':role_id', $role_id);

    if ($stmt->execute()) {
        // Registro exitoso
        $_SESSION['success'] = 'Usuario registrado exitosamente.';
        header("Location: success_page.php"); // Cambia a la página que desees
        exit();
    } else {
        // Manejar error al registrar
        $_SESSION['error'] = 'Error al registrar el usuario.';
        header("Location: register.php"); // Cambia a tu página de registro
        exit();
    }
}
?>
