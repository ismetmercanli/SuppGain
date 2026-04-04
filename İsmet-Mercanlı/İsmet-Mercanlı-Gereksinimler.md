**1. Üye Olma**

 * **API Metodu:** `POST /auth/register`  
 * **Açıklama:** Kullanıcıların yeni hesaplar oluşturarak sisteme kayıt olmasını sağlar. Kişisel bilgilerin toplanmasını ve hesap oluşturma işlemlerini içerir. Kullanıcılar email adresi ve şifre belirleyerek hesap oluşturur.

**2. Giriş Yapma**

 * **API Metodu:** `POST /auth/login`  
 * **Açıklama:** Kullanıcıların sisteme giriş yapmasını sağlar. Kullanıcılar email ve şifre ile kimlik doğrulaması yapar. Giriş başarılı olduğunda sistem tarafından oturum başlatılır ve kullanıcı erişim yetkisi kazanır.

**3. Profil Görüntüleme**

 * **API Metodu:** `GET /users/{userId}`  
 * **Açıklama:** Kullanıcının profil bilgilerini görüntülemesini sağlar. Kullanıcı adı, email, telefon gibi kişisel bilgiler ve hesap durumu gösterilir. Kullanıcılar kendi profil bilgilerini görüntüleyebilir veya yöneticiler diğer kullanıcıların bilgilerini inceleyebilir. Güvenlik için giriş yapmış olmak gerekir.

**4. Profil Güncelleme**

 * **API Metodu:** `PUT /users/{userId}`  
 * **Açıklama:** Kullanıcının profil bilgilerini güncellemesini sağlar. Kullanıcılar ad, soyad, email, telefon gibi kişisel bilgilerini değiştirebilir. Güvenlik için giriş yapmış olmak gerekir ve kullanıcılar yalnızca kendi bilgilerini güncelleyebilir.

**5. Hesap Silme**

 * **API Metodu:** `DELETE /users/{userId}`  
 * **Açıklama:** Kullanıcının hesabını sistemden kalıcı olarak silmesini sağlar. Bu işlem geri alınamaz ve kullanıcının tüm verileri silinir. Sadece kullanıcı veya yönetici bu işlemi yapabilir.

**6. Ürün Listeleme**

 * **API Metodu:** `GET /products`  
 * **Açıklama:** Sistemdeki tüm ürünleri veya filtrelenmiş ürünleri listelemeyi sağlar. Kullanıcılar ürün adı, kategori veya fiyat aralığına göre ürünleri görüntüleyebilir.

**7. Ürün Ekleme**

 * **API Metodu:** `POST /products`  
 * **Açıklama:** Sisteme yeni ürün eklenmesini sağlar. Ürün adı, açıklama, fiyat, stok durumu ve kategori bilgileri ile sistemde yeni ürün oluşturulur. Bu işlem yalnızca yönetici veya yetkili kullanıcılar tarafından yapılabilir.

**8. Ürün Güncelleme**

 * **API Metodu:** `PUT /products/{productId}`  
 * **Açıklama:** Var olan ürünün bilgilerini güncellemeyi sağlar. Ürün adı, açıklama, fiyat veya stok durumu değiştirilebilir. Sadece yetkili kullanıcılar bu işlemi gerçekleştirebilir.

**9. Ürün Silme**

 * **API Metodu:** `DELETE /products/{productId}`  
 * **Açıklama:** Sistemdeki bir ürünü kalıcı olarak silmeyi sağlar. Silinen ürün geri getirilemez. Bu işlem yalnızca yönetici veya yetkili kullanıcılar tarafından yapılabilir.

**10. Sepete Ürün Ekleme**

 * **API Metodu:** `POST /cart`  
 * **Açıklama:** Kullanıcının seçtiği ürünü sepetine eklemesini sağlar. Kullanıcı ürün adedi belirleyebilir ve aynı ürün birden fazla kez eklenebilir. Giriş yapmış olmak gerekir.

**11. Sepet Görüntüleme**

 * **API Metodu:** `GET /cart`  
 * **Açıklama:** Kullanıcının sepetindeki ürünleri görüntülemesini sağlar. Ürün adı, adet, fiyat ve toplam tutar gibi bilgiler gösterilir. Kullanıcı yalnızca kendi sepetini görebilir.

**12. Sipariş Oluşturma**

 * **API Metodu:** `POST /orders`  
 * **Açıklama:** Sepetteki ürünler için yeni sipariş oluşturulmasını sağlar. Sipariş oluşturulduğunda stok durumu güncellenir ve kullanıcıya sipariş özeti sunulur.

**13. Sipariş Görüntüleme**

 * **API Metodu:** `GET /orders/{orderId}`  
 * **Açıklama:** Kullanıcının oluşturduğu siparişlerin detaylarını görüntülemesini sağlar. Kullanıcı yalnızca kendi siparişlerini görebilir.

**14. Haftalık Program Oluşturma**

 * **API Metodu:** `POST /weekly-program`  
 * **Açıklama:** Kullanıcının haftalık programını oluşturmasını sağlar. Program, günlere göre planlanan aktiviteler veya ürün kullanım bilgilerini içerir.

**15. Haftalık Program Güncelleme**

 * **API Metodu:** `PUT /weekly-program/{programId}`  
 * **Açıklama:** Mevcut haftalık programın güncellenmesini sağlar. Kullanıcı yalnızca kendi programını güncelleyebilir.
