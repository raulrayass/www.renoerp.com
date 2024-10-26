<?php
// config.php

// Establecer la zona horaria
date_default_timezone_set('America/Mexico_City');

define('DEBUG_MODE', true); 

// Manejo de errores
if (DEBUG_MODE) {
    error_reporting(E_ALL); // Reportar todos los errores
    ini_set('display_errors', 1); // Mostrar errores en la pantalla
} else {
    error_reporting(0); // No mostrar errores en producción
}


?>
