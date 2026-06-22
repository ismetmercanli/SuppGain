# Mobil Frontend Görev Dağılımı

Bu dokümanda, mobil uygulamanın kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) görevleri listelenmektedir. Her grup üyesi, kendisine atanan ekranların tasarımı, implementasyonu ve kullanıcı etkileşimlerinden sorumludur.



---
# SuppGain Mobile Frontend Yapısı

## Frontend Yapısı

SuppGain Mobile uygulamasının kullanıcı arayüzü, modern mobil geliştirme prensiplerine uygun şekilde tasarlanmıştır.
Uygulama, koyu tema tabanlı bir tasarım sistemi ile geliştirilmiş ve tüm ekranlarda tutarlı bir kullanıcı deneyimi hedeflenmiştir.

Arayüz geliştirme sürecinde tekrar kullanılabilir bileşen yapısı tercih edilmiştir.

---

## Tasarım Sistemi

Uygulama genelinde ortak bir tasarım sistemi oluşturulmuştur.

Bu sistem içerisinde:

* Ortak renk paleti
* Yazı tipi yapısı
* Boşluk (spacing) sistemi
* Border radius yapısı

tanımlanmıştır.

Bu yapı sayesinde tüm ekranlarda görsel bütünlük sağlanmıştır.

Ana tema yapısı koyu renk ağırlıklı olup yeşil tonları vurgulayıcı renk olarak kullanılmıştır.

---

## Bileşen Yapısı

Projede tekrar kullanılabilir ortak bileşenler geliştirilmiştir.

Temel bileşenler:

* AppText
* Button
* TextInputField
* Card
* Screen
* ProductCard
* BrandMark
* SectionHeader

Bu yapı sayesinde kod tekrarının azaltılması ve geliştirme sürecinin hızlandırılması amaçlanmıştır.

---

## Responsive Tasarım

Mobil ekran uyumluluğu için responsive yapı kullanılmıştır.

Bu kapsamda:

* SafeArea yapısı uygulanmıştır
* Farklı ekran boyutlarına uyum sağlanmıştır
* Android ve iOS cihazlarda güvenli alan yönetimi yapılmıştır

Bu sayede daha stabil ve kullanıcı dostu bir arayüz elde edilmiştir.

---

## Kullanıcı Deneyimi (UX)

Kullanıcı deneyimini iyileştirmek için çeşitli yapılar uygulanmıştır.

Bunlar:

* Loading ekranları
* Hata mesajları
* Boş veri durumları
* Buton geri bildirimleri
* Ekran yenileme mekanizmaları

API işlemleri sırasında kullanıcıya sürekli geri bildirim verilmesi hedeflenmiştir.

---

## Performans Optimizasyonları

Uygulama performansını artırmak için bazı optimizasyon teknikleri kullanılmıştır.

Başlıca:

* React.memo
* useMemo
* useFocusEffect

Bu optimizasyonlar gereksiz render işlemlerini azaltarak daha akıcı bir kullanım sağlamaktadır.

---

## Navigasyon Yapısı

Uygulama içerisinde kullanıcı akışı belirli bir navigasyon mimarisi ile yönetilmektedir.

Auth ekranları:

* Welcome
* Login
* Register
* Forgot Password

Ana uygulama sekmeleri:

* Home
* Products
* Cart
* Orders
* Profile

Ek ekranlar:

* Weekly Program
* Admin Products
* Order Detail
* Supplement Tracking

Bu yapı kullanıcı giriş durumuna göre dinamik olarak değişmektedir.

---

## Form Yönetimi

Form işlemlerinde kullanıcı girişleri kontrollü şekilde yönetilmektedir.

Form yapılarında:

* Giriş doğrulama
* Klavye yönetimi
* Şifre alanı güvenliği
* E-posta format kontrolleri

uygulanmıştır.

Bu yapı hatalı veri girişlerini azaltmaktadır.

---

## Kimlik Doğrulama Yapısı

Kimlik doğrulama işlemleri JWT token sistemi ile çalışmaktadır.

Token yönetimi:

* Expo Secure Store ile saklanır
* AuthContext üzerinden yönetilir
* API isteklerinde otomatik eklenir
* Süresi dolduğunda oturum sonlandırılır

Bu yapı güvenli oturum yönetimi sağlamaktadır.

---

## API Katmanı

Frontend tarafında backend bağlantıları modüler şekilde ayrılmıştır.

Temel API dosyaları:

* Auth API
* Profile API
* Products API
* Cart API
* Orders API
* Weekly Program API
* Supplement Tracker API

Bu yapı kod organizasyonunu kolaylaştırmaktadır.

---

## Geliştirme Durumu

Şu ana kadar:

* Tasarım sistemi oluşturuldu
* Ortak bileşen yapıları geliştirildi
* Navigasyon sistemi kuruldu
* API bağlantıları tamamlandı
* Form yapıları oluşturuldu
* Kimlik doğrulama sistemi entegre edildi

Sonraki aşamada uygulamanın ekran bazlı geliştirmeleri ve test süreçleri devam edecektir.

