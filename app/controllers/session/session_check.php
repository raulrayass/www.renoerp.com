<?php
session_start(); // Inicia la sesión

// Verifica si el usuario ha iniciado sesión
if (!isset($_SESSION['user_id'])) {
    header("Location: ../../login/login.php"); // Redirige a la página de inicio de sesión
    exit; // Termina la ejecución del script
}
