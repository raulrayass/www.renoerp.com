<?php

class UserModel {
    private $db;

    public function __construct($db_connection) {
        $this->db = $db_connection;
    }

    public function validate_credentials($username, $password) {
        $query = "SELECT id_user, password, role_id FROM tbl_users WHERE username = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if ($user && password_verify($password, $user['password'])) {
            return $user;
        }
        return false;
    }

    public function get_user_role($user_id) {
        $query = "SELECT role_id FROM tbl_users WHERE id_user = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $role = $result->fetch_assoc();

        return $role ? $role['role_id'] : null;
    }

    public function register_user($username, $email, $password, $role_id) {
        $hashed_password = password_hash($password, PASSWORD_BCRYPT);
        $query = "INSERT INTO tbl_users (username, email, password, role_id) VALUES (?, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('sssi', $username, $email, $hashed_password, $role_id);
        return $stmt->execute();
    }

    public function get_user_by_id($user_id) {
        $query = "SELECT id_user, username, email, role_id FROM tbl_users WHERE id_user = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    public function update_user($user_id, $username, $email, $role_id) {
        $query = "UPDATE tbl_users SET username = ?, email = ?, role_id = ? WHERE id_user = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('ssii', $username, $email, $role_id, $user_id);
        return $stmt->execute();
    }

    public function delete_user($user_id) {
        $query = "DELETE FROM tbl_users WHERE id_user = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('i', $user_id);
        return $stmt->execute();
    }

    public function reset_password($user_id, $new_password) {
        $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
        $query = "UPDATE tbl_users SET password = ? WHERE id_user = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('si', $hashed_password, $user_id);
        return $stmt->execute();
    }

    public function email_exists($email) {
        $query = "SELECT id_user FROM tbl_users WHERE email = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->num_rows > 0;
    }
}
