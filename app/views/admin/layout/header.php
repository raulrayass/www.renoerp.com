<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reno Carrocerias | Dashboard</title>
    <meta name="description" content="Dashboard Manager.">

    <!-- Rutas -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="<?php echo URLSERVER; ?>public/templates/plugins/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="<?php echo URLSERVER; ?>public/templates/dist/css/adminlte.min.css">

    <!-- jQuery -->
    <script src="<?php echo URLSERVER; ?>public/templates/plugins/jquery/jquery.min.js"></script>

    <style>
        /* estilos personalizados */
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
            font-size: 1.5rem; /* Tamaño de fuente */
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
            border-radius: 12px; /* Bordes redondeados */
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
