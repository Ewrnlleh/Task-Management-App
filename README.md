# Görev Yönetim Sistemi (Task Management App)

Türkçe görev yönetim web uygulaması. Görevler birden fazla kişiye atanabilir ve görevler atanan kişiye göre filtrelenebilir.

## Özellikler

- **5 Durum Kategorisi:**
  - Yeni Talep
  - Devam Ediyor
  - Beklemede
  - Test Aşamasında
  - Tamamlandı

- **Görev Yönetimi:**
  - Görev oluşturma, düzenleme ve silme
  - Birden fazla kişiye görev atama
  - Bitiş tarihi belirleme
  - Görev açıklaması

- **Geri Bildirim Sistemi:**
  - Her görev için durum notları
  - En son durum ("Son Durum") üstte görüntülenir
  - Zaman damgalı geri bildirimler

- **Filtreleme:**
  - Atanan kişiye göre görev filtreleme

- **Kişi Yönetimi:**
  - Kişi ekleme
  - İsim ve e-posta bilgileri

## Kurulum

### Gereksinimler

- PHP 7.4 veya üzeri (PDO MySQL desteği ile)
- MySQL 5.7 veya üzeri
- Web sunucusu (Apache, Nginx, vb.)

### Adım 1: Dosyaları Yükleyin

Tüm dosyaları web sunucunuzun document root dizinine kopyalayın.

### Adım 2: Veritabanını Oluşturun

MySQL'de `database.sql` dosyasını çalıştırın:

```bash
mysql -u root -p < database.sql
```

Veya MySQL istemcisinde:

```sql
source database.sql
```

Bu işlem:
- `task_management` veritabanını oluşturur
- Gerekli tabloları oluşturur
- Örnek veriler ekler

### Adım 3: Veritabanı Yapılandırması

`config.example.php` dosyasını `config.php` olarak kopyalayın ve veritabanı bilgilerinizi güncelleyin:

```bash
cp config.example.php config.php
```

`config.php` dosyasını düzenleyin:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'task_management');
```

### Adım 4: Uygulamayı Başlatın

Web tarayıcınızda uygulamayı açın:

```
http://localhost/Task-Management-App/
```

## Veritabanı Yapısı

### Tablolar

1. **tasks** - Görev bilgileri
   - id, title, description, status, due_date, created_at, updated_at

2. **assignees** - Atanan kişiler
   - id, name, email, created_at

3. **task_assignees** - Görev-Kişi ilişkisi (çoka çok)
   - task_id, assignee_id

4. **feedback** - Görev geri bildirimleri
   - id, task_id, message, created_at

## Kullanım

### Yeni Görev Ekleme

1. "Yeni Görev Ekle" butonuna tıklayın
2. Görev bilgilerini doldurun
3. Bir veya birden fazla kişi seçin
4. "Kaydet" butonuna tıklayın

### Görev Düzenleme

1. Bir görev kartına tıklayın
2. "Düzenle" butonuna tıklayın
3. Değişiklikleri yapın ve kaydedin

### Geri Bildirim Ekleme

1. Bir görev kartına tıklayın
2. "Yeni durum notu" alanına mesajınızı yazın
3. "Durum Notu Ekle" butonuna tıklayın

### Kişi Ekleme

1. "Kişileri Yönet" butonuna tıklayın
2. İsim ve e-posta bilgilerini girin
3. "Kişi Ekle" butonuna tıklayın

### Filtreleme

"Atanan Kişiye Göre Filtrele" açılır menüsünden bir kişi seçin.

## Teknolojiler

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** PHP 7.4+ (PDO)
- **Veritabanı:** MySQL 8.0
- **Dil:** Türkçe

## Güvenlik

- SQL injection koruması (PDO prepared statements)
- XSS koruması için uygun veri temizleme
- config.php .gitignore'a eklenmiştir

## Lisans

Bu proje açık kaynaklıdır ve serbestçe kullanılabilir.
