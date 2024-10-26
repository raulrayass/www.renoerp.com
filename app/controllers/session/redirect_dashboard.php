<?php
session_start();
require_once __DIR__ . '/../../../settings/settings_control.php';

// Verificar si el usuario está autenticado
if (!isset($_SESSION['id_user'])) {
    // Redirigir a la página de inicio de sesión si no está autenticado
    header("Location: " . URLSERVER . "login/login.php"); // Se asegura que no haya '/' extra
    exit();
}

// Redirigir según el rol
$role_id = $_SESSION['role_id'];
switch ($role_id) {
    case 1: // Admin
        header("Location: " . URLSERVER . "app/views/admin/admin_dashboard.php");
        break;
    case 2: // Manager
        header("Location: " . URLSERVER . "app/views/manager/manager_dashboard.php");
        break;
    case 3: // Warehouse
        header("Location: " . URLSERVER . "app/views/warehouse/warehouse_dashboard.php");
        break;
    case 4: // Production
        header("Location: " . URLSERVER . "app/views/production/production_dashboard.php");
        break;
    case 5: // Sales
        header("Location: " . URLSERVER . "app/views/sales/sales_dashboard.php");
        break;
    case 6: // Purchases
        header("Location: " . URLSERVER . "app/views/purchases/purchase_dashboard.php");
        break;
    case 7: // HR
        header("Location: " . URLSERVER . "app/views/hr/employee_management.php");
        break;
    default:
        // Redirigir a login si el rol no coincide
        header("Location: " . URLSERVER . "login/login.php?error=true");
        break;
}

// Asegúrate de que el script no siga ejecutándose después de una redirección
exit();
?>
