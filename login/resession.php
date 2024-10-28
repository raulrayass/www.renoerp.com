<?php
session_start();
require_once '../settings/settings_control.php';

// Recuperar el usuario actual de la sesión
if (isset($_SESSION['id_user'])) {
    $user_id = $_SESSION['id_user'];
    
    // Actualizar `is_logged_in` a 0 para indicar que la sesión está bloqueada
    // y actualizar el campo `browser_id` a NULL
    $stmt = $pdo->prepare("UPDATE tbl_users SET is_logged_in = 0, browser_id = NULL WHERE id_user = :id_user");
    $stmt->bindParam(':id_user', $user_id);
    $stmt->execute();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reno ERP | Lockscreen</title>

    <!-- Google Fonts -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="<?php echo URLSERVER; ?>public/templates/plugins/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="<?php echo URLSERVER; ?>public/templates/dist/css/adminlte.min.css">
    <link rel="stylesheet" href="<?php echo URLSERVER; ?>public/templates/plugins/sweetalert2/sweetalert2.min.css"> <!-- SweetAlert CSS -->

    <style>
        body {
            background-image: url('../public/images/uploads/page/background.jpg'); /* Cambiar background */
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            margin: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden; /* Evitar scroll */
        }
        .lockscreen-wrapper {
            background-color: rgba(255, 255, 255, 0.9); /* Fondo semi-transparente */
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
        }
        .lockscreen-name {
            font-weight: bold;
            text-align: center;
            margin: 10px 0;
            color: #002667; /* Color personalizado */
        }
        .lockscreen-image img {
            width: 100px; /* Ajustar tamaño */
            height: 100px; /* Ajustar tamaño */
            object-fit: cover;
            border-radius: 50%; /* Estilo circular */
            border: 2px solid #002667; /* Borde alrededor de la imagen */
            margin: 0 auto; /* Centrar la imagen */
            display: block; /* Centrar la imagen */
        }
        .input-group .form-control {
            border-radius: 10px;
        }
        .input-group-text {
            background-color: rgba(0, 0, 0, 0.1);
            border: none;
            border-radius: 10px 0 0 10px;
        }
        .btn {
            background-color: #002667;
            border-color: #002667;
            border-radius: 10px;
            font-weight: bold;
            width: 100%;
        }
        .btn:hover {
            background-color: #001E5B;
            border-color: #001E5B;
        }
    </style>
</head>
<body class="hold-transition lockscreen">
<div class="lockscreen-wrapper">
    <div class="lockscreen-logo">
        <a href="<?php echo URLSERVER; ?>/index.php"><b>Reno</b> ERP</a>
    </div>
    
    <!-- Nombre del usuario en la pantalla de bloqueo -->
    <div class="lockscreen-name"><?php echo isset($_SESSION['username']) ? htmlspecialchars($_SESSION['username']) : 'Usuario'; ?></div>
    
    <!-- Elemento de la pantalla de bloqueo -->
    <div class="lockscreen-item">
        <div class="lockscreen-image">
            <?php 
            // Verificar si el usuario tiene una imagen de perfil
            $profile_image = isset($_SESSION['profile_image']) && !empty($_SESSION['profile_image']) 
                ? URLSERVER . htmlspecialchars($_SESSION['profile_image']) 
                : URLSERVER . 'public/images/uploads/users/default.jpg'; // Ruta de la imagen predeterminada
            ?>
            <img src="<?php echo $profile_image; ?>" alt="User Image">
        </div>
        
        <!-- Formulario para desbloquear sesión -->
        <form class="lockscreen-credentials" action="<?php echo URLSERVER; ?>app/controllers/session/re_session.php" method="post">
            <div class="input-group mb-3">
                <input type="password" name="password" class="form-control" placeholder="Contraseña" required>
                <div class="input-group-append">
                    <div class="input-group-text">
                        <span class="fas fa-key"></span>
                    </div>
                </div>
            </div>
            <button type="submit" class="btn">Desbloquear</button>
        </form>
    </div>
    
    <!-- Mensaje de ayuda -->
    <div class="help-block text-center">
        Ingresa tu contraseña para recuperar tu sesión
    </div>
    
    <!-- Opción para cerrar sesión y cambiar de usuario -->
    <div class="text-center">
        <a href="<?php echo URLSERVER; ?>login/login.php" style="color: #002667;">O inicia sesión como otro usuario</a>
    </div>
    
    <!-- Pie de página -->
    <div class="lockscreen-footer text-center">
        Copyright &copy; 2024 <b><a href="https://adminlte.io" class="text-black">AdminLTE.io</a></b><br>
        Todos los derechos reservados
    </div>
</div>

<!-- Scripts -->
<script src="<?php echo URLSERVER; ?>public/templates/plugins/jquery/jquery.min.js"></script>
<script src="<?php echo URLSERVER; ?>public/templates/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="<?php echo URLSERVER; ?>public/templates/plugins/sweetalert2/sweetalert2.all.min.js"></script> <!-- SweetAlert JS -->

<script>
    $(document).ready(function() {
        // Si hay un mensaje de sesión restablecida, mostrar alerta
        <?php if ($message): ?>
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Sesión re establecida',
                confirmButtonText: 'Aceptar'
            });
        <?php endif; ?>
    });
</script>

</body>
</html>
