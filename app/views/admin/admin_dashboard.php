<?php 
session_start(); // Iniciar la sesión

// Incluir el archivo de control de sesión
require_once __DIR__ . '/../../../settings/settings_control.php'; // Ruta a settings_control.php
require_once __DIR__ . '/../../controllers/session/session_control.php'; // Ruta a session_control.php

// Incluir el controlador del breadcrumb
require_once __DIR__ . '/../../controllers/navigation/BreadcrumbController.php'; // Ruta a BreadcrumbController
$breadcrumbController = new BreadcrumbController();

// Agregar la ruta actual al breadcrumb
$breadcrumbController->addBreadcrumbItem('Dashboard', '/app/views/admin/admin_dashboard.php'); // Asegúrate de que esta ruta sea correcta
$breadcrumbItems = $breadcrumbController->getBreadcrumb(); // Obtener los elementos del breadcrumb

// Incluye los archivos de la vista usando rutas relativas
require_once __DIR__ . '/layout/header.php'; // Ruta a header.php
require_once __DIR__ . '/layout/navbar.php'; // Ruta a navbar.php
require_once __DIR__ . '/layout/sidebar.php'; // Ruta a sidebar.php
?>

<!-- Contenido Principal -->
<div class="content-wrapper">
    <div class="content">
        <div class="container-fluid">
            <!-- Incluir el breadcrumb justo debajo de la barra de navegación -->
            <?php 
            // Incluir el breadcrumb
            require_once __DIR__ . '/../navigation/breadcrumb.php'; // Ruta a breadcrumb.php
            ?>

            <div class="row">
                <div class="col-lg-3 col-6">
                    <div class="small-box bg-success summary-card">
                        <div class="inner">
                            <h3>150</h3>
                            <p>Ventas</p>
                        </div>
                        <div class="icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <a href="#" class="small-box-footer">Más info <i class="fas fa-arrow-circle-right"></i></a>
                    </div>
                </div>
                <div class="col-lg-3 col-6">
                    <div class="small-box bg-info summary-card">
                        <div class="inner">
                            <h3>53</h3>
                            <p>Clientes</p>
                        </div>
                        <div class="icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <a href="#" class="small-box-footer">Más info <i class="fas fa-arrow-circle-right"></i></a>
                    </div>
                </div>
                <div class="col-lg-3 col-6">
                    <div class="small-box bg-warning summary-card">
                        <div class="inner">
                            <h3>44</h3>
                            <p>Solicitudes</p>
                        </div>
                        <div class="icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <a href="#" class="small-box-footer">Más info <i class="fas fa-arrow-circle-right"></i></a>
                    </div>
                </div>
                <div class="col-lg-3 col-6">
                    <div class="small-box bg-danger summary-card">
                        <div class="inner">
                            <h3>65</h3>
                            <p>Quejas</p>
                        </div>
                        <div class="icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <a href="#" class="small-box-footer">Más info <i class="fas fa-arrow-circle-right"></i></a>
                    </div>
                </div>
            </div>
            <!-- Fin de las tarjetas de resumen -->

            <!-- Contenido adicional para probar el scroll -->
            <div class="additional-content">
                <h4>Contenido adicional</h4>
                <?php for ($i = 0; $i < 30; $i++): ?>
                    <p>Contenido de prueba para el scroll.</p>
                <?php endfor; ?>
            </div>
        </div>
    </div>
</div>

<?php 
// Incluir el pie de página y scripts usando rutas relativas
require_once __DIR__ . '/layout/footer.php'; // Ruta a footer.php
require_once __DIR__ . '/layout/scripts.php'; // Ruta a scripts.php
?>
