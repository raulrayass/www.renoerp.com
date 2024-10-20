<?php
// routes.php

// Definición de rutas
const ROUTES = [
    'home' => 'index.php',
    'login' => 'login/login.php',
    'dashboard' => 'dashboard.php',

];

// Función para redirigir según la ruta
function redirect($route) {
    if (array_key_exists($route, ROUTES)) {
        header("Location: " . ROUTES[$route]);
        exit();
    } else {
        // Ruta no encontrada - redirigir a una página de error 404
        header("HTTP/1.0 404 Not Found");
        include '404.php'; // Pendiente hacer archivo php de error 404
        exit();
    }
}
