<?php
// Database connection class

class Database {
    private $conn = null;
    
    public function __construct() {
        if (file_exists(__DIR__ . '/config.php')) {
            require_once __DIR__ . '/config.php';
        } else {
            // Default configuration for development
            define('DB_HOST', 'localhost');
            define('DB_USER', 'root');
            define('DB_PASS', '');
            define('DB_NAME', 'task_management');
            define('DB_CHARSET', 'utf8mb4');
        }
    }
    
    public function connect() {
        if ($this->conn === null) {
            try {
                $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];
                $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                throw new Exception("Database connection failed: " . $e->getMessage());
            }
        }
        return $this->conn;
    }
    
    public function disconnect() {
        $this->conn = null;
    }
}
