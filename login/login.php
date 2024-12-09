<?php 
session_start(); 
require_once '../settings/settings_control.php'; // Incluir la configuración de conexión a la base de datos

// Obtener el browser_id actual de la cookie, o generar uno nuevo si no existe
if (isset($_COOKIE['browser_id'])) {
    $browser_id = $_COOKIE['browser_id']; // Usar el browser_id de la cookie
} else {
    $browser_id = session_id(); // Generar uno nuevo
    setcookie('browser_id', $browser_id, time() + (86400 * 30), "/"); // 30 días de expiración
}

// Consultar la base de datos para ver si hay una sesión activa
$stmt = $pdo->prepare("SELECT * FROM tbl_users WHERE is_logged_in = 1");
$stmt->execute();

// Obtener el resultado
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Debug: Imprimir browser_id actual y el de la base de datos
echo "<pre>";
echo "Browser ID Actual: " . htmlspecialchars($browser_id) . "<br>";
if ($user) {
    echo "Browser ID en la Tabla: " . htmlspecialchars($user['browser_id']) . "<br>";
} else {
    echo "No se encontró usuario activo.<br>";
}
echo "</pre>";

// Si hay una sesión activa con el mismo browser_id, redirigir a resession.php
if ($user && $user['browser_id'] === $browser_id) {
    header("Location: lockscreen.php");
    exit();
}

// Continúa con el flujo normal de la página de inicio de sesión
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Aquí iría la lógica de validación de credenciales (ejemplo):
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    // Consulta a la base de datos para validar credenciales
    $stmt = $pdo->prepare("SELECT * FROM tbl_users WHERE username = :username");
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Validar la contraseña
    if ($user && password_verify($password, $user['password'])) {
        // Iniciar sesión
        $_SESSION['id_user'] = $user['id_user'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['profile_image'] = $user['profile_image'];
        
        // Actualizar el estado de la sesión
        $stmt = $pdo->prepare("UPDATE tbl_users SET is_logged_in = 1, browser_id = :browser_id WHERE id_user = :id_user");
        $stmt->bindParam(':browser_id', $browser_id);
        $stmt->bindParam(':id_user', $user['id_user']);
        $stmt->execute();
        
        // Redirigir a la página de inicio
        header("Location: " . URLSERVER . "app/views/dashboard.php");
        exit();
    } else {
        $error_message = "Nombre de usuario o contraseña incorrectos.";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login RENO ERP</title>

  <!-- Google Fonts -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
  <link rel="stylesheet" href="../public/templates/plugins/fontawesome-free/css/all.min.css">
  <link rel="stylesheet" href="../public/templates/plugins/icheck-bootstrap/icheck-bootstrap.min.css">
  <!-- Template -->
  <link rel="stylesheet" href="../public/templates/dist/css/adminlte.min.css">
  <!-- SweetAlert2 -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

  <style>
    body {
      background-image: url('../public/images/uploads/page/background.jpg'); /* Cambiar background */
      background-size: cover; /* Cambiar a 'contain' si lo prefieres */
      background-position: center;
      background-repeat: no-repeat;
      margin: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden; /* Evitar scroll */
    }
    .login-box {
      background-color: transparent;
      border-radius: 15px;
      padding: 20px;
      box-shadow: none;
    }
    .logo-container {
      background-color: #002667;
      padding: 20px;
      border-radius: 15px;
      margin-bottom: 15px;
      display: flex;
      justify-content: center;
    }
    .btn-primary {
      background-color: #002667;
      border-color: #002667;
      border-radius: 10px;
      font-weight: bold;
    }
    .btn-primary:hover {
      background-color: #001E5B;
      border-color: #001E5B;
    }
    .input-group .form-control {
      border-radius: 10px;
    }
    .input-group-text {
      background-color: rgba(0, 0, 0, 0.1);
      border: none;
      border-radius: 10px 0 0 10px;
    }
    .form-control:focus {
      box-shadow: none;
      border-color: #002667;
    }
    h1 {
      color: #002667;
      font-weight: bold;
    }
    .login-box-msg {
      font-weight: bold;
    }
    .logo {
      max-width: 150px;
    }
  </style>
</head>
<body class="hold-transition login-page">
  <div class="login-box">
    <div class="logo-container">
      <img src="../public/images/uploads/page/logo.png" alt="Logo" class="logo"> <!-- Cambiar logo -->
    </div>
    <h1 class="text-center">RENO ERP</h1>
    <p class="login-box-msg text-center">Inicia sesión para continuar</p>

    <!-- Mensaje de error si las credenciales son incorrectas -->
    <?php if (isset($error_message)): ?>
      <script>
        $(document).ready(function() {
          $('#errorModal').modal('show');
        });
      </script>
    <?php endif; ?>

    <!-- Formulario de inicio de sesión -->
    <form action="../app/controllers/session/login_session.php" method="post">
      <div class="input-group mb-3">
        <input type="email" name="email" class="form-control" placeholder="Email" required>
        <div class="input-group-append">
          <div class="input-group-text">
            <span class="fas fa-user-circle"></span>
          </div>
        </div>
      </div>
      <div class="input-group mb-3">
        <input type="password" name="password" class="form-control" placeholder="Contraseña" required>
        <div class="input-group-append">
          <div class="input-group-text">
            <span class="fas fa-key"></span>
          </div>
        </div>
      </div>
      <div class="row justify-content-center">
        <div class="col-12">
          <button type="submit" class="btn btn-primary btn-block">Iniciar sesión</button>
        </div>
      </div>
    </form>

    <!-- Link de recuperación de contraseña -->
    <p class="mb-1 text-center" style="margin-top: 20px;">
      <a href="forgot-password.php">No recuerdo mi contraseña</a>
    </p>
  </div>

  <!-- Modal de error -->
  <div class="modal fade" id="errorModal" tabindex="-1" role="dialog" aria-labelledby="errorModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="errorModalLabel">Error de Inicio de Sesión</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <?php echo isset($error_message) ? htmlspecialchars($error_message) : ''; ?>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Scripts necesarios -->
  <script src="../public/templates/plugins/jquery/jquery.min.js"></script>
  <script src="../public/templates/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
  <script src="../public/templates/dist/js/adminlte.min.js"></script>
</body>
</html>
