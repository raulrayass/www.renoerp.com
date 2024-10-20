<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    // Si el usuario no está autenticado, redirigir a login
    header("Location: ../login.php");
    exit();
}

// Redirigir según el rol
$role_id = $_SESSION['role_id'];
switch ($role_id) {
    case 1:
        header("Location: ../admin/admin_dashboard.php");
        break;
    case 2:
        header("Location: ../manager/manager_dashboard.php");
        break;
    case 3:
        header("Location: /app/controllers/warehouse/warehouse_dashboard.php");
        break;
    case 4:
        header("Location: /app/controllers/production/production_dashboard.php");
        break;
    case 5:
        header("Location: /app/controllers/sales/sales_dashboard.php");
        break;
    case 6:
        header("Location: /app/controllers/purchases/purchase_dashboard.php");
        break;
    case 7:
        header("Location: /app/controllers/hr/employee_management.php");
        break;
    default:
        header("Location: ../login.php?error=true");
        break;
}
?>
