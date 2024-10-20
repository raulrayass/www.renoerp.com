<?php 
// Script para realizar pruebas unitarias

require_once '../app/models/database.php'; //conexión a la base de datos

// Función para actualizar la contraseña
function updatePassword($email, $newPassword) {
    global $pdo;

    // Generar el hash de la nueva contraseña
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Preparar la consulta de actualización
    $stmt = $pdo->prepare("UPDATE tbl_users SET password = :password WHERE email = :email");
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':email', $email);

    // Ejecutar la consulta y verificar si se actualizó la contraseña
    if ($stmt->execute()) {
        echo "Contraseña actualizada correctamente para el usuario: $email<br>";
    } else {
        echo "Error al actualizar la contraseña para el usuario: $email<br>";
    }
}

// usuarios a actualizar
$usersToUpdate = [
    'admin@example.com' => 'password', // Cuenta de administrador
    'manager@example.com' => 'password123', // manager cuenta
    
];

// Recorrer cada usuario y actualizar su contraseña
foreach ($usersToUpdate as $email => $newPassword) {
    updatePassword($email, $newPassword);
}
?>