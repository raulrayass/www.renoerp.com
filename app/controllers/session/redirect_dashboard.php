<?php
// Incluir el archivo de configuración
require_once '../../models/settings/config.php'; 

if (!isset($_SESSION['user_id'])) {
    // Si el usuario no está autenticado, redirigir a login
    header("Location: " . URLSERVER . "login/login.php");
    exit();
}

// Redirigir según el rol
$role_id = $_SESSION['role_id'];
switch ($role_id) {
    case 1:
        header("Location: " . URLSERVER . "app/views/admin/admin_dashboard.php");
        break;
    case 2:
        header("Location: " . URLSERVER . "app/views/manager/manager_dashboard.php");
        break;
    case 3:
        header("Location: " . URLSERVER . "app/views/warehouse/warehouse_dashboard.php");
        break;
    case 4:
        header("Location: " . URLSERVER . "app/views/production/production_dashboard.php");
        break;
    case 5:
        header("Location: " . URLSERVER . "app/views/sales/sales_dashboard.php");
        break;
    case 6:
        header("Location: " . URLSERVER . "app/views/purchases/purchase_dashboard.php");
        break;
    case 7:
        header("Location: " . URLSERVER . "app/views/hr/employee_management.php");
        break;
    default:
        header("Location: " . URLSERVER . "app/login/login.php?error=true");
        break;
}
?>
