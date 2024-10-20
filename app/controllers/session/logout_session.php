<?php
// Iniciar sesión si no está iniciada
session_start();

// Destruir todas las variables de sesión
session_unset();

// Destruir la sesión
session_destroy();

// Redirigir al login, correción de ruta
header("Location: /RRSoluciones/www.renoamd.com/login/login.php");
exit;
