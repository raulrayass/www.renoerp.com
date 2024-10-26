<!-- Barra Superior -->
<nav class="main-header navbar navbar-expand navbar-dark" style="padding: 11px 16px;"> <!-- Controla el grosor de la barra de navegación -->
    <ul class="navbar-nav">
        <li class="nav-item">
            <a class="nav-link" data-widget="pushmenu" href="#" style="font-size: 1.2rem;"> <!-- Ajusta el tamaño del icono de menú -->
                <i class="fas fa-bars"></i>
            </a>
        </li>
    </ul>
    <span class="navbar-title">Dashboard</span> <!-- Título "Dashboard" en la barra superior -->
    <ul class="navbar-nav ml-auto">
        <li class="nav-item">
            <a class="nav-link navbar-notifications" href="<?php echo URLSERVER; ?>app/controllers/manager/manager_dashboard.php" style="font-size: 1.2rem;"> <!-- Ajusta el tamaño del icono de inicio -->
                <i class="fas fa-home"></i>
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link navbar-notifications" href="#" id="fullscreen-btn" style="font-size: 1.2rem;"> <!-- Ajusta el tamaño del icono de pantalla completa -->
                <i class="fas fa-expand"></i>
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link navbar-notifications" href="#" style="font-size: 1.2rem;"> <!-- Ajusta el tamaño del icono de notificación -->
                <i class="fas fa-bell"></i>
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link navbar-notifications" href="#" style="font-size: 1.2rem;"> <!-- Ajusta el tamaño del icono de mensaje -->
                <i class="fas fa-envelope"></i>
            </a>
        </li>
        <li class="nav-item dropdown">
            <a class="nav-link profile-link" href="#" data-toggle="dropdown" style="display: flex; align-items: center;"> <!-- Flexbox para alinear elementos -->
                <div style="display: flex; align-items: center;">
                    <div style="margin-right: 9px; display: flex; flex-direction: column; justify-content: center; line-height: 1;">
                        <span id="user_name" style="font-weight: bold; font-size: 0.85rem; margin-bottom: 0;"><?php echo $_SESSION['username']; ?></span> <!-- Nombre de usuario -->
                        <span id="role_name" style="font-size: 0.7rem; color: #b0b0b0; margin-bottom: 0;"><?php echo $_SESSION['role_name']; ?></span> <!-- Rol del usuario -->
                    </div>
                    <!-- Usar la imagen del perfil desde la sesión -->
                    <img src="<?php echo isset($_SESSION['profile_image']) && !empty($_SESSION['profile_image']) ? URLSERVER . $_SESSION['profile_image'] : URLSERVER . 'public/images/uploads/users/default.jpg'; ?>" 
                         class="img-circle elevation-2" 
                         alt="Foto de perfil" 
                         style="width: 30px; height: 30px; object-fit: cover; margin-top: 0;"> <!-- Ajusta el tamaño y la posición de la imagen del perfil -->
                </div>
            </a>
            <!-- Menú desplegable -->
            <div class="dropdown-menu dropdown-menu-right" style="margin-top: 15px;"> <!-- Controla la separación del menú desplegable -->
                <a href="#" class="dropdown-item"><i class="fas fa-user-cog"></i> Perfil</a> <!-- Enlace al perfil -->
                <a href="<?php echo URLSERVER; ?>app/controllers/session/logout_session.php" class="dropdown-item"><i class="fas fa-sign-out-alt"></i> Cerrar sesión</a> <!-- Enlace para cerrar sesión -->
            </div>
        </li>
    </ul>
</nav>

<!-- CSS para hover -->
<style>
    .nav-item.dropdown:hover .dropdown-menu {
        display: block; /* Muestra el menú al pasar el cursor */
    }

    .dropdown-menu {
        display: none; /* Ocultar por defecto */
    }
</style>
