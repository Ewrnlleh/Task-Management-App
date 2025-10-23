-- ====================================================
-- Task Management App - MySQL Database Setup
-- ====================================================
-- Bu dosyayı MySQL Workbench'e import edebilirsiniz
-- Created: October 23, 2025
-- ====================================================

-- Veritabanını oluştur (eğer yoksa)
CREATE DATABASE IF NOT EXISTS `task_manager` 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

-- Veritabanını kullan
USE `task_manager`;

-- ====================================================
-- TABLOLARI SIL (Eğer varsa) - Yeniden oluşturmak için
-- ====================================================
DROP TABLE IF EXISTS `task_assignees`;
DROP TABLE IF EXISTS `feedback`;
DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `people`;

-- ====================================================
-- PEOPLE TABLOSU - Kullanıcılar/Kişiler
-- ====================================================
CREATE TABLE `people` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `avatarUrl` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_people_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TASKS TABLOSU - Görevler
-- ====================================================
CREATE TABLE `tasks` (
    `id` VARCHAR(100) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM(
        'Yeni Talep', 
        'Devam Ediyor', 
        'Beklemede', 
        'Test Aşamasında', 
        'Tamamlandı'
    ) NOT NULL DEFAULT 'Yeni Talep',
    `dueDate` DATE NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_tasks_status` (`status`),
    INDEX `idx_tasks_due_date` (`dueDate`),
    INDEX `idx_tasks_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TASK_ASSIGNEES TABLOSU - Görev Atamaları (Many-to-Many)
-- ====================================================
CREATE TABLE `task_assignees` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `task_id` VARCHAR(100) NOT NULL,
    `person_id` VARCHAR(36) NOT NULL,
    `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_task_person` (`task_id`, `person_id`),
    INDEX `idx_task_assignees_task` (`task_id`),
    INDEX `idx_task_assignees_person` (`person_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- FEEDBACK TABLOSU - Görev Geri Bildirimleri
-- ====================================================
CREATE TABLE `feedback` (
    `id` VARCHAR(100) NOT NULL PRIMARY KEY,
    `text` TEXT NOT NULL,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `task_id` VARCHAR(100) NOT NULL,
    FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE,
    INDEX `idx_feedback_task` (`task_id`),
    INDEX `idx_feedback_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- ÖRNEK VERİLER - Sample Data
-- ====================================================

-- Örnek Kullanıcılar
INSERT INTO `people` (`id`, `name`, `avatarUrl`) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Ahmet Yılmaz', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet'),
('550e8400-e29b-41d4-a716-446655440002', 'Elif Kaya', 'https://api.dicebear.com/7.x/avataaars/svg?seed=elif'),
('550e8400-e29b-41d4-a716-446655440003', 'Mehmet Demir', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet'),
('550e8400-e29b-41d4-a716-446655440004', 'Zeynep Öztürk', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep'),
('550e8400-e29b-41d4-a716-446655440005', 'Burak Şahin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=burak');

-- Örnek Görevler
INSERT INTO `tasks` (`id`, `title`, `description`, `status`, `dueDate`) VALUES
('task-550e8400-e29b-41d4-a716-446655440001', 'Web Sitesi Ana Sayfa Tasarımı', 'Şirket web sitesinin ana sayfa tasarımını oluştur. Modern ve responsive olmalı.', 'Devam Ediyor', '2025-11-15'),
('task-550e8400-e29b-41d4-a716-446655440002', 'Mobil Uygulama API Entegrasyonu', 'Mobil uygulamanın backend API ile entegrasyonunu tamamla.', 'Test Aşamasında', '2025-11-01'),
('task-550e8400-e29b-41d4-a716-446655440003', 'Veritabanı Optimizasyonu', 'Mevcut veritabanı sorgularını optimize et ve performansı artır.', 'Yeni Talep', '2025-12-01'),
('task-550e8400-e29b-41d4-a716-446655440004', 'Kullanıcı Dokümentasyonu', 'Son kullanıcılar için kapsamlı kullanım kılavuzu hazırla.', 'Beklemede', '2025-11-20'),
('task-550e8400-e29b-41d4-a716-446655440005', 'Güvenlik Testi', 'Uygulamanın güvenlik açıklarını test et ve raporla.', 'Tamamlandı', '2025-10-20');

-- Görev Atamaları
INSERT INTO `task_assignees` (`task_id`, `person_id`) VALUES
-- Web Sitesi Ana Sayfa Tasarımı - Ahmet ve Elif
('task-550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('task-550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
-- Mobil Uygulama API - Mehmet
('task-550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'),
-- Veritabanı Optimizasyonu - Burak
('task-550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005'),
-- Kullanıcı Dokümentasyonu - Zeynep
('task-550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004'),
-- Güvenlik Testi - Mehmet ve Burak
('task-550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003'),
('task-550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005');

-- Örnek Geri Bildirimler
INSERT INTO `feedback` (`id`, `text`, `timestamp`, `task_id`) VALUES
('feedback-550e8400-e29b-41d4-a716-446655440001', 'İlk tasarım taslağı hazırlandı. İncelemenizi bekliyoruz.', '2025-10-20 10:30:00', 'task-550e8400-e29b-41d4-a716-446655440001'),
('feedback-550e8400-e29b-41d4-a716-446655440002', 'Tasarım güzel görünüyor, ancak mobil versiyonda bazı düzenlemeler gerekli.', '2025-10-21 14:15:00', 'task-550e8400-e29b-41d4-a716-446655440001'),
('feedback-550e8400-e29b-41d4-a716-446655440003', 'API entegrasyonu %80 tamamlandı. Test aşamasına geçebiliriz.', '2025-10-22 09:45:00', 'task-550e8400-e29b-41d4-a716-446655440002'),
('feedback-550e8400-e29b-41d4-a716-446655440004', 'Güvenlik testleri başarıyla tamamlandı. Herhangi bir açık bulunamadı.', '2025-10-19 16:20:00', 'task-550e8400-e29b-41d4-a716-446655440005'),
('feedback-550e8400-e29b-41d4-a716-446655440005', 'Test raporu hazırlandı ve dökümantasyon güncellendi.', '2025-10-20 11:00:00', 'task-550e8400-e29b-41d4-a716-446655440005');

-- ====================================================
-- KULLANIŞLI GÖRÜNÜMLER (VIEWS)
-- ====================================================

-- Görevlerin detaylı görünümü
CREATE VIEW `task_details_view` AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.status,
    t.dueDate,
    t.created_at,
    t.updated_at,
    GROUP_CONCAT(DISTINCT p.name ORDER BY p.name SEPARATOR ', ') AS assignee_names,
    COUNT(DISTINCT ta.person_id) AS assignee_count,
    COUNT(DISTINCT f.id) AS feedback_count,
    CASE 
        WHEN t.dueDate < CURDATE() AND t.status != 'Tamamlandı' THEN 'Gecikmiş'
        WHEN t.dueDate = CURDATE() AND t.status != 'Tamamlandı' THEN 'Bugün Bitiyor'
        WHEN t.dueDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY) AND t.status != 'Tamamlandı' THEN 'Yaklaşan'
        ELSE 'Normal'
    END AS priority_status
FROM tasks t
LEFT JOIN task_assignees ta ON t.id = ta.task_id
LEFT JOIN people p ON ta.person_id = p.id
LEFT JOIN feedback f ON t.id = f.task_id
GROUP BY t.id, t.title, t.description, t.status, t.dueDate, t.created_at, t.updated_at;

-- Kullanıcı iş yükü görünümü
CREATE VIEW `user_workload_view` AS
SELECT 
    p.id,
    p.name,
    COUNT(DISTINCT ta.task_id) AS total_tasks,
    COUNT(DISTINCT CASE WHEN t.status != 'Tamamlandı' THEN ta.task_id END) AS active_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'Tamamlandı' THEN ta.task_id END) AS completed_tasks,
    COUNT(DISTINCT CASE WHEN t.dueDate < CURDATE() AND t.status != 'Tamamlandı' THEN ta.task_id END) AS overdue_tasks
FROM people p
LEFT JOIN task_assignees ta ON p.id = ta.person_id
LEFT JOIN tasks t ON ta.task_id = t.id
GROUP BY p.id, p.name;

-- ====================================================
-- STORED PROCEDURES - Saklı Yordamlar
-- ====================================================

DELIMITER //

-- Görev durumu güncellemek için stored procedure
CREATE PROCEDURE UpdateTaskStatus(
    IN p_task_id VARCHAR(36),
    IN p_new_status VARCHAR(50)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    UPDATE tasks 
    SET status = p_new_status, updated_at = CURRENT_TIMESTAMP 
    WHERE id = p_task_id;
    
    -- Durum değişikliği için otomatik feedback ekle
    INSERT INTO feedback (id, text, timestamp, task_id)
    VALUES (UUID(), CONCAT('Görev durumu "', p_new_status, '" olarak güncellendi.'), CURRENT_TIMESTAMP, p_task_id);
    
    COMMIT;
END //

-- Kullanıcının aktif görevlerini getiren stored procedure
CREATE PROCEDURE GetUserActiveTasks(
    IN p_person_id VARCHAR(36)
)
BEGIN
    SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.dueDate,
        CASE 
            WHEN t.dueDate < CURDATE() THEN 'Gecikmiş'
            WHEN t.dueDate = CURDATE() THEN 'Bugün Bitiyor'
            WHEN t.dueDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY) THEN 'Yaklaşan'
            ELSE 'Normal'
        END AS priority
    FROM tasks t
    INNER JOIN task_assignees ta ON t.id = ta.task_id
    WHERE ta.person_id = p_person_id 
    AND t.status != 'Tamamlandı'
    ORDER BY 
        CASE 
            WHEN t.dueDate < CURDATE() THEN 1
            WHEN t.dueDate = CURDATE() THEN 2
            WHEN t.dueDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY) THEN 3
            ELSE 4
        END,
        t.dueDate ASC;
END //

DELIMITER ;

-- ====================================================
-- İNDEKSLER VE PERFORMANS OPTIMIZASYONU
-- ====================================================

-- Ek performans indeksleri (yukarıda tanımlananların yanında)
CREATE INDEX `idx_tasks_status_due_date` ON `tasks` (`status`, `dueDate`);
CREATE INDEX `idx_feedback_task_timestamp` ON `feedback` (`task_id`, `timestamp`);

-- ====================================================
-- VERİTABANI KULLANICI YETKİLERİ (Opsiyonel)
-- ====================================================

-- Uygulama için özel kullanıcı oluştur (güvenlik için)
-- CREATE USER 'task_manager_user'@'localhost' IDENTIFIED BY 'secure_password_123';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON task_manager.* TO 'task_manager_user'@'localhost';
-- FLUSH PRIVILEGES;

-- ====================================================
-- VERİFİKASYON SORGULARI
-- ====================================================

-- Tüm tabloların oluşturulduğunu kontrol et
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'task_manager' 
ORDER BY TABLE_NAME;

-- Örnek veri kontrolü
SELECT 'PEOPLE' AS table_name, COUNT(*) AS record_count FROM people
UNION ALL
SELECT 'TASKS', COUNT(*) FROM tasks
UNION ALL
SELECT 'TASK_ASSIGNEES', COUNT(*) FROM task_assignees
UNION ALL
SELECT 'FEEDBACK', COUNT(*) FROM feedback;

-- ====================================================
-- KURULUM TAMAMLANDI!
-- ====================================================
-- Bu dosyayı MySQL Workbench'te açıp çalıştırabilirsiniz.
-- 
-- Adımlar:
-- 1. MySQL Workbench'i açın
-- 2. File > Open SQL Script... seçin
-- 3. Bu dosyayı seçin
-- 4. Lightning (⚡) butonuna tıklayarak çalıştırın
-- 
-- Backend bağlantı bilgileri:
-- - Host: localhost
-- - User: root
-- - Password: [your_mysql_password]
-- - Database: task_manager
-- ====================================================