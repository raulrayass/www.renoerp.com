<?php
session_start();

// Comprobar si el usuario ha iniciado sesión
if (!isset($_SESSION['user_id'])) {
    header('Location: /www.renoamd.com/login/login.php'); // Redirigir a login si no está autenticado
    exit();
}

// Obtener el nombre del usuario y rol desde la sesión
$user_name = $_SESSION['username'] ?? 'Usuario'; // Guardar en la sesión
$role_name = $_SESSION['role_name'] ?? 'Rol desconocido'; // Suponiendo que el rol se almacena aquí
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reno Carrocerias | Dashboard</title>
    <meta name="description" content="AdminLTE 3 - Dashboard para el Almacen de Reno Carrocerias.">

    <!-- Rutas -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="/RRSoluciones/www.renoamd.com/public/templates/plugins/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="/RRSoluciones/www.renoamd.com/public/templates/dist/css/adminlte.min.css">

    <style>
        /* Tus estilos personalizados */
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f4f6f9;
            overflow: hidden; /* Evitar scroll global */
        }

        .brand-link {
            text-align: center;
            border-bottom: none;
        }

        .brand-image {
            width: 50px;
            height: 50px;
        }

        .main-header, .main-sidebar {
            background-color: #343a40 !important;
        }

        .main-header .navbar-nav .nav-link {
            color: #ffffff !important;
        }

        .sidebar .nav-link {
            color: #c2c7d0;
            font-weight: 500; /* Peso de fuente para las opciones del menú */
        }

        .sidebar .nav-link.active {
            background-color: #495057 !important;
            border-left: 3px solid #007bff;
            font-weight: bold; /* Negrita para la opción activa */
        }

        /* Estilo para las subopciones */
        .nav-treeview .nav-link {
            color: #c2c7d0;
            padding-left: 30px; /* Sangría para subopciones */
            font-weight: 400; /* Peso de fuente normal para subopciones */
        }

        .nav-treeview .nav-link:hover {
            background-color: #495057; /* Color al pasar el mouse */
        }

        /* Estilo para la barra de navegación */
        .navbar-title {
            color: #ffffff;
            font-weight: 500;
            margin: 0 20px;
            font-size: 1.5rem; /* Tamaño de fuente más grande */
        }

        .content-header {
            display: none; /* Ocultar el encabezado de contenido */
        }

        .small-box {
            border-radius: 12px; /* Bordes más redondeados */
            background: #ffffff; /* Fondo blanco para evitar sombra gris */
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); /* Sombra suave */
            color: #fff;
        }

        .small-box.bg-success {
            background-color: #28a745 !important;
        }

        .small-box.bg-info {
            background-color: #17a2b8 !important;
        }

        .small-box.bg-warning {
            background-color: #ffc107 !important;
        }

        .small-box.bg-danger {
            background-color: #dc3545 !important;
        }

        .small-box .inner h3 {
            font-weight: 700;
            font-size: 28px;
        }

        .small-box-footer {
            color: #fff;
            font-weight: 500;
        }

        .footer {
            font-size: 14px;
            color: #6c757d;
            border-top: none;
        }

        /* Estilo para las tarjetas de resumen */
        .summary-card {
            border-radius: 12px; /* Bordes más redondeados */
            background-color: #ffffff;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); /* Sombra suave */
        }

        /* Mejoras de diseño para la barra superior */
        .profile-link {
            display: flex;
            flex-direction: column; /* Cambiar a columna para alinear el nombre y rol */
            align-items: center; /* Centrar horizontalmente */
            margin-left: 15px;
            color: #ffffff;
        }

        .profile-link img {
            margin-bottom: 8px; /* Separar imagen de texto */
        }

        /* Estilo del menú lateral */
        .sidebar {
            overflow-y: auto; /* Permitir scroll en el menú lateral */
            height: calc(100vh - 56px); /* Altura total menos la altura de la barra superior */
        }

        .content-wrapper {
            overflow-y: auto; /* Permitir scroll en el contenido principal */
            height: calc(100vh - 56px); /* Altura total menos la altura de la barra superior */
            margin-top: 0; /* Sin margen superior */
            padding: 20px; /* Espaciado interno */
        }

        /* Estilo para contenido adicional */
        .additional-content {
            margin-top: 20px;
            padding: 15px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        /* Estilo para opciones de perfil */
        .dropdown-item {
            display: flex;
            align-items: center; /* Alinear íconos y texto */
            padding: 10px;
            color: #343a40; /* Color del texto */
        }

        .dropdown-item i {
            margin-right: 10px; /* Espacio entre ícono y texto */
            font-size: 1.2em; /* Tamaño de ícono */
        }

        /* Estilo del menú de cierre de sesión */
        .dropdown-menu {
            padding: 0; /* Eliminar padding extra */
        }

        .dropdown-item:hover {
            background-color: #f8f9fa; /* Color de fondo al pasar el mouse */
        }
    </style>
</head>
<body class="hold-transition sidebar-mini">
<div class="wrapper">

    <!-- Barra Superior -->
    <nav class="main-header navbar navbar-expand navbar-dark">
        <ul class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" data-widget="pushmenu" href="#"><i class="fas fa-bars"></i></a>
            </li>
        </ul>
        <span class="navbar-title">Dashboard</span> <!-- Título "Dashboard" en la barra superior -->
        <ul class="navbar-nav ml-auto">
            <li class="nav-item">
                <a class="nav-link navbar-notifications" href="/RRSoluciones/www.renoamd.com/app/controllers/manager/manager_dashboard.php">
                    <i class="fas fa-home"></i>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link navbar-notifications" href="#" id="fullscreen-btn">
                    <i class="fas fa-expand"></i>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link navbar-notifications" href="#"><i class="fas fa-bell"></i></a>
            </li>
            <li class="nav-item">
                <a class="nav-link navbar-notifications" href="#"><i class="fas fa-envelope"></i></a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link" data-toggle="dropdown" href="#" class="profile-link">
                    <img src="/RRSoluciones/www.renoamd.com/public/images/profile.jpg" class="img-circle elevation-2" alt="Foto de perfil" style="width: 30px; height: 30px;">
                    <span id="user_name" style="font-weight: bold;"><?php echo $user_name; ?></span> <!-- Nombre en negrita -->
                    <span id="role_name" style="font-size: 0.8rem; color: #b0b0b0;"><?php echo $role_name; ?></span> <!-- Rol debajo del nombre -->
                </a>
                <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                    <a href="#" class="dropdown-item"><i class="fas fa-user-cog"></i> Perfil</a>
                    <a href="/RRSoluciones/www.renoamd.com/app/controllers/session/logout_session.php" class="dropdown-item"><i class="fas fa-sign-out-alt"></i> Cerrar sesión</a>
                </div>
            </li>
        </ul>
    </nav>

    <!-- Menu Lateral -->
    <aside class="main-sidebar sidebar-dark-primary elevation-4">
        <a href="#" class="brand-link">
            <img src="/RRSoluciones/www.renoamd.com/public/images/logo.png" alt="Reno ERP" class="brand-image">
            <span class="brand-text font-weight-bold" style="font-size: 1.5rem;">RENO ERP</span> <!-- Título en negrita -->
        </a>

        <div class="sidebar">
            <nav class="mt-2">
                <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                    <li class="nav-item">
                        <a href="#" class="nav-link active">
                            <i class="fas fa-tachometer-alt"></i>
                            <p>Dashboard</p>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="fas fa-users"></i>
                            <p>Usuarios</p>
                            <i class="right fas fa-angle-left"></i>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item">
                                <a href="#" class="nav-link">
                                    <i class="fas fa-list"></i>
                                    <p>Lista de usuarios</p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="#" class="nav-link">
                                    <i class="fas fa-user-plus"></i>
                                    <p>Registrar usuario</p>
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="fas fa-user-shield"></i>
                            <p>Roles</p>
                            <i class="right fas fa-angle-left"></i>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item">
                                <a href="#" class="nav-link">
                                    <i class="fas fa-list"></i>
                                    <p>Lista de roles</p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="#" class="nav-link">
                                    <i class="fas fa-user-plus"></i>
                                    <p>Registrar rol</p>
                                </a>
                            </li>
                        </ul>
                    </li>
                    <!-- Otras opciones del menú -->
                </ul>
            </nav>
        </div>
    </aside>

    <!-- Contenido Principal -->
    <div class="content-wrapper">
        <div class="content">
            <div class="container-fluid">
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
                        <p>contenido de prueba para el scroll.</p>
                    <?php endfor; ?>
                </div>
            </div>
        </div>
    </div>

    <!-- Pie de Página -->
    <footer class="main-footer">
        <div class="float-right d-none d-sm-inline">
            Versión 1.0
        </div>
        <strong>&copy; 2024 <a href="https://www.renoamd.com">RENO Carrocerias</a>.</strong> Todos los derechos reservados.
    </footer>
</div>

<!-- Scripts -->
<script src="/RRSoluciones/www.renoamd.com/public/templates/plugins/jquery/jquery.min.js"></script>
<script src="/RRSoluciones/www.renoamd.com/public/templates/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="/RRSoluciones/www.renoamd.com/public/templates/dist/js/adminlte.js"></script>
<script>
    // Acción de pantalla completa
    document.getElementById('fullscreen-btn').addEventListener('click', function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });

    $('.main-sidebar').on('hide.bs.sidebar', function () {
            $('.nav-treeview').slideUp(); // Cerrar todos los submenús
            $('.nav-item').removeClass('menu-open'); // Eliminar la clase 'menu-open' para cerrar los elementos
        });

        // Asegurarse de que los submenús se cierren al hacer clic en un enlace de menú
        $('.nav-link').on('click', function() {
            var $parent = $(this).parent();
            if ($parent.hasClass('menu-open')) {
                $parent.removeClass('menu-open');
                $parent.find('.nav-treeview').slideUp();
            } else {
                $('.nav-item.menu-open').removeClass('menu-open').find('.nav-treeview').slideUp();
                $parent.addClass('menu-open');
                $parent.find('.nav-treeview').slideDown();
            }
        });
    });


</script>
</body>
</html>
