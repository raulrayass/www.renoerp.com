<?php
require_once __DIR__ . '/../../../settings/database.php'; // Asegúrate de que esta ruta apunte al archivo de conexión

function get_user_by_credentials($username, $password) {
    global $pdo; // Asumiendo que usas PDO para la conexión
    $stmt = $pdo->prepare("SELECT * FROM tbl_users WHERE username = :username LIMIT 1");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verifica la contraseña
    if ($user && password_verify($password, $user['password'])) { // Cambia el método de hash si es necesario
        return $user;
    }
    return null; // Devuelve null si no se encuentra el usuario o la contraseña no coincide
}

function update_session_status($user_id, $status) {
    global $pdo;
    $stmt = $pdo->prepare("UPDATE tbl_users SET is_logged_in = :status WHERE id_user = :user_id");
    $stmt->execute(['status' => $status, 'user_id' => $user_id]);
}

function update_session_info($user_id, $session_token, $browser_id) {
    global $pdo;
    $stmt = $pdo->prepare("UPDATE tbl_users SET session_token = :session_token, browser_id = :browser_id WHERE id_user = :user_id");
    $stmt->execute(['session_token' => $session_token, 'browser_id' => $browser_id, 'user_id' => $user_id]);
}
?>
