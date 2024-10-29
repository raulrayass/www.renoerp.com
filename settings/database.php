<?php 

// Configuración de la conexión a la base de datos

$host = 'localhost';
$dbname = 'db_erp';
$username = 'root';
$password = '';

try {
    // Conexión PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
?>
