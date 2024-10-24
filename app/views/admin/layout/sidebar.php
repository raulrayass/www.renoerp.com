<!-- Menu Lateral -->
<aside class="main-sidebar sidebar-dark-primary elevation-4">
    <a href="#" class="brand-link">
        <img src="<?php echo URLSERVER; ?>public/images/uploads/page/logo.png" alt="Reno ERP" class="brand-image">
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
                            <a href="<?php echo URLSERVER; ?>app/controllers/user/list.php" class="nav-link">
                                <i class="fas fa-list"></i>
                                <p>Lista de usuarios</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?php echo URLSERVER; ?>app/controllers/user/register.php" class="nav-link">
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
                            <a href="<?php echo URLSERVER; ?>app/controllers/role/list.php" class="nav-link">
                                <i class="fas fa-list"></i>
                                <p>Lista de roles</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?php echo URLSERVER; ?>app/controllers/role/register.php" class="nav-link">
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
