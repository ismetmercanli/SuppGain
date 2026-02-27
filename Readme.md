# SuppGain

## Proje Hakkında

![Ürün Tanıtım Görseli](Product.png)

**Proje Tanımı:** 

SuppGain uygulamamız, spor yapan ve takviye ürün kullanan bireylerin kullanım sürecini düzenli, planlı ve verimli hale getirmek için tasarlandı. Kullanıcı dostu arayüzü sayesinde herkesin rahatlıkla kullanabileceği bir deneyim sunarken, kişisel hedeflere uygun planlama sistemi ile süreci daha bilinçli yönetmenizi sağlar.
Uygulama içerisinde oluşturabileceğiniz günlük ve haftalık programlar sayesinde hangi ürünü ne zaman kullanmanız gerektiğini kolayca planlayabilirsiniz. Saat bazlı hatırlatmalar ile kullanım düzeninizi korurken, kilo ve gelişim takibi özellikleri sayesinde ilerlemenizi somut verilerle izleyebilirsiniz.
SuppGain, yalnızca bir hatırlatma uygulaması değil; aynı zamanda performans sürecinizi analiz eden ve istatistiklerle destekleyen dijital bir asistandır. Kullanım geçmişinizi görüntüleyebilir, düzenli takibin sağladığı farkı net bir şekilde görebilirsiniz.
Güvenli altyapısı, sade tasarımı ve kullanıcı odaklı yapısıyla SuppGain, spor sürecinizi daha disiplinli ve kontrollü bir hale getirir. Hedeflerinize ulaşırken planlı ilerlemek ve gelişiminizi profesyonel bir şekilde takip etmek için SuppGain her zaman yanınızda.
SuppGain’e hoş geldiniz, gelişiminizi birlikte planlayalım. 💪

**Proje Kategorisi:** 
Healty-Fittness

**Referans Uygulama:** 
[Supplify](https://play.google.com/store/apps/details?id=co.a80bucks.supplify&hl=tr)
---

## Proje Linkleri

- **REST API Adresi:** [api.yazmuh.com](https://api.yazmuh.com)
- **Web Frontend Adresi:** [frontend.yazmuh.com](https://frontend.yazmuh.com)

---

## Proje Ekibi

**Grup Adı:** 
 EternalLone

**Ekip Üyeleri:** 
- İsmet Mercanlı
---

## Dokümantasyon

Proje dokümantasyonuna aşağıdaki linklerden erişebilirsiniz:

1. [Gereksinim Analizi](Gereksinim-Analizi.md)
2. [REST API Tasarımı](API-Tasarimi.md)
3. [REST API](Rest-API.md)
4. [Web Front-End](WebFrontEnd.md)
5. [Mobil Front-End](MobilFrontEnd.md)
6. [Mobil Backend](MobilBackEnd.md)
7. [Video Sunum](Sunum.md)

---

## Projeyi Klonlama ve Düzenleme

**ÖNEMLİ:** Aşağıdaki işlemleri sadece grup lideri veya grup tarafından seçilen bir üye yapmalıdır.

### Kendi Reponuzu Oluşturma ve Şablonu Ekleme (Grup Lideri veya Seçilen Üye)

**Adım 1: Bu Şablon Repoyu Klonlama**
1. Bu (YazMuh şablon) repoyu yerel bilgisayarınıza klonlayın:

```bash
git clone https://github.com/yazmuh/YazMuh.git
```

**Adım 2: Kendi Reponuza Ekleme**
1. Kendi reponuzu da git clone ile çekerek Yazmuh şablonunu içine ekleyin.
2. Böylece şablon projenin tüm içeriği kendi reponuza kopyalanmış olur.
3. Grup lideri ya da seçilen üye şablon eklenmiş repoyu push etmeli ve diğer grup üyelerinin erişimine açmalı.

**Adım 3: Diğer Grup Üyelerini Collaborator Olarak Ekleme**
1. Kendi repo sayfanızda **Settings** sekmesine gidin
2. Sol menüden **Collaborators** seçeneğine tıklayın
3. **Add people** butonuna tıklayın
4. Diğer grup üyelerinin GitHub kullanıcı adlarını veya email adreslerini girin
5. Her bir grup üyesini **collaborator** olarak ekleyin
6. Eklenen üyelere GitHub üzerinden davet gönderilecektir
7. Her grup üyesi email'deki daveti kabul etmelidir

**Adım 4: Diğer Grup Üyelerinin Projeyi Klonlaması**
Repo sahibi ve collaborator olarak eklenen tüm grup üyeleri:

```bash
git clone https://github.com/repo-sahibinin-kullanici-adi/proje-adi.git
```

### Projeyi Düzenleme

Kendi reponuza ekledikten sonra projeyi kendi bilgilerinizle güncellemeniz gerekmektedir:

1. **Proje Bilgilerini Güncelleme:**
   - `Readme.md` dosyasındaki proje adı, grup adı, ekip üyeleri
   - Proje tanımı ve kategorisi
   - Referans uygulama bilgisi

2. **Gereksinimleri Ekleme:**
   - `Gereksinim-Analizi.md` dosyasına kendi gereksinimlerinizi ekleyin
   - Her ekip üyesi için bir klasör oluşturun (örn: `Ali-Tutar/`)
   - Her ekip üyesinin klasörüne gereksinim dosyası ekleyin (örn: `Ali-Tutar/Ali-Tutar-Gereksinimler.md`)
   - Gereksinim sayılarına dikkat edin (Gereksinim-Analizi.md dosyasındaki kurallara göre)

3. **Dokümantasyonu Güncelleme:**
   - Tüm dokümantasyon dosyalarını kendi projenize göre düzenleyin
   - Her ekip üyesinin klasörüne görev dosyalarını ekleyin:
     - `[İsim-Soyisim]/[İsim-Soyisim]-Rest-API-Gorevleri.md`
     - `[İsim-Soyisim]/[İsim-Soyisim]-Web-Frontend-Gorevleri.md`
     - `[İsim-Soyisim]/[İsim-Soyisim]-Mobil-Frontend-Gorevleri.md`
     - `[İsim-Soyisim]/[İsim-Soyisim]-Mobil-Backend-Gorevleri.md`
   - Ekip üyelerinin görevlerini güncelleyin
   - API endpoint'lerini ve açıklamalarını kontrol edin

4. **Değişiklikleri Kaydetme:**
   ```bash
   git add .
   git commit -m "Proje bilgileri güncellendi"
   git push origin main
   ```

### Notlar

- **Repo oluşturma:** Sadece grup lideri veya seçilen bir üye yeni repo oluşturup şablonu eklemelidir.
- **Collaborator ekleme:** Repo sahibi, diğer tüm grup üyelerini collaborator olarak eklemelidir.
- **Repo adı:** GitHub'da yeni repo oluştururken repo adını proje adınız ile belirleyin.
- **Klasör yapısı:** Her grup üyesi kendi klasörünü oluşturmalıdır. Klasör adı formatı: `[İsim-Soyisim]` (örn: `Ali-Tutar/`, `Veli-Yılmaz/`). Her grup üyesinin tüm dosyaları (gereksinimler, REST API görevleri, frontend görevleri vb.) kendi klasöründe bulunmalıdır.
- **Tüm placeholder'ları değiştirin:** (örn: [Grup Üyesi 2], [Soyisim], PROJE ADI vb.) kendi bilgilerinizle değiştirin
- **Dokümantasyon:** Tüm dokümantasyon dosyalarını eksiksiz doldurun
- **Görev dağılımı:** Her ekip üyesi kendi görevlerini tamamlamalıdır
- **İşbirliği:** Collaborator olarak eklenen üyeler, projeye doğrudan commit ve push yapabilirler
