# Mobil Backend (REST API Bağlantısı)

**REST API Adresi:** [api.suppgain.com](https://suppgain-production.up.railway.app/swagger/index.html)
**BACKEND VİDEOSU** [Backend VİDEO](https://www.youtube.com/watch?v=WX2btrcFKis)

## Backend Entegrasyonu

Mobil uygulama, mevcut SuppGain backend sistemi ile haberleşmektedir.

Canlı backend adresi:

```text
https://suppgain-production.up.railway.app
```

API bağlantıları ortak bir Axios client yapısı üzerinden yönetilmektedir.

Temel yapı:

* JSON veri gönderimi
* JWT tabanlı kimlik doğrulama
* Token gereken işlemlerde Authorization header kullanımı
* Timeout ve hata yönetimi

---

## Kimlik Doğrulama Sistemi

Sistemde kullanıcı kayıt ve giriş işlemleri bulunmaktadır.

Kullanılan işlemler:

* Kullanıcı kayıt
* Kullanıcı giriş
* Profil görüntüleme
* Profil güncelleme
* Hesap silme

Giriş sonrası alınan JWT token mobil cihazda güvenli şekilde saklanmaktadır.

---

## Uygulama Modülleri

Mobil uygulama içerisinde temel olarak şu modüller bulunmaktadır:

* Ürün listeleme
* Ürün detay görüntüleme
* Sepet işlemleri
* Sipariş oluşturma
* Sipariş geçmişi görüntüleme
* Profil yönetimi
* Haftalık supplement programı oluşturma ve güncelleme

Ayrıca admin kullanıcılar için ürün yönetim ekranları da planlanmıştır.

---

## API Test Süreci

Mobil uygulamanın backend bağlantıları Postman üzerinden test edilmiştir.

Test edilen başlıca işlemler:

* Sistem sağlık kontrolü
* Kullanıcı kayıt/giriş
* Ürün listeleme
* Profil işlemleri
* Sepet işlemleri
* Sipariş işlemleri
* Haftalık program işlemleri
* Admin ürün yönetimi

Bu testler sonucunda backend bağlantılarının sağlıklı şekilde çalıştığı doğrulanmıştır.

---

## Navigasyon Yapısı

Mobil uygulama içerisinde kullanıcı akışı aşağıdaki şekilde planlanmıştır:

**Auth Bölümü:**

* Login
* Register

**Ana Bölüm:**

* Home
* Products
* Cart
* Orders
* Profile

**Ek Ekranlar:**

* Product Detail
* Order Detail
* Weekly Program
* Admin Product Management

Bu yapı kullanıcı deneyimini daha düzenli hale getirmektedir.
