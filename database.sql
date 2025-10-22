-- Task Management App Database Schema

CREATE DATABASE IF NOT EXISTS task_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE task_management;

-- Assignees table
CREATE TABLE IF NOT EXISTS assignees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('Yeni Talep', 'Devam Ediyor', 'Beklemede', 'Test Aşamasında', 'Tamamlandı') NOT NULL DEFAULT 'Yeni Talep',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Task assignees junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS task_assignees (
    task_id INT NOT NULL,
    assignee_id INT NOT NULL,
    PRIMARY KEY (task_id, assignee_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES assignees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some sample assignees
INSERT INTO assignees (name, email) VALUES
('Ahmet Yılmaz', 'ahmet@example.com'),
('Ayşe Demir', 'ayse@example.com'),
('Mehmet Kaya', 'mehmet@example.com'),
('Fatma Şahin', 'fatma@example.com');

-- Insert some sample tasks
INSERT INTO tasks (title, description, status, due_date) VALUES
('Proje Planlaması', 'Yeni proje için detaylı plan hazırlanması', 'Yeni Talep', DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
('Veritabanı Tasarımı', 'MySQL veritabanı şeması oluşturulması', 'Devam Ediyor', DATE_ADD(CURDATE(), INTERVAL 5 DAY)),
('Frontend Geliştirme', 'Kullanıcı arayüzü tasarımı', 'Beklemede', DATE_ADD(CURDATE(), INTERVAL 10 DAY));

-- Assign tasks to assignees
INSERT INTO task_assignees (task_id, assignee_id) VALUES
(1, 1),
(1, 2),
(2, 2),
(2, 3),
(3, 1),
(3, 3),
(3, 4);

-- Add some feedback
INSERT INTO feedback (task_id, message) VALUES
(1, 'Proje başlangıç toplantısı yapıldı'),
(1, 'Gereksinimler belirlendi'),
(2, 'Tablo yapıları tasarlandı'),
(2, 'İlk versiyon hazır, gözden geçirme bekleniyor'),
(3, 'Mockup tasarımları onaylandı'),
(3, 'Geliştirme başladı, arka plan işlemleri bekleniyor');
