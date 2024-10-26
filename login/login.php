<?php 
session_start(); 
?> <!--inicio de session-->

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
    <?php if (isset($_SESSION['error'])): ?>
    <script>
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '<?php echo $_SESSION['error']; ?>',
        confirmButtonColor: '#002667'
      });
    </script>
    <?php unset($_SESSION['error']); // Limpiar mensaje después de mostrarlo ?>
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

  <!-- Scripts necesarios -->
  <script src="../public/templates/plugins/jquery/jquery.min.js"></script>
  <script src="../public/templates/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
  <script src="../public/templates/dist/js/adminlte.min.js"></script>
</body>
</html>
