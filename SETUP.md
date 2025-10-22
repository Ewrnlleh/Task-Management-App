# Görev Yönetim Sistemi - Kurulum Kılavuzu

## Hızlı Başlangıç

### 1. Sistem Gereksinimleri

- PHP 7.4 veya üzeri
- MySQL 5.7 veya üzeri / MariaDB 10.2 veya üzeri
- Web sunucusu (Apache, Nginx) veya PHP built-in server

### 2. Veritabanı Kurulumu

#### Otomatik Kurulum

```bash
# MySQL ile
mysql -u root -p < database.sql

# veya MariaDB ile
mariadb -u root -p < database.sql
```

Bu komut:
- `task_management` veritabanını oluşturur
- Gerekli tabloları oluşturur (tasks, assignees, task_assignees, feedback)
- Örnek verileri yükler

#### Manuel Kurulum

MySQL istemcisinde:

```sql
mysql -u root -p
source /path/to/database.sql
```

### 3. Veritabanı Bağlantı Yapılandırması

```bash
# config.example.php dosyasını kopyalayın
cp config.example.php config.php

# Veritabanı bilgilerinizi config.php dosyasında güncelleyin
```

`config.php` içeriği:

```php
<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'task_management');
define('DB_CHARSET', 'utf8mb4');
?>
```

### 4. Uygulamayı Başlatma

#### Seçenek A: PHP Built-in Server (Geliştirme için)

```bash
cd Task-Management-App
php -S localhost:8080
```

Tarayıcıda açın: `http://localhost:8080/index.html`

#### Seçenek B: Apache/Nginx

1. Dosyaları web sunucusu document root'a kopyalayın
2. Uygun izinleri ayarlayın
3. Tarayıcıda domain/subdomain'i açın

## Özellikler

### 1. Görev Yönetimi

**Görev Oluşturma:**
- "Yeni Görev Ekle" butonuna tıklayın
- Görev başlığı, açıklama ve durum seçin
- Bitiş tarihi belirleyin
- Bir veya birden fazla kişi atayın
- İsteğe bağlı ilk durum notu ekleyin

**Görev Düzenleme:**
- Herhangi bir görev kartına tıklayın
- "Düzenle" butonuna tıklayın
- Değişiklikleri yapın ve kaydedin

**Görev Silme:**
- Görev detayını açın
- "Sil" butonuna tıklayın
- Onaylayın

### 2. Durum Kategorileri

Sistem 5 durum kategorisine sahiptir:

1. **Yeni Talep** (Mavi) - Yeni açılan görevler
2. **Devam Ediyor** (Turuncu) - Aktif olarak üzerinde çalışılan görevler
3. **Beklemede** (Kırmızı) - Engellenmiş veya bekleyen görevler
4. **Test Aşamasında** (Mor) - Test edilmekte olan görevler
5. **Tamamlandı** (Yeşil) - Tamamlanmış görevler

### 3. Geri Bildirim Sistemi

Her görev için:
- Zaman damgalı durum notları
- En son durum ("Son Durum") üstte vurgulanır
- Yeni durum notu ekleme özelliği
- Tüm geçmiş durum notlarını görüntüleme

### 4. Kişi Yönetimi

**Kişi Ekleme:**
- "Kişileri Yönet" butonuna tıklayın
- İsim ve e-posta bilgilerini girin
- "Kişi Ekle" butonuna tıklayın

**Kişileri Görüntüleme:**
- Mevcut tüm kişiler liste halinde gösterilir
- İsim ve e-posta bilgileri görünür

### 5. Filtreleme

**Atanan Kişiye Göre Filtreleme:**
- Üst menüden açılır listeyi kullanın
- Bir kişi seçin
- Sadece o kişiye atanan görevler görüntülenir
- "Tüm Görevler" seçerek filtreyi kaldırın

## Veritabanı Yapısı

### tasks Tablosu
```sql
- id: Benzersiz görev kimliği
- title: Görev başlığı
- description: Görev açıklaması
- status: Görev durumu (ENUM)
- due_date: Bitiş tarihi
- created_at: Oluşturulma zamanı
- updated_at: Güncellenme zamanı
```

### assignees Tablosu
```sql
- id: Benzersiz kişi kimliği
- name: Kişi adı
- email: E-posta adresi
- created_at: Oluşturulma zamanı
```

### task_assignees Tablosu
```sql
- task_id: Görev kimliği (FK)
- assignee_id: Kişi kimliği (FK)
- Çoka-çok ilişki
```

### feedback Tablosu
```sql
- id: Benzersiz geri bildirim kimliği
- task_id: Görev kimliği (FK)
- message: Geri bildirim mesajı
- created_at: Oluşturulma zamanı
```

## API Endpoints

### GET İstekleri

- `api.php?action=getTasks` - Tüm görevleri getir
- `api.php?action=getTasks&assignee={id}` - Filtrelenmiş görevleri getir
- `api.php?action=getTask&id={id}` - Tek görev detayı
- `api.php?action=getAssignees` - Tüm kişileri getir

### POST İstekleri

- `api.php?action=createTask` - Yeni görev oluştur
- `api.php?action=updateTask` - Görevi güncelle
- `api.php?action=deleteTask&id={id}` - Görevi sil
- `api.php?action=addFeedback` - Geri bildirim ekle
- `api.php?action=createAssignee` - Yeni kişi ekle

## Güvenlik

### Uygulanan Güvenlik Önlemleri

1. **SQL Injection Koruması**
   - PDO prepared statements kullanımı
   - Tüm veritabanı sorguları parametrize edilmiş

2. **XSS Koruması**
   - Kullanıcı girdileri uygun şekilde işlenir
   - JSON formatında veri alışverişi

3. **Yapılandırma Güvenliği**
   - config.php .gitignore'da
   - Veritabanı bilgileri repository dışında

### Önerilen Ek Güvenlik Adımları

1. **Üretim Ortamı İçin:**
   ```php
   // config.php'de
   error_reporting(0);
   ini_set('display_errors', 0);
   ```

2. **HTTPS Kullanımı:**
   - SSL sertifikası kurun
   - HTTP isteklerini HTTPS'e yönlendirin

3. **Veritabanı Kullanıcısı:**
   - Özel bir veritabanı kullanıcısı oluşturun
   - Sadece gerekli yetkileri verin

4. **Dosya İzinleri:**
   ```bash
   chmod 640 config.php
   chmod 644 *.php *.html *.css *.js
   ```

## Sorun Giderme

### Veritabanı Bağlantı Hatası

**Hata:** "Database connection failed"

**Çözüm:**
1. MySQL/MariaDB servisinin çalıştığını kontrol edin
2. config.php'deki bilgileri doğrulayın
3. Veritabanı kullanıcısının yetkilerini kontrol edin

### API Hataları

**Hata:** "Geçersiz işlem"

**Çözüm:**
1. API endpoint'inin doğru olduğunu kontrol edin
2. Tarayıcı console'unda JavaScript hatalarını kontrol edin
3. PHP error log'larını inceleyin

### Görevler Yüklenmiyor

**Çözüm:**
1. Tarayıcı console'unu açın (F12)
2. Network tab'ında API isteklerini kontrol edin
3. PHP error log'larını kontrol edin
4. Veritabanında veri olduğunu doğrulayın

## Yedekleme

### Veritabanı Yedeği

```bash
# Yedek alma
mysqldump -u username -p task_management > backup.sql

# Yedek geri yükleme
mysql -u username -p task_management < backup.sql
```

## Katkıda Bulunma

1. Projeyi fork edin
2. Yeni bir feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Branch'i push edin
5. Pull Request açın

## Lisans

Bu proje açık kaynaklıdır ve serbestçe kullanılabilir.

## Destek

Sorunlar için GitHub Issues kullanın.
