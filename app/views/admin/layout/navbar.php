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
            <a class="nav-link navbar-notifications" href="<?php echo URLSERVER; ?>app/controllers/manager/manager_dashboard.php">
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
                <!-- Usar la imagen del perfil desde la sesión -->
                <img src="<?php echo isset($_SESSION['profile_image']) && !empty($_SESSION['profile_image']) ? URLSERVER . $_SESSION['profile_image'] : URLSERVER . 'public/images/uploads/users/default.jpg'; ?>" 
                     class="img-circle elevation-2" 
                     alt="Foto de perfil" 
                     style="width: 30px; height: 30px; object-fit: cover;">
                <span id="user_name" style="font-weight: bold;"><?php echo $_SESSION['username']; ?></span> <!-- Nombre en negrita -->
                <span id="role_name" style="font-size: 0.8rem; color: #b0b0b0;"><?php echo $_SESSION['role_name']; ?></span> <!-- Rol debajo del nombre -->
            </a>
            <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                <a href="#" class="dropdown-item"><i class="fas fa-user-cog"></i> Perfil</a>
                <a href="<?php echo URLSERVER; ?>app/controllers/session/logout_session.php" class="dropdown-item"><i class="fas fa-sign-out-alt"></i> Cerrar sesión</a>
            </div>
        </li>
    </ul>
</nav>
