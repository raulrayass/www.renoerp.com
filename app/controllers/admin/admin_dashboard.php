<?php
session_start();

// Comprobar si el usuario ha iniciado sesión
if (!isset($_SESSION['user_id'])) {
    header('Location: /www.renoamd.com/login/login.php'); // Redirigir a login si no está autenticado
    exit();
}

// Obtener el nombre del usuario desde la sesión
$user_name = $_SESSION['nombres'] ?? 'Usuario'; // Guardar en la session
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reno Carrocerías | Dashboard</title>
    <meta name="description" content="AdminLTE 3 - Dashboard para el Almacén de Reno Carrocerías.">
    
    <!-- Rutas -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="/www.renoamd.com/public/templates/plugins/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="/RRSoluciones/www.renoamd.com/public/templates/plugins/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="/RRSoluciones/www.renoamd.com/public/templates/dist/css/adminlte.min.css">

    <style>
        body {
            background-color: #e7eff6;
        }
        .main-header, .main-footer {
            background-color: #003366;
            color: white;
        }
        .nav-sidebar {
            background-color: #003366;
        }
        .nav-sidebar .nav-link {
            color: white;
        }
        .nav-sidebar .nav-link.active {
            background-color: #cc0000;
        }
        .card {
            background-color: #ffffff;
            color: #003366;
        }
        .card-title, .card-text strong {
            color: #003366;
        }
        .brand-link {
            display: flex;
            align-items: center;
        }
        .brand-image {
            margin-right: 10px;
        }
        .content {
            background-color: #ffffff;
        }
    </style>
</head>
<body class="hold-transition sidebar-mini">
<div class="wrapper">

    <!-- Navbar -->
    <nav class="main-header navbar navbar-expand navbar-white navbar-light">
        <ul class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" data-widget="pushmenu" href="#" role="button" aria-label="Toggle navigation" style="color: white;">
                    <i class="fas fa-bars" style="color: white;"></i>
                </a>
            </li>
            <li class="nav-item d-none d-sm-inline-block">
                <a href="#" class="nav-link" style="color: white;"><strong>Inicio</strong></a>
            </li>
            <li class="nav-item d-none d-sm-inline-block">
                <a href="#" class="nav-link" style="color: white;"><strong>Contacto</strong></a>
            </li>
        </ul>
        <ul class="navbar-nav ml-auto">
            <li class="nav-item">   <!-- correcion de ruta -->
                <a class="nav-link" href="/RRSoluciones/www.renoamd.com/app/controllers/session/logout_session.php" style="color: white;"><strong>Cerrar Sesión</strong></a>
            </li>
        </ul>
    </nav>

    <!-- Sidebar -->
    <aside class="main-sidebar sidebar-dark-primary elevation-4">
        <!-- Logo -->
        <a href="index.php" class="brand-link">
            <img src="/RRSoluciones/www.renoamd.com/public/images/logo.png" alt="Logo de Reno Carrocerías" class="brand-image img-circle elevation-3" style="opacity: .8; width: 40px; height: 40px;">
            <span class="brand-text font-weight-light"><strong>Reno Carrocerías</strong></span>
        </a>
        
        <!-- Sidebar User Panel -->
        <div class="sidebar">
            <div class="user-panel mt-3 pb-3 mb-3 d-flex">
                <div class="image">
                    <img src="/RRSoluciones/www.renoamd.com/public/images/profile.jpg" class="img-circle elevation-2" alt="Imagen de Usuario">
                </div>
                <div class="info">
                    <a href="#" class="d-block"><strong><?php echo $user_name; ?></strong></a>
                </div>
            </div>
            <nav class="mt-2">
                <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                    <li class="nav-item menu-open">
                        <a href="#" class="nav-link active">
                            <i class="nav-icon fas fa-tachometer-alt"></i>
                            <p>
                                <strong>Tablero</strong>
                                <i class="right fas fa-angle-left"></i>
                            </p>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item">
                                <a href="#" class="nav-link active">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p><strong>Ingresos</strong></p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="#" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p><strong>Egresos</strong></p>
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="nav-icon fas fa-th"></i>
                            <p>
                                <strong>Menu General</strong>
                                <span class="right badge badge-danger">Alerta</span>
                            </p>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    </aside>

    <main class="content-wrapper">
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0"><strong>Bienvenido, <?php echo $user_name; ?>!</strong></h1>
                    </div>
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                            <li class="breadcrumb-item"><a href="#"><strong>Inicio</strong></a></li>
                            <li class="breadcrumb-item active"><strong>Tablero</strong></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-lg-6">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title"><strong>Gestión de Inventario</strong></h5>
                                <p class="card-text">
                                    Monitorea el estado de los productos en tiempo real y asegúrate de que tu almacén funcione sin problemas.
                                </p>
                                <a href="#" class="card-link"><strong>Ver Detalles</strong></a>
                            </div>
                        </div>
                        <div class="card card-primary card-outline">
                            <div class="card-body">
                                <h5 class="card-title"><strong>Control de Pedidos</strong></h5>
                                <p class="card-text">
                                    Realiza un seguimiento de los pedidos y gestiona las entregas eficientemente.
                                </p>
                                <a href="#" class="card-link"><strong>Ver Pedidos</strong></a>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="m-0"><strong>Estadísticas de Almacén</strong></h5>
                            </div>
                            <div class="card-body">
                                <h6 class="card-title"><strong>Rendimiento del Almacén</strong></h6>
                                <p class="card-text">Visualiza las métricas clave para optimizar la gestión de tu almacén.</p>
                                <a href="#" class="btn btn-primary"><strong>Ver Estadísticas</strong></a>
                            </div>
                        </div>
                        <div class="card card-primary card-outline">
                            <div class="card-header">
                                <h5 class="m-0"><strong>Alertas de Inventario</strong></h5>
                            </div>
                            <div class="card-body">
                                <h6 class="card-title"><strong>Alertas Críticas</strong></h6>
                                <p class="card-text">Recibe notificaciones sobre niveles bajos de inventario.</p>
                                <a href="#" class="btn btn-primary"><strong>Configurar Alertas</strong></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <footer class="main-footer">
        <strong>&copy; 2024 <a href="#">Reno Carrocerías</a>.</strong> Todos los derechos reservados.
    </footer>
</div>

<!-- Scripts necesarios -->
<script src="/RRSoluciones/www.renoamd.com/public/templates/plugins/jquery/jquery.min.js"></script>
<script src="/RRSoluciones/www.renoamd.com/public/templates/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="/RRSoluciones/www.renoamd.com/public/templates/dist/js/adminlte.min.js"></script>

</body>
</html>
