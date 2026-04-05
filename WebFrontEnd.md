# Web Frontend Görev Dağılımı

**Web Frontend Adresi:** [frontend.suppgain.com](https://ismetmercanli-suppgainfrontend.vercel.app/)

Bu dokümanda, web uygulamasının kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) görevleri listelenmektedir. Her grup üyesi, kendisine atanan sayfaların tasarımı, implementasyonu ve kullanıcı etkileşimlerinden sorumludur.

---
# SuppGain Gereksinimleri (UI + API Tasarım Dokümanı)

## 1. Üye Olma (Kayıt) Sayfası
**API Endpoint:** `POST /auth/register`  
**Görev:** Yeni kullanıcı hesabı oluşturma ekranının tasarımı ve implementasyonu.

**UI Bileşenleri:**
- Responsive kayıt formu (mobile + desktop)
- Ad, soyad, email, şifre alanları
- “Kayıt Ol” butonu
- “Zaten hesabın var mı? Giriş Yap” linki
- Loading spinner

**Form Validasyonu:**
- Zorunlu alan kontrolleri
- Email format kontrolü
- Şifre min uzunluk ve güvenlik kontrolü
- Server-side 400 hata mesajlarının gösterimi

**Kullanıcı Deneyimi:**
- Inline hata mesajları
- Başarı sonrası otomatik login veya login sayfasına yönlendirme
- Double-submit koruması

**Teknik Detaylar:**
- React + Axios + form state yönetimi
- API hata kodlarını kullanıcı dostu mesaja map etme
- Auth token storage stratejisi

---

## 2. Giriş (Login) Sayfası
**API Endpoint:** `POST /auth/login`  
**Görev:** JWT token alarak oturum açma ekranı.

**UI Bileşenleri:**
- Email + şifre input
- “Giriş Yap” butonu
- Kayıt sayfasına geçiş linki
- Loading indicator

**Form Validasyonu:**
- Email formatı
- Şifre boş geçilemez
- 401/invalid credentials mesajları

**Kullanıcı Deneyimi:**
- Başarılı girişte dashboard/ana sayfaya yönlendirme
- Hata durumunda toast/inline mesaj

**Teknik Detaylar:**
- Token’ı localStorage/sessionStorage’da saklama
- Axios header’a `Authorization: Bearer <token>` ekleme

---

## 3. Profil Görüntüleme Sayfası
**API Endpoint:** `GET /users/me`  
**Görev:** Oturum açmış kullanıcının profil bilgilerini gösterme.

**UI Bileşenleri:**
- Profil kartı (ad, soyad, email, rol)
- Profil başlığı + avatar placeholder
- “Profili Düzenle” butonu

**Form Validasyonu:**
- Uygulanmaz (read-only)

**Kullanıcı Deneyimi:**
- Loading skeleton
- 401 durumunda login’e yönlendirme
- Hata durumunda retry

**Teknik Detaylar:**
- Protected route
- User state cache (opsiyonel)

---

## 4. Profil Güncelleme Sayfası
**API Endpoint:** `PUT /users/me`  
**Görev:** Kullanıcı profil bilgilerini güncelleme.

**UI Bileşenleri:**
- Ad, soyad, telefon vb. güncellenebilir alanlar
- “Kaydet” ve “İptal” butonları
- Değişiklik algılama (dirty state)

**Form Validasyonu:**
- Zorunlu alanlar
- Format kontrolleri
- Geçersiz input için inline mesaj

**Kullanıcı Deneyimi:**
- Başarı toast’ı
- Kaydet sırasında buton disable + loading
- Değişiklik yoksa “Kaydet” pasif

**Teknik Detaylar:**
- İlk değerleri `GET /users/me` ile doldurma
- PUT sonrası profile state senkronizasyonu

---

## 5. Hesap Silme Akışı
**API Endpoint:** `DELETE /users/me`  
**Görev:** Kullanıcının kendi hesabını silme/deaktive etme.

**UI Bileşenleri:**
- Danger “Hesabı Sil” butonu
- Onay modalı (“Bu işlem geri alınamaz”)

**Form Validasyonu:**
- Uygulanmaz (onay akışı)

**Kullanıcı Deneyimi:**
- Çift onay akışı
- Başarılı silmede logout + login’e yönlendirme
- Hata durumunda net mesaj

**Teknik Detaylar:**
- Token temizleme
- Auth state reset

---

## 6. Ürün Listeleme Sayfası
**API Endpoint:** `GET /products`  
**Görev:** Ürünlerin listelenmesi ve filtrelenmesi.

**UI Bileşenleri:**
- Responsive ürün kart/grid yapısı
- Ürün adı, fiyat, stok, görsel
- Filtre/sıralama alanları (opsiyonel)

**Form Validasyonu:**
- Uygulanmaz (listeleme)

**Kullanıcı Deneyimi:**
- Loading skeleton
- Empty state
- Hata durumunda retry

**Teknik Detaylar:**
- Public endpoint tüketimi
- Query param ile filtre desteği

---

## 7. Ürün Ekleme (Admin)
**API Endpoint:** `POST /products`  
**Görev:** Sadece admin kullanıcı için ürün oluşturma formu.

**UI Bileşenleri:**
- Ürün formu (name, category, price, stock, description, imageUrl)
- “Ürün Ekle” butonu
- Admin alanı rozeti

**Form Validasyonu:**
- Zorunlu alanlar
- Price/stock numeric ve pozitif kontrol
- 403/400 hata gösterimi

**Kullanıcı Deneyimi:**
- Başarı toast’ı
- Form reset veya listeye dönüş
- Loading sırasında double-submit engeli

**Teknik Detaylar:**
- Role bazlı UI gizleme/gösterme
- JWT ile yetkili istek

---

## 8. Ürün Güncelleme (Admin)
**API Endpoint:** `PUT /products/{productId}`  
**Görev:** Admin’in ürün güncellemesi.

**UI Bileşenleri:**
- Dolu gelen edit form
- “Güncelle” ve “İptal” butonu

**Form Validasyonu:**
- Alan tip kontrolü
- Negatif değer engeli
- 404/403 hata işleme

**Kullanıcı Deneyimi:**
- Başarı sonrası listede güncel görüntü
- Hata durumunda mevcut state korunması

**Teknik Detaylar:**
- Selected product state
- PUT sonrası refetch/optimistic update

---

## 9. Ürün Silme (Admin)
**API Endpoint:** `DELETE /products/{productId}`  
**Görev:** Admin’in ürün silmesi/pasifleştirmesi.

**UI Bileşenleri:**
- Satır/kart üzerinde “Sil” aksiyonu
- Onay modalı (destructive)

**Form Validasyonu:**
- Uygulanmaz (id bazlı işlem)

**Kullanıcı Deneyimi:**
- Başarı mesajı
- Listeden kaldırma / refetch
- Hata durumunda bilgilendirme

**Teknik Detaylar:**
- 403/404 handling
- UI rollback (gerekirse)

---

## 10. Sepete Ürün Ekleme
**API Endpoint:** `POST /cart`  
**Görev:** Kullanıcının aktif sepetine ürün ekleme.

**UI Bileşenleri:**
- Ürün kartında “Sepete Ekle” butonu
- Adet seçimi (opsiyonel)
- Sepet badge/counter

**Form Validasyonu:**
- quantity > 0
- productId zorunlu
- Stok kontrolü (server response)

**Kullanıcı Deneyimi:**
- Başarı toast’ı
- Sepet sayısı anlık güncelleme

**Teknik Detaylar:**
- Auth required
- POST sonrası cart state sync

---

## 11. Sepet Görüntüleme
**API Endpoint:** `GET /cart`  
**Görev:** Kullanıcının aktif sepetini görüntüleme.

**UI Bileşenleri:**
- Sepet satırları (ürün, adet, birim fiyat)
- Toplam tutar alanı
- “Siparişi Tamamla” CTA

**Form Validasyonu:**
- Uygulanmaz (read-only + aksiyon)

**Kullanıcı Deneyimi:**
- Empty cart state
- Loading/hata ekranı

**Teknik Detaylar:**
- Protected route
- Cart state merkezi yönetim

---

## 12. Sipariş Oluşturma
**API Endpoint:** `POST /orders`  
**Görev:** Aktif sepetten sipariş oluşturma.

**UI Bileşenleri:**
- Sipariş onay butonu
- Onay modalı (opsiyonel)
- İşlem sonucu bildirimleri

**Form Validasyonu:**
- Sepetin boş olmaması
- Server-side stok doğrulaması

**Kullanıcı Deneyimi:**
- Başarıda sipariş detaya/listeye yönlendirme
- Hata mesajlarının açık gösterimi

**Teknik Detaylar:**
- Auth required
- Sipariş sonrası cart temizleme/state güncelleme

---

## 13. Sipariş Görüntüleme
**API Endpoint:** `GET /orders/{orderId}` *(opsiyonel liste: `GET /orders/me`)*  
**Görev:** Sipariş detayını görüntüleme.

**UI Bileşenleri:**
- Sipariş özet kartı
- Ürün satırları
- Sipariş durumu ve tarih bilgileri

**Form Validasyonu:**
- Uygulanmaz

**Kullanıcı Deneyimi:**
- 404 sipariş bulunamadı ekranı
- Loading + retry

**Teknik Detaylar:**
- Owner/Admin yetki kontrolü backend’de
- Route param ile detay çekme

---

## 14. Haftalık Program Oluşturma
**API Endpoint:** `POST /weekly-program`  
**Görev:** Kullanıcı için haftalık program oluşturma.

**UI Bileşenleri:**
- Program formu (goal, notes vb.)
- “Program Oluştur” butonu

**Form Validasyonu:**
- Zorunlu alan kontrolleri
- Metin uzunluğu kontrolü (opsiyonel)

**Kullanıcı Deneyimi:**
- Başarı toast’ı
- Oluşturma sonrası program ekranına yönlendirme

**Teknik Detaylar:**
- Auth required
- Form state + error state yönetimi

---

## 15. Haftalık Program Güncelleme
**API Endpoint:** `PUT /weekly-program/{programId}`  
**Görev:** Var olan haftalık programı güncelleme.

**UI Bileşenleri:**
- Dolu edit form
- “Güncelle” / “İptal” butonu

**Form Validasyonu:**
- Boş payload gönderimini engelleme
- Uygun alan tip ve format kontrolleri

**Kullanıcı Deneyimi:**
- Başarı bildirimleri
- Hata durumunda kullanıcı verisini kaybetmeme

**Teknik Detaylar:**
- Program id bazlı güncelleme
- PUT sonrası ekran state yenileme
