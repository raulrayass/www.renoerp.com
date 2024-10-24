<?php
require_once '../app/models/settings/config.php'; // Asegúrate de que la ruta sea correcta

// Comprobar si el usuario ha iniciado sesión
if (!is_logged_in()) {
    header('Location: ' . URLSERVER . 'login/login.php'); // Redirigir a login si no está autenticado
    exit();
}

// Si el usuario ha iniciado sesión pero está inactivo (ajustado a 5 segundos para pruebas)
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 5)) { // 5 segundos para pruebas
    session_unset(); // Eliminar la sesión
    session_destroy(); // Destruir la sesión
    header('Location: ' . URLSERVER . 'login/login.php'); // Redirigir a login
    exit();
}

// Actualizar el tiempo de la última actividad
$_SESSION['last_activity'] = time();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reno ERP | Lockscreen</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="<?php echo URLSERVER; ?>/public/templates/plugins/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="<?php echo URLSERVER; ?>/public/templates/dist/css/adminlte.min.css">
</head>
<body class="hold-transition lockscreen">
<div class="lockscreen-wrapper">
    <div class="lockscreen-logo">
        <a href="<?php echo URLSERVER; ?>/index.php"><b>Reno</b> ERP</a>
    </div>
    <div class="lockscreen-name"><?php echo $_SESSION['username']; ?></div>
    <div class="lockscreen-item">
        <div class="lockscreen-image">
            <img src="<?php echo URLSERVER . $_SESSION['profile_image']; ?>" alt="User Image">
        </div>
        <form class="lockscreen-credentials" action="<?php echo URLSERVER; ?>app/controllers/session/unlock_session.php" method="post">
            <div class="input-group">
                <input type="password" name="password" class="form-control" placeholder="password" required>
                <div class="input-group-append">
                    <button type="submit" class="btn">
                        <i class="fas fa-arrow-right text-muted"></i>
                    </button>
                </div>
            </div>
        </form>
    </div>
    <div class="help-block text-center">
        Enter your password to retrieve your session
    </div>
    <div class="text-center">
        <a href="<?php echo URLSERVER; ?>/login/login.php?logout=true">Or sign in as a different user</a>
    </div>
    <div class="lockscreen-footer text-center">
        Copyright &copy; 2024 <b><a href="https://adminlte.io" class="text-black">AdminLTE.io</a></b><br>
        All rights reserved
    </div>
</div>

<script src="<?php echo URLSERVER; ?>/public/templates/plugins/jquery/jquery.min.js"></script>
<script src="<?php echo URLSERVER; ?>/public/templates/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
</body>
</html>
